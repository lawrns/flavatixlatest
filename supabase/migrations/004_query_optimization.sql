-- =============================================================================
-- Migration 004: Query Optimization Functions and Pagination
-- =============================================================================
-- Purpose: Optimized query patterns for common operations
-- Features:
--   - Cursor-based pagination for large result sets
--   - Optimized wheel regeneration query
--   - Paginated descriptor fetch
--   - Query result caching hints
--   - Slow query documentation
-- =============================================================================

-- =============================================================================
-- STEP 1: Paginated descriptor fetch with cursor
-- =============================================================================

-- Cursor-based pagination for efficient large result set handling
CREATE OR REPLACE FUNCTION get_descriptors_paginated(
    p_user_id UUID,
    p_descriptor_type TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL,
    p_cursor_created_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_direction TEXT DEFAULT 'forward'  -- 'forward' or 'backward'
)
RETURNS TABLE (
    id UUID,
    descriptor_text TEXT,
    descriptor_type TEXT,
    category TEXT,
    subcategory TEXT,
    intensity INTEGER,
    confidence_score NUMERIC,
    source_type TEXT,
    source_id UUID,
    item_name TEXT,
    item_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN
)
STABLE
PARALLEL SAFE
LANGUAGE plpgsql
AS $$
DECLARE
    v_query TEXT;
    v_cursor_condition TEXT := '';
    v_order_direction TEXT;
    v_comparison_op TEXT;
BEGIN
    -- Set direction-based operators
    IF p_direction = 'backward' THEN
        v_order_direction := 'ASC';
        v_comparison_op := '>';
    ELSE
        v_order_direction := 'DESC';
        v_comparison_op := '<';
    END IF;

    -- Build cursor condition
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
        v_cursor_condition := format(
            ' AND (created_at, id) %s (%L, %L)',
            v_comparison_op,
            p_cursor_created_at,
            p_cursor_id
        );
    END IF;

    -- Build and execute query
    RETURN QUERY EXECUTE format($q$
        WITH page_data AS (
            SELECT
                fd.id,
                fd.descriptor_text,
                fd.descriptor_type,
                fd.category,
                fd.subcategory,
                fd.intensity,
                fd.confidence_score,
                fd.source_type,
                fd.source_id,
                fd.item_name,
                fd.item_category,
                fd.created_at
            FROM public.flavor_descriptors fd
            WHERE fd.user_id = %L
            %s  -- descriptor_type filter
            %s  -- category filter
            %s  -- cursor condition
            ORDER BY fd.created_at %s, fd.id %s
            LIMIT %s + 1
        )
        SELECT
            pd.id,
            pd.descriptor_text,
            pd.descriptor_type,
            pd.category,
            pd.subcategory,
            pd.intensity,
            pd.confidence_score,
            pd.source_type,
            pd.source_id,
            pd.item_name,
            pd.item_category,
            pd.created_at,
            (SELECT COUNT(*) > %s FROM page_data) as has_more
        FROM page_data pd
        LIMIT %s
    $q$,
        p_user_id,
        CASE WHEN p_descriptor_type IS NOT NULL
            THEN format(' AND fd.descriptor_type = %L', p_descriptor_type)
            ELSE ''
        END,
        CASE WHEN p_category IS NOT NULL
            THEN format(' AND fd.category = %L', p_category)
            ELSE ''
        END,
        v_cursor_condition,
        v_order_direction,
        v_order_direction,
        p_limit,
        p_limit,
        p_limit
    );
END;
$$;

COMMENT ON FUNCTION get_descriptors_paginated IS
'Cursor-based pagination for descriptors. More efficient than OFFSET for large datasets.
Usage: SELECT * FROM get_descriptors_paginated(user_id, null, null, last_id, last_created_at, 50);';

-- =============================================================================
-- STEP 2: Optimized wheel regeneration query
-- =============================================================================

-- Fast check if wheel needs regeneration
CREATE OR REPLACE FUNCTION wheel_needs_regeneration(
    p_wheel_id UUID,
    p_threshold_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.flavor_wheels fw
        LEFT JOIN mv_wheel_generation_stats wgs ON fw.user_id = wgs.user_id
        WHERE fw.id = p_wheel_id
        AND (
            -- Expired
            fw.expires_at < NOW()
            -- Or stale based on threshold
            OR fw.generated_at < NOW() - (p_threshold_minutes || ' minutes')::interval
            -- Or new descriptors added since generation
            OR (wgs.latest_descriptor_at IS NOT NULL AND wgs.latest_descriptor_at > fw.generated_at)
        )
    );
$$;

COMMENT ON FUNCTION wheel_needs_regeneration(UUID, INTEGER) IS
'Check if a wheel needs regeneration based on expiration, staleness, or new data.';

-- Optimized wheel data query using materialized view
CREATE OR REPLACE FUNCTION get_wheel_data_fast(
    p_user_id UUID,
    p_wheel_type TEXT DEFAULT 'combined',
    p_scope_type TEXT DEFAULT 'personal',
    p_item_category TEXT DEFAULT NULL
)
RETURNS JSONB
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT CASE p_scope_type
        WHEN 'personal' THEN
            (SELECT generate_wheel_data_optimized(p_user_id, p_wheel_type, 1, 10))
        WHEN 'category' THEN
            (SELECT jsonb_build_object(
                'categories', COALESCE(
                    (SELECT jsonb_agg(
                        jsonb_build_object(
                            'name', category,
                            'count', SUM(occurrence_count),
                            'subcategories', jsonb_agg(
                                jsonb_build_object(
                                    'name', subcategory,
                                    'count', occurrence_count,
                                    'descriptors', jsonb_build_array(
                                        jsonb_build_object(
                                            'text', display_text,
                                            'count', occurrence_count,
                                            'avgIntensity', ROUND(avg_intensity::numeric, 1)
                                        )
                                    )
                                )
                            )
                        )
                    )
                    FROM mv_category_descriptor_summary
                    WHERE item_category = p_item_category
                    AND (p_wheel_type = 'combined' OR descriptor_type = p_wheel_type)
                    GROUP BY category),
                    '[]'::jsonb
                ),
                'generatedAt', NOW()
            ))
        ELSE
            (SELECT generate_wheel_data_optimized(p_user_id, p_wheel_type, 1, 10))
    END;
$$;

COMMENT ON FUNCTION get_wheel_data_fast(UUID, TEXT, TEXT, TEXT) IS
'Fast wheel data retrieval using materialized views.
Supports personal and category scope types.';

-- =============================================================================
-- STEP 3: Batch operations for large datasets
-- =============================================================================

-- Batch insert descriptors with deduplication
CREATE OR REPLACE FUNCTION batch_insert_descriptors(
    p_descriptors JSONB,
    p_user_id UUID,
    p_source_type TEXT,
    p_source_id UUID
)
RETURNS TABLE (
    inserted_count INTEGER,
    duplicate_count INTEGER,
    error_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_inserted INTEGER := 0;
    v_duplicate INTEGER := 0;
    v_error INTEGER := 0;
    v_descriptor JSONB;
BEGIN
    FOR v_descriptor IN SELECT jsonb_array_elements(p_descriptors)
    LOOP
        BEGIN
            INSERT INTO public.flavor_descriptors (
                user_id,
                source_type,
                source_id,
                descriptor_text,
                descriptor_type,
                category,
                subcategory,
                confidence_score,
                intensity,
                item_name,
                item_category,
                ai_extracted,
                extraction_model
            )
            VALUES (
                p_user_id,
                p_source_type,
                p_source_id,
                v_descriptor->>'text',
                COALESCE(v_descriptor->>'type', 'flavor'),
                v_descriptor->>'category',
                v_descriptor->>'subcategory',
                (v_descriptor->>'confidence')::numeric,
                (v_descriptor->>'intensity')::integer,
                v_descriptor->>'item_name',
                v_descriptor->>'item_category',
                COALESCE((v_descriptor->>'ai_extracted')::boolean, false),
                v_descriptor->>'extraction_model'
            )
            ON CONFLICT (source_type, source_id, normalized_form, descriptor_type)
            DO UPDATE SET
                confidence_score = EXCLUDED.confidence_score,
                intensity = EXCLUDED.intensity,
                updated_at = NOW()
            WHERE flavor_descriptors.confidence_score < EXCLUDED.confidence_score;

            IF FOUND THEN
                v_inserted := v_inserted + 1;
            ELSE
                v_duplicate := v_duplicate + 1;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                v_error := v_error + 1;
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted, v_duplicate, v_error;
END;
$$;

COMMENT ON FUNCTION batch_insert_descriptors(JSONB, UUID, TEXT, UUID) IS
'Batch insert descriptors with automatic deduplication.
Returns counts of inserted, duplicate, and error records.';

-- =============================================================================
-- STEP 4: Aggregation queries with result caching hints
-- =============================================================================

-- Get user descriptor statistics (cached-friendly)
CREATE OR REPLACE FUNCTION get_user_descriptor_stats(
    p_user_id UUID
)
RETURNS JSONB
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT jsonb_build_object(
        'totalDescriptors', COALESCE(total_descriptors, 0),
        'uniqueDescriptors', COALESCE(unique_descriptors, 0),
        'byType', jsonb_build_object(
            'aroma', COALESCE(aroma_count, 0),
            'flavor', COALESCE(flavor_count, 0),
            'texture', COALESCE(texture_count, 0),
            'defect', COALESCE(defect_count, 0),
            'metaphor', COALESCE(metaphor_count, 0)
        ),
        'sourceCount', COALESCE(source_count, 0),
        'categoryCount', COALESCE(category_count, 0),
        'aiExtractedCount', COALESCE(ai_extracted_count, 0),
        'keywordExtractedCount', COALESCE(keyword_extracted_count, 0),
        'latestDescriptorAt', latest_descriptor_at,
        'cacheHint', jsonb_build_object(
            'ttlSeconds', 300,  -- 5 minute cache
            'staleWhileRevalidate', true
        )
    )
    FROM mv_wheel_generation_stats
    WHERE user_id = p_user_id;
$$;

COMMENT ON FUNCTION get_user_descriptor_stats(UUID) IS
'Get user descriptor statistics from materialized view.
Includes cache hints for application-level caching.';

-- =============================================================================
-- STEP 5: Top descriptors query (for wheel visualization)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_top_descriptors(
    p_user_id UUID DEFAULT NULL,
    p_descriptor_type TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    display_text TEXT,
    descriptor_type TEXT,
    category TEXT,
    subcategory TEXT,
    occurrence_count BIGINT,
    avg_intensity NUMERIC,
    unique_sources BIGINT
)
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT
        display_text,
        descriptor_type,
        category,
        subcategory,
        occurrence_count,
        ROUND(avg_intensity::numeric, 2) as avg_intensity,
        source_count as unique_sources
    FROM mv_user_descriptor_summary
    WHERE
        (p_user_id IS NULL OR user_id = p_user_id)
        AND (p_descriptor_type IS NULL OR descriptor_type = p_descriptor_type)
        AND (p_category IS NULL OR category = p_category)
    ORDER BY occurrence_count DESC, avg_intensity DESC
    LIMIT p_limit;
$$;

COMMENT ON FUNCTION get_top_descriptors(UUID, TEXT, TEXT, INTEGER) IS
'Get top descriptors by occurrence count. Uses materialized view for fast results.';

-- =============================================================================
-- STEP 6: Descriptor timeline query (for history views)
-- =============================================================================

CREATE OR REPLACE FUNCTION get_descriptor_timeline(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30,
    p_descriptor_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    date DATE,
    descriptor_count BIGINT,
    unique_descriptors BIGINT,
    ai_count BIGINT,
    keyword_count BIGINT
)
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT
        DATE(created_at) as date,
        COUNT(*) as descriptor_count,
        COUNT(DISTINCT normalized_form) as unique_descriptors,
        COUNT(*) FILTER (WHERE ai_extracted = TRUE) as ai_count,
        COUNT(*) FILTER (WHERE ai_extracted = FALSE OR ai_extracted IS NULL) as keyword_count
    FROM public.flavor_descriptors
    WHERE
        user_id = p_user_id
        AND created_at >= NOW() - (p_days || ' days')::interval
        AND (p_descriptor_type IS NULL OR descriptor_type = p_descriptor_type)
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
$$;

COMMENT ON FUNCTION get_descriptor_timeline(UUID, INTEGER, TEXT) IS
'Get descriptor creation timeline for charts and analytics.';

-- =============================================================================
-- STEP 7: Efficient count queries
-- =============================================================================

-- Fast approximate count using statistics
CREATE OR REPLACE FUNCTION estimate_descriptor_count(
    p_user_id UUID DEFAULT NULL
)
RETURNS BIGINT
STABLE
LANGUAGE SQL
AS $$
    SELECT CASE
        WHEN p_user_id IS NOT NULL THEN
            (SELECT COALESCE(total_descriptors, 0)
             FROM mv_wheel_generation_stats
             WHERE user_id = p_user_id)
        ELSE
            -- Use statistics for global count (much faster than COUNT(*))
            (SELECT COALESCE(
                (SELECT reltuples::bigint
                 FROM pg_class
                 WHERE relname = 'flavor_descriptors'),
                0
            ))
    END;
$$;

COMMENT ON FUNCTION estimate_descriptor_count(UUID) IS
'Fast approximate descriptor count. Uses materialized view for user counts,
pg_class statistics for global counts. Much faster than COUNT(*).';

-- =============================================================================
-- STEP 8: Query performance hints table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.query_performance_hints (
    query_name TEXT PRIMARY KEY,
    description TEXT,
    recommended_indexes TEXT[],
    cache_ttl_seconds INTEGER,
    pagination_recommended BOOLEAN,
    materialized_view TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document slow query patterns and solutions
INSERT INTO public.query_performance_hints VALUES
    ('wheel_generation', 'Generate flavor wheel from descriptors',
     ARRAY['idx_flavor_descriptors_user_type', 'idx_flavor_descriptors_category'],
     300, true, 'mv_user_descriptor_summary',
     'Use generate_wheel_data_optimized() instead of direct query'),

    ('descriptor_list', 'List user descriptors with pagination',
     ARRAY['idx_flavor_descriptors_created', 'idx_flavor_descriptors_user_type'],
     60, true, NULL,
     'Use get_descriptors_paginated() with cursor-based pagination'),

    ('duplicate_detection', 'Find duplicate descriptors',
     ARRAY['idx_flavor_descriptors_normalized_trgm'],
     600, true, NULL,
     'Use find_duplicate_descriptors() with similarity threshold'),

    ('autocomplete', 'Descriptor autocomplete suggestions',
     ARRAY['idx_flavor_descriptors_text_trgm'],
     30, false, NULL,
     'Use autocomplete_descriptors() for combined prefix + similarity'),

    ('user_stats', 'User descriptor statistics',
     ARRAY['idx_mv_wheel_generation_stats_user'],
     300, false, 'mv_wheel_generation_stats',
     'Use get_user_descriptor_stats() for cached-friendly results'),

    ('category_aggregation', 'Aggregate by category',
     ARRAY['idx_mv_category_descriptor_summary_category'],
     300, true, 'mv_category_descriptor_summary',
     'Query mv_category_descriptor_summary directly')
ON CONFLICT (query_name) DO NOTHING;

-- =============================================================================
-- STEP 9: Performance monitoring function
-- =============================================================================

CREATE OR REPLACE FUNCTION analyze_query_performance(
    p_query TEXT,
    p_params JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan JSONB;
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_execution_time NUMERIC;
BEGIN
    v_start_time := clock_timestamp();

    -- Get query plan
    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' || p_query
    INTO v_plan;

    v_end_time := clock_timestamp();
    v_execution_time := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;

    RETURN jsonb_build_object(
        'plan', v_plan,
        'executionTimeMs', v_execution_time,
        'analyzedAt', NOW()
    );
END;
$$;

COMMENT ON FUNCTION analyze_query_performance(TEXT, JSONB) IS
'Analyze query performance with EXPLAIN ANALYZE output.
Returns execution plan and timing information.';

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 004: Query Optimization Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - get_descriptors_paginated() cursor pagination';
    RAISE NOTICE '  - wheel_needs_regeneration() staleness check';
    RAISE NOTICE '  - get_wheel_data_fast() optimized wheel query';
    RAISE NOTICE '  - batch_insert_descriptors() bulk insert';
    RAISE NOTICE '  - get_user_descriptor_stats() with cache hints';
    RAISE NOTICE '  - get_top_descriptors() for visualization';
    RAISE NOTICE '  - get_descriptor_timeline() for analytics';
    RAISE NOTICE '  - estimate_descriptor_count() fast counting';
    RAISE NOTICE '  - query_performance_hints documentation table';
    RAISE NOTICE '  - analyze_query_performance() debugging tool';
    RAISE NOTICE '========================================';
END $$;

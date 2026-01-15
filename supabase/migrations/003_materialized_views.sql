-- =============================================================================
-- Migration 003: Materialized Views for Performance
-- =============================================================================
-- Purpose: Pre-compute expensive aggregations for instant wheel generation
-- Use cases:
--   - User descriptor summary (for personal wheels)
--   - Category-level aggregations
--   - Global descriptor statistics
--   - Optimized wheel regeneration
--
-- Performance target: <100ms for wheel generation on 10M+ descriptors
-- =============================================================================

-- =============================================================================
-- STEP 1: User Descriptor Summary View
-- =============================================================================

-- This materialized view pre-aggregates descriptor data per user
-- Dramatically speeds up personal flavor wheel generation
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_descriptor_summary AS
SELECT
    user_id,
    descriptor_type,
    category,
    subcategory,
    normalized_form,
    MIN(descriptor_text) as display_text,  -- Keep one version for display
    COUNT(*) as occurrence_count,
    AVG(COALESCE(intensity, 3)) as avg_intensity,
    AVG(COALESCE(confidence_score, 0.8)) as avg_confidence,
    COUNT(DISTINCT source_id) as source_count,
    COUNT(DISTINCT item_name) FILTER (WHERE item_name IS NOT NULL) as item_count,
    ARRAY_AGG(DISTINCT item_category) FILTER (WHERE item_category IS NOT NULL) as item_categories,
    MAX(created_at) as last_used_at,
    MIN(created_at) as first_used_at,
    BOOL_OR(ai_extracted) as has_ai_extraction
FROM public.flavor_descriptors
GROUP BY
    user_id,
    descriptor_type,
    category,
    subcategory,
    normalized_form
WITH DATA;

-- Create unique index for fast refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_descriptor_summary_pk
ON mv_user_descriptor_summary (user_id, descriptor_type, category, subcategory, normalized_form);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_mv_user_descriptor_summary_user
ON mv_user_descriptor_summary (user_id);

CREATE INDEX IF NOT EXISTS idx_mv_user_descriptor_summary_user_type
ON mv_user_descriptor_summary (user_id, descriptor_type);

CREATE INDEX IF NOT EXISTS idx_mv_user_descriptor_summary_category
ON mv_user_descriptor_summary (category, subcategory);

CREATE INDEX IF NOT EXISTS idx_mv_user_descriptor_summary_count
ON mv_user_descriptor_summary (user_id, occurrence_count DESC);

COMMENT ON MATERIALIZED VIEW mv_user_descriptor_summary IS
'Pre-aggregated descriptor data per user for fast wheel generation.
Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_descriptor_summary;';

-- =============================================================================
-- STEP 2: Global Descriptor Statistics View
-- =============================================================================

-- For universal wheels and global statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_global_descriptor_stats AS
SELECT
    descriptor_type,
    category,
    subcategory,
    normalized_form,
    MIN(descriptor_text) as display_text,
    COUNT(*) as total_occurrences,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(COALESCE(intensity, 3)) as avg_intensity,
    AVG(COALESCE(confidence_score, 0.8)) as avg_confidence,
    COUNT(DISTINCT item_category) as category_breadth,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(intensity, 3)) as median_intensity,
    MAX(created_at) as last_used_globally,
    BOOL_OR(ai_extracted) as has_ai_extraction
FROM public.flavor_descriptors
GROUP BY
    descriptor_type,
    category,
    subcategory,
    normalized_form
HAVING COUNT(*) >= 2  -- Only include descriptors used at least twice
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_global_descriptor_stats_pk
ON mv_global_descriptor_stats (descriptor_type, category, subcategory, normalized_form);

CREATE INDEX IF NOT EXISTS idx_mv_global_descriptor_stats_type
ON mv_global_descriptor_stats (descriptor_type);

CREATE INDEX IF NOT EXISTS idx_mv_global_descriptor_stats_popularity
ON mv_global_descriptor_stats (total_occurrences DESC);

COMMENT ON MATERIALIZED VIEW mv_global_descriptor_stats IS
'Global descriptor statistics for universal wheels and trends.
Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_global_descriptor_stats;';

-- =============================================================================
-- STEP 3: Category Aggregation View
-- =============================================================================

-- For category-scoped wheels (e.g., all coffee descriptors)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_category_descriptor_summary AS
SELECT
    item_category,
    descriptor_type,
    category,
    subcategory,
    normalized_form,
    MIN(descriptor_text) as display_text,
    COUNT(*) as occurrence_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT item_name) as unique_items,
    AVG(COALESCE(intensity, 3)) as avg_intensity,
    AVG(COALESCE(confidence_score, 0.8)) as avg_confidence,
    MAX(created_at) as last_used_at
FROM public.flavor_descriptors
WHERE item_category IS NOT NULL
GROUP BY
    item_category,
    descriptor_type,
    category,
    subcategory,
    normalized_form
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_category_descriptor_summary_pk
ON mv_category_descriptor_summary (item_category, descriptor_type, category, subcategory, normalized_form);

CREATE INDEX IF NOT EXISTS idx_mv_category_descriptor_summary_category
ON mv_category_descriptor_summary (item_category);

CREATE INDEX IF NOT EXISTS idx_mv_category_descriptor_summary_item_type
ON mv_category_descriptor_summary (item_category, descriptor_type);

COMMENT ON MATERIALIZED VIEW mv_category_descriptor_summary IS
'Category-level descriptor aggregations for category-scoped wheels.
Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_descriptor_summary;';

-- =============================================================================
-- STEP 4: Wheel Generation Cache Statistics
-- =============================================================================

-- Quick stats for deciding whether to regenerate wheels
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_wheel_generation_stats AS
SELECT
    user_id,
    COUNT(*) as total_descriptors,
    COUNT(DISTINCT normalized_form) as unique_descriptors,
    COUNT(*) FILTER (WHERE descriptor_type = 'aroma') as aroma_count,
    COUNT(*) FILTER (WHERE descriptor_type = 'flavor') as flavor_count,
    COUNT(*) FILTER (WHERE descriptor_type = 'texture') as texture_count,
    COUNT(*) FILTER (WHERE descriptor_type = 'defect') as defect_count,
    COUNT(*) FILTER (WHERE descriptor_type = 'metaphor') as metaphor_count,
    COUNT(DISTINCT source_id) as source_count,
    COUNT(DISTINCT item_category) as category_count,
    MAX(created_at) as latest_descriptor_at,
    COUNT(*) FILTER (WHERE ai_extracted = TRUE) as ai_extracted_count,
    COUNT(*) FILTER (WHERE ai_extracted = FALSE OR ai_extracted IS NULL) as keyword_extracted_count
FROM public.flavor_descriptors
GROUP BY user_id
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_wheel_generation_stats_user
ON mv_wheel_generation_stats (user_id);

COMMENT ON MATERIALIZED VIEW mv_wheel_generation_stats IS
'Quick user-level statistics for wheel generation decisions.
Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wheel_generation_stats;';

-- =============================================================================
-- STEP 5: Optimized wheel data function using materialized views
-- =============================================================================

-- Function to generate wheel data using materialized view (10x faster)
CREATE OR REPLACE FUNCTION generate_wheel_data_optimized(
    p_user_id UUID,
    p_wheel_type TEXT DEFAULT 'combined',
    p_min_count INTEGER DEFAULT 1,
    p_max_per_subcategory INTEGER DEFAULT 10
)
RETURNS JSONB
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    WITH filtered_data AS (
        SELECT
            category,
            subcategory,
            display_text,
            occurrence_count,
            avg_intensity,
            ROW_NUMBER() OVER (
                PARTITION BY category, subcategory
                ORDER BY occurrence_count DESC
            ) as rank_in_subcategory
        FROM mv_user_descriptor_summary
        WHERE
            user_id = p_user_id
            AND (
                p_wheel_type = 'combined'
                OR descriptor_type = p_wheel_type
                OR (p_wheel_type = 'combined' AND descriptor_type IN ('aroma', 'flavor'))
            )
            AND occurrence_count >= p_min_count
    ),
    subcategory_data AS (
        SELECT
            category,
            subcategory,
            COALESCE(SUM(occurrence_count), 0) as subcategory_count,
            jsonb_agg(
                jsonb_build_object(
                    'text', display_text,
                    'count', occurrence_count,
                    'avgIntensity', ROUND(avg_intensity::numeric, 1)
                )
                ORDER BY occurrence_count DESC
            ) FILTER (WHERE rank_in_subcategory <= p_max_per_subcategory) as descriptors
        FROM filtered_data
        GROUP BY category, subcategory
    ),
    category_data AS (
        SELECT
            category,
            COALESCE(SUM(subcategory_count), 0) as category_count,
            jsonb_agg(
                jsonb_build_object(
                    'name', subcategory,
                    'count', subcategory_count,
                    'descriptors', descriptors
                )
                ORDER BY subcategory_count DESC
            ) as subcategories
        FROM subcategory_data
        GROUP BY category
    ),
    total_stats AS (
        SELECT
            COALESCE(SUM(category_count), 0) as total_count
        FROM category_data
    )
    SELECT jsonb_build_object(
        'categories', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'name', category,
                    'count', category_count,
                    'percentage', ROUND((category_count::numeric / NULLIF(total_stats.total_count, 0) * 100), 2),
                    'subcategories', subcategories
                )
                ORDER BY category_count DESC
            )
            FROM category_data, total_stats),
            '[]'::jsonb
        ),
        'totalDescriptors', (SELECT total_count FROM total_stats),
        'generatedAt', NOW()
    );
$$;

COMMENT ON FUNCTION generate_wheel_data_optimized(UUID, TEXT, INTEGER, INTEGER) IS
'Generates wheel data from materialized view for 10x faster performance.
Use instead of querying flavor_descriptors directly.';

-- =============================================================================
-- STEP 6: Refresh functions for materialized views
-- =============================================================================

-- Function to refresh all materialized views (for scheduled jobs)
CREATE OR REPLACE FUNCTION refresh_descriptor_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Refresh concurrently to avoid blocking queries
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_descriptor_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_global_descriptor_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_category_descriptor_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wheel_generation_stats;

    RAISE NOTICE 'All descriptor materialized views refreshed at %', NOW();
END;
$$;

COMMENT ON FUNCTION refresh_descriptor_views() IS
'Refreshes all descriptor-related materialized views.
Should be called periodically (e.g., every 5-15 minutes).';

-- Function to refresh only user-specific view (faster for single user updates)
CREATE OR REPLACE FUNCTION refresh_user_descriptor_summary()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_descriptor_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_wheel_generation_stats;
END;
$$;

-- =============================================================================
-- STEP 7: Trigger to mark when refresh is needed
-- =============================================================================

-- Create tracking table for view staleness
CREATE TABLE IF NOT EXISTS public.mv_refresh_status (
    view_name TEXT PRIMARY KEY,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    records_since_refresh INTEGER DEFAULT 0,
    needs_refresh BOOLEAN DEFAULT FALSE
);

-- Insert initial status records
INSERT INTO public.mv_refresh_status (view_name, last_refreshed_at, records_since_refresh, needs_refresh)
VALUES
    ('mv_user_descriptor_summary', NOW(), 0, FALSE),
    ('mv_global_descriptor_stats', NOW(), 0, FALSE),
    ('mv_category_descriptor_summary', NOW(), 0, FALSE),
    ('mv_wheel_generation_stats', NOW(), 0, FALSE)
ON CONFLICT (view_name) DO NOTHING;

-- Function to track when refresh is needed
CREATE OR REPLACE FUNCTION track_descriptor_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.mv_refresh_status
    SET
        records_since_refresh = records_since_refresh + 1,
        needs_refresh = TRUE
    WHERE view_name IN (
        'mv_user_descriptor_summary',
        'mv_global_descriptor_stats',
        'mv_category_descriptor_summary',
        'mv_wheel_generation_stats'
    );

    RETURN NEW;
END;
$$;

-- Create trigger to track changes
DROP TRIGGER IF EXISTS trg_track_descriptor_changes ON public.flavor_descriptors;
CREATE TRIGGER trg_track_descriptor_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.flavor_descriptors
    FOR EACH STATEMENT
    EXECUTE FUNCTION track_descriptor_changes();

-- =============================================================================
-- STEP 8: Check if refresh needed function
-- =============================================================================

CREATE OR REPLACE FUNCTION should_refresh_views(
    p_threshold INTEGER DEFAULT 100  -- Refresh after 100 changes
)
RETURNS BOOLEAN
STABLE
LANGUAGE SQL
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.mv_refresh_status
        WHERE needs_refresh = TRUE
        AND records_since_refresh >= p_threshold
    );
$$;

-- =============================================================================
-- STEP 9: Update refresh status after refresh
-- =============================================================================

CREATE OR REPLACE FUNCTION mark_views_refreshed()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.mv_refresh_status
    SET
        last_refreshed_at = NOW(),
        records_since_refresh = 0,
        needs_refresh = FALSE
    WHERE needs_refresh = TRUE;
END;
$$;

-- =============================================================================
-- STEP 10: Grant permissions
-- =============================================================================

GRANT SELECT ON mv_user_descriptor_summary TO authenticated;
GRANT SELECT ON mv_global_descriptor_stats TO authenticated;
GRANT SELECT ON mv_category_descriptor_summary TO authenticated;
GRANT SELECT ON mv_wheel_generation_stats TO authenticated;
GRANT SELECT ON public.mv_refresh_status TO authenticated;

GRANT ALL ON mv_user_descriptor_summary TO service_role;
GRANT ALL ON mv_global_descriptor_stats TO service_role;
GRANT ALL ON mv_category_descriptor_summary TO service_role;
GRANT ALL ON mv_wheel_generation_stats TO service_role;
GRANT ALL ON public.mv_refresh_status TO service_role;

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 003: Materialized Views Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - mv_user_descriptor_summary (user-level aggregation)';
    RAISE NOTICE '  - mv_global_descriptor_stats (global statistics)';
    RAISE NOTICE '  - mv_category_descriptor_summary (category aggregation)';
    RAISE NOTICE '  - mv_wheel_generation_stats (quick stats)';
    RAISE NOTICE '  - generate_wheel_data_optimized() function';
    RAISE NOTICE '  - refresh_descriptor_views() function';
    RAISE NOTICE '  - mv_refresh_status tracking table';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'To refresh views: SELECT refresh_descriptor_views();';
    RAISE NOTICE '========================================';
END $$;

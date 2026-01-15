-- =============================================================================
-- Migration 002: GIN Trigram Indexes for Fuzzy Matching
-- =============================================================================
-- Purpose: Enable fast fuzzy text search for flavor descriptors
-- Use cases:
--   - Autocomplete suggestions
--   - Typo-tolerant search
--   - Similarity-based deduplication
--   - Cross-language descriptor matching
--
-- Performance target: <50ms for similarity searches on 10M+ rows
-- =============================================================================

-- Ensure pg_trgm extension is available
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- STEP 1: GIN Trigram indexes for text search
-- =============================================================================

-- GIN trigram index on descriptor_text for fuzzy matching
-- This enables % (similarity) and <-> (word similarity) operators
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_text_trgm
ON public.flavor_descriptors
USING GIN (descriptor_text gin_trgm_ops);

-- GIN trigram index on normalized_form for dedupe matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_normalized_trgm
ON public.flavor_descriptors
USING GIN (normalized_form gin_trgm_ops);

-- GIN trigram index on category for category search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_category_trgm
ON public.flavor_descriptors
USING GIN (category gin_trgm_ops)
WHERE category IS NOT NULL;

-- GIN trigram index on subcategory
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_subcategory_trgm
ON public.flavor_descriptors
USING GIN (subcategory gin_trgm_ops)
WHERE subcategory IS NOT NULL;

-- =============================================================================
-- STEP 2: Full-text search indexes
-- =============================================================================

-- Add tsvector column for full-text search (better for phrase matching)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND column_name = 'textsearch_vector'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD COLUMN textsearch_vector tsvector
        GENERATED ALWAYS AS (
            setweight(to_tsvector('english', COALESCE(descriptor_text, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(category, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(subcategory, '')), 'C')
        ) STORED;
    END IF;
END $$;

-- GIN index for full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_textsearch
ON public.flavor_descriptors
USING GIN (textsearch_vector);

-- =============================================================================
-- STEP 3: Similarity search functions
-- =============================================================================

-- Function to find similar descriptors (for autocomplete/suggestions)
CREATE OR REPLACE FUNCTION find_similar_descriptors(
    p_search_text TEXT,
    p_user_id UUID DEFAULT NULL,
    p_descriptor_type TEXT DEFAULT NULL,
    p_similarity_threshold FLOAT DEFAULT 0.3,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    descriptor_text TEXT,
    descriptor_type TEXT,
    category TEXT,
    subcategory TEXT,
    usage_count BIGINT,
    similarity FLOAT
)
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    WITH ranked_descriptors AS (
        SELECT
            fd.id,
            fd.descriptor_text,
            fd.descriptor_type,
            fd.category,
            fd.subcategory,
            COUNT(*) OVER (PARTITION BY fd.normalized_form) as usage_count,
            similarity(fd.descriptor_text, p_search_text) as sim,
            ROW_NUMBER() OVER (
                PARTITION BY fd.normalized_form
                ORDER BY fd.created_at DESC
            ) as rn
        FROM public.flavor_descriptors fd
        WHERE
            similarity(fd.descriptor_text, p_search_text) >= p_similarity_threshold
            AND (p_user_id IS NULL OR fd.user_id = p_user_id)
            AND (p_descriptor_type IS NULL OR fd.descriptor_type = p_descriptor_type)
    )
    SELECT
        rd.id,
        rd.descriptor_text,
        rd.descriptor_type,
        rd.category,
        rd.subcategory,
        rd.usage_count,
        rd.sim as similarity
    FROM ranked_descriptors rd
    WHERE rd.rn = 1
    ORDER BY rd.sim DESC, rd.usage_count DESC
    LIMIT p_limit;
$$;

COMMENT ON FUNCTION find_similar_descriptors(TEXT, UUID, TEXT, FLOAT, INTEGER) IS
'Find descriptors similar to search text using trigram matching.
Returns deduplicated results ordered by similarity and usage count.';

-- Function to find potential duplicates for deduplication
CREATE OR REPLACE FUNCTION find_duplicate_descriptors(
    p_user_id UUID,
    p_similarity_threshold FLOAT DEFAULT 0.8,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    descriptor1_id UUID,
    descriptor1_text TEXT,
    descriptor2_id UUID,
    descriptor2_text TEXT,
    similarity FLOAT,
    descriptor_type TEXT
)
STABLE
LANGUAGE SQL
AS $$
    SELECT DISTINCT ON (LEAST(fd1.id, fd2.id), GREATEST(fd1.id, fd2.id))
        fd1.id as descriptor1_id,
        fd1.descriptor_text as descriptor1_text,
        fd2.id as descriptor2_id,
        fd2.descriptor_text as descriptor2_text,
        similarity(fd1.normalized_form, fd2.normalized_form) as similarity,
        fd1.descriptor_type
    FROM public.flavor_descriptors fd1
    JOIN public.flavor_descriptors fd2
        ON fd1.user_id = fd2.user_id
        AND fd1.descriptor_type = fd2.descriptor_type
        AND fd1.id < fd2.id
        AND fd1.normalized_form <> fd2.normalized_form
        AND similarity(fd1.normalized_form, fd2.normalized_form) >= p_similarity_threshold
    WHERE fd1.user_id = p_user_id
    ORDER BY
        LEAST(fd1.id, fd2.id),
        GREATEST(fd1.id, fd2.id),
        similarity(fd1.normalized_form, fd2.normalized_form) DESC
    LIMIT p_limit;
$$;

COMMENT ON FUNCTION find_duplicate_descriptors(UUID, FLOAT, INTEGER) IS
'Find potential duplicate descriptors for a user based on similarity threshold.
Useful for deduplication workflows.';

-- Function for autocomplete (fast prefix + similarity matching)
CREATE OR REPLACE FUNCTION autocomplete_descriptors(
    p_prefix TEXT,
    p_user_id UUID DEFAULT NULL,
    p_descriptor_type TEXT DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    descriptor_text TEXT,
    descriptor_type TEXT,
    category TEXT,
    usage_count BIGINT,
    match_type TEXT
)
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    -- Combine prefix matches (exact start) with similarity matches
    WITH prefix_matches AS (
        SELECT DISTINCT ON (normalized_form)
            fd.descriptor_text,
            fd.descriptor_type,
            fd.category,
            COUNT(*) OVER (PARTITION BY fd.normalized_form) as usage_count,
            'prefix' as match_type,
            1 as priority
        FROM public.flavor_descriptors fd
        WHERE
            fd.descriptor_text ILIKE p_prefix || '%'
            AND (p_user_id IS NULL OR fd.user_id = p_user_id)
            AND (p_descriptor_type IS NULL OR fd.descriptor_type = p_descriptor_type)
            AND (p_category IS NULL OR fd.category = p_category)
        ORDER BY fd.normalized_form, fd.created_at DESC
        LIMIT p_limit
    ),
    similarity_matches AS (
        SELECT DISTINCT ON (normalized_form)
            fd.descriptor_text,
            fd.descriptor_type,
            fd.category,
            COUNT(*) OVER (PARTITION BY fd.normalized_form) as usage_count,
            'similar' as match_type,
            2 as priority
        FROM public.flavor_descriptors fd
        WHERE
            fd.descriptor_text % p_prefix
            AND fd.descriptor_text NOT ILIKE p_prefix || '%'
            AND (p_user_id IS NULL OR fd.user_id = p_user_id)
            AND (p_descriptor_type IS NULL OR fd.descriptor_type = p_descriptor_type)
            AND (p_category IS NULL OR fd.category = p_category)
        ORDER BY
            fd.normalized_form,
            similarity(fd.descriptor_text, p_prefix) DESC
        LIMIT p_limit
    )
    SELECT
        descriptor_text,
        descriptor_type,
        category,
        usage_count,
        match_type
    FROM (
        SELECT * FROM prefix_matches
        UNION ALL
        SELECT * FROM similarity_matches
    ) combined
    ORDER BY priority, usage_count DESC
    LIMIT p_limit;
$$;

COMMENT ON FUNCTION autocomplete_descriptors(TEXT, UUID, TEXT, TEXT, INTEGER) IS
'Fast autocomplete for descriptors combining prefix and similarity matching.
Returns results ordered by match quality and usage frequency.';

-- =============================================================================
-- STEP 4: Fuzzy match for category suggestions
-- =============================================================================

CREATE OR REPLACE FUNCTION suggest_descriptor_category(
    p_descriptor_text TEXT,
    p_similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    suggested_category TEXT,
    suggested_subcategory TEXT,
    confidence FLOAT,
    based_on_count BIGINT
)
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT
        category as suggested_category,
        subcategory as suggested_subcategory,
        MAX(similarity(descriptor_text, p_descriptor_text)) as confidence,
        COUNT(*) as based_on_count
    FROM public.flavor_descriptors
    WHERE
        similarity(descriptor_text, p_descriptor_text) >= p_similarity_threshold
        AND category IS NOT NULL
    GROUP BY category, subcategory
    ORDER BY confidence DESC, based_on_count DESC
    LIMIT 5;
$$;

COMMENT ON FUNCTION suggest_descriptor_category(TEXT, FLOAT) IS
'Suggests category and subcategory for a descriptor based on similar existing descriptors.
Useful for auto-categorization of new descriptors.';

-- =============================================================================
-- STEP 5: Set similarity threshold for query optimization
-- =============================================================================

-- Set default similarity threshold for better query performance
ALTER DATABASE CURRENT SET pg_trgm.similarity_threshold = 0.3;

-- =============================================================================
-- STEP 6: Update statistics
-- =============================================================================

ANALYZE public.flavor_descriptors;

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 002: Trigram Fuzzy Search Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added:';
    RAISE NOTICE '  - GIN trigram index on descriptor_text';
    RAISE NOTICE '  - GIN trigram index on normalized_form';
    RAISE NOTICE '  - GIN trigram index on category/subcategory';
    RAISE NOTICE '  - Full-text search tsvector column and index';
    RAISE NOTICE '  - find_similar_descriptors() function';
    RAISE NOTICE '  - find_duplicate_descriptors() function';
    RAISE NOTICE '  - autocomplete_descriptors() function';
    RAISE NOTICE '  - suggest_descriptor_category() function';
    RAISE NOTICE '========================================';
END $$;

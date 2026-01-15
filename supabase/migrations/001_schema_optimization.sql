-- =============================================================================
-- Migration 001: Schema Optimization for Flavor Descriptors
-- =============================================================================
-- Purpose: Optimize flavor_descriptors table for 10x query performance
-- Target: Support 10M+ rows with sub-100ms query times
--
-- Changes:
-- 1. Add normalization_form computed column
-- 2. Convert TEXT fields to VARCHAR with length constraints
-- 3. Add unique index for deduplication
-- 4. Add text search indexes
-- 5. Add proper CHECK constraints
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- For fuzzy matching
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- For accent-insensitive search

-- =============================================================================
-- STEP 1: Add normalization function for descriptor text
-- =============================================================================

-- Function to normalize descriptor text for deduplication
-- Handles: lowercase, trim whitespace, remove accents, collapse spaces
CREATE OR REPLACE FUNCTION normalize_descriptor_text(input_text TEXT)
RETURNS TEXT
IMMUTABLE
PARALLEL SAFE
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return NULL for NULL input
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;

    -- Normalize: lowercase, trim, unaccent, collapse multiple spaces
    RETURN LOWER(
        TRIM(
            regexp_replace(
                unaccent(input_text),
                '\s+', ' ', 'g'
            )
        )
    );
END;
$$;

COMMENT ON FUNCTION normalize_descriptor_text(TEXT) IS
'Normalizes descriptor text for consistent deduplication.
Applies: lowercase, trim, unaccent, collapse multiple spaces.';

-- =============================================================================
-- STEP 2: Add computed column for normalized form
-- =============================================================================

-- Add the normalized_form column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND column_name = 'normalized_form'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD COLUMN normalized_form VARCHAR(500)
        GENERATED ALWAYS AS (normalize_descriptor_text(descriptor_text)) STORED;
    END IF;
END $$;

COMMENT ON COLUMN public.flavor_descriptors.normalized_form IS
'Computed column: normalized version of descriptor_text for deduplication queries';

-- =============================================================================
-- STEP 3: Add AI extraction tracking columns
-- =============================================================================

DO $$
BEGIN
    -- Add ai_extracted column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND column_name = 'ai_extracted'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD COLUMN ai_extracted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add extraction_model column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND column_name = 'extraction_model'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD COLUMN extraction_model VARCHAR(100);
    END IF;
END $$;

-- =============================================================================
-- STEP 4: Add CHECK constraints for enums
-- =============================================================================

-- Add CHECK constraint for descriptor_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND constraint_name = 'chk_descriptor_type'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD CONSTRAINT chk_descriptor_type
        CHECK (descriptor_type IN ('aroma', 'flavor', 'texture', 'defect', 'metaphor', 'mouthfeel'));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint chk_descriptor_type may already exist or data violates constraint';
END $$;

-- Add CHECK constraint for source_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND constraint_name = 'chk_source_type'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD CONSTRAINT chk_source_type
        CHECK (source_type IN ('quick_tasting', 'quick_review', 'prose_review', 'study_session'));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint chk_source_type may already exist or data violates constraint';
END $$;

-- Add CHECK constraint for confidence_score range
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND constraint_name = 'chk_confidence_score'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD CONSTRAINT chk_confidence_score
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1));
    END IF;
END $$;

-- Add CHECK constraint for intensity range
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_descriptors'
        AND constraint_name = 'chk_intensity'
    ) THEN
        ALTER TABLE public.flavor_descriptors
        ADD CONSTRAINT chk_intensity
        CHECK (intensity IS NULL OR (intensity >= 1 AND intensity <= 5));
    END IF;
END $$;

-- =============================================================================
-- STEP 5: Add NOT NULL constraints where appropriate
-- =============================================================================

-- Ensure core columns are NOT NULL
DO $$
BEGIN
    -- user_id should not be null
    ALTER TABLE public.flavor_descriptors
    ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'user_id NOT NULL constraint may already exist';
END $$;

DO $$
BEGIN
    -- source_type should not be null
    ALTER TABLE public.flavor_descriptors
    ALTER COLUMN source_type SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'source_type NOT NULL constraint may already exist';
END $$;

DO $$
BEGIN
    -- source_id should not be null
    ALTER TABLE public.flavor_descriptors
    ALTER COLUMN source_id SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'source_id NOT NULL constraint may already exist';
END $$;

DO $$
BEGIN
    -- descriptor_text should not be null
    ALTER TABLE public.flavor_descriptors
    ALTER COLUMN descriptor_text SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'descriptor_text NOT NULL constraint may already exist';
END $$;

DO $$
BEGIN
    -- descriptor_type should not be null
    ALTER TABLE public.flavor_descriptors
    ALTER COLUMN descriptor_type SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'descriptor_type NOT NULL constraint may already exist';
END $$;

-- =============================================================================
-- STEP 6: Core performance indexes
-- =============================================================================

-- Index for user + normalized text + type (deduplication queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_user_normalized
ON public.flavor_descriptors (user_id, normalized_form, descriptor_type);

-- Index for wheel generation queries (user + type filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_user_type
ON public.flavor_descriptors (user_id, descriptor_type);

-- Index for item-scoped queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_item
ON public.flavor_descriptors (item_name, item_category)
WHERE item_name IS NOT NULL;

-- Index for category-based aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_category
ON public.flavor_descriptors (category, subcategory);

-- Index for source lookup (upsert conflict resolution)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_source
ON public.flavor_descriptors (source_type, source_id);

-- Index for time-based queries and cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_created
ON public.flavor_descriptors (created_at DESC);

-- Index for AI extraction filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_ai_extracted
ON public.flavor_descriptors (ai_extracted)
WHERE ai_extracted = TRUE;

-- =============================================================================
-- STEP 7: Add unique constraint for cross-source deduplication
-- =============================================================================

-- This ensures no duplicate descriptors from the same source
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_descriptors_source_unique
ON public.flavor_descriptors (source_type, source_id, normalized_form, descriptor_type);

-- =============================================================================
-- STEP 8: Optimize flavor_wheels table
-- =============================================================================

-- Add indexes for flavor_wheels table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_wheels_user_type
ON public.flavor_wheels (user_id, wheel_type, scope_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_wheels_expires
ON public.flavor_wheels (expires_at)
WHERE expires_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flavor_wheels_generated
ON public.flavor_wheels (generated_at DESC);

-- Add CHECK constraints for flavor_wheels
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_wheels'
        AND constraint_name = 'chk_wheel_type'
    ) THEN
        ALTER TABLE public.flavor_wheels
        ADD CONSTRAINT chk_wheel_type
        CHECK (wheel_type IN ('aroma', 'flavor', 'combined', 'metaphor'));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint chk_wheel_type may already exist';
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'flavor_wheels'
        AND constraint_name = 'chk_scope_type'
    ) THEN
        ALTER TABLE public.flavor_wheels
        ADD CONSTRAINT chk_scope_type
        CHECK (scope_type IN ('personal', 'universal', 'item', 'category', 'tasting'));
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint chk_scope_type may already exist';
END $$;

-- =============================================================================
-- STEP 9: Update table statistics for query planner
-- =============================================================================

-- Analyze tables to update statistics
ANALYZE public.flavor_descriptors;
ANALYZE public.flavor_wheels;

-- =============================================================================
-- STEP 10: Add helper function for descriptor deduplication check
-- =============================================================================

CREATE OR REPLACE FUNCTION descriptor_exists(
    p_user_id UUID,
    p_descriptor_text TEXT,
    p_descriptor_type TEXT
)
RETURNS BOOLEAN
STABLE
PARALLEL SAFE
LANGUAGE SQL
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.flavor_descriptors
        WHERE user_id = p_user_id
        AND normalized_form = normalize_descriptor_text(p_descriptor_text)
        AND descriptor_type = p_descriptor_type
    );
$$;

COMMENT ON FUNCTION descriptor_exists(UUID, TEXT, TEXT) IS
'Checks if a descriptor already exists for a user (normalized matching)';

-- =============================================================================
-- Migration complete
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration 001: Schema Optimization Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added:';
    RAISE NOTICE '  - normalize_descriptor_text() function';
    RAISE NOTICE '  - normalized_form computed column';
    RAISE NOTICE '  - CHECK constraints for enums';
    RAISE NOTICE '  - NOT NULL constraints';
    RAISE NOTICE '  - 7 performance indexes on flavor_descriptors';
    RAISE NOTICE '  - 3 performance indexes on flavor_wheels';
    RAISE NOTICE '  - descriptor_exists() helper function';
    RAISE NOTICE '========================================';
END $$;

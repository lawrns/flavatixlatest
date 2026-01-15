-- Migration: Add unique constraint for normalized descriptors (case-insensitive deduplication)
-- Created: 2026-01-15
-- Purpose: Prevent duplicate descriptors with different casing (e.g., "Chocolate" vs "chocolate")

BEGIN;

-- ============================================================================
-- PART 1: Add normalized_form column if not exists and populate it
-- ============================================================================

-- The normalized_form column already exists in schema but might not be populated
-- Update it to ensure it's always lowercase trimmed version of descriptor_text
UPDATE public.flavor_descriptors
SET normalized_form = LOWER(TRIM(descriptor_text))
WHERE normalized_form IS NULL OR normalized_form != LOWER(TRIM(descriptor_text));

-- Make normalized_form column NOT NULL and add generation trigger
ALTER TABLE public.flavor_descriptors
  ALTER COLUMN normalized_form SET NOT NULL;

-- Create function to auto-generate normalized_form
CREATE OR REPLACE FUNCTION generate_normalized_descriptor_form()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_form = LOWER(TRIM(NEW.descriptor_text));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate normalized_form
DROP TRIGGER IF EXISTS trigger_generate_normalized_form ON public.flavor_descriptors;
CREATE TRIGGER trigger_generate_normalized_form
  BEFORE INSERT OR UPDATE OF descriptor_text ON public.flavor_descriptors
  FOR EACH ROW
  EXECUTE FUNCTION generate_normalized_descriptor_form();


-- ============================================================================
-- PART 2: Add unique constraint on (user_id, LOWER(descriptor_text), descriptor_type)
-- ============================================================================

-- First, let's identify and report existing duplicates
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, LOWER(TRIM(descriptor_text)) as normalized, descriptor_type, COUNT(*) as cnt
    FROM public.flavor_descriptors
    GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % groups of duplicate descriptors. See deduplication script.', duplicate_count;

    -- Log some examples
    RAISE NOTICE 'Example duplicates (first 5 groups):';
    FOR r IN (
      SELECT
        user_id,
        LOWER(TRIM(descriptor_text)) as normalized,
        descriptor_type,
        COUNT(*) as duplicate_count,
        STRING_AGG(DISTINCT descriptor_text, ', ' ORDER BY descriptor_text) as variations
      FROM public.flavor_descriptors
      GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
      HAVING COUNT(*) > 1
      LIMIT 5
    )
    LOOP
      RAISE NOTICE 'User: %, Type: %, Normalized: "%" (% duplicates), Variations: %',
        r.user_id, r.descriptor_type, r.normalized, r.duplicate_count, r.variations;
    END LOOP;
  ELSE
    RAISE NOTICE 'No duplicate descriptors found. Safe to add unique constraint.';
  END IF;
END $$;

-- Create unique index on normalized form
-- NOTE: This will fail if duplicates exist - run deduplication script first!
CREATE UNIQUE INDEX IF NOT EXISTS idx_flavor_descriptors_unique_normalized
  ON public.flavor_descriptors (user_id, normalized_form, descriptor_type);

-- Add comment explaining the constraint
COMMENT ON INDEX idx_flavor_descriptors_unique_normalized IS
  'Ensures case-insensitive uniqueness of descriptors per user and type. Prevents "Chocolate" and "chocolate" duplicates.';


-- ============================================================================
-- PART 3: Add index on normalized_form for fast lookups
-- ============================================================================

-- Index for fast case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_normalized_form
  ON public.flavor_descriptors (normalized_form);

-- Index for user-specific normalized searches
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_user_normalized
  ON public.flavor_descriptors (user_id, normalized_form);

-- GIN index for full-text search on normalized form
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_normalized_text_search
  ON public.flavor_descriptors USING gin (to_tsvector('english', normalized_form));


-- ============================================================================
-- PART 4: Create helper function for case-insensitive descriptor lookup
-- ============================================================================

CREATE OR REPLACE FUNCTION find_descriptor_by_text(
  p_user_id UUID,
  p_descriptor_text TEXT,
  p_descriptor_type TEXT
)
RETURNS TABLE (
  id UUID,
  descriptor_text TEXT,
  normalized_form TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fd.id,
    fd.descriptor_text,
    fd.normalized_form,
    fd.created_at
  FROM public.flavor_descriptors fd
  WHERE fd.user_id = p_user_id
    AND fd.normalized_form = LOWER(TRIM(p_descriptor_text))
    AND fd.descriptor_type = p_descriptor_type
  ORDER BY fd.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_descriptor_by_text IS
  'Case-insensitive lookup of flavor descriptors. Returns the most recent match.';


-- ============================================================================
-- PART 5: Update existing unique constraint to include normalized form
-- ============================================================================

-- Drop old unique constraint that doesn't handle case sensitivity
-- The old constraint was: source_type, source_id, descriptor_text, descriptor_type
-- We'll keep it but add another one for user-level uniqueness

-- Note: The source-level uniqueness is still valuable (same source, same descriptor)
-- But we're adding user-level uniqueness to prevent "chocolate" and "Chocolate" for same user


COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run these manually after migration)
-- ============================================================================

-- Test case-insensitive uniqueness (should fail on second insert):
-- INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'quick_tasting',
--   gen_random_uuid(),
--   'Chocolate',
--   'aroma'
-- );
--
-- INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'quick_tasting',
--   gen_random_uuid(),
--   'chocolate',  -- Different case
--   'aroma'
-- );
-- Expected: ERROR: duplicate key value violates unique constraint

-- Check normalized forms are populated:
-- SELECT
--   descriptor_text,
--   normalized_form,
--   descriptor_text = normalized_form as exact_match,
--   CASE
--     WHEN descriptor_text != normalized_form THEN 'NORMALIZED'
--     ELSE 'UNCHANGED'
--   END as status
-- FROM flavor_descriptors
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Find descriptors with case variations:
-- SELECT
--   user_id,
--   normalized_form,
--   descriptor_type,
--   COUNT(*) as variation_count,
--   STRING_AGG(DISTINCT descriptor_text, ' | ' ORDER BY descriptor_text) as all_variations
-- FROM flavor_descriptors
-- GROUP BY user_id, normalized_form, descriptor_type
-- HAVING COUNT(DISTINCT descriptor_text) > 1
-- ORDER BY variation_count DESC;

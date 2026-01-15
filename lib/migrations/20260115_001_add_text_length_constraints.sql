-- Migration: Add TEXT field length constraints and convert mode to ENUM
-- Created: 2026-01-15
-- Purpose: Enforce data integrity with field length limits and proper ENUM types

BEGIN;

-- ============================================================================
-- PART 1: Add length constraints to TEXT fields
-- ============================================================================

-- Add CHECK constraints for descriptor_text (max 500 chars)
ALTER TABLE public.flavor_descriptors
  ADD CONSTRAINT flavor_descriptors_descriptor_text_length_check
  CHECK (char_length(descriptor_text) <= 500);

-- Add CHECK constraint for item_name in flavor_descriptors (max 200 chars)
ALTER TABLE public.flavor_descriptors
  ADD CONSTRAINT flavor_descriptors_item_name_length_check
  CHECK (item_name IS NULL OR char_length(item_name) <= 200);

-- Add CHECK constraint for item_name in quick_tasting_items (max 200 chars)
ALTER TABLE public.quick_tasting_items
  ADD CONSTRAINT quick_tasting_items_item_name_length_check
  CHECK (char_length(item_name) <= 200);

-- Verify no existing data violates constraints before proceeding
DO $$
DECLARE
  violating_count INTEGER;
BEGIN
  -- Check flavor_descriptors.descriptor_text
  SELECT COUNT(*) INTO violating_count
  FROM public.flavor_descriptors
  WHERE char_length(descriptor_text) > 500;

  IF violating_count > 0 THEN
    RAISE WARNING 'Found % rows in flavor_descriptors with descriptor_text > 500 chars', violating_count;
  END IF;

  -- Check flavor_descriptors.item_name
  SELECT COUNT(*) INTO violating_count
  FROM public.flavor_descriptors
  WHERE item_name IS NOT NULL AND char_length(item_name) > 200;

  IF violating_count > 0 THEN
    RAISE WARNING 'Found % rows in flavor_descriptors with item_name > 200 chars', violating_count;
  END IF;

  -- Check quick_tasting_items.item_name
  SELECT COUNT(*) INTO violating_count
  FROM public.quick_tasting_items
  WHERE char_length(item_name) > 200;

  IF violating_count > 0 THEN
    RAISE WARNING 'Found % rows in quick_tasting_items with item_name > 200 chars', violating_count;
  END IF;
END $$;


-- ============================================================================
-- PART 2: Convert mode from TEXT to proper PostgreSQL ENUM
-- ============================================================================

-- Create the ENUM type for tasting mode
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasting_mode') THEN
    CREATE TYPE tasting_mode AS ENUM ('study', 'competition', 'quick');
  END IF;
END $$;

-- Add new column with ENUM type
ALTER TABLE public.quick_tastings
  ADD COLUMN mode_enum tasting_mode;

-- Migrate data from TEXT column to ENUM column
UPDATE public.quick_tastings
SET mode_enum = mode::tasting_mode
WHERE mode IN ('study', 'competition', 'quick');

-- Verify migration was successful
DO $$
DECLARE
  unmigrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmigrated_count
  FROM public.quick_tastings
  WHERE mode_enum IS NULL;

  IF unmigrated_count > 0 THEN
    RAISE EXCEPTION 'Failed to migrate % rows - invalid mode values exist', unmigrated_count;
  END IF;
END $$;

-- Make new column NOT NULL
ALTER TABLE public.quick_tastings
  ALTER COLUMN mode_enum SET NOT NULL;

-- Drop old TEXT column constraint
ALTER TABLE public.quick_tastings
  DROP CONSTRAINT IF EXISTS quick_tastings_mode_check;

-- Rename columns
ALTER TABLE public.quick_tastings
  RENAME COLUMN mode TO mode_old;

ALTER TABLE public.quick_tastings
  RENAME COLUMN mode_enum TO mode;

-- Add default value
ALTER TABLE public.quick_tastings
  ALTER COLUMN mode SET DEFAULT 'study'::tasting_mode;

-- Drop old column (commented out for safety - uncomment after verification)
-- ALTER TABLE public.quick_tastings DROP COLUMN mode_old;


-- ============================================================================
-- PART 3: Add indexes for new constraints
-- ============================================================================

-- Add index on descriptor_text length for monitoring
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_long_text
  ON public.flavor_descriptors (char_length(descriptor_text))
  WHERE char_length(descriptor_text) > 400;

-- Add index on mode for query performance
CREATE INDEX IF NOT EXISTS idx_quick_tastings_mode
  ON public.quick_tastings (mode);


COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run these manually after migration)
-- ============================================================================

-- Verify constraint is working:
-- INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type)
-- VALUES (gen_random_uuid(), 'quick_tasting', gen_random_uuid(), repeat('a', 501), 'aroma');
-- Expected: ERROR: new row violates check constraint

-- Check for long descriptors:
-- SELECT id, char_length(descriptor_text), descriptor_text
-- FROM flavor_descriptors
-- WHERE char_length(descriptor_text) > 400
-- ORDER BY char_length(descriptor_text) DESC
-- LIMIT 10;

-- Verify mode ENUM is working:
-- SELECT mode, pg_typeof(mode), COUNT(*)
-- FROM quick_tastings
-- GROUP BY mode, pg_typeof(mode);

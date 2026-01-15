-- Migration: Add CASCADE DELETE constraints for orphaned data prevention
-- Created: 2026-01-15
-- Purpose: Ensure orphaned flavor_descriptors are automatically cleaned up when source records are deleted

BEGIN;

-- ============================================================================
-- PART 1: Identify orphaned flavor_descriptors before adding constraints
-- ============================================================================

DO $$
DECLARE
  orphaned_quick_tasting INTEGER;
  orphaned_quick_review INTEGER;
  orphaned_prose_review INTEGER;
  total_orphaned INTEGER;
BEGIN
  -- Count orphaned descriptors from quick_tastings
  SELECT COUNT(*) INTO orphaned_quick_tasting
  FROM public.flavor_descriptors fd
  WHERE fd.source_type = 'quick_tasting'
    AND NOT EXISTS (
      SELECT 1 FROM public.quick_tastings qt WHERE qt.id = fd.source_id
    );

  -- Count orphaned descriptors from quick_reviews
  SELECT COUNT(*) INTO orphaned_quick_review
  FROM public.flavor_descriptors fd
  WHERE fd.source_type = 'quick_review'
    AND NOT EXISTS (
      SELECT 1 FROM public.quick_reviews qr WHERE qr.id = fd.source_id
    );

  -- Count orphaned descriptors from prose_reviews
  SELECT COUNT(*) INTO orphaned_prose_review
  FROM public.flavor_descriptors fd
  WHERE fd.source_type = 'prose_review'
    AND NOT EXISTS (
      SELECT 1 FROM public.prose_reviews pr WHERE pr.id = fd.source_id
    );

  total_orphaned := orphaned_quick_tasting + orphaned_quick_review + orphaned_prose_review;

  IF total_orphaned > 0 THEN
    RAISE WARNING 'Found % orphaned flavor_descriptors:', total_orphaned;
    RAISE WARNING '  - % from deleted quick_tastings', orphaned_quick_tasting;
    RAISE WARNING '  - % from deleted quick_reviews', orphaned_quick_review;
    RAISE WARNING '  - % from deleted prose_reviews', orphaned_prose_review;
    RAISE NOTICE 'Run the cleanup script (20260115_005_cleanup_orphaned_descriptors.sql) to remove these before adding foreign keys.';
  ELSE
    RAISE NOTICE 'No orphaned flavor_descriptors found. Safe to add foreign key constraints.';
  END IF;
END $$;


-- ============================================================================
-- PART 2: Add foreign key constraints with CASCADE DELETE
-- ============================================================================

-- NOTE: These constraints cannot be added directly because flavor_descriptors
-- uses a polymorphic pattern (source_type + source_id) that references different tables.
-- PostgreSQL foreign keys can only reference a single table.

-- Instead, we'll create triggers to enforce referential integrity and cascading deletes.

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_tasting_descriptors ON public.quick_tastings;
DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_review_descriptors ON public.quick_reviews;
DROP TRIGGER IF EXISTS trigger_cascade_delete_prose_review_descriptors ON public.prose_reviews;


-- ============================================================================
-- PART 3: Create trigger functions for CASCADE DELETE behavior
-- ============================================================================

-- Function to delete flavor_descriptors when quick_tasting is deleted
CREATE OR REPLACE FUNCTION cascade_delete_quick_tasting_descriptors()
RETURNS TRIGGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flavor_descriptors
  WHERE source_type = 'quick_tasting'
    AND source_id = OLD.id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cascade deleted % flavor_descriptors for quick_tasting %', deleted_count, OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to delete flavor_descriptors when quick_review is deleted
CREATE OR REPLACE FUNCTION cascade_delete_quick_review_descriptors()
RETURNS TRIGGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flavor_descriptors
  WHERE source_type = 'quick_review'
    AND source_id = OLD.id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cascade deleted % flavor_descriptors for quick_review %', deleted_count, OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to delete flavor_descriptors when prose_review is deleted
CREATE OR REPLACE FUNCTION cascade_delete_prose_review_descriptors()
RETURNS TRIGGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flavor_descriptors
  WHERE source_type = 'prose_review'
    AND source_id = OLD.id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cascade deleted % flavor_descriptors for prose_review %', deleted_count, OLD.id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- PART 4: Create triggers for CASCADE DELETE
-- ============================================================================

-- Trigger for quick_tastings
CREATE TRIGGER trigger_cascade_delete_quick_tasting_descriptors
  BEFORE DELETE ON public.quick_tastings
  FOR EACH ROW
  EXECUTE FUNCTION cascade_delete_quick_tasting_descriptors();

-- Trigger for quick_reviews
CREATE TRIGGER trigger_cascade_delete_quick_review_descriptors
  BEFORE DELETE ON public.quick_reviews
  FOR EACH ROW
  EXECUTE FUNCTION cascade_delete_quick_review_descriptors();

-- Trigger for prose_reviews
CREATE TRIGGER trigger_cascade_delete_prose_review_descriptors
  BEFORE DELETE ON public.prose_reviews
  FOR EACH ROW
  EXECUTE FUNCTION cascade_delete_prose_review_descriptors();

-- Add comments
COMMENT ON TRIGGER trigger_cascade_delete_quick_tasting_descriptors ON public.quick_tastings IS
  'Automatically deletes associated flavor_descriptors when a quick_tasting is deleted';

COMMENT ON TRIGGER trigger_cascade_delete_quick_review_descriptors ON public.quick_reviews IS
  'Automatically deletes associated flavor_descriptors when a quick_review is deleted';

COMMENT ON TRIGGER trigger_cascade_delete_prose_review_descriptors ON public.prose_reviews IS
  'Automatically deletes associated flavor_descriptors when a prose_review is deleted';


-- ============================================================================
-- PART 5: Create validation trigger to prevent invalid source references
-- ============================================================================

-- Function to validate source_id references exist
CREATE OR REPLACE FUNCTION validate_flavor_descriptor_source()
RETURNS TRIGGER AS $$
DECLARE
  source_exists BOOLEAN;
BEGIN
  -- Validate that the source_id references an existing record
  CASE NEW.source_type
    WHEN 'quick_tasting' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.quick_tastings WHERE id = NEW.source_id
      ) INTO source_exists;

    WHEN 'quick_review' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.quick_reviews WHERE id = NEW.source_id
      ) INTO source_exists;

    WHEN 'prose_review' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.prose_reviews WHERE id = NEW.source_id
      ) INTO source_exists;

    ELSE
      RAISE EXCEPTION 'Invalid source_type: %', NEW.source_type;
  END CASE;

  IF NOT source_exists THEN
    RAISE EXCEPTION 'Referenced source does not exist: source_type=%, source_id=%',
      NEW.source_type, NEW.source_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate source references on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_validate_descriptor_source ON public.flavor_descriptors;
CREATE TRIGGER trigger_validate_descriptor_source
  BEFORE INSERT OR UPDATE OF source_type, source_id ON public.flavor_descriptors
  FOR EACH ROW
  EXECUTE FUNCTION validate_flavor_descriptor_source();

COMMENT ON TRIGGER trigger_validate_descriptor_source ON public.flavor_descriptors IS
  'Validates that flavor_descriptor source_id references an existing record in the appropriate source table';


-- ============================================================================
-- PART 6: Add indexes to improve cascade delete performance
-- ============================================================================

-- Index on source_type and source_id for fast cascade deletes
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_source_cascade
  ON public.flavor_descriptors (source_type, source_id);

-- Partial indexes for each source type
CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_quick_tasting_source
  ON public.flavor_descriptors (source_id)
  WHERE source_type = 'quick_tasting';

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_quick_review_source
  ON public.flavor_descriptors (source_id)
  WHERE source_type = 'quick_review';

CREATE INDEX IF NOT EXISTS idx_flavor_descriptors_prose_review_source
  ON public.flavor_descriptors (source_id)
  WHERE source_type = 'prose_review';


COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run these manually after migration)
-- ============================================================================

-- Test cascade delete for quick_tasting:
-- BEGIN;
--   INSERT INTO quick_tastings (id, user_id, category, mode)
--   VALUES (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'Coffee', 'study');
--
--   INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type)
--   VALUES (
--     (SELECT id FROM auth.users LIMIT 1),
--     'quick_tasting',
--     (SELECT id FROM quick_tastings ORDER BY created_at DESC LIMIT 1),
--     'Test Chocolate',
--     'aroma'
--   );
--
--   -- This should cascade delete the flavor_descriptor
--   DELETE FROM quick_tastings WHERE id = (SELECT id FROM quick_tastings ORDER BY created_at DESC LIMIT 1);
--
--   -- Verify descriptor was deleted
--   SELECT COUNT(*) FROM flavor_descriptors WHERE descriptor_text = 'Test Chocolate';
--   -- Expected: 0
-- ROLLBACK;

-- Check for remaining orphaned descriptors:
-- SELECT
--   fd.source_type,
--   COUNT(*) as orphaned_count
-- FROM public.flavor_descriptors fd
-- WHERE
--   (fd.source_type = 'quick_tasting' AND NOT EXISTS (SELECT 1 FROM quick_tastings WHERE id = fd.source_id))
--   OR (fd.source_type = 'quick_review' AND NOT EXISTS (SELECT 1 FROM quick_reviews WHERE id = fd.source_id))
--   OR (fd.source_type = 'prose_review' AND NOT EXISTS (SELECT 1 FROM prose_reviews WHERE id = fd.source_id))
-- GROUP BY fd.source_type;

-- Test invalid source reference (should fail):
-- INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'quick_tasting',
--   '00000000-0000-0000-0000-000000000000',  -- Non-existent ID
--   'Should Fail',
--   'aroma'
-- );
-- Expected: ERROR: Referenced source does not exist

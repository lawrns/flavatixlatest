-- Migration: Add CHECK constraint for completed tastings
-- Created: 2026-01-15
-- Purpose: Ensure data integrity - completed tastings must have completed_at timestamp

BEGIN;

-- ============================================================================
-- PART 1: Add CHECK constraint for completed tastings
-- ============================================================================

-- A tasting is considered "completed" when all items have been tasted
-- This means completed_items should equal total_items when completed_at is set
-- Also, completed_at should only be set when tasting is actually finished

ALTER TABLE public.quick_tastings
  ADD CONSTRAINT quick_tastings_completed_integrity_check
  CHECK (
    -- If completed_at is set, completed_items must equal total_items
    (completed_at IS NULL) OR
    (completed_items >= total_items AND total_items > 0)
  );

-- Add constraint to ensure completed_items never exceeds total_items
ALTER TABLE public.quick_tastings
  ADD CONSTRAINT quick_tastings_completed_items_check
  CHECK (completed_items <= total_items);

-- Add constraint to ensure counts are non-negative
ALTER TABLE public.quick_tastings
  ADD CONSTRAINT quick_tastings_item_counts_positive_check
  CHECK (total_items >= 0 AND completed_items >= 0);


-- ============================================================================
-- PART 2: Verify existing data integrity
-- ============================================================================

DO $$
DECLARE
  violating_count INTEGER;
  invalid_completed_count INTEGER;
  overcounted_count INTEGER;
BEGIN
  -- Check for tastings marked complete but with mismatched counts
  SELECT COUNT(*) INTO violating_count
  FROM public.quick_tastings
  WHERE completed_at IS NOT NULL
    AND (completed_items < total_items OR total_items = 0);

  IF violating_count > 0 THEN
    RAISE WARNING 'Found % tastings marked as completed but with incomplete item counts', violating_count;

    -- Log the problematic records
    RAISE NOTICE 'Problematic tastings:';
    FOR r IN (
      SELECT id, session_name, total_items, completed_items, completed_at
      FROM public.quick_tastings
      WHERE completed_at IS NOT NULL
        AND (completed_items < total_items OR total_items = 0)
      LIMIT 5
    )
    LOOP
      RAISE NOTICE 'ID: %, Name: %, Total: %, Completed: %, Completed At: %',
        r.id, r.session_name, r.total_items, r.completed_items, r.completed_at;
    END LOOP;
  END IF;

  -- Check for tastings where completed_items exceeds total_items
  SELECT COUNT(*) INTO overcounted_count
  FROM public.quick_tastings
  WHERE completed_items > total_items;

  IF overcounted_count > 0 THEN
    RAISE WARNING 'Found % tastings where completed_items exceeds total_items', overcounted_count;
  END IF;

  -- Check for negative counts
  SELECT COUNT(*) INTO invalid_completed_count
  FROM public.quick_tastings
  WHERE total_items < 0 OR completed_items < 0;

  IF invalid_completed_count > 0 THEN
    RAISE WARNING 'Found % tastings with negative item counts', invalid_completed_count;
  END IF;
END $$;


-- ============================================================================
-- PART 3: Create helper function to auto-update completion status
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tasting_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set completed_at when all items are completed
  IF NEW.completed_items >= NEW.total_items AND NEW.total_items > 0 AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;

  -- Clear completed_at if items are uncompleted
  IF NEW.completed_items < NEW.total_items AND NEW.completed_at IS NOT NULL THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage completion status
DROP TRIGGER IF EXISTS trigger_update_tasting_completion ON public.quick_tastings;
CREATE TRIGGER trigger_update_tasting_completion
  BEFORE UPDATE ON public.quick_tastings
  FOR EACH ROW
  WHEN (OLD.completed_items IS DISTINCT FROM NEW.completed_items OR
        OLD.total_items IS DISTINCT FROM NEW.total_items)
  EXECUTE FUNCTION update_tasting_completion_status();


-- ============================================================================
-- PART 4: Add index for querying completed vs incomplete tastings
-- ============================================================================

-- Index for filtering incomplete tastings
CREATE INDEX IF NOT EXISTS idx_quick_tastings_incomplete
  ON public.quick_tastings (user_id, created_at DESC)
  WHERE completed_at IS NULL;

-- Index for filtering completed tastings
CREATE INDEX IF NOT EXISTS idx_quick_tastings_completed
  ON public.quick_tastings (user_id, completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- Index for completion ratio queries
CREATE INDEX IF NOT EXISTS idx_quick_tastings_completion_ratio
  ON public.quick_tastings (user_id, (completed_items::FLOAT / NULLIF(total_items, 0)))
  WHERE total_items > 0;


COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (run these manually after migration)
-- ============================================================================

-- Test constraint violation (should fail):
-- UPDATE quick_tastings
-- SET completed_at = NOW(), completed_items = 0, total_items = 5
-- WHERE id = (SELECT id FROM quick_tastings LIMIT 1);
-- Expected: ERROR: check constraint violation

-- View tastings with completion status:
-- SELECT
--   id,
--   session_name,
--   total_items,
--   completed_items,
--   ROUND((completed_items::NUMERIC / NULLIF(total_items, 0) * 100), 1) as completion_pct,
--   completed_at,
--   CASE
--     WHEN completed_at IS NOT NULL THEN 'COMPLETED'
--     WHEN completed_items = 0 THEN 'NOT_STARTED'
--     ELSE 'IN_PROGRESS'
--   END as status
-- FROM quick_tastings
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Check data integrity:
-- SELECT
--   COUNT(*) as total_tastings,
--   COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_tastings,
--   COUNT(*) FILTER (WHERE completed_at IS NOT NULL AND completed_items >= total_items) as valid_completed,
--   COUNT(*) FILTER (WHERE completed_items > total_items) as overcounted,
--   COUNT(*) FILTER (WHERE total_items < 0 OR completed_items < 0) as negative_counts
-- FROM quick_tastings;

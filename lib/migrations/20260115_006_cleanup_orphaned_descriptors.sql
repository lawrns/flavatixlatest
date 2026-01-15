-- Migration: Cleanup orphaned flavor_descriptors
-- Created: 2026-01-15
-- Purpose: Remove flavor_descriptors that reference deleted source records
-- IMPORTANT: Run this BEFORE migration 004 (cascade delete triggers) to clean existing orphans

BEGIN;

-- ============================================================================
-- PART 1: Identify orphaned flavor_descriptors
-- ============================================================================

-- Create temporary table to analyze orphaned descriptors
CREATE TEMP TABLE orphaned_descriptors_analysis AS
SELECT
  fd.id,
  fd.user_id,
  fd.source_type,
  fd.source_id,
  fd.descriptor_text,
  fd.descriptor_type,
  fd.created_at,
  fd.item_name,
  fd.item_category,
  CASE fd.source_type
    WHEN 'quick_tasting' THEN NOT EXISTS (SELECT 1 FROM public.quick_tastings qt WHERE qt.id = fd.source_id)
    WHEN 'quick_review' THEN NOT EXISTS (SELECT 1 FROM public.quick_reviews qr WHERE qr.id = fd.source_id)
    WHEN 'prose_review' THEN NOT EXISTS (SELECT 1 FROM public.prose_reviews pr WHERE pr.id = fd.source_id)
    ELSE true  -- Unknown source type is also orphaned
  END as is_orphaned
FROM public.flavor_descriptors fd;

-- Report orphaned descriptor statistics
DO $$
DECLARE
  total_orphaned INTEGER;
  orphaned_quick_tasting INTEGER;
  orphaned_quick_review INTEGER;
  orphaned_prose_review INTEGER;
  orphaned_unknown INTEGER;
  oldest_orphan TIMESTAMPTZ;
  newest_orphan TIMESTAMPTZ;
BEGIN
  -- Count total orphaned
  SELECT COUNT(*) INTO total_orphaned
  FROM orphaned_descriptors_analysis
  WHERE is_orphaned = true;

  IF total_orphaned = 0 THEN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'No orphaned descriptors found!';
    RAISE NOTICE '===============================================';
    RETURN;
  END IF;

  -- Count by source type
  SELECT
    COUNT(*) FILTER (WHERE source_type = 'quick_tasting'),
    COUNT(*) FILTER (WHERE source_type = 'quick_review'),
    COUNT(*) FILTER (WHERE source_type = 'prose_review'),
    COUNT(*) FILTER (WHERE source_type NOT IN ('quick_tasting', 'quick_review', 'prose_review'))
  INTO orphaned_quick_tasting, orphaned_quick_review, orphaned_prose_review, orphaned_unknown
  FROM orphaned_descriptors_analysis
  WHERE is_orphaned = true;

  -- Get date range
  SELECT MIN(created_at), MAX(created_at)
  INTO oldest_orphan, newest_orphan
  FROM orphaned_descriptors_analysis
  WHERE is_orphaned = true;

  RAISE NOTICE '===============================================';
  RAISE NOTICE 'ORPHANED DESCRIPTOR ANALYSIS';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Total orphaned descriptors: %', total_orphaned;
  RAISE NOTICE '  - From deleted quick_tastings: %', orphaned_quick_tasting;
  RAISE NOTICE '  - From deleted quick_reviews: %', orphaned_quick_review;
  RAISE NOTICE '  - From deleted prose_reviews: %', orphaned_prose_review;
  RAISE NOTICE '  - Unknown/invalid source type: %', orphaned_unknown;
  RAISE NOTICE 'Date range: % to %', oldest_orphan, newest_orphan;
  RAISE NOTICE '===============================================';
END $$;

-- Show sample orphaned descriptors
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Sample orphaned descriptors (first 10):';
  FOR r IN (
    SELECT
      source_type,
      descriptor_text,
      descriptor_type,
      created_at,
      item_name
    FROM orphaned_descriptors_analysis
    WHERE is_orphaned = true
    ORDER BY created_at DESC
    LIMIT 10
  )
  LOOP
    RAISE NOTICE '  - % [%] "%%" (%) from %',
      r.source_type, r.created_at::DATE, r.descriptor_text,
      r.descriptor_type, COALESCE(r.item_name, 'unknown item');
  END LOOP;
END $$;

-- Analyze by user
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Orphaned descriptors by user (top 10):';
  FOR r IN (
    SELECT
      user_id,
      COUNT(*) as orphaned_count,
      MIN(created_at) as oldest,
      MAX(created_at) as newest
    FROM orphaned_descriptors_analysis
    WHERE is_orphaned = true
    GROUP BY user_id
    ORDER BY orphaned_count DESC
    LIMIT 10
  )
  LOOP
    RAISE NOTICE '  - User %: % orphaned (% to %)',
      r.user_id, r.orphaned_count, r.oldest::DATE, r.newest::DATE;
  END LOOP;
END $$;


-- ============================================================================
-- PART 2: Cleanup orphaned descriptors (DRY RUN mode by default)
-- ============================================================================

-- Set this to true to execute the actual deletion
-- Default: false (dry run mode)
DO $$
DECLARE
  DRY_RUN BOOLEAN := true;  -- Change to false to execute
  deleted_count INTEGER;
  deleted_quick_tasting INTEGER;
  deleted_quick_review INTEGER;
  deleted_prose_review INTEGER;
BEGIN
  SELECT COUNT(*) INTO deleted_count
  FROM orphaned_descriptors_analysis
  WHERE is_orphaned = true;

  IF deleted_count = 0 THEN
    RAISE NOTICE 'No orphaned descriptors to clean up.';
    RETURN;
  END IF;

  IF DRY_RUN THEN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'DRY RUN MODE - No changes will be made';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Would delete % orphaned descriptor records', deleted_count;
    RAISE NOTICE 'To execute cleanup, set DRY_RUN := false';

    -- Show breakdown by source type
    SELECT
      COUNT(*) FILTER (WHERE source_type = 'quick_tasting'),
      COUNT(*) FILTER (WHERE source_type = 'quick_review'),
      COUNT(*) FILTER (WHERE source_type = 'prose_review')
    INTO deleted_quick_tasting, deleted_quick_review, deleted_prose_review
    FROM orphaned_descriptors_analysis
    WHERE is_orphaned = true;

    RAISE NOTICE 'Would delete:';
    RAISE NOTICE '  - % from quick_tastings', deleted_quick_tasting;
    RAISE NOTICE '  - % from quick_reviews', deleted_quick_review;
    RAISE NOTICE '  - % from prose_reviews', deleted_prose_review;

  ELSE
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'EXECUTING ORPHANED DESCRIPTOR CLEANUP';
    RAISE NOTICE '===============================================';

    -- Delete orphaned quick_tasting descriptors
    DELETE FROM public.flavor_descriptors
    WHERE source_type = 'quick_tasting'
      AND NOT EXISTS (
        SELECT 1 FROM public.quick_tastings qt WHERE qt.id = flavor_descriptors.source_id
      );
    GET DIAGNOSTICS deleted_quick_tasting = ROW_COUNT;

    -- Delete orphaned quick_review descriptors
    DELETE FROM public.flavor_descriptors
    WHERE source_type = 'quick_review'
      AND NOT EXISTS (
        SELECT 1 FROM public.quick_reviews qr WHERE qr.id = flavor_descriptors.source_id
      );
    GET DIAGNOSTICS deleted_quick_review = ROW_COUNT;

    -- Delete orphaned prose_review descriptors
    DELETE FROM public.flavor_descriptors
    WHERE source_type = 'prose_review'
      AND NOT EXISTS (
        SELECT 1 FROM public.prose_reviews pr WHERE pr.id = flavor_descriptors.source_id
      );
    GET DIAGNOSTICS deleted_prose_review = ROW_COUNT;

    deleted_count := deleted_quick_tasting + deleted_quick_review + deleted_prose_review;

    RAISE NOTICE 'Successfully deleted % orphaned descriptors:', deleted_count;
    RAISE NOTICE '  - % from quick_tastings', deleted_quick_tasting;
    RAISE NOTICE '  - % from quick_reviews', deleted_quick_review;
    RAISE NOTICE '  - % from prose_reviews', deleted_prose_review;

    -- Verify cleanup was successful
    DECLARE
      remaining_orphans INTEGER;
    BEGIN
      SELECT COUNT(*) INTO remaining_orphans
      FROM public.flavor_descriptors fd
      WHERE
        (fd.source_type = 'quick_tasting' AND NOT EXISTS (SELECT 1 FROM quick_tastings WHERE id = fd.source_id))
        OR (fd.source_type = 'quick_review' AND NOT EXISTS (SELECT 1 FROM quick_reviews WHERE id = fd.source_id))
        OR (fd.source_type = 'prose_review' AND NOT EXISTS (SELECT 1 FROM prose_reviews WHERE id = fd.source_id));

      IF remaining_orphans > 0 THEN
        RAISE WARNING 'Warning: % orphaned descriptors still remain!', remaining_orphans;
      ELSE
        RAISE NOTICE 'Success: All orphaned descriptors have been cleaned up!';
      END IF;
    END;
  END IF;
END $$;


-- ============================================================================
-- PART 3: Create backup table (execute before cleanup)
-- ============================================================================

-- Uncomment to create backup before executing
-- CREATE TABLE IF NOT EXISTS flavor_descriptors_orphan_backup_20260115 AS
-- SELECT fd.*
-- FROM public.flavor_descriptors fd
-- WHERE
--   (fd.source_type = 'quick_tasting' AND NOT EXISTS (SELECT 1 FROM quick_tastings WHERE id = fd.source_id))
--   OR (fd.source_type = 'quick_review' AND NOT EXISTS (SELECT 1 FROM quick_reviews WHERE id = fd.source_id))
--   OR (fd.source_type = 'prose_review' AND NOT EXISTS (SELECT 1 FROM prose_reviews WHERE id = fd.source_id));
--
-- COMMENT ON TABLE flavor_descriptors_orphan_backup_20260115 IS
--   'Backup of orphaned flavor_descriptors before cleanup on 2026-01-15';


COMMIT;

-- ============================================================================
-- POST-CLEANUP VERIFICATION QUERIES
-- ============================================================================

-- After running with DRY_RUN := false, verify results:

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
-- Expected: 0 rows

-- Verify all remaining descriptors have valid source references:
-- SELECT
--   COUNT(*) as total_descriptors,
--   COUNT(*) FILTER (WHERE source_type = 'quick_tasting') as quick_tasting_count,
--   COUNT(*) FILTER (WHERE source_type = 'quick_review') as quick_review_count,
--   COUNT(*) FILTER (WHERE source_type = 'prose_review') as prose_review_count
-- FROM public.flavor_descriptors;

-- Sample check - verify random descriptors have valid sources:
-- SELECT
--   fd.id,
--   fd.source_type,
--   fd.descriptor_text,
--   CASE fd.source_type
--     WHEN 'quick_tasting' THEN EXISTS (SELECT 1 FROM quick_tastings WHERE id = fd.source_id)
--     WHEN 'quick_review' THEN EXISTS (SELECT 1 FROM quick_reviews WHERE id = fd.source_id)
--     WHEN 'prose_review' THEN EXISTS (SELECT 1 FROM prose_reviews WHERE id = fd.source_id)
--     ELSE false
--   END as source_exists
-- FROM public.flavor_descriptors fd
-- ORDER BY RANDOM()
-- LIMIT 20;
-- All source_exists should be true

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if something goes wrong)
-- ============================================================================

-- If you created a backup table and need to restore:
-- BEGIN;
--   INSERT INTO public.flavor_descriptors
--   SELECT * FROM flavor_descriptors_orphan_backup_20260115;
-- COMMIT;

-- ============================================================================
-- CLEANUP (after successful cleanup and verification)
-- ============================================================================

-- Drop backup table (only after confirming cleanup worked):
-- DROP TABLE IF EXISTS flavor_descriptors_orphan_backup_20260115;

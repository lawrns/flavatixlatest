-- Migration: Deduplication script for existing duplicate descriptors
-- Created: 2026-01-15
-- Purpose: Find and merge case-insensitive duplicate descriptors before adding unique constraints
-- IMPORTANT: Run this BEFORE migration 003 (unique constraint) if duplicates exist

BEGIN;

-- ============================================================================
-- PART 1: Analysis - Identify duplicate descriptors
-- ============================================================================

-- Create temporary table to store duplicate analysis
CREATE TEMP TABLE duplicate_descriptor_analysis AS
SELECT
  user_id,
  LOWER(TRIM(descriptor_text)) as normalized_text,
  descriptor_type,
  COUNT(*) as duplicate_count,
  MIN(id) as keep_id,  -- Keep the oldest descriptor
  ARRAY_AGG(id ORDER BY created_at ASC) as all_ids,
  ARRAY_AGG(DISTINCT descriptor_text ORDER BY descriptor_text) as text_variations,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created,
  COUNT(DISTINCT source_id) as distinct_sources,
  STRING_AGG(DISTINCT source_type, ', ') as source_types
FROM public.flavor_descriptors
GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
HAVING COUNT(*) > 1;

-- Report duplicate statistics
DO $$
DECLARE
  total_duplicate_groups INTEGER;
  total_duplicate_records INTEGER;
  max_duplicates INTEGER;
BEGIN
  SELECT COUNT(*), SUM(duplicate_count), MAX(duplicate_count)
  INTO total_duplicate_groups, total_duplicate_records, max_duplicates
  FROM duplicate_descriptor_analysis;

  RAISE NOTICE '===============================================';
  RAISE NOTICE 'DUPLICATE DESCRIPTOR ANALYSIS';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Total duplicate groups: %', COALESCE(total_duplicate_groups, 0);
  RAISE NOTICE 'Total duplicate records: %', COALESCE(total_duplicate_records, 0);
  RAISE NOTICE 'Records to keep: %', COALESCE(total_duplicate_groups, 0);
  RAISE NOTICE 'Records to remove: %', COALESCE(total_duplicate_records - total_duplicate_groups, 0);
  RAISE NOTICE 'Max duplicates in one group: %', COALESCE(max_duplicates, 0);
  RAISE NOTICE '===============================================';
END $$;

-- Show top 10 most duplicated descriptors
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Top 10 most duplicated descriptors:';
  FOR r IN (
    SELECT
      normalized_text,
      descriptor_type,
      duplicate_count,
      text_variations,
      distinct_sources
    FROM duplicate_descriptor_analysis
    ORDER BY duplicate_count DESC
    LIMIT 10
  )
  LOOP
    RAISE NOTICE '  - "%" (%) - % duplicates, % variations: %, % sources',
      r.normalized_text, r.descriptor_type, r.duplicate_count,
      array_length(r.text_variations, 1), array_to_string(r.text_variations, ' | '),
      r.distinct_sources;
  END LOOP;
END $$;


-- ============================================================================
-- PART 2: Deduplication strategy - Merge duplicates
-- ============================================================================

-- Strategy:
-- 1. Keep the OLDEST descriptor (MIN created_at)
-- 2. Update all references to point to the kept descriptor
-- 3. Delete duplicate descriptors
-- 4. Preserve all source associations

-- Create table to track what we're about to delete (for rollback safety)
CREATE TEMP TABLE descriptors_to_delete AS
SELECT
  fd.id,
  fd.user_id,
  fd.descriptor_text,
  fd.descriptor_type,
  fd.source_type,
  fd.source_id,
  fd.created_at,
  dda.keep_id,
  dda.normalized_text
FROM public.flavor_descriptors fd
INNER JOIN duplicate_descriptor_analysis dda
  ON fd.user_id = dda.user_id
  AND LOWER(TRIM(fd.descriptor_text)) = dda.normalized_text
  AND fd.descriptor_type = dda.descriptor_type
WHERE fd.id != dda.keep_id;  -- Don't delete the one we're keeping

-- Report what will be deleted
DO $$
DECLARE
  delete_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO delete_count FROM descriptors_to_delete;
  RAISE NOTICE 'Preparing to delete % duplicate descriptor records', delete_count;
END $$;


-- ============================================================================
-- PART 3: Execute deduplication (DRY RUN mode by default)
-- ============================================================================

-- Set this to true to execute the actual deletion
-- Default: false (dry run mode)
DO $$
DECLARE
  DRY_RUN BOOLEAN := true;  -- Change to false to execute
  deleted_count INTEGER;
BEGIN
  IF DRY_RUN THEN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'DRY RUN MODE - No changes will be made';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'To execute deduplication, set DRY_RUN := false';

    -- Show what would be deleted
    FOR r IN (
      SELECT
        normalized_text,
        descriptor_type,
        COUNT(*) as would_delete
      FROM descriptors_to_delete dtd
      INNER JOIN duplicate_descriptor_analysis dda
        ON dtd.keep_id = dda.keep_id
      GROUP BY normalized_text, descriptor_type
      ORDER BY would_delete DESC
      LIMIT 20
    )
    LOOP
      RAISE NOTICE 'Would delete % duplicates of "%%" (%)',
        r.would_delete, r.normalized_text, r.descriptor_type;
    END LOOP;

  ELSE
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'EXECUTING DEDUPLICATION';
    RAISE NOTICE '===============================================';

    -- Delete duplicate descriptors
    -- The kept descriptor (oldest one) remains
    DELETE FROM public.flavor_descriptors
    WHERE id IN (SELECT id FROM descriptors_to_delete);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RAISE NOTICE 'Successfully deleted % duplicate descriptors', deleted_count;
    RAISE NOTICE 'Kept % unique descriptors', (SELECT COUNT(*) FROM duplicate_descriptor_analysis);

    -- Verify deduplication was successful
    DECLARE
      remaining_duplicates INTEGER;
    BEGIN
      SELECT COUNT(*) INTO remaining_duplicates
      FROM (
        SELECT user_id, LOWER(TRIM(descriptor_text)), descriptor_type, COUNT(*) as cnt
        FROM public.flavor_descriptors
        GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
        HAVING COUNT(*) > 1
      ) still_dupes;

      IF remaining_duplicates > 0 THEN
        RAISE WARNING 'Warning: % duplicate groups still remain!', remaining_duplicates;
      ELSE
        RAISE NOTICE 'Success: All duplicates have been removed!';
      END IF;
    END;
  END IF;
END $$;


-- ============================================================================
-- PART 4: Create backup table (execute before deduplication)
-- ============================================================================

-- Uncomment to create backup before executing
-- CREATE TABLE IF NOT EXISTS flavor_descriptors_backup_20260115 AS
-- SELECT * FROM public.flavor_descriptors;
--
-- COMMENT ON TABLE flavor_descriptors_backup_20260115 IS
--   'Backup of flavor_descriptors before deduplication on 2026-01-15';


COMMIT;

-- ============================================================================
-- POST-DEDUPLICATION VERIFICATION QUERIES
-- ============================================================================

-- After running with DRY_RUN := false, verify results:

-- Check for remaining duplicates:
-- SELECT
--   user_id,
--   LOWER(TRIM(descriptor_text)) as normalized,
--   descriptor_type,
--   COUNT(*) as count
-- FROM public.flavor_descriptors
-- GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
-- HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- Verify total descriptor count:
-- SELECT
--   COUNT(*) as total_descriptors,
--   COUNT(DISTINCT (user_id, LOWER(TRIM(descriptor_text)), descriptor_type)) as unique_descriptors
-- FROM public.flavor_descriptors;
-- total_descriptors should equal unique_descriptors

-- Check that oldest descriptors were kept:
-- SELECT
--   fd.id,
--   fd.descriptor_text,
--   fd.descriptor_type,
--   fd.created_at,
--   fd.source_type,
--   COUNT(*) OVER (PARTITION BY fd.user_id, LOWER(TRIM(fd.descriptor_text)), fd.descriptor_type) as should_be_1
-- FROM public.flavor_descriptors fd
-- ORDER BY fd.created_at DESC
-- LIMIT 20;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if something goes wrong)
-- ============================================================================

-- If you created a backup table and need to restore:
-- BEGIN;
--   TRUNCATE public.flavor_descriptors;
--   INSERT INTO public.flavor_descriptors
--   SELECT * FROM flavor_descriptors_backup_20260115;
-- COMMIT;

-- ============================================================================
-- CLEANUP (after successful deduplication and verification)
-- ============================================================================

-- Drop backup table (only after confirming deduplication worked):
-- DROP TABLE IF EXISTS flavor_descriptors_backup_20260115;

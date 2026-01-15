# Quick Start Guide - Data Quality Migrations

**⚡ Fast execution guide for experienced DBAs**

---

## TL;DR

6 migrations + 3 code fixes = 100% data integrity

**Execution time:** 15-30 minutes
**Downtime:** Minimal (only during constraint application)
**Risk:** Low (dry-run modes included)

---

## Quick Execution Steps

### 1. Pre-Flight Check (2 min)

```bash
cd /Users/lukatenbosch/Downloads/flavatixlatest
psql $DATABASE_URL
```

```sql
-- Count duplicates
SELECT COUNT(*) FROM (
  SELECT user_id, LOWER(TRIM(descriptor_text)), descriptor_type, COUNT(*)
  FROM flavor_descriptors
  GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
  HAVING COUNT(*) > 1
) dupes;

-- Count orphans
SELECT
  COUNT(*) FILTER (WHERE source_type = 'quick_tasting' AND NOT EXISTS (SELECT 1 FROM quick_tastings WHERE id = source_id)) as orphaned_tastings,
  COUNT(*) FILTER (WHERE source_type = 'quick_review' AND NOT EXISTS (SELECT 1 FROM quick_reviews WHERE id = source_id)) as orphaned_reviews,
  COUNT(*) FILTER (WHERE source_type = 'prose_review' AND NOT EXISTS (SELECT 1 FROM prose_reviews WHERE id = source_id)) as orphaned_prose
FROM flavor_descriptors;
```

---

### 2. Dry-Run Data Cleanup (5 min)

```sql
-- Dry-run deduplication (DRY_RUN := true by default)
\i lib/migrations/20260115_005_deduplicate_descriptors.sql
-- Review output

-- Dry-run orphan cleanup (DRY_RUN := true by default)
\i lib/migrations/20260115_006_cleanup_orphaned_descriptors.sql
-- Review output
```

**✅ If dry-run output looks good, proceed. Otherwise investigate.**

---

### 3. Backup (2 min)

```sql
CREATE TABLE flavor_descriptors_backup_20260115 AS SELECT * FROM flavor_descriptors;
CREATE TABLE quick_tastings_backup_20260115 AS SELECT * FROM quick_tastings;
```

---

### 4. Execute Data Cleanup (5 min)

**Edit both files and set `DRY_RUN := false`**, then run:

```sql
\i lib/migrations/20260115_005_deduplicate_descriptors.sql
\i lib/migrations/20260115_006_cleanup_orphaned_descriptors.sql
```

**✅ Verify no duplicates or orphans remain:**

```sql
-- Should return 0
SELECT COUNT(*) FROM (
  SELECT user_id, LOWER(TRIM(descriptor_text)), descriptor_type, COUNT(*)
  FROM flavor_descriptors
  GROUP BY user_id, LOWER(TRIM(descriptor_text)), descriptor_type
  HAVING COUNT(*) > 1
) dupes;
```

---

### 5. Apply Constraints (5 min)

```sql
\i lib/migrations/20260115_001_add_text_length_constraints.sql
\i lib/migrations/20260115_002_add_completed_tasting_constraints.sql
\i lib/migrations/20260115_003_add_normalized_descriptor_constraints.sql
\i lib/migrations/20260115_004_add_cascade_delete_constraints.sql
```

**✅ Verify constraints are active:**

```sql
SELECT conname FROM pg_constraint WHERE conrelid = 'flavor_descriptors'::regclass;
-- Should show: flavor_descriptors_descriptor_text_length_check, etc.
```

---

### 6. Deploy Application Code (2 min)

```bash
# Code changes already in place, just restart app
git add pages/api/flavor-wheels/extract-descriptors.ts
git add lib/ai/descriptorExtractionService.ts
git commit -m "fix: data quality improvements - case-insensitive dedup, full logging, increased AI tokens"
# Deploy via your CI/CD pipeline
```

---

### 7. Quick Verification (2 min)

```sql
-- Test duplicate prevention (should fail on second insert)
BEGIN;
  INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type, normalized_form)
  VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'quick_tasting',
    gen_random_uuid(),
    'Chocolate',
    'aroma',
    'chocolate'
  );

  -- This should FAIL due to unique constraint
  INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type, normalized_form)
  VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'quick_tasting',
    gen_random_uuid(),
    'chocolate',  -- Different case, same normalized form
    'aroma',
    'chocolate'
  );
  -- Expected: ERROR: duplicate key value violates unique constraint
ROLLBACK;

-- Test cascade delete (should auto-delete descriptors)
BEGIN;
  -- Create test tasting with descriptor
  INSERT INTO quick_tastings (id, user_id, category, mode)
  VALUES (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'Coffee', 'study'::tasting_mode)
  RETURNING id;  -- Note this ID

  -- Add descriptor
  INSERT INTO flavor_descriptors (user_id, source_type, source_id, descriptor_text, descriptor_type, normalized_form)
  VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'quick_tasting',
    (SELECT id FROM quick_tastings ORDER BY created_at DESC LIMIT 1),
    'Test Cascade',
    'aroma',
    'test cascade'
  );

  -- Delete tasting (should cascade delete descriptor)
  DELETE FROM quick_tastings WHERE id = (SELECT id FROM quick_tastings ORDER BY created_at DESC LIMIT 1);

  -- Verify descriptor was deleted
  SELECT COUNT(*) FROM flavor_descriptors WHERE descriptor_text = 'Test Cascade';
  -- Expected: 0
ROLLBACK;
```

---

## Rollback (if needed)

```sql
-- Restore backups
BEGIN;
  TRUNCATE flavor_descriptors;
  INSERT INTO flavor_descriptors SELECT * FROM flavor_descriptors_backup_20260115;

  -- Drop constraints
  ALTER TABLE flavor_descriptors DROP CONSTRAINT IF EXISTS flavor_descriptors_descriptor_text_length_check;
  ALTER TABLE flavor_descriptors DROP CONSTRAINT IF EXISTS flavor_descriptors_item_name_length_check;
  DROP INDEX IF EXISTS idx_flavor_descriptors_unique_normalized;

  -- Drop triggers
  DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_tasting_descriptors ON quick_tastings;
  DROP TRIGGER IF EXISTS trigger_cascade_delete_quick_review_descriptors ON quick_reviews;
  DROP TRIGGER IF EXISTS trigger_cascade_delete_prose_review_descriptors ON prose_reviews;
COMMIT;
```

---

## Cleanup (after 7 days)

```sql
-- Drop backup tables (only after confirming everything works)
DROP TABLE flavor_descriptors_backup_20260115;
DROP TABLE quick_tastings_backup_20260115;
```

---

## Monitoring Queries (run weekly)

```sql
-- Health check dashboard
SELECT
  'Orphaned Descriptors' as metric,
  COUNT(*) as count,
  'Should be 0' as expected
FROM flavor_descriptors fd
WHERE NOT EXISTS (
  SELECT 1 FROM quick_tastings WHERE id = fd.source_id AND fd.source_type = 'quick_tasting'
) AND NOT EXISTS (
  SELECT 1 FROM quick_reviews WHERE id = fd.source_id AND fd.source_type = 'quick_review'
) AND NOT EXISTS (
  SELECT 1 FROM prose_reviews WHERE id = fd.source_id AND fd.source_type = 'prose_review'
)

UNION ALL

SELECT
  'Duplicate Descriptors' as metric,
  COUNT(*) as count,
  'Should be 0' as expected
FROM (
  SELECT user_id, normalized_form, descriptor_type, COUNT(*)
  FROM flavor_descriptors
  GROUP BY user_id, normalized_form, descriptor_type
  HAVING COUNT(*) > 1
) dupes

UNION ALL

SELECT
  'Long Descriptors (>500)' as metric,
  COUNT(*) as count,
  'Should be 0' as expected
FROM flavor_descriptors
WHERE char_length(descriptor_text) > 500

UNION ALL

SELECT
  'Long Item Names (>200)' as metric,
  COUNT(*) as count,
  'Should be 0' as expected
FROM flavor_descriptors
WHERE item_name IS NOT NULL AND char_length(item_name) > 200;
```

---

## Troubleshooting

### "ERROR: new row violates check constraint"
**Solution:** Existing data violates constraint. Run pre-migration analysis to identify and fix.

### "ERROR: duplicate key value violates unique constraint"
**Solution:** Duplicates still exist. Re-run migration 005 (deduplication) with `DRY_RUN := false`.

### "Migration takes too long"
**Solution:** Increase `statement_timeout` temporarily:
```sql
SET statement_timeout = '10min';
```

### "Constraint breaks existing application code"
**Solution:** Review application code for:
- Inserting descriptors longer than 500 chars
- Creating duplicates with different casing
- Not setting normalized_form field

---

## Support

For detailed documentation, see:
- `lib/migrations/README.md` - Complete migration guide
- `DATA_QUALITY_IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `tests/unit/descriptor-deduplication.test.ts` - Test examples

---

**⚡ Total Time:** ~15-30 minutes
**✅ Result:** 100% Data Integrity

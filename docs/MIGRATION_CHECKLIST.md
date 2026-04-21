# Analytics Database Migration - Quick Reference

## Migration Status: **NOT APPLIED**

The migration file exists at `/migrations/add_analytics_tables.sql` but has NOT been applied to your database yet.

## What This Migration Does

✅ Creates 5 analytics tables:
- `analytics_events` - Custom event tracking
- `analytics_page_views` - Page view analytics
- `analytics_pwa_installs` - PWA installation tracking
- `analytics_sessions` - User session data for MAU/DAU
- `analytics_user_acquisition` - User acquisition for CAC

✅ Creates 5 helper views:
- `analytics_daily_active_users` - DAU metrics
- `analytics_monthly_active_users` - MAU metrics
- `analytics_pwa_install_rate` - Install rate calculation
- `analytics_platform_split` - Mobile vs desktop traffic
- `analytics_cac` - Customer acquisition cost

✅ Sets up security:
- Row Level Security (RLS) on all tables
- Service role insert permissions
- User-specific read permissions
- Performance indexes

## How to Apply (Choose One)

### Method 1: Supabase SQL Editor ⭐ RECOMMENDED

1. Go to https://supabase.com/dashboard
2. Select your Flavatix project
3. Click "SQL Editor" → "New Query"
4. Copy contents of `/migrations/add_analytics_tables.sql`
5. Paste and click "Run"
6. Verify tables appear in "Table Editor"

**Time:** 2 minutes | **Difficulty:** Easy | **Safety:** High

### Method 2: Supabase CLI

```bash
# From project directory
supabase db push
```

**Time:** 1 minute | **Difficulty:** Medium | **Safety:** High

### Method 3: psql Command Line

```bash
psql $DATABASE_URL -f migrations/add_analytics_tables.sql
```

**Time:** 1 minute | **Difficulty:** Advanced | **Safety:** High

## Prerequisites Check

Before applying, verify:

- [ ] Supabase project is set up
- [ ] Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`

## After Applying: Verify Success

Run these checks in Supabase SQL Editor:

```sql
-- 1. Check tables exist (should return 5 rows)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'analytics_%';

-- 2. Check views exist (should return 5 rows)
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'analytics_%';

-- 3. Check RLS policies (should return 10 rows)
SELECT tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'analytics_%';
```

## Test Insert (Optional)

```sql
-- Test that inserts work
INSERT INTO analytics_events (event_name, properties, platform, session_id)
VALUES ('migration_test', '{"status": "success"}', 'web', 'test-123');

-- Verify
SELECT * FROM analytics_events WHERE event_name = 'migration_test';

-- Clean up
DELETE FROM analytics_events WHERE event_name = 'migration_test';
```

## Rollback (If Needed)

If you need to remove the analytics tables:

```sql
DROP VIEW IF EXISTS analytics_daily_active_users;
DROP VIEW IF EXISTS analytics_monthly_active_users;
DROP VIEW IF EXISTS analytics_pwa_install_rate;
DROP VIEW IF EXISTS analytics_platform_split;
DROP VIEW IF EXISTS analytics_cac;

DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.analytics_page_views CASCADE;
DROP TABLE IF EXISTS public.analytics_pwa_installs CASCADE;
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;
DROP TABLE IF EXISTS public.analytics_user_acquisition CASCADE;
```

## Detailed Documentation

For complete instructions, troubleshooting, and security notes, see:
**`/ANALYTICS_SETUP_GUIDE.md`**

## Current Status

| Step | Status |
|------|--------|
| Migration file created | ✅ Complete |
| Documentation created | ✅ Complete |
| Migration applied to DB | ⚠️ NOT DONE - Manual action required |
| Tables verified | ⏳ Pending migration |
| Analytics integration | ⏳ Pending migration |

---

## Quick Decision Tree

**I want to apply the migration now:**
→ Use Method 1 (SQL Editor) - easiest and safest

**I'm comfortable with CLI:**
→ Use Method 2 (Supabase CLI) - fastest

**I need to understand everything first:**
→ Read `/ANALYTICS_SETUP_GUIDE.md`

**I need to rollback:**
→ Use the rollback SQL above

**I'm not sure if it's applied:**
→ Run the verification queries in Supabase SQL Editor

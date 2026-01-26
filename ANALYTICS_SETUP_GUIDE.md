# Analytics Database Setup Guide

## Overview

This guide walks you through setting up the analytics database for Flavatix. The analytics system tracks PWA metrics needed for the Day 90 Capacitor decision, including MAU/DAU, mobile vs desktop traffic split, PWA install rates, and user acquisition costs.

## What the Migration Creates

The migration file `/migrations/add_analytics_tables.sql` creates:

### Tables (5 total)
1. **`analytics_events`** - Custom analytics events with properties
2. **`analytics_page_views`** - Page view tracking for traffic analysis
3. **`analytics_pwa_installs`** - PWA installation events
4. **`analytics_sessions`** - User session data for MAU/DAU calculation
5. **`analytics_user_acquisition`** - User acquisition data for CAC calculation

### Helper Views (5 total)
1. **`analytics_daily_active_users`** - DAU by platform and date
2. **`analytics_monthly_active_users`** - MAU by platform and month
3. **`analytics_pwa_install_rate`** - Install rate as percentage of unique users
4. **`analytics_platform_split`** - Mobile vs desktop traffic split
5. **`analytics_cac`** - Customer Acquisition Cost by source and month

### Security Features
- Row Level Security (RLS) enabled on all tables
- Service role can insert data
- Authenticated users can only view their own data
- Proper indexes for query performance

## Prerequisites

1. **Supabase Project** - You should have a Supabase project set up
2. **Environment Variables** - Ensure these are set in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
   ```

## Option 1: Apply via Supabase SQL Editor (Recommended)

This is the safest and easiest method.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your Flavatix project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**
   - Open `/migrations/add_analytics_tables.sql`
   - Copy the entire contents (all 313 lines)
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Success**
   - You should see "Success. No rows returned" (this is expected)
   - Check the tables were created by going to "Table Editor" in the sidebar
   - You should see 5 new tables: `analytics_events`, `analytics_page_views`, `analytics_pwa_installs`, `analytics_sessions`, `analytics_user_acquisition`

5. **Verify Views**
   - In SQL Editor, run:
     ```sql
     SELECT * FROM analytics_daily_active_users;
     ```
   - Should return empty result set (no data yet, but view exists)

## Option 2: Apply via Supabase CLI (For Advanced Users)

If you have the Supabase CLI installed and configured:

### Steps:

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Link to Your Project** (if not already linked)
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Apply the Migration**
   ```bash
   # From the flavatixlatest directory
   supabase db push --db-url "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
   ```

   Or use the environment variable:
   ```bash
   supabase db push
   ```

4. **Verify**
   ```bash
   supabase db remote tables list
   ```

## Option 3: Apply via psql (Command Line)

If you prefer using PostgreSQL directly:

### Steps:

1. **Install PostgreSQL Client** (if not installed)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # macOS
   brew install postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Run the Migration**
   ```bash
   psql $DATABASE_URL -f migrations/add_analytics_tables.sql
   ```

   Or with explicit connection string:
   ```bash
   psql "postgresql://postgres:password@db.your-project.supabase.co:5432/postgres" -f migrations/add_analytics_tables.sql
   ```

3. **Verify**
   ```bash
   psql $DATABASE_URL -c "\dt public.analytics_*"
   ```

## Verification Steps

After applying the migration, verify everything is working:

### 1. Check Tables Exist
In Supabase SQL Editor, run:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'analytics_%'
ORDER BY table_name;
```

Expected result: 5 tables (events, page_views, pwa_installs, sessions, user_acquisition)

### 2. Check Views Exist
```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'analytics_%'
ORDER BY table_name;
```

Expected result: 5 views (daily_active_users, monthly_active_users, pwa_install_rate, platform_split, cac)

### 3. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'analytics_%'
ORDER BY tablename, policyname;
```

Expected result: 10 policies (2 per table: insert + select)

### 4. Test Insert Permission (Server-side)
```sql
-- This should work with service_role key
INSERT INTO analytics_events (event_name, properties, platform, session_id)
VALUES ('test_event', '{"test": "data"}', 'web', 'test-session-123');

-- Verify insert worked
SELECT * FROM analytics_events WHERE event_name = 'test_event';

-- Clean up test data
DELETE FROM analytics_events WHERE event_name = 'test_event';
```

## Troubleshooting

### Error: "relation already exists"
**Cause:** Tables already exist from a previous migration attempt.

**Solution:**
```sql
-- Drop existing analytics tables (BE CAREFUL - this deletes data!)
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.analytics_page_views CASCADE;
DROP TABLE IF EXISTS public.analytics_pwa_installs CASCADE;
DROP TABLE IF EXISTS public.analytics_sessions CASCADE;
DROP TABLE IF EXISTS public.analytics_user_acquisition CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS analytics_daily_active_users;
DROP VIEW IF EXISTS analytics_monthly_active_users;
DROP VIEW IF EXISTS analytics_pwa_install_rate;
DROP VIEW IF EXISTS analytics_platform_split;
DROP VIEW IF EXISTS analytics_cac;

-- Then re-run the migration
```

### Error: "permission denied"
**Cause:** Insufficient permissions.

**Solution:**
- Make sure you're using the `postgres` user or a superuser
- Check that your `DATABASE_URL` has the correct credentials
- In Supabase dashboard, make sure you're the project owner

### Error: "extension uuid-ossp not found"
**Cause:** UUID extension not available.

**Solution:**
```sql
-- Check if extension exists
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- If not found, create it
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Next Steps

After successfully applying the migration:

1. **Update TypeScript Types**
   - Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts`
   - Or manually add the analytics tables to `lib/supabase.ts` Database type

2. **Test Analytics Integration**
   - The analytics system should now be ready to track events
   - Check that API routes can insert data using service_role key
   - Verify that authenticated users can query their own data

3. **Monitor Data Collection**
   - After applying, check that data is being collected:
     ```sql
     -- Check recent events
     SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 10;

     -- Check page views
     SELECT * FROM analytics_page_views ORDER BY created_at DESC LIMIT 10;

     -- Check sessions
     SELECT * FROM analytics_sessions ORDER BY created_at DESC LIMIT 10;
     ```

## Security Notes

### Service Role Key
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS
- **NEVER expose this to the client**
- Only use it in server-side API routes
- Never commit it to version control

### RLS Policies
- All analytics tables have RLS enabled
- Users can only see their own data
- Service role can insert data for tracking
- Consider adding admin policies if you need cross-user analytics

### Data Privacy
- Analytics data may contain user information
- Ensure your privacy policy covers analytics collection
- Consider data retention policies (auto-delete old data)

## Analytics Queries Reference

### Daily Active Users
```sql
SELECT * FROM analytics_daily_active_users
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Mobile vs Desktop Split
```sql
SELECT * FROM analytics_platform_split
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, platform;
```

### PWA Install Rate
```sql
SELECT * FROM analytics_pwa_install_rate
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Customer Acquisition Cost
```sql
SELECT * FROM analytics_cac
ORDER BY month DESC;
```

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Database
2. Verify environment variables are set correctly
3. Ensure you're using the correct Supabase project
4. Review the migration SQL for any syntax issues

For additional help, refer to:
- Supabase Documentation: https://supabase.com/docs
- Migration file: `/migrations/add_analytics_tables.sql`
- Supabase client: `/lib/supabase.ts`

## Status Checklist

- [ ] Migration file reviewed and understood
- [ ] Supabase project identified
- [ ] Environment variables configured
- [ ] Migration applied (via SQL Editor, CLI, or psql)
- [ ] Tables verified (5 tables created)
- [ ] Views verified (5 views created)
- [ ] RLS policies verified (10 policies created)
- [ ] Test insert successful
- [ ] Analytics integration tested
- [ ] Documentation updated

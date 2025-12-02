# Flavor Wheels Feature - Complete Fix Guide

## 🔍 Issue Summary

The Flavor Wheels feature was experiencing **401 Unauthorized** errors due to:

1. **Missing RLS (Row Level Security) policies** on database tables
2. **Incorrect server-side authentication** in API routes
3. **Missing database type definitions** in TypeScript

---

## ✅ Fixes Applied

### 1. Fixed Server-Side Authentication ([lib/supabase.ts](lib/supabase.ts))

**Problem:** The `getSupabaseClient()` function didn't accept `req` and `res` parameters, causing API routes to lose authentication context.

**Solution:** Updated the function to:
- Accept optional `NextApiRequest` and `NextApiResponse` parameters
- Extract auth token from Authorization header or cookies
- Create server-side client with proper auth context

**Changes:**
```typescript
// Before
export const getSupabaseClient = () => SupabaseClientSingleton.getInstance();

// After
export const getSupabaseClient = (req?: NextApiRequest, res?: NextApiResponse) => {
  if (req && res) {
    // Extract auth token from headers or cookies
    // Create authenticated client for server-side
  }
  return SupabaseClientSingleton.getInstance();
};
```

---

### 2. Added Missing Database Types ([lib/supabase.ts](lib/supabase.ts))

**Problem:** TypeScript types for `flavor_descriptors`, `flavor_wheels`, and `aroma_molecules` tables were missing.

**Solution:** Added complete type definitions for all three tables with Row, Insert, and Update types.

---

## 🔧 Required Manual Steps

### Step 1: Apply Database RLS Policies

**⚠️ CRITICAL:** You must manually execute the SQL to apply Row Level Security policies.

#### Option A: Using Supabase Dashboard (Recommended)

1. Open the Supabase Dashboard SQL Editor:
   ```
   https://app.supabase.com/project/kobuclkvlacdwvxmakvq/sql/new
   ```

2. Run the RLS fix script to get the SQL:
   ```bash
   node fix_flavor_wheels_rls.js
   ```

3. Copy the SQL output and paste it into the SQL Editor

4. Click **Run** to execute

#### Option B: Using PostgreSQL CLI (If Available)

```bash
psql postgresql://postgres:PASSWORD@db.kobuclkvlacdwvxmakvq.supabase.co:5432/postgres < migrations/flavor_wheels_schema.sql
```

**The SQL will:**
- ✅ Enable RLS on all flavor wheels tables
- ✅ Drop old/conflicting policies
- ✅ Create new policies for user-specific access
- ✅ Grant proper permissions to authenticated/anon roles

---

### Step 2: Insert Test Data

After applying RLS policies, seed the database with sample flavor descriptors:

```bash
node seed_flavor_descriptors.js
```

**This will:**
- ✅ Find your test user from the profiles table
- ✅ Insert 50+ diverse flavor descriptors across categories:
  - Fruity (Citrus, Berry, Stone Fruit)
  - Sweet (Vanilla, Caramelized, Honey)
  - Smoky (Wood Smoke, Peat, Charred)
  - Spicy (Sweet Spice, Pepper, Root Spice)
  - Woody, Floral, Nutty, Herbal, Earthy, Chocolate
  - Metaphors (Texture, Freshness, Warmth)
- ✅ Distribute descriptors across different tasting sources
- ✅ Provide summary statistics

---

## 🧪 Testing the Fix

### 1. Start the Development Server

```bash
npm run dev
```

The app should start on `http://localhost:3032`

### 2. Test the Flavor Wheels Page

1. **Navigate to:** http://localhost:3032/flavor-wheels
2. **Login with:** `dev@devtix.com` / `123test`
3. **Select options:**
   - Wheel Type: `Aroma` (or any other)
   - Scope: `Personal`
4. **Click:** "Regenerate Wheel"

### 3. Expected Results

**✅ Success Indicators:**
- No 401 Unauthorized errors in browser console
- Wheel data loads successfully
- D3.js visualization renders
- Interactive features work (hover, tooltips)
- Export button becomes enabled

**❌ Still Broken? Check:**
- RLS policies were applied (Step 1)
- Test data was inserted (Step 2)
- Server restarted after code changes
- Browser cache cleared
- No errors in terminal or browser console

---

## 📊 Verification Checklist

- [ ] **RLS Policies Applied**
  - Run: `node fix_flavor_wheels_rls.js`
  - Copy SQL to Supabase Dashboard
  - Execute successfully

- [ ] **Test Data Inserted**
  - Run: `node seed_flavor_descriptors.js`
  - Verify "✅ Test data inserted successfully!" message
  - Check summary shows 50+ descriptors

- [ ] **Server Restarted**
  - Stop dev server (Ctrl+C)
  - Run: `npm run dev`
  - Wait for "ready" message

- [ ] **Authentication Works**
  - Login at http://localhost:3032
  - User session persists
  - No 401 errors in console

- [ ] **API Endpoints Respond**
  - `/api/flavor-wheels/generate` returns 200
  - `/api/flavor-wheels/extract-descriptors` returns 200
  - Response contains wheelData

- [ ] **Visualization Renders**
  - Wheel appears on page
  - Categories are visible
  - Interactive hover works
  - Export button enabled

---

## 🛠 Troubleshooting

### Issue: Still Getting 401 Unauthorized

**Check:**
1. RLS policies were actually applied (verify in Supabase Dashboard → Authentication → Policies)
2. User is logged in (check browser cookies for `sb-access-token`)
3. Server was restarted after code changes
4. No errors in server logs

**Debug:**
```bash
# Check server logs for auth errors
tail -f .next/server.log

# Check browser console for detailed error messages
# Open DevTools → Console tab
```

### Issue: No Data Available

**Check:**
1. Test data script ran successfully
2. Descriptors were inserted for the logged-in user
3. Query the database directly:
   ```sql
   SELECT COUNT(*) FROM flavor_descriptors WHERE user_id = 'YOUR_USER_ID';
   ```

### Issue: Wheel Doesn't Render

**Check:**
1. Browser console for JavaScript errors
2. Network tab for failed requests
3. D3.js library loaded correctly
4. wheelData object is valid JSON

---

## 📁 Files Modified

### Code Changes
- [lib/supabase.ts](lib/supabase.ts) - Fixed authentication + added types

### New Scripts
- [fix_flavor_wheels_rls.js](fix_flavor_wheels_rls.js) - Generates RLS SQL
- [seed_flavor_descriptors.js](seed_flavor_descriptors.js) - Inserts test data

### Existing Migrations
- [migrations/flavor_wheels_schema.sql](migrations/flavor_wheels_schema.sql) - Full schema

---

## 🎯 Summary

**What Was Broken:**
- ❌ API returns 401 Unauthorized
- ❌ No database permissions
- ❌ No test data

**What's Fixed:**
- ✅ Server-side auth working
- ✅ TypeScript types added
- ✅ RLS policies ready to apply
- ✅ Test data script ready to run

**What You Need to Do:**
1. ⚠️ Apply RLS policies (Manual - Supabase Dashboard)
2. ⚠️ Insert test data (Run script)
3. ⚠️ Test the feature

**Time to Complete:** 10-15 minutes

---

## 🚀 Next Steps After Fix

Once the feature is working:

1. **Test All Wheel Types:**
   - Aroma wheels
   - Flavor wheels
   - Combined wheels
   - Metaphor wheels

2. **Test All Scopes:**
   - Personal (user-specific)
   - Universal (all users)
   - Item-specific
   - Category-specific

3. **Test Interactive Features:**
   - Hover tooltips
   - Click to expand categories
   - Export functionality
   - Regenerate with force refresh

4. **Performance Testing:**
   - Wheel generation speed (< 2 seconds)
   - Cached retrieval (< 500ms)
   - Large datasets (100+ descriptors)

---

## 📞 Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify database tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'flavor%';
   ```

4. Verify RLS policies exist:
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE tablename IN ('flavor_descriptors', 'flavor_wheels', 'aroma_molecules');
   ```

---

**Last Updated:** 2025-10-04
**Status:** Ready for manual deployment steps

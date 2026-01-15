# Flavatix Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Authentication Problems](#authentication-problems)
3. [Database Issues](#database-issues)
4. [UI/Component Issues](#uicomponent-issues)
5. [Performance Issues](#performance-issues)
6. [Deployment Issues](#deployment-issues)
7. [Development Environment](#development-environment)

---

## Common Issues

### Empty Page After "Start Tasting"

**Symptom:** Clicking "Start Tasting" shows empty page

**Cause:** Session created but no items added

**Solution:** The auto-add first item logic triggers after mount

```typescript
// In QuickTastingSession.tsx
useEffect(() => {
  if (items.length === 0 && !isLoading && phase === 'tasting') {
    setTimeout(() => addNewItem(), 100);
  }
}, [items.length, phase]);
```

**Verify:** Check browser console for errors

---

### Slider Flickering

**Symptom:** Sliders jump/flicker when moving

**Cause:** Database updates on every pixel move causes re-renders

**Solution:** Debounce updates (already implemented)

```typescript
const handleScoreChange = (score: number) => {
  setLocalScore(score); // Immediate UI update

  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    onUpdate({ overall_score: score }); // DB update after 300ms
  }, 300);
};
```

**Verify:** Slider should move smoothly without jumps

---

### Photo Delete Button Not Working

**Symptom:** Clicking X on photo doesn't remove it

**Cause:** Supabase ignores `undefined` in updates

**Solution:** Convert undefined to null

```typescript
// ❌ This doesn't work
onUpdate({ photo_url: undefined });

// ✅ This works
onUpdate({ photo_url: null });

// Already fixed in updateItem():
const dbUpdates = Object.fromEntries(
  Object.entries(updates).map(([key, value]) =>
    [key, value === undefined ? null : value]
  )
);
```

**Verify:** Photo should disappear from UI and database

---

## Authentication Problems

### "Not Authenticated" Error

**Symptom:** API requests return 401 Unauthorized

**Causes:**
1. Token expired
2. Token missing
3. Invalid token

**Solutions:**

**Check token exists:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```

**Refresh token:**
```typescript
const { data: { session }, error } = await supabase.auth.refreshSession();
if (error) console.error('Refresh failed:', error);
```

**Re-login:**
```typescript
await supabase.auth.signOut();
// Then sign in again
```

---

### Session Expires Too Quickly

**Symptom:** Logged out after a few minutes

**Cause:** Token not being refreshed

**Solution:** Supabase auto-refreshes if configured correctly

```typescript
// In lib/supabase.ts
const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true, // Should be true
    detectSessionInUrl: true
  }
});
```

**Verify:** Check localStorage for `supabase.auth.token`

---

### Can't Sign Up

**Symptom:** Sign up form submits but no user created

**Causes:**
1. Email already exists
2. Password too weak
3. Email confirmation required

**Solutions:**

**Check Supabase Auth settings:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Verify "Enable email confirmations" setting
3. Check "Allowed Email Domains" if restricted

**Check error response:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password
});

if (error) {
  console.error('Sign up error:', error.message);
  // Show user-friendly message
}
```

---

## Database Issues

### RLS Policy Errors

**Symptom:** "Row level security policy violation" error

**Cause:** User lacks permission for operation

**Solutions:**

**Verify user is authenticated:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user?.id);
```

**Check RLS policies:**
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'quick_tastings';
```

**Test with service role key (admin):**
```typescript
// Only for debugging!
const adminClient = createClient(url, serviceRoleKey);
const { data, error } = await adminClient.from('quick_tastings').select('*');
```

---

### "undefined" vs null Issues

**Symptom:** Fields not updating or showing as undefined

**Cause:** Supabase ignores undefined values

**Solution:** Always use null to clear fields

```typescript
// ❌ Bad
const updates = { photo_url: undefined };

// ✅ Good
const updates = { photo_url: null };

// Helper function
function toDbUpdates(updates: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(updates).map(([k, v]) => [k, v ?? null])
  );
}
```

---

### Foreign Key Violations

**Symptom:** "violates foreign key constraint"

**Cause:** Referenced record doesn't exist

**Example:**
```typescript
// Error: tasting_id doesn't exist
await supabase.from('quick_tasting_items').insert({
  tasting_id: 'non-existent-id',
  item_name: 'Sample A'
});
```

**Solution:** Verify parent record exists

```typescript
const { data: tasting } = await supabase
  .from('quick_tastings')
  .select('id')
  .eq('id', tastingId)
  .single();

if (!tasting) {
  throw new Error('Tasting not found');
}
```

---

## UI/Component Issues

### Component Not Re-rendering

**Symptom:** Data updates but UI doesn't change

**Causes:**
1. State not updated correctly
2. Missing dependency in useEffect
3. Object/array mutation

**Solutions:**

**Check state updates:**
```typescript
// ❌ Bad: Mutating state
items.push(newItem); // Won't trigger re-render

// ✅ Good: New array
setItems([...items, newItem]);
```

**Check useEffect dependencies:**
```typescript
// ❌ Bad: Missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // userId not in deps

// ✅ Good: All dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

**Force re-render (last resort):**
```typescript
const [, forceUpdate] = useReducer(x => x + 1, 0);
// Later: forceUpdate()
```

---

### Modal Not Closing

**Symptom:** Modal stays open after clicking close

**Cause:** State not updating or event not firing

**Solution:**

**Check state update:**
```typescript
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => {
    console.log('Close called'); // Debug
    setIsOpen(false);
  }}
/>
```

**Check z-index conflicts:**
```css
/* Ensure modal has high z-index */
.modal-overlay {
  z-index: 9999;
}
```

---

### Infinite Re-render Loop

**Symptom:** Browser freezes, "Maximum update depth exceeded"

**Cause:** State update in render or wrong useEffect deps

**Solutions:**

**Move state updates to handlers:**
```typescript
// ❌ Bad: setState in render
function Component() {
  setCount(count + 1); // Infinite loop!
  return <div>{count}</div>;
}

// ✅ Good: setState in handler
function Component() {
  const handleClick = () => setCount(count + 1);
  return <button onClick={handleClick}>{count}</button>;
}
```

**Fix useEffect dependencies:**
```typescript
// ❌ Bad: Object in deps causes infinite loop
useEffect(() => {
  fetchData(config); // config is new object each render
}, [config]);

// ✅ Good: Destructure needed values
useEffect(() => {
  fetchData({ url: config.url });
}, [config.url]);
```

---

## Performance Issues

### Slow Page Load

**Symptom:** Page takes > 3 seconds to load

**Diagnose:**
```bash
# Lighthouse audit
npm run build
npm start
# Open DevTools → Lighthouse → Run audit
```

**Solutions:**

**1. Code splitting:**
```typescript
// Lazy load heavy components
const FlavorWheel = dynamic(() => import('@/components/FlavorWheel'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

**2. Reduce bundle size:**
```bash
# Analyze bundle
npm run build
# Check .next/analyze/client.html
```

**3. Optimize images:**
```typescript
// Use Next.js Image
<Image
  src={photo}
  alt="Tasting photo"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

### Excessive API Calls

**Symptom:** Network tab shows many duplicate requests

**Cause:** Re-renders triggering fetches

**Solutions:**

**Memoize expensive operations:**
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

**Debounce input handlers:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((query) => searchAPI(query), 300),
  []
);
```

**Use React Query (future):**
```typescript
const { data } = useQuery(['tastings'], fetchTastings, {
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

---

## Deployment Issues

### Build Fails on Netlify

**Symptom:** `npm run build` fails in CI

**Common Causes:**

**1. Missing environment variables:**
```bash
# Check Netlify dashboard:
# Site Settings → Build & Deploy → Environment
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**2. TypeScript errors:**
```bash
# Check locally first
npm run build

# Ignore build errors (not recommended):
# next.config.js
typescript: {
  ignoreBuildErrors: true
}
```

**3. Out of memory:**
```bash
# Increase Node memory in package.json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

---

### Site Works Locally But Not in Production

**Symptom:** Features work in dev but fail in prod

**Causes:**

**1. Hard-coded localhost:**
```typescript
// ❌ Bad
const API_URL = 'http://localhost:3000/api';

// ✅ Good
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
```

**2. Missing environment variables:**
```typescript
// Check if var is set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
```

**3. Browser caching:**
```bash
# Clear cache:
# Chrome: Ctrl+Shift+R (hard reload)
# Or in DevTools: Network → Disable cache
```

---

### API Routes Return 500

**Symptom:** `/api/*` endpoints return Internal Server Error

**Diagnose:**

**Check Netlify function logs:**
```bash
# In Netlify dashboard:
# Functions → Select function → View logs
```

**Check Sentry (if configured):**
```typescript
// Sentry.io dashboard → Issues
```

**Common Fixes:**

**1. Timeout (10s limit on Netlify):**
```typescript
// Optimize slow queries
const { data } = await supabase
  .from('quick_tastings')
  .select('id, session_name') // Only needed columns
  .limit(20); // Add limit
```

**2. Missing auth context:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## Development Environment

### Hot Reload Not Working

**Symptom:** Changes don't reflect without manual refresh

**Solutions:**

**1. Restart dev server:**
```bash
# Stop with Ctrl+C, then:
npm run dev
```

**2. Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

**3. Check file watcher limits (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### Module Not Found Errors

**Symptom:** `Cannot find module '@/components/...'`

**Solutions:**

**1. Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**2. Restart TypeScript server:**
```
VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**3. Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Tests Failing

**Symptom:** `npm test` shows failures

**Common Fixes:**

**1. Update snapshots:**
```bash
npm test -- -u
```

**2. Clear Jest cache:**
```bash
npm test -- --clearCache
```

**3. Check test environment:**
```javascript
// jest.setup.js
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
```

---

## Getting Help

**Still stuck?**

1. **Check existing issues:** GitHub Issues
2. **Search documentation:** All .md files in repo
3. **Enable debug logging:**
   ```typescript
   // In lib/logger.ts
   logger.setLevel('debug');
   ```

4. **Create detailed bug report:**
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS info
   - Console errors
   - Screenshots

---

**Last Updated:** January 2026
**Maintainer:** Development Team

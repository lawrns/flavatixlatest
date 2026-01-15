# Debugging API Errors: Comprehensive Guide

Learn to identify, diagnose, and fix API issues quickly.

## What You'll Learn

By the end of this guide, you will:
- Understand common API error types
- Use browser DevTools to debug API calls
- Read error messages effectively
- Fix validation errors
- Handle authentication issues
- Deal with database errors
- Debug rate limiting

**Time estimate:** 30-40 minutes

**Prerequisites:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) completed
- Basic understanding of HTTP status codes

## Section 1: The Error Landscape (10 minutes)

### Common API Status Codes

| Code | Meaning | Usually Means |
|------|---------|---------------|
| 200 | OK | Success! |
| 201 | Created | Successfully created something |
| 400 | Bad Request | Your request has an error |
| 401 | Unauthorized | Not logged in or token expired |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Already exists (duplicate) |
| 422 | Unprocessable | Data validation failed |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Server bug or database issue |

### Where Errors Happen

```
Request
  ↓
Rate Limiting         ← 429 errors
  ↓
Authentication        ← 401 errors
  ↓
Validation            ← 400/422 errors
  ↓
Business Logic        ← 404/409 errors
  ↓
Database              ← 500 errors
  ↓
Response
```

## Section 2: Finding Errors with Browser DevTools (10 minutes)

### Step 1: Open DevTools

```
Chrome/Edge:  Press F12 or Ctrl+Shift+I
Safari:       Cmd+Option+I
Firefox:      F12
```

### Step 2: Go to Network Tab

1. Open DevTools (F12)
2. Click "Network" tab
3. Refresh the page (Ctrl+R)
4. Try your action (create tasting, submit form, etc.)

### Step 3: Find Your API Call

Look for requests starting with `/api/`:

```
GET  /api/tastings                    Status: 200
POST /api/tastings/create             Status: 201
PUT  /api/tastings/abc123             Status: 200
DELETE /api/tastings/abc123           Status: 200
```

### Step 4: Inspect the Request

Click the API call to see details:

```
Headers:
  URL: /api/tastings/create
  Method: POST
  Status Code: 400

Request Headers:
  Content-Type: application/json
  Authorization: Bearer token_xyz

Request Body:
  {
    "category": "wine",
    "session_name": "My Tasting"
  }
```

### Step 5: Check the Response

Look for the error in the Response tab:

```
Response:
{
  "success": false,
  "error": {
    "message": "Validation error",
    "field": "session_name",
    "reason": "too short"
  }
}
```

### Step 6: Read the Error Message

The error tells you exactly what's wrong. Fix it and retry.

## Section 3: Common Errors and Solutions (15 minutes)

### Error 1: 401 Unauthorized

**Symptoms:**
- Status: 401
- Message: "Unauthorized" or "Authentication required"
- You're logged out or token expired

**Causes:**
- Not logged in
- Session expired
- Cookie deleted

**How to fix:**

```typescript
// Check your auth status
const { user } = useAuth()

if (!user) {
  // Redirect to login
  router.push('/auth')
  return null
}

// Or use the auth guard hook
import { useAuthGuard } from '@/hooks/useAuthGuard'

export default function ProtectedPage() {
  useAuthGuard() // Redirects to login if not authenticated

  return <div>Protected content</div>
}
```

**Debug step:**
1. Open DevTools
2. Go to Application → Cookies
3. Find `sb-auth-token`
4. If missing, you're logged out

### Error 2: 400 Bad Request / 422 Validation Error

**Symptoms:**
- Status: 400 or 422
- Message: "Validation error"
- Response shows what field is wrong

**Example:**
```json
{
  "error": "Validation error",
  "details": {
    "session_name": "String must have at least 3 characters"
  }
}
```

**How to fix:**
1. Read the error message
2. Find the field mentioned
3. Check what's required:
   - Too short? Add more characters
   - Wrong format? Check the pattern
   - Missing? Add the field

**Example fix:**
```typescript
// Before: validation error
const formData = {
  category: 'wine',
  session_name: 'AB', // ❌ Too short
}

// After: fixed
const formData = {
  category: 'wine',
  session_name: 'My Wine Tasting', // ✓ Long enough
}
```

### Error 3: 404 Not Found

**Symptoms:**
- Status: 404
- Message: "Not found" or "Resource not found"
- You're trying to access something that doesn't exist

**Causes:**
- Tasting ID is wrong
- Tasting was deleted
- URL has typo

**How to fix:**

```typescript
// Check if resource exists first
async function loadTasting(id: string) {
  try {
    const res = await fetch(`/api/tastings/${id}`)

    if (res.status === 404) {
      // Show user-friendly message
      showError('Tasting not found')
      router.push('/my-tastings')
      return
    }

    const data = await res.json()
    return data
  } catch (error) {
    showError('Failed to load tasting')
  }
}
```

### Error 4: 409 Conflict

**Symptoms:**
- Status: 409
- Message: "Already exists" or "Conflict"
- You tried to create something that already exists

**Example:**
```json
{
  "error": "You have already liked this tasting"
}
```

**How to fix:**

```typescript
// Try to like a tasting
const res = await fetch(`/api/tastings/${id}/like`, { method: 'POST' })

if (res.status === 409) {
  // User already liked it
  showError('You already liked this')
  return
}

showSuccess('Tasting liked!')
```

### Error 5: 429 Too Many Requests (Rate Limited)

**Symptoms:**
- Status: 429
- You're getting this after many rapid requests
- Requests work later

**Causes:**
- Making requests too fast
- Testing with repeated requests
- Buggy code in a loop

**How to fix:**

```typescript
// Bad: Makes 100 requests at once
const ids = tastings.map(t => t.id)
const results = await Promise.all(
  ids.map(id => fetch(`/api/tastings/${id}/like`, { method: 'POST' }))
)

// Good: Space out requests
const results = []
for (const id of ids) {
  const res = await fetch(`/api/tastings/${id}/like`, { method: 'POST' })
  results.push(res)
  await new Promise(resolve => setTimeout(resolve, 100)) // Wait 100ms
}

// Better: Use batch endpoint
const res = await fetch('/api/tastings/like-batch', {
  method: 'POST',
  body: JSON.stringify({ tasting_ids: ids })
})
```

### Error 6: 500 Server Error

**Symptoms:**
- Status: 500
- Message: "Internal Server Error"
- Something broke on the server

**Causes:**
- Bug in API endpoint
- Database query failed
- Missing environment variable
- External service (Anthropic, etc.) is down

**How to fix:**

1. **Check server logs:**
   ```bash
   # If running locally
   npm run dev
   # Look at terminal for error messages
   ```

2. **Check Sentry:**
   - Go to [sentry.io](https://sentry.io)
   - Look for recent errors
   - See the full stack trace

3. **Check environment variables:**
   ```bash
   # Make sure .env.local has all required values
   grep ANTHROPIC_API_KEY .env.local
   grep SUPABASE .env.local
   ```

4. **Check database:**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Tables exist?
   - Permissions set up?

5. **Ask for help:**
   - If it's a bug, open an issue
   - Include: Status code, endpoint, timestamp
   - Include: Request and response from DevTools

## Section 4: Debugging Specific Issues (10 minutes)

### Issue: Wrong Endpoint Called

**Symptom:** Getting 404 but the endpoint exists

**Debug:**
1. Check URL in DevTools Network tab
2. Verify it matches the file name:
   - `/api/tastings/create` → `/pages/api/tastings/create.ts`
   - `/api/tastings/[id]` → `/pages/api/tastings/[id].ts`

**Common mistake:**
```typescript
// Wrong: Forgot the route
fetch('/api/tastings')      // ❌ No endpoint here

// Right: Check actual endpoint
fetch('/api/tastings/create')  // ✓ Correct path
```

### Issue: Headers Not Sent

**Symptom:** API says "Invalid format" or "Body is empty"

**Debug:**

```typescript
// Wrong: No headers
fetch('/api/tastings/create', {
  method: 'POST',
  body: JSON.stringify({ name: 'Wine' }) // ❌ Missing Content-Type
})

// Right: Send proper headers
fetch('/api/tastings/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Wine' }) // ✓
})
```

### Issue: CORS Error

**Symptom:**
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Cause:** Calling external API directly from browser

**Solution:** Call your API instead (which can call external APIs)

```typescript
// Wrong: Direct external API call (CORS blocked)
fetch('https://anthropic-api.com/...')  // ❌ Blocked

// Right: Call your API, which calls external API
fetch('/api/ai/analyze', {  // ✓ Works
  method: 'POST',
  body: JSON.stringify({ text: 'Analyze this' })
})

// pages/api/ai/analyze.ts
async function handler(req, res, context) {
  // Safe to call external API from server
  const result = await fetch('https://anthropic-api.com/...')
  return sendSuccess(res, result)
}
```

## Section 5: Using Console Logs (5 minutes)

### Add Temporary Logs

```typescript
// In your component
const handleCreateTasting = async () => {
  const payload = {
    category: 'wine',
    session_name: 'My Tasting',
  }

  console.log('Sending payload:', payload)  // ← Add this

  try {
    const res = await fetch('/api/tastings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    console.log('Response status:', res.status)  // ← Add this

    const data = await res.json()
    console.log('Response data:', data)  // ← Add this

    if (!res.ok) {
      console.error('Error:', data.error)  // ← Add this
      return
    }

    // Success!
  } catch (error) {
    console.error('Fetch error:', error)  // ← Add this
  }
}
```

### View Logs in DevTools

1. Press F12
2. Click "Console" tab
3. Try your action
4. See the logs:
   ```
   Sending payload: {category: "wine", session_name: "My Tasting"}
   Response status: 201
   Response data: {success: true, data: {...}}
   ```

### Remove Logs When Done

```typescript
// Don't commit console.logs to production
// Before committing, remove them:
console.log(...) // ← Remove this line
```

## Debugging Checklist

When you get an error:

- [ ] Check status code (see table above)
- [ ] Read the error message carefully
- [ ] Open DevTools Network tab
- [ ] Find the failing request
- [ ] Check Request tab (what did I send?)
- [ ] Check Response tab (what did server say?)
- [ ] Try the fix
- [ ] Verify it works

## Summary

You've learned:
- Common API error types
- How to use browser DevTools
- Solutions for specific errors
- Debugging techniques
- How to read error messages

## Next Steps

- **Want to debug state?** → [DEBUG_STATE_ISSUES.md](./DEBUG_STATE_ISSUES.md)
- **Want to debug authentication?** → [DEBUG_AUTH_ISSUES.md](./DEBUG_AUTH_ISSUES.md)
- **Want to use DevTools effectively?** → [DEBUG_DEVTOOLS.md](./DEBUG_DEVTOOLS.md)
- **Back to index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Pro Tip:** Use Sentry in production to catch errors automatically. See [DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md).

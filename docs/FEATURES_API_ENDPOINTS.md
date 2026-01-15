# Building API Endpoints: Complete Tutorial

Learn to create production-ready API endpoints with validation, authentication, and error handling.

## What You'll Learn

By the end of this tutorial, you will:
- Create a new API endpoint from scratch
- Add request validation with Zod
- Implement proper error handling
- Secure your endpoint with authentication
- Write tests for your endpoint
- Handle edge cases gracefully

**Time estimate:** 45-60 minutes for the full guide

**Prerequisites:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) completed
- Basic understanding of HTTP requests (GET, POST, PUT, DELETE)
- Familiarity with TypeScript types

## Section 1: Understand the Current Pattern (10 minutes)

### Where API Endpoints Live

All API endpoints are in `/pages/api/`:

```
pages/api/
├── tastings/
│   ├── create.ts                    # POST /api/tastings/create
│   ├── [id]/
│   │   ├── index.ts                 # GET/PUT /api/tastings/[id]
│   │   ├── items/
│   │   │   └── index.ts             # GET/POST /api/tastings/[id]/items
│   │   └── participants/
│   │       └── index.ts             # GET/POST /api/tastings/[id]/participants
│   └── study/
│       ├── create.ts
│       └── join.ts
├── flavor-wheels/
│   └── ...
└── social/
    ├── comments.ts
    ├── likes.ts
    └── follows.ts
```

### The Standard Pattern

Every endpoint follows this pattern:

```typescript
// 1. Type imports
import type { NextApiRequest, NextApiResponse } from 'next'
import type { YourInputType } from '@/lib/validations'

// 2. Middleware and helpers
import { createApiHandler, withAuth, withValidation } from '@/lib/api/middleware'
import { sendSuccess, sendError } from '@/lib/api/responses'

// 3. Handler function
async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Your logic here
}

// 4. Export with middleware
export default createApiHandler({
  POST: withAuth(withValidation(yourSchema, handler)),
})
```

### The Middleware Chain

Requests go through middleware in order:

```
Request
  ↓
createApiHandler (method routing, error handling)
  ↓
withRateLimit (check rate limits)
  ↓
withAuth (verify user is logged in)
  ↓
withValidation (check request is valid)
  ↓
Your handler function
  ↓
Response
```

## Section 2: Create Your First Endpoint (20 minutes)

### Scenario: Add a "Like" Endpoint

We'll create: `POST /api/tastings/[id]/like`

This endpoint will:
- Check the user is authenticated
- Verify the tasting exists
- Add a like record
- Return the updated like count

### Step 1: Define the Input Schema

Open or create `/lib/validations/like.ts`:

```typescript
import { z } from 'zod'

// Define what the API expects
export const createLikeSchema = z.object({
  // This comes from the URL: /api/tastings/[id]/like
  // We'll add this in the handler, not the schema
})

export type CreateLikeInput = z.infer<typeof createLikeSchema>
```

Hmm, this request has no body! Let's refine:

```typescript
import { z } from 'zod'

// For POST /api/tastings/[id]/like
// The tasting_id comes from the URL, not the body
export const createLikeSchema = z.object({
  // Empty schema because URL param is handled separately
  // See step 3 for how to handle this
})

export type CreateLikeInput = z.infer<typeof createLikeSchema>
```

Actually, let's use the proper pattern. See the validation file:

```typescript
// lib/validations/tasting-like.ts
import { z } from 'zod'

// For endpoints that only use URL params
export const likeSchema = z.object({
  // Can be empty if all data comes from URL
})

export type LikeInput = z.infer<typeof likeSchema>
```

### Step 2: Create the Endpoint File

Create `/pages/api/tastings/[id]/like.ts`:

```typescript
/**
 * API Route: Like a Tasting
 * POST /api/tastings/[id]/like
 *
 * Adds a like to a tasting session
 * User can only like once per tasting
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import {
  createApiHandler,
  withAuth,
  RATE_LIMITS,
  withRateLimit,
  sendSuccess,
  sendServerError,
  sendNotFound,
  sendConflict,
  type ApiContext,
} from '@/lib/api/middleware'

/**
 * Handler function
 * This is called after auth, validation, and rate limits pass
 */
async function likeTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Get the tasting ID from URL: /api/tastings/[id]/like
  const { id: tasting_id } = req.query

  if (!tasting_id || typeof tasting_id !== 'string') {
    return sendNotFound(res, 'Tasting not found')
  }

  // Get user ID from authenticated context (set by withAuth)
  // NEVER trust user_id from request body
  const user_id = context.user?.id
  if (!user_id) {
    return sendUnauthorized(res, 'Authentication required')
  }

  // Get Supabase client with RLS (Row Level Security) enforcement
  const supabase = getSupabaseClient(req, res)

  // Step 1: Check if tasting exists
  logger.debug('Like', 'Checking tasting exists', { tasting_id })

  const { data: tasting, error: tastingError } = await supabase
    .from('quick_tastings')
    .select('id')
    .eq('id', tasting_id)
    .single()

  if (tastingError || !tasting) {
    logger.warn('Like', 'Tasting not found', { tasting_id, user_id })
    return sendNotFound(res, 'Tasting not found')
  }

  // Step 2: Check if user already liked this tasting
  logger.debug('Like', 'Checking existing like', { tasting_id, user_id })

  const { data: existingLike, error: checkError } = await supabase
    .from('tasting_likes')
    .select('id')
    .eq('tasting_id', tasting_id)
    .eq('user_id', user_id)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 = no rows found (which is fine)
    logger.error('Like', 'Error checking like', checkError)
    return sendServerError(res, checkError, 'Failed to check like status')
  }

  if (existingLike) {
    // User already liked this tasting
    logger.info('Like', 'User already liked this tasting', { tasting_id, user_id })
    return sendConflict(res, 'You have already liked this tasting')
  }

  // Step 3: Create the like
  logger.mutation('tasting_likes', 'create', undefined, user_id, { tasting_id })

  const { data: newLike, error: likeError } = await supabase
    .from('tasting_likes')
    .insert({
      tasting_id,
      user_id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (likeError) {
    logger.error('Like', 'Error creating like', likeError)
    return sendServerError(res, likeError, 'Failed to like tasting')
  }

  // Step 4: Get updated like count
  const { count: likeCount, error: countError } = await supabase
    .from('tasting_likes')
    .select('id', { count: 'exact' })
    .eq('tasting_id', tasting_id)

  if (countError) {
    logger.warn('Like', 'Error getting like count', countError)
    // Still return success, but without count
  }

  logger.info('Like', 'Tasting liked successfully', {
    tasting_id,
    user_id,
    total_likes: likeCount || 0,
  })

  return sendSuccess(
    res,
    {
      like: newLike,
      total_likes: likeCount || 0,
    },
    'Tasting liked successfully',
    201
  )
}

// Export with middleware chain
// Requests go through: rate limit → auth → handler
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(likeTastingHandler)),
})
```

### Step 3: Add the Database Table

First, check if the table exists. Open `/schema.sql` and search for `tasting_likes`.

If it doesn't exist, add it:

```sql
-- Table for user likes on tastings
CREATE TABLE IF NOT EXISTS tasting_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasting_id UUID NOT NULL REFERENCES quick_tastings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Prevent duplicate likes
  UNIQUE(tasting_id, user_id)
);

-- Index for fast queries
CREATE INDEX idx_tasting_likes_tasting_id ON tasting_likes(tasting_id);
CREATE INDEX idx_tasting_likes_user_id ON tasting_likes(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE tasting_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes (public data)
CREATE POLICY "Likes are viewable by everyone"
  ON tasting_likes FOR SELECT
  USING (true);

-- Users can only create their own likes
CREATE POLICY "Users can create their own likes"
  ON tasting_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON tasting_likes FOR DELETE
  USING (user_id = auth.uid());
```

Run this in Supabase SQL editor:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. New Query
5. Paste the SQL
6. Run

### Step 4: Test the Endpoint

Now let's test it. Create a test file at `/pages/api/tastings/[id]/like.test.ts`:

```typescript
import { createMocks } from 'node-mocks-http'
import handler from './like'

// Mock the dependencies
jest.mock('@/lib/supabase')
jest.mock('@/lib/api/middleware')

describe('/api/tastings/[id]/like', () => {
  it('should like a tasting', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { id: 'tasting-123' },
      // The middleware would set this
      context: {
        user: { id: 'user-456' },
      },
    })

    // Call the handler
    await handler(req, res)

    // Check response
    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.data.like).toBeDefined()
  })

  it('should prevent duplicate likes', async () => {
    // This test would mock Supabase to return an existing like
    // See TESTING_UNIT_TESTS.md for detailed examples
  })

  it('should return 404 for non-existent tasting', async () => {
    // Test when tasting doesn't exist
  })
})
```

## Section 3: Common Patterns (15 minutes)

### Pattern 1: Getting Data from Different Sources

Most endpoints need data from multiple sources:

```typescript
async function handler(req: NextApiRequest, res: NextApiResponse, context: ApiContext) {
  // Source 1: URL parameters
  const { id: tasting_id } = req.query

  // Source 2: Query parameters
  const { limit = '10', offset = '0' } = req.query

  // Source 3: Request body (for POST/PUT)
  const { description } = req.body

  // Source 4: Authentication context
  const user_id = context.user?.id

  // Validate all of them
  if (!tasting_id || typeof tasting_id !== 'string') {
    return sendBadRequest(res, 'Invalid tasting ID')
  }

  const limitNum = Math.min(parseInt(limit as string) || 10, 100)
  const offsetNum = Math.max(parseInt(offset as string) || 0, 0)

  // Now use them
}
```

### Pattern 2: Handling List Endpoints (with Pagination)

```typescript
async function handler(req: NextApiRequest, res: NextApiResponse, context: ApiContext) {
  const user_id = context.user?.id
  const { limit = '20', offset = '0' } = req.query

  const limitNum = Math.min(parseInt(limit as string) || 20, 100)
  const offsetNum = parseInt(offset as string) || 0

  const supabase = getSupabaseClient(req, res)

  // Get total count
  const { count: total } = await supabase
    .from('quick_tastings')
    .select('id', { count: 'exact' })
    .eq('user_id', user_id)

  // Get paginated results
  const { data: tastings, error } = await supabase
    .from('quick_tastings')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offsetNum, offsetNum + limitNum - 1)

  if (error) {
    return sendServerError(res, error, 'Failed to fetch tastings')
  }

  return sendSuccess(res, {
    tastings,
    pagination: {
      offset: offsetNum,
      limit: limitNum,
      total: total || 0,
      hasMore: offsetNum + limitNum < (total || 0),
    },
  })
}
```

### Pattern 3: Complex Queries with Relationships

```typescript
async function handler(req: NextApiRequest, res: NextApiResponse, context: ApiContext) {
  const { id: tasting_id } = req.query
  const user_id = context.user?.id

  const supabase = getSupabaseClient(req, res)

  // Get tasting with related data
  const { data: tasting, error } = await supabase
    .from('quick_tastings')
    .select(
      `
      id,
      session_name,
      category,
      created_at,
      user:user_id (id, email),
      items:quick_tasting_items (id, item_name),
      participants:tasting_participants (id, user_id, role),
      likes:tasting_likes (id, user_id)
      `
    )
    .eq('id', tasting_id)
    .single()

  if (error) {
    return sendNotFound(res, 'Tasting not found')
  }

  // Transform the data
  return sendSuccess(res, {
    ...tasting,
    like_count: tasting.likes?.length || 0,
    is_liked_by_user: tasting.likes?.some(l => l.user_id === user_id),
  })
}
```

### Pattern 4: Batch Operations

```typescript
async function handler(req: NextApiRequest, res: NextApiResponse, context: ApiContext) {
  const { ids } = req.body // Array of IDs
  const user_id = context.user?.id

  if (!Array.isArray(ids) || ids.length === 0) {
    return sendBadRequest(res, 'ids must be a non-empty array')
  }

  if (ids.length > 100) {
    return sendBadRequest(res, 'Cannot process more than 100 items at once')
  }

  const supabase = getSupabaseClient(req, res)

  // Delete multiple tastings
  const { error } = await supabase
    .from('quick_tastings')
    .delete()
    .eq('user_id', user_id) // RLS: only delete own tastings
    .in('id', ids)

  if (error) {
    return sendServerError(res, error, 'Failed to delete tastings')
  }

  return sendSuccess(res, {
    deleted_count: ids.length,
  }, 'Tastings deleted successfully')
}
```

## Section 4: Error Handling (10 minutes)

### The Response Helpers

Flavatix provides standard response functions:

```typescript
// Success responses
sendSuccess(res, data, 'Success message', 200)
sendCreated(res, data, 'Created message', 201)

// Error responses
sendBadRequest(res, 'Invalid input')
sendUnauthorized(res, 'Not authenticated')
sendForbidden(res, 'Not allowed')
sendNotFound(res, 'Not found')
sendConflict(res, 'Already exists')
sendServerError(res, error, 'Server error')
```

### Common Error Scenarios

**Validation Error:**
```typescript
if (!description || description.trim().length === 0) {
  return sendBadRequest(res, 'Description is required')
}
```

**Authentication Error:**
```typescript
const user_id = context.user?.id
if (!user_id) {
  return sendUnauthorized(res, 'You must be logged in')
}
```

**Permission Error:**
```typescript
// RLS should prevent this, but check anyway
if (tasting.user_id !== user_id) {
  return sendForbidden(res, 'You do not have permission to modify this tasting')
}
```

**Not Found:**
```typescript
const { data: tasting, error } = await supabase
  .from('quick_tastings')
  .select('*')
  .eq('id', tasting_id)
  .single()

if (error || !tasting) {
  return sendNotFound(res, 'Tasting not found')
}
```

**Database Error:**
```typescript
if (error) {
  logger.error('Tasting', 'Database error', error)
  return sendServerError(res, error, 'Failed to update tasting')
}
```

## Section 5: Security Best Practices (10 minutes)

### 1. Never Trust the Client

**Wrong:**
```typescript
// DON'T DO THIS
const user_id = req.body.user_id  // Client could lie
```

**Right:**
```typescript
// DO THIS
const user_id = context.user?.id  // From JWT token
```

### 2. Always Use RLS (Row Level Security)

**Wrong:**
```typescript
// This could expose other users' data
const { data } = await supabase
  .from('quick_tastings')
  .select('*')
  .eq('id', tasting_id)
```

**Right:**
```typescript
// RLS automatically filters to the authenticated user
const supabase = getSupabaseClient(req, res)  // Has RLS enabled
const { data } = await supabase
  .from('quick_tastings')
  .select('*')
  .eq('id', tasting_id)
```

### 3. Validate Rate Limits

```typescript
// Wrap your handler with rate limiting
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(handler)
  ),
})
```

### 4. Log Security Events

```typescript
// Log when users try to access things they shouldn't
if (tasting.user_id !== user_id) {
  logger.warn('Security', 'Unauthorized access attempt', {
    user_id,
    tasting_id,
  })
  return sendForbidden(res, 'Not allowed')
}
```

### 5. Validate Input Size

```typescript
if (description && description.length > 5000) {
  return sendBadRequest(res, 'Description too long (max 5000 characters)')
}

if (Array.isArray(items) && items.length > 1000) {
  return sendBadRequest(res, 'Too many items (max 1000)')
}
```

## Common Mistakes

### Mistake 1: Forgetting to Handle Errors

**Wrong:**
```typescript
const { data } = await supabase.from('tastings').select('*')
return sendSuccess(res, { tastings: data })  // data could be null!
```

**Right:**
```typescript
const { data, error } = await supabase.from('tastings').select('*')
if (error) {
  return sendServerError(res, error, 'Failed to fetch tastings')
}
return sendSuccess(res, { tastings: data })
```

### Mistake 2: Not Validating URL Parameters

**Wrong:**
```typescript
const { id } = req.query
// What if id is undefined or an array?
const tasting = await getTasting(id)
```

**Right:**
```typescript
const { id } = req.query
if (!id || typeof id !== 'string') {
  return sendBadRequest(res, 'Invalid ID')
}
const tasting = await getTasting(id)
```

### Mistake 3: Exposing Sensitive Data

**Wrong:**
```typescript
return sendSuccess(res, {
  user: {
    id: user.id,
    email: user.email,
    password_hash: user.password_hash,  // NEVER!
    api_key: user.api_key,  // NEVER!
  },
})
```

**Right:**
```typescript
return sendSuccess(res, {
  user: {
    id: user.id,
    email: user.email,
    // Only send safe data
  },
})
```

## Summary

You've learned:
- The standard API endpoint pattern in Flavatix
- How to create endpoints with validation
- Common patterns for different scenarios
- Error handling best practices
- Security considerations

## Next Steps

- **Ready to write tests?** → [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md)
- **Need to add database tables?** → [ARCHITECTURE_DATABASE.md](./ARCHITECTURE_DATABASE.md)
- **Debugging API errors?** → [DEBUG_API_ERRORS.md](./DEBUG_API_ERRORS.md)
- **Complete guide index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Remember:** Always test your endpoints before deploying! See the next section for testing strategies.

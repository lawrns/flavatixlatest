# API Design Patterns and Standards

This document outlines the standardized patterns, middleware, and conventions used across all Flavatix API endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Middleware Architecture](#middleware-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Request/Response Patterns](#requestresponse-patterns)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Validation](#validation)
8. [Ownership Verification](#ownership-verification)
9. [HTTP Methods & Status Codes](#http-methods--status-codes)
10. [API Endpoint Examples](#api-endpoint-examples)

---

## Overview

All Flavatix API endpoints follow a consistent architecture using:

- **Centralized Middleware**: Authentication, validation, error handling, logging
- **Type-Safe Validation**: Zod schemas for all inputs
- **Standardized Responses**: Consistent success/error format
- **Built-in Security**: Rate limiting, CSRF protection, audit logging
- **Comprehensive Observability**: Request tracking, Sentry integration

### Core Principles

1. **Consistency**: All endpoints use the same middleware composition patterns
2. **Security First**: Fail-closed authentication, ownership verification, rate limiting
3. **Type Safety**: Zod validation for all inputs, TypeScript for all code
4. **Developer Experience**: Clear error messages, comprehensive logging
5. **Production Ready**: Built-in monitoring, rate limiting, error tracking

---

## Middleware Architecture

### Middleware Stack

All API endpoints use `createApiHandler` which automatically applies:

```typescript
createApiHandler({
  GET: handler,
  POST: handler,
  PATCH: handler,
  DELETE: handler,
})
```

This provides:
- **Method Routing**: Automatic 405 for unsupported methods
- **Request ID Generation**: Unique ID for tracing
- **Error Handling**: Automatic error catching and formatting
- **Logging**: Request/response logging with timing

### Available Middleware

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `withAuth` | Require authentication | Protected endpoints |
| `withOptionalAuth` | Optional authentication | Public endpoints with user context |
| `withValidation` | Request body validation | All POST/PATCH endpoints |
| `withQueryValidation` | Query parameter validation | GET endpoints with params |
| `withRateLimit` | Rate limiting | All endpoints |
| `withOwnership` | Resource ownership verification | Resource-specific endpoints |
| `withErrorHandling` | Error handling (automatic) | Automatic in createApiHandler |
| `withLogging` | Request/response logging (automatic) | Automatic in createApiHandler |

### Middleware Composition

Middleware is composed right-to-left (inner to outer):

```typescript
// Example: Protected endpoint with validation and rate limiting
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(createTastingSchema, createTastingHandler)
    )
  ),
});
```

**Execution Order** (request → response):
1. `createApiHandler` - Method routing, request ID, error handling
2. `withRateLimit` - Check rate limits
3. `withAuth` - Verify authentication
4. `withValidation` - Validate request body
5. Handler function
6. Response logging (automatic)

---

## Authentication & Authorization

### Authentication

All protected endpoints use Bearer token authentication:

```typescript
Authorization: Bearer <supabase-jwt-token>
```

#### Required Authentication

```typescript
withAuth(handler)
```

- Verifies Bearer token
- Extracts user from token
- Adds user to context
- Returns 401 if unauthorized

#### Optional Authentication

```typescript
withOptionalAuth(handler)
```

- Attempts to authenticate
- Continues without user if token invalid
- Useful for public endpoints with user-specific features

### Authorization (Ownership Verification)

Use `withOwnership` to verify resource ownership:

```typescript
// Basic ownership check
withOwnership({ table: 'quick_tastings' })(handler)

// Custom ownership logic
withOwnership({
  table: 'quick_tastings',
  customCheck: async (req, userId, supabase) => {
    const { id: tastingId, itemId } = req.query;
    const { data: tasting } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();
    return { isOwner: !!tasting, resource: tasting };
  }
})(handler)
```

**Security Features:**
- Returns 404 for both missing resources and unauthorized access (doesn't reveal existence)
- Logs all authorization failures
- Sends security events to Sentry

### Admin Authentication

Admin endpoints use `withAdminAuth` from `@/lib/admin/rbac`:

```typescript
import { withAdminAuth, AdminPermission } from '@/lib/admin/rbac';

export default withAdminAuth(handler, AdminPermission.AI_USAGE_READ);
```

**Features:**
- Role-based access control (SUPER_ADMIN, ADMIN, MODERATOR)
- Permission-based authorization
- Automatic audit logging
- Fail-closed security (deny by default)

---

## Request/Response Patterns

### Request Format

#### POST/PATCH Requests

```json
{
  "field1": "value1",
  "field2": "value2"
}
```

Validated against Zod schema before reaching handler.

#### Query Parameters

```
GET /api/resource?param1=value1&param2=value2
```

Use `withQueryValidation` for type-safe query params.

### Response Format

All API responses follow a consistent structure:

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

**Status Codes:**
- `200 OK` - Successful GET/PATCH/DELETE
- `201 Created` - Successful POST (resource created)

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional context
    }
  }
}
```

**Common Error Codes:**
- `AUTH_REQUIRED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_FAILED` - Input validation failed (400)
- `RATE_LIMIT_EXCEEDED` - Too many requests (429)
- `INTERNAL_ERROR` - Server error (500)

### Response Helpers

Use standardized response helpers:

```typescript
// Success responses
sendSuccess(res, data, message?, status?)
sendSuccess(res, tasting, 'Tasting created successfully', 201)

// Error responses
sendError(res, code, message, status?, details?)
sendUnauthorized(res, message?)
sendForbidden(res, message?)
sendNotFound(res, resource?)
sendValidationError(res, errors)
sendServerError(res, error, message?, context?)
```

---

## Error Handling

### Automatic Error Handling

`createApiHandler` automatically catches all errors:

```typescript
try {
  return await handler(req, res, context);
} catch (error) {
  // Logs error
  // Sends to Sentry
  // Returns 500 with standardized error response
}
```

### Validation Errors

Validation errors are automatically formatted:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "field1": "Error message for field1",
      "field2": "Error message for field2"
    }
  }
}
```

### Error Logging

All errors are:
1. Logged with `logger.error()`
2. Sent to Sentry with context
3. Returned as standardized error response

**Never expose sensitive information in error messages!**

---

## Rate Limiting

### Configuration

Rate limits are applied using `withRateLimit`:

```typescript
withRateLimit(RATE_LIMITS.API)(handler)
```

### Preset Rate Limits

| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| `PUBLIC` | 100 req | 1 minute | Public endpoints |
| `AUTH` | 10 req | 1 minute | Login/signup |
| `API` | 60 req | 1 minute | Authenticated API |
| `STRICT` | 5 req | 15 minutes | Sensitive ops (password reset) |

### Custom Rate Limits

```typescript
withRateLimit({
  maxRequests: 30,
  windowMs: 60000, // 1 minute
  keyGenerator: (req) => req.user?.id || getClientIp(req),
  message: 'Custom rate limit message'
})(handler)
```

### Rate Limit Headers

All rate-limited responses include headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 42
```

When rate limit exceeded (429):

```
Retry-After: 42
```

### Rate Limit Storage

- **Development**: In-memory (single instance only)
- **Production**: Redis (distributed, required with `REDIS_URL` env var)

**Warning:** In-memory rate limiting does NOT work across serverless instances!

---

## Validation

### Zod Schemas

All request bodies are validated using Zod:

```typescript
const createTastingSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  mode: z.enum(['quick', 'study', 'competition']),
  session_name: z.string().optional(),
  notes: z.string().optional(),
});

type CreateTastingInput = z.infer<typeof createTastingSchema>;
```

### Using Validation Middleware

```typescript
withValidation(createTastingSchema, handler)
```

**Behavior:**
- Validates `req.body` against schema
- Replaces `req.body` with validated data (typed!)
- Returns 400 with validation errors if invalid
- Calls handler only if validation passes

### Query Parameter Validation

```typescript
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

withQueryValidation(querySchema, handler)
```

Validated query params available at `req.validatedQuery`.

### Custom Error Messages

```typescript
z.string()
  .min(1, 'Category is required')
  .max(100, 'Category name too long')

z.enum(['quick', 'study', 'competition'], {
  errorMap: () => ({ message: 'Mode must be quick, study, or competition' })
})
```

---

## Ownership Verification

### Basic Ownership Check

Verify user owns a resource:

```typescript
withOwnership({ table: 'quick_tastings' })(handler)
```

**Configuration:**
```typescript
{
  table: string;              // Supabase table name
  idParam?: string;           // URL param name (default: 'id')
  idColumn?: string;          // DB column name (default: 'id')
  userIdColumn?: string;      // User ID column (default: 'user_id')
  resourceName?: string;      // For error messages (default: 'Resource')
}
```

### Custom Ownership Logic

For complex ownership checks (nested resources, multiple conditions):

```typescript
withOwnership({
  table: 'quick_tastings',
  customCheck: async (req, userId, supabase) => {
    const { id: tastingId, itemId } = req.query;

    // Verify tasting ownership
    const { data: tasting } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    // Verify item belongs to tasting
    const { data: item } = await supabase
      .from('quick_tasting_items')
      .select('id, tasting_id')
      .eq('id', itemId)
      .eq('tasting_id', tastingId)
      .single();

    return {
      isOwner: !!(tasting && item),
      resource: { tasting, item }
    };
  }
})(handler)
```

### Security Best Practices

1. **Don't reveal resource existence**: Return 404 for both missing and unauthorized
2. **Log authorization failures**: Track potential security issues
3. **Verify ownership early**: Before expensive operations
4. **Use RLS as backup**: Row-Level Security in Supabase as defense-in-depth

---

## HTTP Methods & Status Codes

### HTTP Methods

| Method | Purpose | Idempotent | Request Body |
|--------|---------|------------|--------------|
| GET | Retrieve resources | Yes | No |
| POST | Create resources | No | Yes |
| PATCH | Partial update | No | Yes (partial) |
| DELETE | Delete resources | Yes | No |

**Note:** We use PATCH (not PUT) for updates as all updates are partial.

### Status Codes

#### Success Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 OK | Success | GET, PATCH, DELETE successful |
| 201 Created | Resource created | POST successful |
| 204 No Content | Success, no response body | Rarely used |

#### Client Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 400 Bad Request | Invalid input | Validation failed |
| 401 Unauthorized | Authentication required | Missing/invalid token |
| 403 Forbidden | Insufficient permissions | Ownership check failed |
| 404 Not Found | Resource not found | Resource doesn't exist (or unauthorized) |
| 405 Method Not Allowed | HTTP method not supported | Wrong method for endpoint |
| 409 Conflict | Resource conflict | Duplicate resource |
| 429 Too Many Requests | Rate limit exceeded | Too many requests |

#### Server Error Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 500 Internal Server Error | Unexpected error | Unhandled exceptions |
| 503 Service Unavailable | Service temporarily unavailable | Maintenance, dependencies down |

---

## API Endpoint Examples

### Example 1: Simple Protected Endpoint

```typescript
import {
  createApiHandler,
  withAuth,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';

async function getTastingsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return sendServerError(res, error, 'Failed to fetch tastings');
    }

    return sendSuccess(res, { tastings: data }, 'Tastings retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to fetch tastings');
  }
}

export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getTastingsHandler)),
});
```

### Example 2: Create with Validation

```typescript
import { z } from 'zod';

const createTastingSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  mode: z.enum(['quick', 'study', 'competition']),
  session_name: z.string().optional(),
  notes: z.string().optional(),
});

type CreateTastingInput = z.infer<typeof createTastingSchema>;

async function createTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated and typed!
  const { category, mode, session_name, notes } = req.body as CreateTastingInput;

  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .insert({
        user_id: userId,
        category,
        mode,
        session_name,
        notes,
      })
      .select()
      .single();

    if (error) {
      return sendServerError(res, error, 'Failed to create tasting');
    }

    return sendSuccess(res, { tasting: data }, 'Tasting created successfully', 201);
  } catch (error) {
    return sendServerError(res, error, 'Failed to create tasting');
  }
}

export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(createTastingSchema, createTastingHandler)
    )
  ),
});
```

### Example 3: Update with Ownership

```typescript
import {
  createApiHandler,
  withAuth,
  withOwnership,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';

const updateTastingSchema = z.object({
  session_name: z.string().optional(),
  notes: z.string().optional(),
  completed_at: z.string().datetime().optional(),
});

type UpdateTastingInput = z.infer<typeof updateTastingSchema>;

async function updateTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Ownership already verified by withOwnership middleware
  const updateData = req.body as UpdateTastingInput;

  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId) // Additional safety check
      .select()
      .single();

    if (error) {
      return sendServerError(res, error, 'Failed to update tasting');
    }

    return sendSuccess(res, { tasting: data }, 'Tasting updated successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to update tasting');
  }
}

export default createApiHandler({
  PATCH: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withOwnership({ table: 'quick_tastings', resourceName: 'Tasting' })(
        withValidation(updateTastingSchema, updateTastingHandler)
      )
    )
  ),
});
```

### Example 4: Public Endpoint with Optional Auth

```typescript
async function getPublicTastingsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = context.user?.id; // May be undefined
  const supabase = getSupabaseClient(req, res);

  try {
    // Fetch public tastings
    const query = supabase
      .from('quick_tastings')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // If user is authenticated, include their own tastings
    if (userId) {
      query.or(`is_public.eq.true,user_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      return sendServerError(res, error, 'Failed to fetch tastings');
    }

    return sendSuccess(res, {
      tastings: data,
      authenticated: !!userId
    });
  } catch (error) {
    return sendServerError(res, error, 'Failed to fetch tastings');
  }
}

export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.PUBLIC)(
    withOptionalAuth(getPublicTastingsHandler)
  ),
});
```

---

## Best Practices

### 1. Security

- **Always use `withAuth`** for protected endpoints
- **Verify ownership** before modifying resources
- **Never trust client input** - validate everything
- **Use RLS** as defense-in-depth
- **Log security events** to Sentry

### 2. Error Handling

- **Use standardized helpers** (sendSuccess, sendError, etc.)
- **Provide clear error messages** for users
- **Never expose sensitive data** in errors
- **Log context** for debugging
- **Send errors to Sentry** for monitoring

### 3. Performance

- **Add rate limiting** to all endpoints
- **Use database indexes** for queries
- **Cache expensive operations** (flavor wheels, taxonomies)
- **Limit response size** with pagination
- **Monitor slow requests** (automatic with logging middleware)

### 4. Type Safety

- **Define Zod schemas** for all inputs
- **Use `z.infer`** for TypeScript types
- **Type context properly** with ApiContext
- **Validate query parameters** with withQueryValidation

### 5. Observability

- **Use request IDs** for tracing (automatic)
- **Log important operations** with logger
- **Set Sentry context** for debugging
- **Monitor performance** with metrics
- **Track rate limit usage**

---

## Migration Guide

### Converting Legacy Endpoints

Old pattern:
```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseClient(req, res);
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Handler logic...
}
```

New pattern:
```typescript
async function createHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Handler logic...
  return sendSuccess(res, data, 'Created successfully', 201);
}

export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(schema, createHandler)
    )
  ),
});
```

### Benefits of Migration

1. **Less boilerplate** - middleware handles repetitive code
2. **Consistent patterns** - all endpoints follow same structure
3. **Better error handling** - automatic error catching and formatting
4. **Built-in security** - rate limiting, CSRF, audit logging
5. **Type safety** - Zod validation with TypeScript types
6. **Better observability** - automatic logging, tracing, monitoring

---

## Related Documentation

- [OpenAPI Specification](./openapi.yaml) - Full API reference
- [API Versioning Strategy](./api-versioning.md) - Versioning and deprecation
- [Authentication Guide](./authentication.md) - Detailed auth flow
- [Rate Limiting](./rate-limiting.md) - Rate limit configuration
- [Error Codes](./error-codes.md) - Complete error code reference

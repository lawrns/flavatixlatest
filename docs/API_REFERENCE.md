# Flavatix API Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Codes](#error-codes)
5. [Rate Limiting](#rate-limiting)
6. [Tasting Endpoints](#tasting-endpoints)
7. [Flavor Wheel Endpoints](#flavor-wheel-endpoints)
8. [Social Endpoints](#social-endpoints)
9. [Admin Endpoints](#admin-endpoints)
10. [Webhooks](#webhooks)

---

## Overview

The Flavatix API is a RESTful HTTP API built with Next.js API routes. All endpoints return JSON responses and require authentication unless otherwise noted.

**Base URL:** `https://your-domain.com/api`

**API Version:** v1 (implicit in all routes)

**Content Type:** `application/json`

---

## Authentication

### JWT Bearer Token

All authenticated endpoints require a valid JWT token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

**Getting a Token:**

Use Supabase Auth to obtain a JWT:

```typescript
import { supabase } from '@/lib/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const token = data.session?.access_token;
```

**Token Expiry:**
- Tokens expire after 1 hour
- Refresh tokens valid for 30 days
- Supabase client handles auto-refresh

---

### Public Endpoints

The following endpoints do NOT require authentication:
- `GET /api/categories` - List public categories
- Any endpoint explicitly marked as public in this doc

---

## Request/Response Format

### Standard Success Response

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "session_name": "Wine Tasting",
    "category": "wine",
    "created_at": "2026-01-15T12:00:00Z"
  },
  "error": null
}
```

### Standard Error Response

```json
{
  "data": null,
  "error": {
    "message": "Tasting session not found",
    "code": "TASTING_NOT_FOUND",
    "details": {
      "id": "invalid-id"
    }
  }
}
```

---

### Request Body Validation

All POST/PUT/PATCH endpoints validate request bodies using Zod schemas:

```typescript
// Example: Create tasting validation
{
  "mode": "quick",           // Required: 'quick' | 'study' | 'competition'
  "category": "wine",        // Required: string
  "session_name": "My Tasting", // Optional: string
  "notes": "Optional notes"  // Optional: string
}
```

**Validation Errors:**

```json
{
  "data": null,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "mode": "Invalid enum value. Expected 'quick' | 'study' | 'competition'",
      "category": "Required"
    }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `TASTING_NOT_FOUND` | 404 | Tasting session not found |
| `ITEM_NOT_FOUND` | 404 | Tasting item not found |
| `USER_NOT_FOUND` | 404 | User profile not found |
| `ALREADY_EXISTS` | 409 | Resource already exists |

---

## Rate Limiting

Rate limits are enforced per IP address and per authenticated user.

### Default Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Tasting Creation | 10 requests | 1 minute |
| Item Updates | 60 requests | 1 minute |
| Flavor Wheel Generation | 5 requests | 1 minute |
| Social Actions (likes, follows) | 30 requests | 1 minute |
| General API | 100 requests | 1 minute |

### Rate Limit Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1705334400
```

### Rate Limit Exceeded Response

```json
{
  "data": null,
  "error": {
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "limit": 10,
      "reset_at": "2026-01-15T12:01:00Z"
    }
  }
}
```

---

## Tasting Endpoints

### Create Tasting Session

Create a new tasting session.

**Endpoint:** `POST /api/tastings/create`

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Request Body:**

```json
{
  "mode": "quick",
  "category": "wine",
  "session_name": "Bordeaux Tasting",
  "notes": "Blind tasting of 2020 Bordeaux wines",
  "study_approach": "predefined",
  "rank_participants": false,
  "is_blind_items": true,
  "items": []
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | `string` | Yes | Tasting mode: `'quick'`, `'study'`, `'competition'` |
| `category` | `string` | Yes | Category name (e.g., 'wine', 'coffee', 'whisky') |
| `session_name` | `string` | No | Custom session name (auto-generated if omitted) |
| `notes` | `string` | No | Session notes |
| `study_approach` | `string` | No | For study mode: `'predefined'` or `'exploratory'` |
| `rank_participants` | `boolean` | No | Enable participant ranking (default: false) |
| `is_blind_items` | `boolean` | No | Hide item names (default: false) |
| `items` | `array` | No | Pre-defined items for competition/study mode |

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "mode": "quick",
    "category": "wine",
    "session_name": "Bordeaux Tasting",
    "notes": "Blind tasting of 2020 Bordeaux wines",
    "total_items": 0,
    "completed_items": 0,
    "created_at": "2026-01-15T12:00:00Z",
    "updated_at": "2026-01-15T12:00:00Z"
  },
  "error": null
}
```

**Example:**

```typescript
const response = await fetch('/api/tastings/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    mode: 'quick',
    category: 'wine',
    session_name: 'Evening Tasting'
  })
});

const { data, error } = await response.json();
```

---

### Get Tasting Session

Retrieve a single tasting session by ID.

**Endpoint:** `GET /api/tastings/[id]`

**Authentication:** Required

**Rate Limit:** 100 requests/minute

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "mode": "quick",
    "category": "wine",
    "session_name": "Bordeaux Tasting",
    "total_items": 5,
    "completed_items": 3,
    "average_score": 87.5,
    "created_at": "2026-01-15T12:00:00Z",
    "completed_at": null
  },
  "error": null
}
```

**Errors:**
- `404 TASTING_NOT_FOUND` - Session doesn't exist or user lacks access

---

### Update Tasting Session

Update tasting session details.

**Endpoint:** `PUT /api/tastings/[id]`

**Authentication:** Required

**Rate Limit:** 60 requests/minute

**Request Body:**

```json
{
  "session_name": "Updated Name",
  "notes": "Updated notes",
  "completed_at": "2026-01-15T15:00:00Z"
}
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "session_name": "Updated Name",
    "notes": "Updated notes",
    "updated_at": "2026-01-15T15:00:00Z"
  },
  "error": null
}
```

---

### Delete Tasting Session

Delete a tasting session and all associated items.

**Endpoint:** `DELETE /api/tastings/[id]`

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Response:**

```json
{
  "data": {
    "message": "Tasting session deleted successfully",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "error": null
}
```

---

### List Tasting Items

Get all items in a tasting session.

**Endpoint:** `GET /api/tastings/[id]/items`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `20` | Max items to return |
| `offset` | `number` | `0` | Pagination offset |
| `sort` | `string` | `created_at` | Sort field |
| `order` | `string` | `asc` | Sort order: `asc` or `desc` |

**Response:**

```json
{
  "data": {
    "items": [
      {
        "id": "item-1",
        "tasting_id": "550e8400-e29b-41d4-a716-446655440000",
        "item_name": "Sample A",
        "overall_score": 85,
        "aroma": "Fruity with hints of berry",
        "flavor": "Complex, well-balanced",
        "photo_url": "https://...",
        "created_at": "2026-01-15T12:30:00Z"
      }
    ],
    "total": 5,
    "limit": 20,
    "offset": 0
  },
  "error": null
}
```

---

### Add Tasting Item

Add a new item to a tasting session.

**Endpoint:** `POST /api/tastings/[id]/items`

**Authentication:** Required

**Rate Limit:** 60 requests/minute

**Request Body:**

```json
{
  "item_name": "Sample B",
  "overall_score": 92,
  "aroma": "Floral with citrus notes",
  "flavor": "Bright, acidic, long finish",
  "photo_url": "https://..."
}
```

**Response:**

```json
{
  "data": {
    "id": "item-2",
    "tasting_id": "550e8400-e29b-41d4-a716-446655440000",
    "item_name": "Sample B",
    "overall_score": 92,
    "created_at": "2026-01-15T13:00:00Z"
  },
  "error": null
}
```

---

### Update Tasting Item

Update an existing tasting item.

**Endpoint:** `PUT /api/tastings/[id]/items/[itemId]`

**Authentication:** Required

**Rate Limit:** 60 requests/minute

**Request Body:**

```json
{
  "overall_score": 88,
  "flavor": "Updated tasting notes"
}
```

**Response:**

```json
{
  "data": {
    "id": "item-2",
    "overall_score": 88,
    "flavor": "Updated tasting notes",
    "updated_at": "2026-01-15T13:15:00Z"
  },
  "error": null
}
```

**Note:** Send `null` to clear a field (e.g., `"photo_url": null` to remove photo).

---

### Delete Tasting Item

Delete an item from a tasting session.

**Endpoint:** `DELETE /api/tastings/[id]/items/[itemId]`

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Response:**

```json
{
  "data": {
    "message": "Item deleted successfully",
    "id": "item-2"
  },
  "error": null
}
```

---

## Study Mode Endpoints

### Create Study Session

Create a collaborative study session with custom categories.

**Endpoint:** `POST /api/tastings/study/create`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Coffee Cupping Session",
  "base_category": "coffee",
  "study_approach": "predefined",
  "categories": [
    {
      "name": "Aroma",
      "has_scale": true,
      "scale_max": 10,
      "sort_order": 0
    },
    {
      "name": "Notes",
      "has_text": true,
      "sort_order": 1
    }
  ],
  "items": [
    { "label": "Ethiopia Yirgacheffe" },
    { "label": "Colombia Supremo" }
  ]
}
```

**Response:**

```json
{
  "data": {
    "id": "study-session-1",
    "name": "Coffee Cupping Session",
    "base_category": "coffee",
    "session_code": "ABC123",
    "status": "draft",
    "host_id": "user-id",
    "created_at": "2026-01-15T12:00:00Z"
  },
  "error": null
}
```

---

### Join Study Session

Join a study session using a session code.

**Endpoint:** `POST /api/tastings/study/join`

**Authentication:** Required

**Request Body:**

```json
{
  "session_code": "ABC123",
  "display_name": "John Doe"
}
```

**Response:**

```json
{
  "data": {
    "session_id": "study-session-1",
    "participant_id": "participant-1",
    "role": "participant",
    "display_name": "John Doe"
  },
  "error": null
}
```

---

### Submit Study Response

Submit a response for an item in a study session.

**Endpoint:** `POST /api/tastings/study/[id]/responses`

**Authentication:** Required

**Request Body:**

```json
{
  "item_id": "item-1",
  "category_id": "category-1",
  "scale_value": 8,
  "text_value": "Notes about this sample"
}
```

**Response:**

```json
{
  "data": {
    "id": "response-1",
    "session_id": "study-session-1",
    "item_id": "item-1",
    "participant_id": "participant-1",
    "category_id": "category-1",
    "scale_value": 8,
    "created_at": "2026-01-15T13:00:00Z"
  },
  "error": null
}
```

---

## Flavor Wheel Endpoints

### Generate Flavor Wheel

Generate a flavor wheel from tasting descriptors.

**Endpoint:** `POST /api/flavor-wheels/generate`

**Authentication:** Required

**Rate Limit:** 5 requests/minute

**Request Body:**

```json
{
  "tasting_id": "550e8400-e29b-41d4-a716-446655440000",
  "wheel_type": "combined",
  "scope_type": "tasting"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tasting_id` | `string` | No | Generate wheel for specific tasting |
| `wheel_type` | `string` | Yes | Type: `'aroma'`, `'flavor'`, `'combined'` |
| `scope_type` | `string` | Yes | Scope: `'personal'`, `'tasting'`, `'category'` |
| `descriptor_limit` | `number` | No | Max descriptors (default: 30) |

**Response:**

```json
{
  "data": {
    "id": "wheel-1",
    "user_id": "user-id",
    "wheel_type": "combined",
    "scope_type": "tasting",
    "wheel_data": {
      "categories": [
        {
          "name": "Fruity",
          "descriptors": [
            { "text": "Cherry", "count": 5, "intensity": 0.8 },
            { "text": "Berry", "count": 3, "intensity": 0.6 }
          ]
        }
      ]
    },
    "total_descriptors": 45,
    "unique_descriptors": 23,
    "generated_at": "2026-01-15T14:00:00Z"
  },
  "error": null
}
```

---

### Extract Descriptors (AI)

Extract flavor descriptors from text using AI.

**Endpoint:** `POST /api/flavor-wheels/extract-descriptors`

**Authentication:** Required

**Rate Limit:** 10 requests/minute

**Request Body:**

```json
{
  "text": "Bright citrus notes with hints of jasmine and a long, sweet finish",
  "category": "wine"
}
```

**Response:**

```json
{
  "data": {
    "descriptors": [
      {
        "text": "Citrus",
        "category": "fruity",
        "type": "aroma",
        "confidence": 0.95
      },
      {
        "text": "Jasmine",
        "category": "floral",
        "type": "aroma",
        "confidence": 0.88
      },
      {
        "text": "Sweet",
        "category": "taste",
        "type": "flavor",
        "confidence": 0.92
      }
    ],
    "extraction_method": "ai",
    "tokens_used": 150
  },
  "error": null
}
```

---

## Social Endpoints

### Follow User

Follow another user.

**Endpoint:** `POST /api/social/follows`

**Authentication:** Required

**Rate Limit:** 30 requests/minute

**Request Body:**

```json
{
  "following_id": "user-to-follow-id"
}
```

**Response:**

```json
{
  "data": {
    "id": "follow-1",
    "follower_id": "current-user-id",
    "following_id": "user-to-follow-id",
    "created_at": "2026-01-15T15:00:00Z"
  },
  "error": null
}
```

---

### Unfollow User

Unfollow a user.

**Endpoint:** `DELETE /api/social/follows`

**Authentication:** Required

**Request Body:**

```json
{
  "following_id": "user-to-unfollow-id"
}
```

**Response:**

```json
{
  "data": {
    "message": "Unfollowed successfully"
  },
  "error": null
}
```

---

### Like Tasting

Like a tasting session.

**Endpoint:** `POST /api/social/likes`

**Authentication:** Required

**Rate Limit:** 30 requests/minute

**Request Body:**

```json
{
  "tasting_id": "tasting-id"
}
```

**Response:**

```json
{
  "data": {
    "id": "like-1",
    "user_id": "current-user-id",
    "tasting_id": "tasting-id",
    "created_at": "2026-01-15T15:00:00Z"
  },
  "error": null
}
```

---

### Comment on Tasting

Add a comment to a tasting session.

**Endpoint:** `POST /api/social/comments`

**Authentication:** Required

**Rate Limit:** 30 requests/minute

**Request Body:**

```json
{
  "tasting_id": "tasting-id",
  "content": "Great tasting! Really enjoyed the Bordeaux."
}
```

**Response:**

```json
{
  "data": {
    "id": "comment-1",
    "user_id": "current-user-id",
    "tasting_id": "tasting-id",
    "content": "Great tasting! Really enjoyed the Bordeaux.",
    "created_at": "2026-01-15T15:30:00Z"
  },
  "error": null
}
```

---

## Admin Endpoints

### Get AI Usage Stats

Get AI extraction usage statistics (admin only).

**Endpoint:** `GET /api/admin/ai-usage-stats`

**Authentication:** Required (admin role)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | `string` | ISO date (e.g., '2026-01-01') |
| `end_date` | `string` | ISO date |
| `user_id` | `string` | Filter by user |

**Response:**

```json
{
  "data": {
    "total_extractions": 1250,
    "total_tokens_used": 125000,
    "average_tokens_per_extraction": 100,
    "extraction_by_method": {
      "ai": 1000,
      "regex": 250
    },
    "top_users": [
      {
        "user_id": "user-1",
        "count": 150,
        "tokens": 15000
      }
    ]
  },
  "error": null
}
```

---

### Get Extraction Stats

Get detailed extraction statistics.

**Endpoint:** `GET /api/admin/extraction-stats`

**Authentication:** Required (admin role)

**Response:**

```json
{
  "data": {
    "total_extractions": 1250,
    "success_rate": 0.96,
    "average_descriptors_per_extraction": 5.2,
    "top_categories": [
      { "name": "fruity", "count": 450 },
      { "name": "floral", "count": 320 }
    ],
    "extraction_trends": [
      { "date": "2026-01-15", "count": 45 }
    ]
  },
  "error": null
}
```

---

## Webhooks

Flavatix can send webhook events for real-time updates.

### Configuring Webhooks

Webhooks are configured per user in settings:

```json
{
  "url": "https://your-app.com/webhooks/flavatix",
  "events": ["tasting.completed", "item.added"],
  "secret": "webhook-secret-key"
}
```

---

### Webhook Payload

All webhook events follow this format:

```json
{
  "event": "tasting.completed",
  "timestamp": "2026-01-15T16:00:00Z",
  "user_id": "user-id",
  "data": {
    "tasting_id": "tasting-id",
    "session_name": "Wine Tasting",
    "total_items": 5,
    "average_score": 87.5
  }
}
```

---

### Webhook Signature Verification

Verify webhook authenticity using HMAC SHA256:

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

### Supported Webhook Events

| Event | Description |
|-------|-------------|
| `tasting.created` | New tasting session created |
| `tasting.updated` | Tasting session updated |
| `tasting.completed` | Tasting marked as complete |
| `tasting.deleted` | Tasting session deleted |
| `item.added` | Item added to tasting |
| `item.updated` | Item updated |
| `item.deleted` | Item deleted |
| `flavor_wheel.generated` | Flavor wheel generated |
| `user.followed` | User followed |
| `comment.added` | Comment added |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create tasting
async function createTasting() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/tastings/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      mode: 'quick',
      category: 'wine',
      session_name: 'Evening Tasting'
    })
  });

  return await response.json();
}

// List tastings with pagination
async function listTastings(page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('quick_tastings')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
}

// Real-time subscription
function subscribeTasting(tastingId: string) {
  const channel = supabase
    .channel(`tasting:${tastingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'quick_tasting_items',
        filter: `tasting_id=eq.${tastingId}`
      },
      (payload) => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
}
```

---

### Python

```python
import requests
from typing import Dict, Any

class FlavatixAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }

    def create_tasting(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/api/tastings/create',
            headers=self.headers,
            json=data
        )
        return response.json()

    def get_tasting(self, tasting_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/api/tastings/{tasting_id}',
            headers=self.headers
        )
        return response.json()

    def add_item(self, tasting_id: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/api/tastings/{tasting_id}/items',
            headers=self.headers,
            json=item_data
        )
        return response.json()

# Usage
api = FlavatixAPI('https://your-domain.com', 'your-token')
tasting = api.create_tasting({
    'mode': 'quick',
    'category': 'wine',
    'session_name': 'Python Test'
})
```

---

### cURL

```bash
# Create tasting
curl -X POST https://your-domain.com/api/tastings/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mode": "quick",
    "category": "wine",
    "session_name": "cURL Test"
  }'

# Get tasting
curl https://your-domain.com/api/tastings/TASTING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add item
curl -X POST https://your-domain.com/api/tastings/TASTING_ID/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "item_name": "Sample A",
    "overall_score": 85,
    "aroma": "Fruity"
  }'
```

---

## Best Practices

### 1. Error Handling

Always check for errors in the response:

```typescript
const { data, error } = await createTasting();

if (error) {
  console.error('Error:', error.message);
  // Handle specific error codes
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
  }
  return;
}

// Process data
console.log('Tasting created:', data.id);
```

---

### 2. Pagination

Use pagination for large result sets:

```typescript
async function getAllTastings() {
  const tastings = [];
  let page = 0;
  const limit = 20;

  while (true) {
    const { data, error } = await listTastings(page, limit);
    if (error || !data.length) break;

    tastings.push(...data);
    page++;
  }

  return tastings;
}
```

---

### 3. Debouncing Updates

Debounce frequent updates to avoid rate limits:

```typescript
import { debounce } from 'lodash';

const updateItem = debounce(async (itemId, updates) => {
  await fetch(`/api/tastings/TASTING_ID/items/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
}, 300);

// Usage: Slider updates
<input
  type="range"
  onChange={(e) => updateItem(itemId, { score: e.target.value })}
/>
```

---

### 4. Optimistic Updates

Update UI immediately, revert on error:

```typescript
function optimisticUpdate(itemId, updates) {
  // Update UI immediately
  setItems(items.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  ));

  // Send to server
  updateItem(itemId, updates).catch((error) => {
    // Revert on error
    setItems(originalItems);
    toast.error('Update failed');
  });
}
```

---

## Changelog

### v1.0.0 (January 2026)
- Initial API release
- Tasting CRUD endpoints
- Study mode support
- Flavor wheel generation
- Social features (follows, likes, comments)
- Real-time subscriptions
- Admin analytics endpoints

---

**Last Updated:** January 2026
**API Version:** 1.0
**Maintainer:** Development Team

# API Versioning Strategy

This document outlines Flavatix's approach to API versioning, backward compatibility, and deprecation policies.

## Table of Contents

1. [Versioning Approach](#versioning-approach)
2. [Version Format](#version-format)
3. [Breaking vs Non-Breaking Changes](#breaking-vs-non-breaking-changes)
4. [Deprecation Policy](#deprecation-policy)
5. [Implementation Plan](#implementation-plan)
6. [Migration Guide](#migration-guide)

---

## Versioning Approach

### Current State (v1 - Implicit)

Currently, all API endpoints are at version 1 (implicit):

```
/api/tastings/create
/api/flavor-wheels/generate
```

### Future State (Explicit Versioning)

When breaking changes are needed, introduce explicit versioning:

```
/api/v1/tastings/create  (stable, maintained)
/api/v2/tastings/create  (new version with breaking changes)
```

### Versioning Strategy: URL Path Versioning

We use **URL path versioning** because it is:

- **Explicit**: Version is immediately visible in the URL
- **Cache-friendly**: Different URLs for different versions
- **Simple**: No header inspection required
- **Documentation-friendly**: Easy to document and understand
- **Tooling-friendly**: Works with all HTTP clients

**Rejected Alternatives:**
- ❌ **Header versioning** (Accept: application/vnd.flavatix.v2+json) - harder to test, poor caching
- ❌ **Query parameter** (?version=2) - easily forgotten, poor semantics
- ❌ **Hostname** (v2.api.flavatix.com) - infrastructure complexity

---

## Version Format

### Semantic Versioning (Major Only)

We use **major version numbers only** for API versioning:

- `v1` - Initial stable API
- `v2` - Breaking changes from v1
- `v3` - Breaking changes from v2

**Rationale:**
- Minor/patch versions are not needed for REST APIs
- Backward-compatible changes don't require version bumps
- Keeps versioning simple and clear

### Version in URL

```
/api/v{major}/endpoint
```

**Examples:**
```
GET /api/v1/tastings
POST /api/v2/tastings/create
GET /api/v1/flavor-wheels/generate
```

### Default Version

When no version is specified, default to the latest stable version:

```
/api/tastings  →  /api/v1/tastings (redirected or aliased)
```

**Benefits:**
- Existing integrations continue to work
- New integrations get latest version by default
- Can be changed when v2 becomes stable

---

## Breaking vs Non-Breaking Changes

### Non-Breaking Changes (No version bump needed)

These changes can be made **without** incrementing the API version:

#### ✅ Adding New Endpoints

```typescript
// Safe: New endpoint
POST /api/v1/tastings/share
```

#### ✅ Adding Optional Fields

```typescript
// v1: Original
{
  "category": "coffee",
  "mode": "quick"
}

// v1: With new optional field (safe)
{
  "category": "coffee",
  "mode": "quick",
  "visibility": "public"  // NEW: optional, has default
}
```

#### ✅ Adding Fields to Responses

```typescript
// v1: Original response
{
  "id": "123",
  "category": "coffee"
}

// v1: Enhanced response (safe)
{
  "id": "123",
  "category": "coffee",
  "created_at": "2025-01-01T00:00:00Z"  // NEW: additional data
}
```

#### ✅ Adding New Error Codes

```typescript
// Safe: New error code
{
  "success": false,
  "error": {
    "code": "DUPLICATE_TASTING",  // NEW
    "message": "A tasting with this name already exists"
  }
}
```

#### ✅ Relaxing Validation

```typescript
// v1: Strict validation
category: z.string().min(1).max(50)

// v1: Relaxed validation (safe)
category: z.string().min(1).max(100)  // Increased max length
```

#### ✅ Adding New HTTP Methods

```typescript
// v1: Only GET
GET /api/v1/tastings/:id

// v1: Added HEAD (safe)
HEAD /api/v1/tastings/:id
GET /api/v1/tastings/:id
```

### Breaking Changes (Requires version bump)

These changes **require** a new API version:

#### ❌ Removing Fields

```typescript
// v1
{
  "category": "coffee",
  "deprecated_field": "value"
}

// v2 (breaking)
{
  "category": "coffee"
  // deprecated_field removed
}
```

#### ❌ Renaming Fields

```typescript
// v1
{ "session_name": "Morning Tasting" }

// v2 (breaking)
{ "name": "Morning Tasting" }  // Renamed
```

#### ❌ Changing Field Types

```typescript
// v1
{ "score": "8.5" }  // string

// v2 (breaking)
{ "score": 8.5 }  // number
```

#### ❌ Making Optional Fields Required

```typescript
// v1
notes: z.string().optional()

// v2 (breaking)
notes: z.string().min(1)  // Now required
```

#### ❌ Changing Response Structure

```typescript
// v1
{
  "tastings": [...]
}

// v2 (breaking)
{
  "data": {
    "tastings": [...]
  },
  "pagination": {...}
}
```

#### ❌ Removing HTTP Methods

```typescript
// v1
POST /api/v1/tastings
PUT /api/v1/tastings/:id

// v2 (breaking)
POST /api/v2/tastings
PATCH /api/v2/tastings/:id  // PUT removed
```

#### ❌ Changing Status Codes

```typescript
// v1
POST /api/v1/tastings → 200 OK

// v2 (breaking)
POST /api/v2/tastings → 201 Created
```

#### ❌ Changing Error Response Format

```typescript
// v1
{ "error": "Invalid input" }

// v2 (breaking)
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid input"
  }
}
```

---

## Deprecation Policy

### Deprecation Timeline

| Phase | Duration | Client Action | API Status |
|-------|----------|---------------|------------|
| **Announcement** | 0-3 months | Plan migration | Both versions active |
| **Migration** | 3-9 months | Migrate to new version | Both versions active |
| **Final Warning** | 9-12 months | Complete migration | Old version marked deprecated |
| **Sunset** | 12+ months | Must use new version | Old version removed |

### Minimum Support Period

- **Major versions**: Supported for at least 12 months after deprecation announcement
- **Security updates**: Critical security fixes backported for 6 months after sunset
- **New features**: Only added to latest version

### Deprecation Process

#### 1. Announcement (Month 0)

- Announce deprecation in:
  - API changelog
  - Developer documentation
  - Email to registered developers
  - Response headers (see below)
- Provide migration guide
- Set sunset date (12 months minimum)

#### 2. Deprecation Headers (Month 0+)

Add headers to deprecated endpoints:

```http
Deprecation: true
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Link: <https://docs.flavatix.com/api/v2/migration>; rel="deprecation"
```

#### 3. Warning Logs (Month 6+)

Log warnings for deprecated endpoint usage:

```typescript
logger.warn('API', 'Deprecated endpoint called', {
  endpoint: req.url,
  version: 'v1',
  sunsetDate: '2025-12-31',
  userId: context.user?.id,
});
```

#### 4. Sunset Notice (Month 9+)

Add sunset warning to responses:

```json
{
  "success": true,
  "data": {...},
  "_deprecated": {
    "message": "This endpoint will be removed on 2025-12-31. Please migrate to /api/v2/tastings.",
    "sunset": "2025-12-31T23:59:59Z",
    "migration_guide": "https://docs.flavatix.com/api/v2/migration"
  }
}
```

#### 5. Removal (Month 12+)

- Remove deprecated version
- Return 410 Gone for removed endpoints:

```http
HTTP/1.1 410 Gone
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "ENDPOINT_REMOVED",
    "message": "This endpoint was removed on 2025-12-31. Please use /api/v2/tastings instead.",
    "migration_guide": "https://docs.flavatix.com/api/v2/migration"
  }
}
```

---

## Implementation Plan

### Phase 1: Preparation (Current)

**Goal:** Establish infrastructure for versioning

1. ✅ **Standardize middleware** across all endpoints
2. ✅ **Document current API** as v1 (implicit)
3. ✅ **Create versioning strategy** (this document)
4. 🔄 **Add version tracking** to monitoring

**Deliverables:**
- Middleware standardization complete
- API documentation published
- Versioning strategy approved

### Phase 2: V1 Stabilization (Next 3-6 months)

**Goal:** Prepare v1 for long-term support

1. 🔄 **Freeze v1 API contract**
   - No breaking changes to existing endpoints
   - Document all endpoint behaviors
   - Create comprehensive test suite

2. 🔄 **Create OpenAPI specification**
   - Generate from endpoint definitions
   - Publish interactive docs
   - Enable client SDK generation

3. 🔄 **Add deprecation infrastructure**
   - Deprecation header middleware
   - Sunset date tracking
   - Migration guide templates

**Deliverables:**
- V1 API contract frozen
- OpenAPI spec published
- Deprecation tooling ready

### Phase 3: V2 Planning (When needed)

**Goal:** Plan and design v2 breaking changes

1. **Gather breaking change requirements**
   - User feedback
   - Technical debt
   - Feature requests

2. **Design v2 improvements**
   - Enhanced data models
   - Better error handling
   - Performance optimizations

3. **Create migration guide**
   - Field mapping
   - Code examples
   - Migration scripts

**Deliverables:**
- V2 design document
- Migration guide
- V2 implementation plan

### Phase 4: V2 Implementation (Future)

**Goal:** Ship v2 while maintaining v1

1. **Implement v2 endpoints**
   ```
   /api/v2/tastings/create
   /api/v2/flavor-wheels/generate
   ```

2. **Deprecate v1 endpoints**
   - Add deprecation headers
   - Send developer notifications
   - Monitor migration progress

3. **Support both versions**
   - Maintain v1 for 12 months
   - Backport critical fixes
   - Track version usage

**Deliverables:**
- V2 endpoints shipped
- V1 deprecation announced
- Both versions stable

### Phase 5: V1 Sunset (12+ months after v2)

**Goal:** Complete migration to v2

1. **Final migration push**
   - Email remaining v1 users
   - Provide migration support
   - Offer grace period

2. **Remove v1 endpoints**
   - Return 410 Gone
   - Redirect to migration guide
   - Monitor error rates

3. **Archive v1 documentation**
   - Mark as archived
   - Keep for historical reference
   - Update all docs to v2

**Deliverables:**
- V1 endpoints removed
- All users migrated to v2
- V2 is now stable baseline

---

## Migration Guide Template

### Example: Migrating from v1 to v2

#### Breaking Changes

##### 1. Response Format Change

**v1:**
```json
{
  "tastings": [
    {"id": "123", "name": "Morning Tasting"}
  ]
}
```

**v2:**
```json
{
  "success": true,
  "data": {
    "tastings": [
      {"id": "123", "name": "Morning Tasting"}
    ]
  },
  "meta": {
    "total": 1,
    "page": 1
  }
}
```

**Migration:**
```typescript
// v1 client
const tastings = response.tastings;

// v2 client
const tastings = response.data.tastings;
```

##### 2. Field Rename

**v1:**
```json
{
  "session_name": "Morning Tasting"
}
```

**v2:**
```json
{
  "name": "Morning Tasting"
}
```

**Migration:**
```typescript
// v1 client
const name = tasting.session_name;

// v2 client
const name = tasting.name;
```

##### 3. HTTP Method Change

**v1:**
```typescript
PUT /api/v1/tastings/:id
```

**v2:**
```typescript
PATCH /api/v2/tastings/:id
```

**Migration:**
```typescript
// v1 client
fetch('/api/v1/tastings/123', {
  method: 'PUT',
  body: JSON.stringify(updates)
});

// v2 client
fetch('/api/v2/tastings/123', {
  method: 'PATCH',
  body: JSON.stringify(updates)
});
```

---

## Best Practices

### For API Designers

1. **Be Conservative**: Avoid breaking changes when possible
2. **Plan Ahead**: Design with extensibility in mind
3. **Communicate Early**: Announce changes well in advance
4. **Support Legacy**: Maintain old versions during transition
5. **Monitor Usage**: Track API version adoption

### For API Consumers

1. **Pin Versions**: Always use explicit version (e.g., `/api/v1/...`)
2. **Monitor Headers**: Watch for deprecation warnings
3. **Update Proactively**: Don't wait for sunset deadline
4. **Test Thoroughly**: Validate migrations in staging
5. **Read Changelog**: Stay informed of upcoming changes

### For Both

1. **Document Everything**: Clear, comprehensive docs
2. **Provide Examples**: Show migration paths
3. **Offer Support**: Help users during transitions
4. **Be Patient**: Allow sufficient migration time
5. **Learn from Changes**: Improve future versions

---

## Version History

| Version | Release Date | Status | Sunset Date | Notes |
|---------|--------------|--------|-------------|-------|
| v1 (implicit) | 2024-01-01 | Stable | TBD | Current version |
| v2 | TBD | Planned | N/A | Breaking changes TBD |

---

## Related Documentation

- [API Design Patterns](./api-design-patterns.md) - Middleware and patterns
- [OpenAPI Specification](./openapi.yaml) - Full API reference
- [Changelog](./CHANGELOG.md) - Version history and changes
- [Migration Guides](./migrations/) - Version migration guides

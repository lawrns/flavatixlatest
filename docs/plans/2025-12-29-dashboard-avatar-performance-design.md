# Dashboard, Avatar & Performance Improvements Design

**Date:** 2025-12-29
**Status:** Approved

## Overview

This design addresses three major issues identified through comprehensive codebase analysis:
1. Redundant profile information on dashboard
2. Avatar upload rejecting valid images instead of auto-resizing
3. Performance problems causing slow app experience

---

## Part 1: Dashboard Simplification

### Current State
The dashboard shows redundant information:
- Header with "Dashboard" title and avatar menu
- "Welcome back, [Name]" section with quick presets
- Full profile card with same name, avatar, stats, member info, email verification

User sees their name 3 times and avatar 2 times.

### Target State
Single compact header replacing welcome section and profile card:

```
+-----------------------------------------------------+
|  [Avatar]  Welcome back, Juan                       |
|            @juan | 3 tastings | Oct 2025            |
|                                                     |
|  [Whisky] [Coffee] [Mezcal]  <- Quick presets       |
+-----------------------------------------------------+
```

### Changes Required

**Remove from dashboard.tsx:**
- Lines 139-147: Separate welcome header section
- Lines 168-299: Full profile card component
- Lines 380-396: Duplicate stats card

**Add to dashboard.tsx:**
- Unified DashboardHeader component with:
  - Avatar (40px)
  - Welcome message with name
  - Compact stats line: @username | X tastings | Member since Month Year
  - Quick presets row (moved into header area)

**Move to Settings/Profile pages:**
- Email verification status
- "Last tasting" date
- Followers/Following counts (keep in profile page only)
- Full bio display

### Files to Modify
- `pages/dashboard.tsx` - Main restructure
- `components/dashboard/DashboardHeader.tsx` - New component (optional extraction)

---

## Part 2: Avatar Upload Auto-Resize

### Current State
- Avatar upload validates dimensions and **rejects** images > 2048x2048
- `compressImage()` method exists in avatarService.ts but is **never called**
- Users must manually resize images before uploading
- Error message: "Image dimensions must be 2048x2048 pixels or smaller"

### Target State
- Any image accepted (within 5MB limit)
- Automatic resize to 400x400 pixels before upload
- Compression applied for optimal file size
- No dimension-related error messages

### Changes Required

**avatarService.ts:**

1. Modify `uploadAvatar()` method:
```typescript
static async uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
  // Validate file type and size (keep existing)
  const fileValidation = this.validateFile(file);
  if (!fileValidation.isValid) {
    return { success: false, error: fileValidation.error };
  }

  // NEW: Auto-resize instead of rejecting
  const processedFile = await this.compressImage(file, 400, 0.85);

  // Continue with upload using processedFile instead of file
  // ... rest of upload logic
}
```

2. Remove dimension validation call:
```typescript
// DELETE these lines (111-119):
const dimensionValidation = await this.validateImageDimensions(file);
if (!dimensionValidation.isValid) {
  return { success: false, error: dimensionValidation.error };
}
```

3. Keep `validateImageDimensions()` method for potential future use but don't call it in upload flow.

**AvatarUpload.tsx:**

Update guidelines text (lines 289-294):
```typescript
<div className="text-caption font-body text-gray-500 dark:text-zinc-400 space-y-xs">
  <p>* Images automatically resized to 400x400 pixels</p>
  <p>* Supported formats: JPEG, PNG, WebP</p>
  <p>* Maximum file size: 5MB</p>
</div>
```

### Files to Modify
- `lib/avatarService.ts` - Add auto-resize, remove dimension rejection
- `components/AvatarUpload.tsx` - Update help text

---

## Part 3: Performance Optimizations

### Issues & Solutions

#### 3.1 Remove Disabled Optimization (Priority 1)

**File:** `next.config.js`
**Issue:** `experimental: { disableOptimizedLoading: true }` disables Next.js optimization
**Fix:** Remove this line

#### 3.2 Memoize Auth Context Values (Priority 1)

**Files:** `contexts/SimpleAuthContext.tsx`, `contexts/AuthContext.tsx`
**Issue:** Context value object recreated every render, causing cascading re-renders
**Fix:** Wrap context value in `useMemo`:

```typescript
const contextValue = useMemo(() => ({
  user,
  loading,
  signIn,
  signOut,
  // ... other values
}), [user, loading]);

return (
  <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
);
```

#### 3.3 Lazy Load D3 (Priority 1)

**File:** `components/flavor-wheels/FlavorWheelVisualization.tsx`
**Issue:** D3 (~80KB) imported statically, loaded even when not viewing flavor wheels
**Fix:** Use dynamic import:

```typescript
// Before
import * as d3 from 'd3';

// After
import dynamic from 'next/dynamic';

const FlavorWheelVisualization = dynamic(
  () => import('./FlavorWheelVisualizationInner'),
  {
    loading: () => <FlavorWheelSkeleton />,
    ssr: false
  }
);
```

#### 3.4 Fix N+1 Social Feed Queries (Priority 2)

**File:** `hooks/useSocialFeed.ts`
**Issue:** For 5 posts, makes 25+ API calls (5 posts x 5 queries each: likes, comments, shares, items, user check)
**Fix:** Batch into single query with Supabase aggregation:

```typescript
// Before: N+1 pattern
for (const tasting of tastings) {
  const likes = await getLikesCount(tasting.id);
  const comments = await getCommentsCount(tasting.id);
  // ...
}

// After: Single query with counts
const { data } = await supabase
  .from('quick_tastings')
  .select(`
    *,
    likes:social_likes(count),
    comments:social_comments(count),
    items:quick_tasting_items(id, photo_url)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5);
```

#### 3.5 Dynamic Import Heavy Components (Priority 3)

**Files to lazy load:**
- `components/quick-tasting/QuickTastingSession.tsx` (986KB)
- `components/flavor-wheels/FlavorWheel.tsx` (173KB)
- Export functionality (html2canvas, jspdf)

```typescript
// In pages that use these components
const QuickTastingSession = dynamic(
  () => import('@/components/quick-tasting/QuickTastingSession'),
  { loading: () => <SessionSkeleton /> }
);
```

### Implementation Order

| Step | Task | Time | Impact |
|------|------|------|--------|
| 1 | Remove disableOptimizedLoading | 5 min | Immediate |
| 2 | Memoize auth context values | 15 min | Stops re-renders |
| 3 | Lazy load D3 | 30 min | -80KB initial |
| 4 | Fix N+1 social feed | 1 hr | -20 API calls |
| 5 | Dynamic import heavy components | 2 hr | Smaller bundles |

---

## Summary of All File Changes

| File | Changes |
|------|---------|
| `pages/dashboard.tsx` | Remove profile card, create unified header |
| `lib/avatarService.ts` | Auto-resize images, remove dimension rejection |
| `components/AvatarUpload.tsx` | Update help text |
| `next.config.js` | Remove disableOptimizedLoading |
| `contexts/SimpleAuthContext.tsx` | Add useMemo to context value |
| `contexts/AuthContext.tsx` | Add useMemo to context value |
| `components/flavor-wheels/FlavorWheelVisualization.tsx` | Dynamic import D3 |
| `hooks/useSocialFeed.ts` | Batch queries |
| `pages/quick-tasting.tsx` | Dynamic import QuickTastingSession |

---

## Acceptance Criteria

- [ ] Dashboard shows single compact header, no duplicate profile info
- [ ] Avatar upload accepts any image size and auto-resizes to 400x400
- [ ] No "dimensions must be 2048x2048" error messages
- [ ] Lighthouse performance score improvement (measure before/after)
- [ ] Social feed loads with fewer than 10 API calls for 5 posts
- [ ] D3 only loads when viewing flavor wheels page

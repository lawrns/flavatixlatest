# Flavatix Evaluation Fixes - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all bugs, UI/UX issues, copy problems, and functionality gaps from the evaluation report.

**Architecture:** Incremental fixes organized by priority - critical bugs first, then UI/UX, copy, and functionality. Each task is self-contained and testable.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Supabase, next-i18next (for i18n)

---

## Phase 1: Critical Bug Fixes

### Task 1: Fix Score Display Format (Dashboard)

**Files:**
- Modify: `pages/dashboard.tsx:346`

**Step 1: Fix the score denominator**

Change line 346 from `/5` to `/100`:

```tsx
// Before (line 346)
{tasting.average_score.toFixed(1)}/5

// After
{tasting.average_score.toFixed(1)}/100
```

**Step 2: Verify the fix**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add pages/dashboard.tsx
git commit -m "fix: change score display from /5 to /100 on dashboard"
```

---

### Task 2: Fix Score Display Format (Other Locations)

**Files:**
- Modify: `components/quick-tasting/FlavorWheel.tsx:91,523`
- Modify: `components/history/TastingHistoryDetail.tsx:79`

**Step 1: Fix FlavorWheel.tsx scores**

Search for `/5` in the file and change to `/100`.

**Step 2: Fix TastingHistoryDetail.tsx**

Line 79 - change `/5` to `/100`.

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/quick-tasting/FlavorWheel.tsx components/history/TastingHistoryDetail.tsx
git commit -m "fix: standardize all score displays to /100 format"
```

---

### Task 3: Fix Dashboard Navigation Bug

**Files:**
- Modify: `pages/dashboard.tsx:328`

**Step 1: Identify the issue**

Current code navigates to `/history` for all tasting clicks:
```tsx
onClick={() => router.push(`/history`)}
```

Should navigate to specific tasting detail.

**Step 2: Fix the navigation**

```tsx
// Before (line 328)
onClick={() => router.push(`/history`)}

// After - navigate to tasting detail page
onClick={() => router.push(`/tasting/${tasting.id}`)}
```

**Step 3: Verify the fix**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add pages/dashboard.tsx
git commit -m "fix: dashboard tasting card now navigates to tasting detail"
```

---

### Task 4: Fix Descriptor Count Grammar

**Files:**
- Modify: `components/flavor-wheels/FlavorWheelListView.tsx:269,326`

**Step 1: Create pluralization helper (inline)**

At line 269, change:
```tsx
// Before
{category.count} descriptors ({category.percentage.toFixed(1)}%)

// After
{category.count} {category.count === 1 ? 'descriptor' : 'descriptors'} ({category.percentage.toFixed(1)}%)
```

**Step 2: Fix line 326**

```tsx
// Before
{subcategory.count} descriptors

// After
{subcategory.count} {subcategory.count === 1 ? 'descriptor' : 'descriptors'}
```

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/flavor-wheels/FlavorWheelListView.tsx
git commit -m "fix: use correct singular/plural for descriptor counts"
```

---

### Task 5: Fix Average Score Calculation

**Files:**
- Modify: `pages/dashboard.tsx` (stats calculation section)
- Modify: `lib/historyService.ts` or wherever stats are calculated

**Step 1: Investigate the calculation**

Read the stats calculation logic to understand why it shows 0.0.

**Step 2: Fix the calculation**

Ensure that:
1. Valid scores are included in the average
2. Division by zero is handled
3. Null/undefined scores are excluded

**Step 3: Add untouched slider exclusion logic**

Track which sliders were interacted with and exclude untouched ones from average.

**Step 4: Test and commit**

```bash
git add pages/dashboard.tsx lib/historyService.ts
git commit -m "fix: correct average score calculation, exclude untouched sliders"
```

---

## Phase 2: UI/UX Improvements

### Task 6: Add Pagination to My Tastings

**Files:**
- Modify: `pages/my-tastings.tsx`

**Step 1: Add pagination state**

```tsx
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 20;
```

**Step 2: Modify loadTastings to use pagination**

```tsx
const { data, error } = await getUserTastingHistory(
  user.id,
  {},
  ITEMS_PER_PAGE,
  (page - 1) * ITEMS_PER_PAGE
);
```

**Step 3: Add pagination controls UI**

Add Previous/Next buttons at the bottom of the list.

**Step 4: Commit**

```bash
git add pages/my-tastings.tsx
git commit -m "feat: add pagination to My Tastings (20 items per page)"
```

---

### Task 7: Fix Profile Picture Consistency

**Files:**
- Modify: `components/navigation/UserAvatarMenu.tsx`
- Modify: `pages/dashboard.tsx`
- Modify: `components/profile/ProfileEditForm.tsx`

**Step 1: Ensure all locations use AvatarWithFallback**

Verify all 3 locations fetch and display the same profile picture source.

**Step 2: Fix any inconsistencies**

Ensure `user.user_metadata?.avatar_url` or profile picture from database is used consistently.

**Step 3: Commit**

```bash
git add components/navigation/UserAvatarMenu.tsx pages/dashboard.tsx components/profile/ProfileEditForm.tsx
git commit -m "fix: ensure profile picture displays consistently across app"
```

---

### Task 8: Fix Truncated Tags in Flavor Wheels

**Files:**
- Modify: `pages/flavor-wheels.tsx:496-505`
- Modify: `components/ui/FlavorPill.tsx` (if needed)

**Step 1: Add deduplication before display**

```tsx
const uniqueTopNotes = [...new Set(wheelData.topNotes)];
```

**Step 2: Fix truncation - show full text or proper ellipsis**

Either remove max-width constraints or add `title` attribute for tooltip.

**Step 3: Commit**

```bash
git add pages/flavor-wheels.tsx components/ui/FlavorPill.tsx
git commit -m "fix: deduplicate and properly display flavor wheel tags"
```

---

### Task 9: Add Empty States for Followers/Following

**Files:**
- Modify: `pages/dashboard.tsx` (follower stats section)
- Modify: `components/profile/ProfileDisplay.tsx`

**Step 1: Add empty state when followers/following is 0**

```tsx
{followersCount === 0 ? (
  <div className="text-center py-4">
    <p className="text-zinc-500 mb-2">No followers yet</p>
    <button className="text-primary text-sm">Find tasters to follow</button>
  </div>
) : (
  // existing followers list
)}
```

**Step 2: Commit**

```bash
git add pages/dashboard.tsx components/profile/ProfileDisplay.tsx
git commit -m "feat: add helpful empty states for followers/following"
```

---

### Task 10: Track Slider Interactions

**Files:**
- Modify: `components/review/CharacteristicSlider.tsx`
- Modify: Parent components that use the slider

**Step 1: Add touched state to slider**

```tsx
interface CharacteristicSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onTouch?: () => void;  // NEW
  touched?: boolean;     // NEW
  description?: string;
  min?: number;
  max?: number;
}
```

**Step 2: Fire onTouch on first interaction**

```tsx
<input
  type="range"
  onMouseDown={() => onTouch?.()}
  onTouchStart={() => onTouch?.()}
  // ... rest
/>
```

**Step 3: Update parent components to track touched state**

**Step 4: Commit**

```bash
git add components/review/CharacteristicSlider.tsx
git commit -m "feat: track slider interactions for accurate score averaging"
```

---

## Phase 3: Copy Improvements

### Task 11: Replace "Pivotal" with "Comprehensive"

**Files:**
- Modify: `pages/index.tsx:47`
- Modify: `pages/_app.tsx:54` (meta description)

**Step 1: Fix index.tsx line 47**

```tsx
// Before
The world's most pivotal tasting app for anything with flavor or aroma.

// After
The world's most comprehensive tasting app for anything with flavor or aroma.
```

**Step 2: Fix _app.tsx meta description**

Same change in meta description.

**Step 3: Commit**

```bash
git add pages/index.tsx pages/_app.tsx
git commit -m "copy: replace 'pivotal' with 'comprehensive' in tagline"
```

---

### Task 12: Rename "Danger Zone" to "Delete Account"

**Files:**
- Modify: `pages/settings.tsx:151`

**Step 1: Change section title**

```tsx
// Before
title: 'Danger Zone',

// After
title: 'Delete Account',
```

**Step 2: Commit**

```bash
git add pages/settings.tsx
git commit -m "copy: rename 'Danger Zone' to 'Delete Account' section"
```

---

## Phase 4: Functionality Improvements

### Task 13: Make Quick Presets Customizable

**Files:**
- Modify: `pages/dashboard.tsx:142-170`
- Modify: `pages/settings.tsx` (add preferences)
- Create: `lib/presetService.ts`

**Step 1: Create preset service**

```tsx
// lib/presetService.ts
export const DEFAULT_PRESETS = ['whiskey', 'coffee', 'mezcal'];

export async function getUserPresets(userId: string): Promise<string[]> {
  // Fetch from user preferences or return defaults
}

export async function saveUserPresets(userId: string, presets: string[]): Promise<void> {
  // Save to user preferences
}
```

**Step 2: Update dashboard to use dynamic presets**

**Step 3: Add preset configuration to settings page**

**Step 4: Commit**

```bash
git add pages/dashboard.tsx pages/settings.tsx lib/presetService.ts
git commit -m "feat: make quick tasting presets user-configurable"
```

---

### Task 14: Auto-Regenerate Flavor Wheels When Stale

**Files:**
- Modify: `pages/flavor-wheels.tsx:145-190`

**Step 1: Add staleness check**

Compare `wheelData.generatedAt` with latest tasting timestamp.

**Step 2: Auto-regenerate on load if stale**

```tsx
useEffect(() => {
  if (wheelData && isStale(wheelData)) {
    loadWheel(selectedCategory, true); // force regenerate
  }
}, [wheelData]);
```

**Step 3: Remove manual cache warning UI (or keep as info)**

**Step 4: Commit**

```bash
git add pages/flavor-wheels.tsx
git commit -m "feat: auto-regenerate flavor wheels when data is stale"
```

---

### Task 15: Fix Notification Bell (Remove or Implement)

**Files:**
- Modify: `components/notifications/NotificationSystem.tsx`
- OR Remove from: `pages/dashboard.tsx:119`, `pages/settings.tsx:173`, `components/layout/PageLayout.tsx:127`

**Step 1: Decision - implement or remove**

If implementing: Add dropdown with notifications, count badge.
If removing: Hide/remove the bell icon until feature is ready.

**Step 2: Implement chosen approach**

**Step 3: Commit**

```bash
git add components/notifications/NotificationSystem.tsx
git commit -m "fix: [implement/remove] notification bell icon"
```

---

### Task 16: Add Session Cleanup (Bulk Delete)

**Files:**
- Modify: `pages/my-tastings.tsx`

**Step 1: Add bulk selection mode**

```tsx
const [selectMode, setSelectMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

**Step 2: Add bulk delete button**

```tsx
<button onClick={handleBulkDelete}>
  Delete Selected ({selectedIds.size})
</button>
```

**Step 3: Implement bulk delete handler**

**Step 4: Commit**

```bash
git add pages/my-tastings.tsx
git commit -m "feat: add bulk delete for abandoned tasting sessions"
```

---

## Phase 5: Internationalization (i18n)

### Task 17: Set Up i18n Framework

**Files:**
- Create: `next-i18next.config.js`
- Modify: `next.config.js`
- Create: `public/locales/en/common.json`
- Create: `public/locales/es/common.json`

**Step 1: Install next-i18next**

```bash
npm install next-i18next react-i18next i18next
```

**Step 2: Create config**

```js
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
};
```

**Step 3: Update next.config.js**

```js
const { i18n } = require('./next-i18next.config');
module.exports = { i18n, /* ...rest */ };
```

**Step 4: Create translation files**

**Step 5: Commit**

```bash
git add next-i18next.config.js next.config.js public/locales
git commit -m "feat: set up i18n framework with EN/ES support"
```

---

### Task 18: Extract Strings to Translation Files

**Files:**
- Modify: Multiple pages and components
- Modify: `public/locales/en/common.json`
- Modify: `public/locales/es/common.json`

**Step 1: Identify all user-facing strings**

Focus on: landing page, dashboard, settings, common UI elements.

**Step 2: Replace hardcoded strings with t() calls**

```tsx
import { useTranslation } from 'next-i18next';

const { t } = useTranslation('common');

// Before
<h1>Dashboard</h1>

// After
<h1>{t('dashboard.title')}</h1>
```

**Step 3: Add translations to JSON files**

**Step 4: Commit incrementally per page/component**

---

## Final Verification

### Task 19: Run Full Test Suite

**Step 1: Run linting**

```bash
npm run lint
```

**Step 2: Run unit tests**

```bash
npm test
```

**Step 3: Run E2E tests**

```bash
npm run test:e2e
```

**Step 4: Manual verification checklist**

- [ ] Scores display as X/100
- [ ] Dashboard avg score calculates correctly
- [ ] Clicking tasting navigates to detail page
- [ ] "1 descriptor" grammar correct
- [ ] My Tastings has pagination
- [ ] Profile picture consistent
- [ ] Tags not duplicated
- [ ] Empty states show guidance
- [ ] "Comprehensive" replaces "pivotal"
- [ ] "Delete Account" section renamed
- [ ] i18n working for EN/ES

---

## Summary

| Phase | Tasks | Estimated Commits |
|-------|-------|-------------------|
| 1. Critical Bugs | 5 | 5 |
| 2. UI/UX | 5 | 5 |
| 3. Copy | 2 | 2 |
| 4. Functionality | 4 | 4 |
| 5. i18n | 2 | 2+ |
| **Total** | **18** | **18+** |

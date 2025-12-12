# Implementation Plan: Uniform Icons & Remove All Emoticons

## Goal
Ensure alignment is properly applied on all pages and icons are uniform - NO emoticons anywhere in the UI.

---

## Phase 1: Remove Emoticons from UI Components

### Task 1.1: Update EmptyState Component Presets
**File:** `components/ui/EmptyState.tsx`

**Changes:**
- Line 170: Replace `icon="🍷"` with `icon="wine_bar"`
- Line 188: Replace `icon="🍊"` with `icon="nutrition"` or `icon="local_cafe"`

```tsx
// Before
export const NoTastingsEmpty: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon="🍷"
    ...

// After
export const NoTastingsEmpty: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon="wine_bar"
    ...
```

### Task 1.2: Update AppShell Logo
**File:** `components/layout/AppShell.tsx`

**Changes:**
- Line 107: Replace `🍊` emoji with Material Symbols icon

```tsx
// Before
<span className="text-xl font-bold text-primary">🍊</span>

// After
<span className="material-symbols-outlined text-xl text-primary">nutrition</span>
```

### Task 1.3: Update Dashboard Greeting
**File:** `pages/dashboard.tsx`

**Changes:**
- Line 169: Remove `👋` emoji from greeting

```tsx
// Before
{profile?.full_name || user?.email?.split('@')[0]} 👋

// After
{profile?.full_name || user?.email?.split('@')[0]}
```

### Task 1.4: Update Flavor Wheels Share Text & UI
**File:** `pages/flavor-wheels.tsx`

**Changes:**
- Line 231: Remove `🎨✨` from share text
- Line 458: Replace `✨` with Material Symbol icon

```tsx
// Line 231 - Before
const shareText = `Check out my ${wheelType} taste profile on Flavatix! Top notes: ${topDescriptors} 🎨✨`;

// Line 231 - After
const shareText = `Check out my ${wheelType} taste profile on Flavatix! Top notes: ${topDescriptors}`;

// Line 458 - Before
<span className="text-2xl">✨</span>

// Line 458 - After
<span className="material-symbols-outlined text-2xl">auto_awesome</span>
```

### Task 1.5: Update Study Mode Page
**File:** `pages/taste/create/study/new.tsx`

**Changes:**
- Line 555: Replace `✓` with Material Symbol

```tsx
// Before
✓ This category will be included...

// After
<span className="material-symbols-outlined text-sm align-middle mr-1">check</span>
This category will be included...
```

---

## Phase 2: Remove Emoticons from Quick Tasting Components

### Task 2.1: Update ItemSuggestions Component
**File:** `components/quick-tasting/ItemSuggestions.tsx`

**Changes:**
- Lines 105-106: Replace status emoticons with Material Symbols
- Line 165: Replace `💡` with icon

```tsx
// Before (lines 105-106)
case 'approved': return '✅';
case 'rejected': return '❌';

// After
case 'approved': return <span className="material-symbols-outlined text-green-600">check_circle</span>;
case 'rejected': return <span className="material-symbols-outlined text-red-600">cancel</span>;

// Line 165 - Before
<div className="text-4xl mb-2">💡</div>

// Line 165 - After
<span className="material-symbols-outlined text-4xl text-yellow-500 mb-2">lightbulb</span>
```

### Task 2.2: Update ModerationDashboard Component
**File:** `components/quick-tasting/ModerationDashboard.tsx`

**Changes:**
- Line 203: Replace `✅` with Material Symbol
- Line 301: Replace `⚠️` with Material Symbol

```tsx
// Line 203 - Before
<div className="text-4xl mb-2">✅</div>

// After
<span className="material-symbols-outlined text-4xl text-green-600 mb-2">check_circle</span>

// Line 301 - Before
<span className="text-yellow-600">⚠️</span>

// After
<span className="material-symbols-outlined text-yellow-600">warning</span>
```

### Task 2.3: Update SessionHeader Component
**File:** `components/quick-tasting/SessionHeader.tsx`

**Changes:**
- Line 196: Replace `💡` with Material Symbol

```tsx
// Before
💡 Suggestions

// After
<span className="material-symbols-outlined text-base mr-1">lightbulb</span>
Suggestions
```

### Task 2.4: Update EditTastingDashboard Component
**File:** `components/quick-tasting/EditTastingDashboard.tsx`

**Changes:**
- Line 234: Replace `🕶️` and `👁️` with Material Symbols

```tsx
// Before
{isBlindTasting ? '🕶️ On' : '👁️ Off'}

// After
{isBlindTasting ? (
  <><span className="material-symbols-outlined text-base mr-1">visibility_off</span>On</>
) : (
  <><span className="material-symbols-outlined text-base mr-1">visibility</span>Off</>
)}
```

### Task 2.5: Update QuickTastingSession Component
**File:** `components/quick-tasting/QuickTastingSession.tsx`

**Changes:**
- Line 715: Replace `✓` with Material Symbol

```tsx
// Before
<span className="ml-xs">✓</span>

// After
<span className="material-symbols-outlined text-sm ml-xs">check</span>
```

---

## Phase 3: Remove Emoticons from Social Components

### Task 3.1: Update SocialFeedWidget Component
**File:** `components/social/SocialFeedWidget.tsx`

**Changes:**
- Line 236: Replace `⭐` with Material Symbol

```tsx
// Before
{post.average_score && ` • ${post.average_score.toFixed(1)}⭐`}

// After
{post.average_score && (
  <> • {post.average_score.toFixed(1)}<span className="material-symbols-outlined text-sm align-middle ml-0.5">star</span></>
)}
```

---

## Phase 4: Update Design System Page

### Task 4.1: Fix EmptyState Demo
**File:** `pages/design-system.tsx`

**Changes:**
- Line 934: Replace emoji icon with Material Symbol

```tsx
// Before
icon="🍷"

// After
icon="wine_bar"
```

---

## Phase 5: Console/Logger Emoticons (Lower Priority)

These are only visible in developer console, not user-facing. Consider cleaning up for consistency:

**Files with console emoticons:**
- `pages/quick-tasting.tsx`: Lines 91, 95, 98
- `components/quick-tasting/QuickTastingSession.tsx`: Multiple lines (189, 195, 202, 222, 226, 279, 323, 327, 353, 357, 360, 365, 384, 389, 398, 401, 404, 568, 582, 586)

**Recommendation:** Replace logger emoticons with prefixes like `[ERROR]`, `[SUCCESS]`, `[DEBUG]` for consistency.

---

## Phase 6: Verify Icon Consistency

### Task 6.1: Standardize on Material Symbols
The codebase uses both Lucide React and Material Symbols. Current usage:
- **Material Symbols:** BottomNavigation, EmptyState, SocialPostCard, various UI elements
- **Lucide React:** Design system page, some components

**Recommendation:** Standardize on Material Symbols for consistency since it's already used for navigation and most UI elements.

### Task 6.2: Alignment Audit
Review all pages for consistent:
- Container max-widths (currently using `max-w-screen-xl` as default)
- Padding patterns (`px-4 py-4` standard)
- Header alignment
- Card grid layouts

---

## Implementation Order

1. **Task 1.1-1.5** - UI Components & Pages (Core UI changes)
2. **Task 2.1-2.5** - Quick Tasting Components
3. **Task 3.1** - Social Components
4. **Task 4.1** - Design System Page
5. **Task 5** - Console emoticons (optional)
6. **Task 6** - Icon consistency audit

---

## Verification Steps

After each phase:
1. Run `npm run build` to verify no type errors
2. Run `npm run lint` to check for issues
3. Test affected pages visually
4. Deploy with `npx netlify deploy --prod`

---

## Notes

- All emoticons should be replaced with Material Symbols icons
- Use existing `material-symbols-outlined` class for consistency
- Icon names reference: https://fonts.google.com/icons
- Key replacements:
  - 🍷 → `wine_bar`
  - 🍊 → `nutrition`
  - ✨ → `auto_awesome`
  - 👋 → (remove or use `waving_hand`)
  - ✅/✓ → `check_circle` or `check`
  - ❌ → `cancel` or `close`
  - 💡 → `lightbulb`
  - ⚠️ → `warning`
  - ⭐ → `star`
  - 🕶️ → `visibility_off`
  - 👁️ → `visibility`

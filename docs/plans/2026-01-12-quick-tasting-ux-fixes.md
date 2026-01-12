# Quick Tasting UX Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 4 critical UX issues in Quick Tasting: prevent auto-creation of empty items, add delete confirmation, improve item naming UX, and validate completion.

**Architecture:** Add state management to prevent duplicate auto-adds, implement confirmation modals, redesign item naming UI with placeholders, and add validation before session completion.

**Tech Stack:** React hooks (useRef, useEffect), Supabase for persistence, existing toast/modal system

---

## Task 1: Fix Auto-Creation of Empty Items on App Resume

**Root Cause:** The `useEffect` at line 655-684 in `QuickTastingSession.tsx` triggers on every component mount/resume, creating duplicate items.

**Files:**
- Modify: `components/quick-tasting/QuickTastingSession.tsx:655-684`
- Test: Manual testing with app switching

**Step 1: Add session-level tracking to prevent duplicate auto-adds**

Modify the `useEffect` to check if an item was already auto-created for this session:

```typescript
// Add new state at top of component (after line 51)
const hasAutoAddedRef = useRef(false);
const sessionIdRef = useRef<string | null>(null);

// Modify the useEffect (lines 655-684)
useEffect(() => {
  if (!session) return;

  // Reset auto-add flag when session changes
  if (sessionIdRef.current !== session.id) {
    sessionIdRef.current = session.id;
    hasAutoAddedRef.current = false;
    autoAddTriggeredRef.current = false;
  }

  // Prevent multiple triggers
  if (autoAddTriggeredRef.current || hasAutoAddedRef.current) return;

  // Quick Tasting: auto-add when in tasting phase with no items
  const isQuickTasting = session.mode === 'quick' && phase === 'tasting';

  // Study Mode: predefined approach with permissions ready
  const isPredefinedStudy = session.mode === 'study' && session.study_approach === 'predefined';

  // For predefined study, wait for permissions
  if (isPredefinedStudy && (!userPermissions || !userRole)) {
    logger.debug('🔄 Auto-add: Waiting for permissions...');
    return;
  }

  // Check if we need to add the first item
  if ((isQuickTasting || isPredefinedStudy) && items.length === 0 && !isLoading) {
    logger.debug('🔄 Auto-add: No items found, auto-adding first item');
    autoAddTriggeredRef.current = true;
    hasAutoAddedRef.current = true;
    setTimeout(() => {
      addNewItem();
      if (session.mode === 'study') {
        setPhase('tasting');
      }
    }, 100);
  }
}, [session?.id, session?.mode, session?.study_approach, phase, items.length, isLoading, userPermissions, userRole]);
```

**Step 2: Test app switching behavior**

1. Start a Quick Tasting session
2. Add 2 items
3. Switch to another app (WhatsApp)
4. Switch back to the tasting app
5. Verify: No new empty items are created
6. Repeat 3-4 multiple times
7. Expected: Item count stays at 2

**Step 3: Commit**

```bash
git add components/quick-tasting/QuickTastingSession.tsx
git commit -m "fix: prevent duplicate items on app resume

- Add hasAutoAddedRef to track auto-add per session
- Reset flag when session changes
- Prevents multiple items being created on app switching"
```

---

## Task 2: Add Delete Confirmation Modal

**Files:**
- Modify: `components/quick-tasting/TastingItem.tsx:200-210` (delete handler)
- Test: Manual testing with delete button

**Step 1: Add confirmation before delete**

Find the `removeItem` function in `TastingItem.tsx` and wrap it with confirmation:

```typescript
const handleRemove = async () => {
  // Check if item has any data
  const hasData = item.item_name ||
                  item.overall_score !== null ||
                  item.appearance_score !== null ||
                  item.aroma_score !== null ||
                  item.flavor_score !== null ||
                  item.notes ||
                  item.photo_url;

  if (hasData) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this item? This action cannot be undone.'
    );
    if (!confirmed) return;
  }

  onRemove();
};
```

**Step 2: Update the delete button to use the new handler**

Replace the existing `onClick={onRemove}` with `onClick={handleRemove}`:

```typescript
<button
  onClick={handleRemove}
  className="text-red-600 hover:text-red-700 text-sm"
  aria-label="Delete item"
>
  Delete
</button>
```

**Step 3: Test delete confirmation**

1. Create an item with data (name, scores, notes)
2. Click delete button
3. Expected: Confirmation dialog appears
4. Click "Cancel" → Item stays
5. Click delete again → Click "OK" → Item deleted

6. Create an empty item (no data)
7. Click delete button
8. Expected: Deletes immediately without confirmation

**Step 4: Commit**

```bash
git add components/quick-tasting/TastingItem.tsx
git commit -m "feat: add delete confirmation for items with data

- Show confirmation dialog before deleting items with data
- Allow immediate deletion of empty items
- Prevents accidental data loss"
```

---

## Task 3: Improve Item Naming UX with Placeholder

**Files:**
- Modify: `components/quick-tasting/TastingItem.tsx:50-80` (item header section)
- Modify: `components/quick-tasting/QuickTastingSession.tsx:690-710` (display name logic)

**Step 1: Update item header to show "Item #" label**

Modify the item header section in `TastingItem.tsx`:

```typescript
{/* Item Header - Always show "Item #" */}
<div className="mb-4">
  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
    Item #{index + 1}
  </div>
  <input
    type="text"
    value={item.item_name || ''}
    onChange={(e) => onUpdate({ item_name: e.target.value })}
    placeholder="<enter name>"
    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md
               bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
               placeholder:text-zinc-400 placeholder:italic
               focus:outline-none focus:ring-2 focus:ring-primary"
    disabled={!canEdit}
  />
</div>
```

**Step 2: Add CSS for placeholder styling**

Ensure the placeholder text is light gray and disappears on focus. The Tailwind classes above handle this, but verify in the global CSS that placeholder colors are correct.

**Step 3: Test item naming UX**

1. Create a new item
2. Expected: Shows "Item #1" above the input
3. Expected: Input shows `<enter name>` in light gray italic
4. Start typing a name
5. Expected: Placeholder disappears, text appears in normal color
6. Clear the text
7. Expected: Placeholder reappears

8. Add another item
9. Expected: Shows "Item #2" with same placeholder behavior

**Step 4: Commit**

```bash
git add components/quick-tasting/TastingItem.tsx
git commit -m "feat: improve item naming with label and placeholder

- Show 'Item #N' label above name input
- Add '<enter name>' placeholder in light gray
- Improves clarity of item identification"
```

---

## Task 4: Validate Completion - Prevent Finishing with Empty Items

**Files:**
- Modify: `components/quick-tasting/QuickTastingSession.tsx:345-365` (completeSession function)
- Modify: `components/quick-tasting/QuickTastingSession.tsx:570-575` (handleEndTasting)

**Step 1: Add validation before completing session**

Modify the `completeSession` function to validate all items have scores:

```typescript
const completeSession = async () => {
  if (!session) return;

  // Validate: Check if all items have at least an overall score
  const emptyItems = items.filter(item => item.overall_score === null);

  if (emptyItems.length > 0) {
    toast.error(`Please score all items before completing. ${emptyItems.length} item(s) missing scores.`);
    return;
  }

  // Validate: Must have at least 1 item
  if (items.length === 0) {
    toast.error('Please add at least one item before completing the tasting.');
    return;
  }

  setIsLoading(true);
  try {
    const { error } = await supabase
      .from('quick_tastings')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (error) throw error;

    logger.info('Tasting', 'Session completed', { sessionId: session.id, itemCount: items.length });
    toast.success('Tasting completed successfully!');
    onSessionComplete?.();
  } catch (error: any) {
    console.error('Error completing session:', error);
    logger.error('Tasting', 'Failed to complete session', { error: error.message });
    toast.error('Failed to complete tasting session');
  } finally {
    setIsLoading(false);
  }
};
```

**Step 2: Add visual indicator for incomplete items**

Update the "Complete Tasting" button to show count of incomplete items:

```typescript
const incompleteCount = items.filter(item => item.overall_score === null).length;

<button
  onClick={handleEndTasting}
  disabled={incompleteCount > 0}
  className={`px-6 py-3 rounded-lg font-medium transition ${
    incompleteCount > 0
      ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
      : 'bg-green-600 text-white hover:bg-green-700'
  }`}
>
  {incompleteCount > 0
    ? `Complete Tasting (${incompleteCount} items incomplete)`
    : 'Complete Tasting'}
</button>
```

**Step 3: Test validation**

Test Case 1: Empty items
1. Start a tasting
2. Add 4 items
3. Fill out only 2 items with scores
4. Leave 2 items empty
5. Click "Complete Tasting"
6. Expected: Error toast "Please score all items before completing. 2 item(s) missing scores."
7. Expected: Button disabled and shows "(2 items incomplete)"

Test Case 2: All items scored
1. Go back and score the 2 remaining items
2. Click "Complete Tasting"
3. Expected: Session completes successfully

Test Case 3: No items
1. Start a new tasting
2. Delete all items (if any)
3. Click "Complete Tasting"
4. Expected: Error toast "Please add at least one item before completing the tasting."

**Step 4: Commit**

```bash
git add components/quick-tasting/QuickTastingSession.tsx
git commit -m "feat: validate completion prevents empty items

- Check all items have scores before completing
- Show count of incomplete items on Complete button
- Disable completion until all items are scored
- Prevents submitting incomplete tasting data"
```

---

## Task 5: Final Integration Test

**Step 1: Test complete user flow**

1. Start a new Quick Tasting session
2. Verify: 1 item auto-created
3. Switch to another app and back 3 times
4. Verify: Still only 1 item (no duplicates)
5. Add item name using new placeholder UI
6. Add scores to the item
7. Add 2 more items
8. Fill out only 1 of the new items
9. Try to complete
10. Verify: Blocked with message about incomplete item
11. Complete the last item
12. Delete an empty item
13. Verify: Deletes immediately
14. Try to delete an item with data
15. Verify: Confirmation appears
16. Cancel deletion
17. Complete the tasting
18. Verify: Success

**Step 2: Test edge cases**

- Create item with just name (no scores) → Should block completion
- Create item with scores but no name → Should allow completion
- Delete last item → Should work
- Try to complete with 0 items → Should block

**Step 3: Final commit**

```bash
git add -A
git commit -m "test: verify all Quick Tasting UX fixes

- Auto-add prevention working across app switches
- Delete confirmation working for items with data
- Item naming with placeholder working
- Completion validation working correctly"
```

---

## Task 6: Update Documentation

**Files:**
- Create: `docs/features/quick-tasting-ux-improvements.md`

**Step 1: Document the changes**

```markdown
# Quick Tasting UX Improvements

## Changes

### 1. Prevent Duplicate Items on App Resume
- **Problem:** Switching apps caused new empty items to be created
- **Solution:** Added session-level tracking to prevent duplicate auto-adds
- **Impact:** Users won't see random empty items appearing

### 2. Delete Confirmation
- **Problem:** Accidentally deleting items with data
- **Solution:** Show confirmation dialog before deleting items with data
- **Impact:** Prevents data loss from accidental deletions

### 3. Improved Item Naming
- **Problem:** "Item 1", "Item 2" naming was confusing
- **Solution:** Show "Item #" label + placeholder text in input
- **Impact:** Clearer item identification and better UX

### 4. Completion Validation
- **Problem:** Could complete tastings with empty items
- **Solution:** Validate all items have scores before allowing completion
- **Impact:** Ensures data quality and prevents incomplete submissions

## Testing

See `docs/plans/2026-01-12-quick-tasting-ux-fixes.md` for detailed test cases.
```

**Step 2: Commit documentation**

```bash
git add docs/features/quick-tasting-ux-improvements.md
git commit -m "docs: document Quick Tasting UX improvements"
```

---

## Execution Summary

**Total Tasks:** 6
**Estimated Time:** 45-60 minutes
**Critical Path:** Task 1 → Task 2 → Task 4 (blocks others)
**Testing Requirements:** Manual testing required for each task

**Files Modified:**
- `components/quick-tasting/QuickTastingSession.tsx`
- `components/quick-tasting/TastingItem.tsx`
- `docs/features/quick-tasting-ux-improvements.md` (new)

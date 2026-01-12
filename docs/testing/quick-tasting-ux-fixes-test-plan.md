# Quick Tasting UX Fixes - Integration Test Plan

## Overview
Manual testing checklist for all 4 UX fixes implemented in Quick Tasting mode.

---

## Test 1: Auto-Creation Prevention (No Duplicate Items)

**Objective:** Verify that switching apps doesn't create duplicate empty items.

### Steps:
1. Go to `http://localhost:3000`
2. Login
3. Navigate to **Quick Tasting**
4. Select a category (e.g., Coffee)
5. Click **"Start Tasting"**
6. **Verify:** One item is auto-created (Item 1)
7. Count the items: Should be **1 item**
8. **Switch apps 3 times:**
   - Desktop: `Alt+Tab` to another window and back
   - Mobile: Swipe up → Open another app → Swipe back
9. **Verify:** Still only **1 item** exists (no Item 2, Item 3, etc.)

### Expected Result:
✅ Item count stays at 1 (no duplicates created)

### If Test Fails:
❌ Multiple empty items appear (Item 2, Item 3, etc.)

---

## Test 2A: Delete Confirmation for Items WITH Data

**Objective:** Verify confirmation dialog appears when deleting items with data.

### Test 2A.1: Item with Custom Name
1. In Quick Tasting, add Item 2
2. Click on "Item 2" name to edit it
3. Change name to **"Coffee Sample"**
4. Don't add scores, notes, or photo
5. Scroll down and click **"Delete this item"** button (red text)
6. **Verify:** Confirmation dialog appears:
   - Message: "Are you sure you want to delete this item? This action cannot be undone."
   - Buttons: Cancel and OK
7. Click **Cancel**
8. **Verify:** Item still exists
9. Click **"Delete this item"** again
10. Click **OK**
11. **Verify:** Item is deleted

### Expected Result:
✅ Confirmation appears for item with custom name
✅ Cancel keeps the item
✅ OK deletes the item

---

### Test 2A.2: Item with Score
1. Add Item 2 (keep default name "Item 2")
2. Set **Overall Score** to **8.5**
3. Click **"Delete this item"**
4. **Verify:** Confirmation dialog appears
5. Click **OK**

### Expected Result:
✅ Confirmation appears for item with score

---

### Test 2A.3: Item with Notes
1. Add Item 2 (keep default name)
2. Add **Notes:** "This coffee has floral notes"
3. Click **"Delete this item"**
4. **Verify:** Confirmation dialog appears

### Expected Result:
✅ Confirmation appears for item with notes

---

### Test 2A.4: Item with Photo
1. Add Item 2 (keep default name)
2. Upload a photo
3. Click **"Delete this item"**
4. **Verify:** Confirmation dialog appears

### Expected Result:
✅ Confirmation appears for item with photo

---

## Test 2B: Delete Without Confirmation for Empty Items

**Objective:** Verify empty items with default names delete immediately without confirmation.

### Steps:
1. Add Item 2 (keep default name "Item 2")
2. **Don't add anything:** No scores, no notes, no photo, no name change
3. Click **"Delete this item"**
4. **Verify:** Item deletes **immediately** (NO confirmation dialog)

### Expected Result:
✅ Deletes immediately without confirmation dialog

### If Test Fails:
❌ Confirmation dialog appears for empty item

---

## Test 3: Item Naming UX

**Objective:** Verify "Item #" label and placeholder functionality.

### Steps:
1. Go to Item 1 in Quick Tasting
2. **Look above the name field**
3. **Verify:** Small gray text says **"Item #1"**
4. **Look at the name input field**
5. **Verify:** Placeholder text `<enter name>` appears in light gray italic
6. Click on the name field
7. Start typing: **"Ethiopian Coffee"**
8. **Verify:** Placeholder disappears, your text appears in normal color
9. Delete all text (Ctrl+A → Delete)
10. **Verify:** Placeholder `<enter name>` reappears
11. Add Item 2
12. **Verify:** Label says **"Item #2"**
13. **Verify:** Same placeholder behavior

### Expected Result:
✅ "Item #1", "Item #2" labels appear
✅ Placeholder `<enter name>` in gray italic
✅ Placeholder disappears when typing
✅ Placeholder reappears when empty

---

## Test 4: Completion Validation

**Objective:** Verify users cannot complete tasting with empty items.

### Test 4.1: Block Completion with Empty Items
1. Start Quick Tasting
2. Add 4 items total
3. **Only score 2 items:**
   - Item 1: Score 8.0
   - Item 2: Score 7.5
   - Item 3: Leave empty (no score)
   - Item 4: Leave empty (no score)
4. Scroll to bottom
5. **Look at "Complete Tasting" button**
6. **Verify:**
   - Button is **grayed out** (disabled)
   - Text says: **"Complete Tasting (2 items incomplete)"**
7. Try clicking the button
8. **Verify:** Nothing happens (button is disabled)
9. **Verify:** Toast message appears:
   - "Please score all items before completing. 2 item(s) missing scores."

### Expected Result:
✅ Button disabled and grayed out
✅ Shows "(2 items incomplete)"
✅ Toast error appears on attempt

---

### Test 4.2: Allow Completion When All Scored
1. Continue from previous test
2. Go to Item 3 and add score: **9.0**
3. Go to Item 4 and add score: **8.5**
4. Scroll to bottom
5. **Verify:**
   - Button is now **enabled** (green/primary color)
   - Text says: **"Complete Tasting"** (no incomplete count)
6. Click **"Complete Tasting"**
7. **Verify:**
   - Session completes successfully
   - Toast: "Tasting session completed!"
   - Redirects to dashboard/summary

### Expected Result:
✅ Button enabled when all items scored
✅ Completes successfully

---

### Test 4.3: Cannot Complete with Zero Items
1. Start a new Quick Tasting session
2. Delete all items (if Item 1 exists, add Item 2, then delete Item 2, then delete Item 1)
3. Try to click **"Complete Tasting"**
4. **Verify:** Toast message:
   - "Please add at least one item before completing the tasting."

### Expected Result:
✅ Blocks completion with 0 items
✅ Shows appropriate error message

---

## Test 5: Complete User Flow

**Objective:** Test all fixes working together in a realistic scenario.

### Steps:
1. Start Quick Tasting → Coffee category
2. **Verify:** Item 1 auto-created
3. Switch to another app and back 3 times
4. **Verify:** Still only 1 item
5. **Verify:** "Item #1" label appears
6. **Verify:** `<enter name>` placeholder
7. Click name, type **"Guatemala Antigua"**
8. Set Overall Score: **8.5**
9. Add notes: **"Sweet with chocolate notes"**
10. Add Item 2
11. **Verify:** "Item #2" label appears
12. Leave Item 2 empty (default name, no score)
13. Add Item 3
14. Set Item 3 name: **"Colombian"**
15. Set Item 3 score: **7.0**
16. Try to complete
17. **Verify:** Button shows "(1 items incomplete)"
18. Try to delete Item 2 (empty)
19. **Verify:** Deletes immediately without confirmation
20. **Verify:** Button now enabled
21. Try to delete Item 3 (has data)
22. **Verify:** Confirmation appears
23. Click Cancel
24. Complete the tasting
25. **Verify:** Success!

### Expected Result:
✅ All features work together seamlessly

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Auto-creation prevention | ⬜ Pass / ⬜ Fail | |
| 2A.1. Delete confirmation - custom name | ⬜ Pass / ⬜ Fail | |
| 2A.2. Delete confirmation - score | ⬜ Pass / ⬜ Fail | |
| 2A.3. Delete confirmation - notes | ⬜ Pass / ⬜ Fail | |
| 2A.4. Delete confirmation - photo | ⬜ Pass / ⬜ Fail | |
| 2B. Delete without confirmation - empty | ⬜ Pass / ⬜ Fail | |
| 3. Item naming UX | ⬜ Pass / ⬜ Fail | |
| 4.1. Block completion - empty items | ⬜ Pass / ⬜ Fail | |
| 4.2. Allow completion - all scored | ⬜ Pass / ⬜ Fail | |
| 4.3. Block completion - zero items | ⬜ Pass / ⬜ Fail | |
| 5. Complete user flow | ⬜ Pass / ⬜ Fail | |

---

## Bugs Found

If you find any bugs during testing, document them here:

### Bug #1:
- **Test:**
- **Expected:**
- **Actual:**
- **Steps to reproduce:**

---

## Sign-off

- **Tested by:** _______________
- **Date:** _______________
- **All tests passed:** ⬜ Yes / ⬜ No
- **Ready for deployment:** ⬜ Yes / ⬜ No

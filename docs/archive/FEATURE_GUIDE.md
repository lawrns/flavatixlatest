# Feature Guide - Quick Tasting Fixes & Review System

## Quick Tasting Improvements

### 1. Session Name & Category Lock
**Before:** Users could edit session name and category at any time, causing database inconsistencies  
**After:** Session name and category are locked after adding the first item

**How to test:**
1. Go to Quick Tasting
2. Create a session with a name and category
3. Add first item
4. Try to edit session name → Should be disabled with tooltip
5. Try to change category → Should show static text instead of dropdown

### 2. Item Name Persistence
**Before:** Item names would revert to default after editing  
**After:** Item names save immediately and persist

**How to test:**
1. Add an item to a tasting session
2. Edit the item name
3. Click outside the field
4. Refresh or navigate away and back
5. Item name should remain as edited

### 3. Slider Interaction
**Before:** Slider thumb was invisible and couldn't be dragged  
**After:** Slider has visible thumb and supports both dragging and clicking

**How to test:**
1. Add an item to a tasting session
2. Find the Overall Score slider
3. Try dragging the thumb → Should work smoothly
4. Try clicking anywhere on the slider → Should jump to that position
5. Thumb should be visible (white circle with border)

### 4. Score Display Format
**Before:** Scores displayed as X/5  
**After:** Scores display as X/100

**How to test:**
1. Complete a quick tasting session
2. View the summary page
3. All scores should show as "X/100" not "X/5"

### 5. Photo Upload
**Status:** Already working, verified present

**How to test:**
1. Add an item to a tasting session
2. Look for "Add Photo" button
3. Click to upload a photo
4. Photo should display below the button

---

## Review System

### Navigation Flow
```
Dashboard → Review (bottom nav)
  ↓
Review Main Page
  ├─→ Review (Structured)
  ├─→ Prose Review
  └─→ My Reviews
       ├─→ Reviews in Progress (drafts)
       ├─→ Reviews (completed structured)
       └─→ Prose Reviews (completed prose)
            ↓
       Review Summary
         ├─→ Publish (to feed)
         └─→ Reviews (back to main)
```

### Review Main Page (`/review`)

**3 Options:**
1. **Review** - "for in depth analysis of flavor characteristics"
2. **Prose Review** - "just write my review"
3. **My Reviews** - "Review History"

**How to access:**
- Click "Review" in bottom navigation
- Navigate to `/review`

### Structured Review Form (`/review/structured`)

**10 Item ID Fields:**
1. Item Name / Variety (required) ⭐
2. Picture (optional upload)
3. Brand
4. Category (required dropdown with 22 options) ⭐
5. Country (dropdown)
6. State (dropdown - conditional on country)
7. Region
8. Vintage (4 digit format)
9. Batch ID
10. Scan UPC / Barcode

**12 Characteristics:**
1. **Aroma** - Text + Intensity slider (1-100)
2. **Saltiness** - Text + slider (1-100)
3. **Sweetness** - Text + slider (1-100)
4. **Acidity** - Text + slider (1-100)
5. **Umami** - Text + slider (1-100)
6. **Spiciness (Chile pepper)** - Text + slider (1-100)
7. **Flavor** - Text + Intensity slider (1-100)
8. **Texture** - Text only (no slider)
9. **Typicity (Tastes how it should)** - Slider only (1-100)
10. **Complexity** - Slider only (1-100)
11. **Other** - Text only (no slider)
12. **Overall** - Slider only (1-100)

**3 Action Buttons:**
- **Done** - Saves as completed, goes to summary
- **Save for Later** - Saves as draft, goes to history
- **New Review** - Saves current and starts fresh

### Prose Review Form (`/review/prose`)

**Same 10 Item ID Fields** as structured review

**Review Content:**
- Large text area for free-form writing
- Footnote: "Descriptors from your text will be added to your flavor wheels"

**Same 3 Action Buttons:**
- Done
- Save for Later
- New Prose Review

### My Reviews Page (`/review/history`)

**3 Sections:**

1. **Reviews in Progress** (if any drafts exist)
   - Shows all draft reviews (both structured and prose)
   - Click to continue editing

2. **Reviews** (Structured)
   - Shows completed structured reviews
   - Displays Review ID
   - Shows overall score
   - Click to view summary

3. **Prose Reviews**
   - Shows completed prose reviews
   - Displays Review ID
   - Click to view summary

**Review ID Format:**
- First 4 chars of Category (uppercase)
- First 4 chars of Item Name (uppercase, no spaces)
- Batch ID (or "NONE")
- Date (M/D/YY)
- Example: `WINECABE322-9/30/25`

### Review Summary Page (`/review/summary/[id]`)

**Displays:**
- Review ID (prominent header)
- Status badge (Draft/Completed/Published)
- Photo (if uploaded)
- All 10 Item ID fields (that were filled)
- For Structured: All 12 characteristics with scores
- For Prose: Full review text

**Action Buttons:**
- **Publish** - Updates status to 'published' (only if not already published)
- **Reviews** - Returns to main review page

---

## Categories Available

The following 22 categories are available in the review system:

1. Red Wine
2. White Wine
3. Wine
4. Coffee
5. Beer
6. Gin
7. Whisky
8. Scotch
9. Bourbon
10. Rum
11. Mezcal
12. Agave Spirit
13. Sotol
14. Raicilla
15. Perfume
16. Olive Oil
17. Chips
18. Snacks
19. Chocolate
20. Dessert
21. Cheese
22. Meat

---

## Database Schema

### `quick_reviews` table
**New fields added:**
- `brand` (varchar 255)
- `country` (varchar 100)
- `state` (varchar 100)
- `region` (varchar 255)
- `vintage` (varchar 4)
- `batch_id` (varchar 255)
- `barcode` (varchar 255)
- `status` (varchar 20) - 'draft', 'completed', 'published'

### `prose_reviews` table
**New fields added:**
- Same 8 fields as `quick_reviews`

---

## User Workflows

### Creating a Structured Review
1. Navigate to `/review`
2. Click "Review"
3. Fill in Item Name (required)
4. Select Category (required)
5. Fill in other Item ID fields as desired
6. Upload photo (optional)
7. Fill in characteristics with text and sliders
8. Click "Done" to complete or "Save for Later" to draft

### Creating a Prose Review
1. Navigate to `/review`
2. Click "Prose Review"
3. Fill in Item Name (required)
4. Select Category (required)
5. Fill in other Item ID fields as desired
6. Upload photo (optional)
7. Write review in text area
8. Click "Done" to complete or "Save for Later" to draft

### Viewing Reviews
1. Navigate to `/review`
2. Click "My Reviews"
3. Browse completed reviews or drafts
4. Click any review to view summary

### Publishing a Review
1. Open a completed review summary
2. Click "Publish" button
3. Review status changes to "Published"
4. Review appears in social feed (future feature)

---

## Technical Notes

- All sliders use 1-100 scale
- Photo uploads go to Supabase storage bucket 'tasting-photos'
- Review IDs are generated client-side using `generateReviewId()` function
- State dropdown is conditional based on selected country (US/Mexico)
- All forms include proper validation and error handling
- Loading states are shown during async operations
- Toast notifications confirm successful actions

---

## Future Enhancements

Potential improvements for future iterations:
- Barcode scanning functionality (currently manual entry)
- AI-powered descriptor extraction from prose reviews
- Social feed integration for published reviews
- Review editing functionality
- Review deletion with confirmation
- Export reviews to PDF
- Share reviews via link
- Review analytics and statistics


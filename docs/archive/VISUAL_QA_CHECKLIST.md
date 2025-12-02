# Visual QA Checklist - Flavatix Phase 1 & 2
## Quick Visual Verification Guide

**Purpose**: Rapid visual inspection of all UI changes
**Time Required**: ~10 minutes
**Best For**: Quick verification before detailed E2E testing

---

## 🎨 Visual Inspection Protocol

### ✅ = Pass | ❌ = Fail | ⚠️ = Needs Review

---

## 1️⃣ LANDING PAGE (/)

**URL**: http://localhost:3000

### Header Section
```
[ ] Logo displays correctly
[ ] Headline reads "Flavatix"
[ ] Tagline: "The one place for all your tasting needs"
[ ] Subtitle mentions "anything with flavor or aroma"
[ ] NO mention of "Taste the World, One Sip at a Time"
[ ] NO mention of "coffee and drinks only"
```

### Feature Cards (Middle Section)
```
Card 1:
[ ] Title: "Tasting Notes" (NOT "Quick Tasting")
[ ] Icon: Plus symbol in colored circle
[ ] Background color: Fruity (reddish/orange)
[ ] Description: "On-the-fly tasting note storage and analysis"

Card 2:
[ ] Title: "Create Tastings"
[ ] Icon: Star symbol
[ ] Background color: Vegetal (greenish)
[ ] Description mentions "study sessions and competitions"

Card 3:
[ ] Title: "Flavor Wheels"
[ ] Icon: Checkmark/donut
[ ] Background color: Roasted (brownish)
[ ] Description mentions "AI-generated visualizations"
```

### Footer
```
[ ] Copyright text: "© 2025 Flavatix. The one place for all your tasting needs."
[ ] NO mention of old tagline
[ ] "Get Started" button works → redirects to /auth
```

**Screenshot Checklist**:
- [ ] Take full-page screenshot
- [ ] Capture on desktop (1920x1080)
- [ ] Capture on mobile (375x667)

---

## 2️⃣ AUTH PAGE (/auth)

**URL**: http://localhost:3000/auth

### Branding
```
[ ] Header: "Flavatix" (single word, no "México")
[ ] Subtitle: "The one place for all your tasting needs"
[ ] Logo is visible above header
[ ] Background image loads
```

### Form Elements
```
[ ] "Sign in with Email" button present
[ ] "Google" button with Google icon
[ ] "Apple" button with Apple icon
[ ] "or" divider between email and social options
[ ] Toggle between Login/Register works
```

**Screenshot Checklist**:
- [ ] Capture auth page default state
- [ ] Capture with email form expanded

---

## 3️⃣ DASHBOARD (/dashboard)

**URL**: http://localhost:3000/dashboard (requires login)

### Top Section
```
[ ] "Welcome back" message displays
[ ] Profile avatar or initials show
[ ] User stats cards visible (tastings, reviews, etc.)
```

### Bottom Navigation Bar
```
Visual count:
[ ] Exactly 4 tabs (count them: 1, 2, 3, 4)

Tab 1 (Left):
[ ] Icon: Home (house symbol)
[ ] Label: "Home"
[ ] Color: Primary/highlighted (orange/red)
[ ] This tab is ACTIVE

Tab 2:
[ ] Icon: Restaurant/utensils
[ ] Label: "Taste"
[ ] Color: Gray/inactive

Tab 3:
[ ] Icon: Reviews/star
[ ] Label: "Review"
[ ] Color: Gray/inactive

Tab 4 (Right):
[ ] Icon: Donut/wheel
[ ] Label: "Wheels"
[ ] Color: Gray/inactive

CONFIRM:
[ ] NO 5th tab
[ ] NO "Social" tab anywhere
[ ] NO "Create" tab
[ ] NO "groups" icon
```

**Screenshot Checklist**:
- [ ] Full dashboard view
- [ ] Close-up of bottom navigation

---

## 4️⃣ TASTE PAGE (/taste)

**URL**: http://localhost:3000/taste

### Header
```
[ ] "Back to Dashboard" button at top
[ ] Page title: "Taste"
[ ] Subtitle: "Choose your tasting experience"
```

### Option Cards (2 Cards)
```
Card 1 - Quick Tasting:
[ ] Icon: Lightning/Zap bolt
[ ] Title: "Quick Tasting"
[ ] Description: "Tasting notes on the fly. Take notes and save them for future reference while growing your Flavor Wheels"
[ ] Clickable and hoverable

Card 2 - Create Tasting:
[ ] Icon: Users/People group
[ ] Title: "Create Tasting"
[ ] Description: "Study Mode, Competition Mode, My Tastings, and Join Tasting"
[ ] Clickable and hoverable
```

### Bottom Navigation
```
[ ] 4 tabs present
[ ] "Taste" tab is ACTIVE/highlighted
[ ] Other tabs: Home, Review, Wheels (all inactive)
```

**Screenshot Checklist**:
- [ ] Full taste page view
- [ ] Hover state on cards (if possible)

---

## 5️⃣ REVIEW LANDING (/review)

**URL**: http://localhost:3000/review

### Option Cards (3 Cards)
```
[ ] "Review" card present
[ ] "Prose Review" card present
[ ] "My Reviews" card present
[ ] All cards have icons and descriptions
```

### Bottom Navigation
```
[ ] 4 tabs present
[ ] "Review" tab is ACTIVE/highlighted
[ ] Labels: Home, Taste, Review, Wheels
```

**Screenshot Checklist**:
- [ ] Full review landing page

---

## 6️⃣ STRUCTURED REVIEW (/review/create)

**URL**: http://localhost:3000/review/create

### Form Visibility
```
[ ] "Item Information" section visible
[ ] All characteristic sliders visible
[ ] Can scroll smoothly
```

### Bottom Buttons (CRITICAL CHECK)
```
Scroll to bottom of page:
[ ] Can reach the bottom without struggle
[ ] Three buttons visible:
    [ ] "Done" button
    [ ] "Save for Later" button
    [ ] "New Review" button
[ ] Buttons are NOT covered by bottom navigation
[ ] Space between buttons and navigation bar (padding visible)
[ ] All buttons are clickable
```

### Bottom Navigation
```
[ ] Navigation bar is fixed at bottom
[ ] Doesn't cover form content
[ ] "Review" tab is highlighted
[ ] 4 tabs: Home, Taste, Review, Wheels
```

**Screenshot Checklist**:
- [ ] Top of form (Item Information)
- [ ] Middle of form (sliders)
- [ ] **CRITICAL**: Bottom of form showing all 3 buttons AND navigation bar
- [ ] Annotate screenshot showing padding/spacing

---

## 7️⃣ PROSE REVIEW (/review/prose)

**URL**: http://localhost:3000/review/prose

### Form Visibility
```
[ ] Item information fields present
[ ] Large text area for review content
[ ] Can scroll smoothly
```

### Bottom Buttons (CRITICAL CHECK)
```
Scroll to bottom:
[ ] Three buttons visible: Done, Save for Later, New Review
[ ] Buttons NOT covered by navigation
[ ] Adequate spacing/padding below buttons
[ ] All buttons clickable
```

### Bottom Navigation
```
[ ] Fixed navigation bar at bottom
[ ] "Review" tab highlighted
[ ] 4 tabs present
```

**Screenshot Checklist**:
- [ ] **CRITICAL**: Bottom of form with buttons and navigation

---

## 8️⃣ QUICK TASTING (/quick-tasting)

**URL**: http://localhost:3000/quick-tasting

### Page Loads
```
[ ] Page loads without 404
[ ] Category selector or session view appears
[ ] No console errors (check F12)
```

### Bottom Navigation
```
[ ] Navigation present
[ ] "Taste" tab is ACTIVE/highlighted
[ ] 4 tabs: Home, Taste, Review, Wheels
```

**Screenshot Checklist**:
- [ ] Quick tasting initial view

---

## 9️⃣ CREATE TASTING (/create-tasting)

**URL**: http://localhost:3000/create-tasting

### Mode Cards
```
[ ] Study Mode card
[ ] Competition Mode card
[ ] Quick Tasting card
[ ] All cards have icons and descriptions
```

### Bottom Navigation
```
[ ] "Taste" tab is ACTIVE
[ ] 4 tabs present
```

---

## 🔟 FLAVOR WHEELS (/flavor-wheels)

**URL**: http://localhost:3000/flavor-wheels

### Page View
```
[ ] Page loads (may be empty/placeholder)
[ ] Header present
[ ] No errors
```

### Bottom Navigation
```
[ ] "Wheels" tab is ACTIVE/highlighted
[ ] 4 tabs: Home, Taste, Review, Wheels
```

---

## 🎯 Navigation Consistency Check

**Test**: Visit each page and verify navigation

| Page | Home Active | Taste Active | Review Active | Wheels Active | Tab Count |
|------|-------------|--------------|---------------|---------------|-----------|
| /dashboard | ✅ | ❌ | ❌ | ❌ | 4 |
| /taste | ❌ | ✅ | ❌ | ❌ | 4 |
| /quick-tasting | ❌ | ✅ | ❌ | ❌ | 4 |
| /create-tasting | ❌ | ✅ | ❌ | ❌ | 4 |
| /review | ❌ | ❌ | ✅ | ❌ | 4 |
| /review/create | ❌ | ❌ | ✅ | ❌ | 4 |
| /review/prose | ❌ | ❌ | ✅ | ❌ | 4 |
| /flavor-wheels | ❌ | ❌ | ❌ | ✅ | 4 |

**Verification**:
```
[ ] All rows show exactly 4 tabs
[ ] Correct tab highlighted on each page
[ ] No page has 5 tabs
[ ] No page has "Social" tab
```

---

## 📱 Mobile View Check

**Instructions**: Use DevTools device emulation (F12 → Toggle Device Toolbar)

**Test Device**: iPhone 12 Pro (390x844) or similar

### Critical Mobile Checks
```
[ ] Landing page hero section readable
[ ] Feature cards stack vertically on mobile
[ ] Auth page form fits screen
[ ] Bottom navigation visible and tappable
[ ] Navigation icons clear at mobile size
[ ] Navigation text readable
[ ] Review form scrollable on mobile
[ ] Bottom buttons accessible on mobile
```

**Screenshot Checklist**:
- [ ] Mobile landing page
- [ ] Mobile dashboard with navigation
- [ ] Mobile review form bottom (showing buttons + nav)

---

## 🎨 Styling & Polish Check

### Typography
```
[ ] All headings use correct font (Space Grotesk or Crimson Text)
[ ] Text is readable (good contrast)
[ ] No text overflow or cutoff
[ ] Consistent font sizes across pages
```

### Colors & Branding
```
[ ] Primary color (orange/red) used consistently
[ ] Active navigation tabs use primary color
[ ] Buttons have correct styling
[ ] Cards have hover effects
[ ] Icons are correct color
```

### Spacing & Layout
```
[ ] Consistent padding/margins
[ ] No overlapping elements
[ ] Cards align properly
[ ] Forms have breathing room
[ ] Footer spacing is adequate
```

### Responsiveness
```
[ ] Desktop view (1920x1080) looks good
[ ] Tablet view (768x1024) looks good
[ ] Mobile view (375x667) looks good
[ ] No horizontal scroll on any view
```

---

## 🚨 Critical Visual Bugs to Watch For

### High Priority Issues
```
[ ] Text reads "Flavatix México" anywhere (should be just "Flavatix")
[ ] Text reads "Taste the World, One Sip at a Time" (old tagline)
[ ] Feature card says "Quick Tasting" instead of "Tasting Notes"
[ ] 5 tabs in navigation instead of 4
[ ] "Social" or "Create" tab appears
[ ] Review form buttons covered by navigation
[ ] Cannot scroll to bottom of review forms
```

### Medium Priority Issues
```
[ ] Wrong icon in navigation
[ ] Incorrect tab highlighting
[ ] Missing hover effects
[ ] Spacing issues between elements
[ ] Mobile view has layout problems
```

### Low Priority Issues
```
[ ] Minor font size inconsistencies
[ ] Color slightly off from design
[ ] Animation timing
```

---

## ✅ Final Visual QA Sign-Off

### Completion Checklist

**Phase 1 - Copy Changes**:
- [ ] Landing page: All text updated ✅
- [ ] Auth page: Branding changed ✅

**Phase 2 - Navigation**:
- [ ] All pages have 4-tab navigation ✅
- [ ] No "Social" tab anywhere ✅
- [ ] Correct tab highlighting ✅
- [ ] Taste page created and accessible ✅

**Phase 2 - Review Fixes**:
- [ ] Review form bottom buttons accessible ✅
- [ ] Prose review bottom buttons accessible ✅
- [ ] Adequate padding on both forms ✅

**Overall**:
- [ ] No critical visual bugs
- [ ] Consistent across all pages
- [ ] Mobile responsive
- [ ] All screenshots captured

---

## 📸 Screenshot Archive

**Required Screenshots** (save with descriptive names):

1. `01-landing-page-full.png` - Full landing page
2. `02-landing-tasting-notes-card.png` - Close-up of "Tasting Notes" card
3. `03-auth-page.png` - Auth page with new branding
4. `04-dashboard-navigation.png` - Dashboard with 4-tab navigation
5. `05-taste-page.png` - New Taste landing page
6. `06-review-landing.png` - Review options page
7. `07-structured-review-bottom.png` - **CRITICAL** Review form bottom showing buttons + nav
8. `08-prose-review-bottom.png` - **CRITICAL** Prose form bottom showing buttons + nav
9. `09-mobile-navigation.png` - Mobile view of navigation
10. `10-all-navigation-states.png` - Composite of all pages showing active tab

---

## 🎬 Video Recording Checklist (Optional)

For comprehensive visual verification:

```
Record screen while:
1. Loading landing page → scroll to bottom
2. Navigating to auth page
3. Logging in → landing on dashboard
4. Clicking each navigation tab (Home, Taste, Review, Wheels)
5. On Taste page, clicking both options
6. On Review page, opening structured review and scrolling to bottom
7. Opening prose review and scrolling to bottom
8. Demonstrating all 4 navigation tabs work

Duration: 2-3 minutes
Format: MP4 or MOV
Resolution: 1920x1080 minimum
```

---

**Visual QA Complete**: _________________ (Sign/Date)

**Next Step**: Proceed to full E2E testing with E2E_TESTING_GUIDE.md

---

Generated: October 2, 2025
Version: 1.0
For: Flavatix App Phase 1 & 2 Visual Verification

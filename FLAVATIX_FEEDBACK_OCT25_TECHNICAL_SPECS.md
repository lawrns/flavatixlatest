# Flavatix Feedback Oct 25 - Technical Specifications

## Overview
Technical specifications for implementing fixes based on user feedback from October 25, 2025.

---

## 1. Edit Profile - Profile Picture Upload Fix

**Issue**: Failed to upload profile picture

**Location**: `/pages/dashboard.tsx`, `/components/ProfileEdit.tsx`

**Implementation**:
- Add proper error handling for file uploads
- Verify Supabase Storage bucket configuration
- Validate file size (max 5MB) and MIME types (JPEG, PNG, WebP)
- Add user feedback notifications for success/failure
- Ensure RLS policies allow authenticated users to upload

**Priority**: High | **Effort**: 2-3 hours

---

## 2. Remove Banner Notifications

**Issue**: Banner notifications are intrusive

**Location**: `/components/Layout.tsx`, `/pages/_app.tsx`

**Implementation**:
- Remove or minimize banner notification component at top of dashboard
- Convert to subtle notification icon with badge count
- Update CSS for less intrusive styling

**Priority**: Medium | **Effort**: 1-2 hours

---

## 3. Quick Tasting - Remove AI Popup Notifications

**Issue**: AI popup notifications (console logs with emojis) are distracting

**Location**: `/pages/quick-tasting.tsx`, `/components/QuickTastingSession.tsx`

**Implementation**:
- Create logger utility that only logs in development mode
- Remove or conditionally display console logs (🔄, 📝, ✅, 👥, 👤)
- Replace console.log with proper logging utility
- Set log level based on environment (production vs development)

**Priority**: High | **Effort**: 2-3 hours

---

## 4. Quick Tasting - Scale Slider Visibility in Dark Mode

**Issue**: Can't see scale slider in dark mode

**Location**: `/components/QuickTastingSession.tsx`, `/styles/globals.css`

**Implementation**:
- Add dark mode styles for range input sliders
- Improve contrast for slider track and thumb
- Use CSS custom properties for dynamic value display
- Apply consistent styling across all sliders

**Priority**: High | **Effort**: 1-2 hours

---

## 5. My Tastings - Content Covered by Bottom Navigation

**Issue**: Content is covered by bottom navigation tab

**Location**: `/pages/my-tastings.tsx`, `/components/Layout.tsx`

**Implementation**:
- Add bottom padding to main content area (pb-24 on mobile, pb-8 on desktop)
- Ensure bottom navigation is fixed with proper z-index
- Make content scrollable with appropriate padding

**Priority**: High | **Effort**: 1 hour

---

## 6. Study Mode - Custom Category Input UX

**Issue**: Custom category field is separate; should be integrated into dropdown

**Location**: `/pages/taste/create/study/new.tsx`

**Implementation**:
- Replace separate dropdown and text input with single combobox
- Use Headless UI Combobox or native datalist
- Allow users to select from preset options or type custom category
- Show "Create [custom]" option when no match found

**Priority**: Medium | **Effort**: 2-3 hours

---

## 7. Study Mode - Scale Maximum Input Bug

**Issue**: Deleting last digit causes "5" to auto-populate and can't be erased

**Location**: `/pages/taste/create/study/new.tsx`

**Implementation**:
- Fix input validation to allow empty string temporarily
- Separate display value from actual value
- Only apply min/max constraints on blur, not on change
- Allow user to clear field and retype without auto-correction

**Priority**: Medium | **Effort**: 1-2 hours

---

## 8. Study Mode - "Start" Button Data Persistence

**Issue**: Start button navigates to page without saved categories

**Location**: `/pages/taste/create/study/new.tsx`, session initialization

**Implementation**:
- Ensure all form data is saved to database before navigation
- Save tasting configuration and all categories in transaction
- Verify tasting_categories table exists with proper schema
- Load categories when session starts
- Add error handling if categories not found

**Priority**: High | **Effort**: 3-4 hours

---

## 9. Review - Scale Slider Dark Mode (Same as #4)

**Issue**: Can't see scale slider background in dark mode

**Location**: `/pages/review/create.tsx`, `/components/ReviewForm.tsx`

**Implementation**:
- Apply same CSS fixes as Quick Tasting sliders
- Update all characteristic sliders (Aroma, Saltiness, Sweetness, Acidity, Umami, Spiciness, Flavor, Typicity, Complexity, Overall)
- Ensure consistent dark mode styling

**Priority**: High | **Effort**: 1 hour

---

## 10. Review - "Save for Later" Error

**Issue**: Save for later works but shows error when completing review

**Location**: `/pages/review/create.tsx`

**Implementation**:
- Fix save logic with proper error handling
- Validate minimum required fields before saving
- Use upsert to handle both insert and update cases
- Add proper error messages with details
- Verify reviews table schema and RLS policies
- Store review ID for later retrieval

**Priority**: High | **Effort**: 2-3 hours

---

## 11. Review - "New Review" Button Issue

**Issue**: "New Review" reloads previous review data instead of blank form

**Location**: `/pages/review/create.tsx`

**Implementation**:
- Create resetForm function to clear all fields
- Add confirmation dialog if unsaved changes exist
- Reset review ID when starting new review
- Scroll to top of form
- Alternative: Navigate to fresh route with query param

**Priority**: Medium | **Effort**: 1-2 hours

---

## 12. Flavor Wheel - Text Display Issue

**Issue**: "DID YOU_KNOW" shows underscore instead of space

**Location**: `/pages/flavor-wheels.tsx`, flavor wheel component

**Implementation**:
- Replace "DID YOU_KNOW" with "DID YOU KNOW" (proper spacing)
- Check for other text formatting issues in flavor wheel section
- Ensure proper text rendering in all UI elements

**Priority**: Low | **Effort**: 15 minutes

---

## Summary

### High Priority (7 items)
1. Profile picture upload fix
2. Remove AI console log notifications
3. Scale slider dark mode visibility (Quick Tasting)
4. My Tastings bottom padding
5. Study Mode start button data persistence
6. Review scale slider dark mode
7. Review save for later error

### Medium Priority (4 items)
1. Banner notifications removal
2. Custom category UX improvement
3. Scale maximum input bug
4. New review button reset

### Low Priority (1 item)
1. Flavor wheel text formatting

**Total Estimated Effort**: 20-28 hours

---

## Implementation Order

### Phase 1: Critical Fixes (8-10 hours)
1. Scale slider dark mode (both Quick Tasting and Review)
2. My Tastings bottom padding
3. Remove AI console notifications
4. Profile picture upload

### Phase 2: Data Persistence (5-7 hours)
1. Study Mode start button fix
2. Review save for later error
3. New review button reset

### Phase 3: UX Improvements (7-11 hours)
1. Custom category combobox
2. Scale maximum input fix
3. Banner notifications
4. Flavor wheel text fix

---

## Testing Checklist

- [ ] Profile picture uploads successfully in all formats
- [ ] No console log notifications appear in production
- [ ] Scale sliders visible in both light and dark modes
- [ ] My Tastings content not covered by bottom nav
- [ ] Study Mode saves all categories when starting
- [ ] Review "Save for Later" works without errors
- [ ] "New Review" button clears all fields
- [ ] Custom category can be typed or selected
- [ ] Scale maximum input allows proper editing
- [ ] Flavor wheel text displays correctly
- [ ] All changes work on mobile and desktop
- [ ] Dark mode works correctly for all components

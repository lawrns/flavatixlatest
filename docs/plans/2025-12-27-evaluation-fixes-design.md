# Flavatix Evaluation Fixes - Design Document

**Date**: 2025-12-27
**Status**: Approved
**Scope**: Comprehensive fix for all issues identified in the Flavatix Evaluation Report

## Overview

This design addresses all bugs, UI/UX issues, copy problems, and functionality gaps identified in the comprehensive evaluation report. The goal is to ship all fixes in one push, prioritized by user impact.

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Spanish messages | Implement proper i18n | Professional, scalable approach |
| Score scale | 0-100 | Display was showing wrong denominator |
| My Tastings improvements | Pagination + status filter | Minimal viable, avoids over-engineering |
| Slider defaults | Keep at 0, exclude untouched from averages | Honest data without added friction |
| Timeline | Ship it all | Comprehensive push |

---

## Section 1: Bug Fixes (Critical)

### 1.1 Score Format Fix
- **Problem**: Scores display as "52.0/5" instead of "52/100"
- **Fix**: Find all score display locations and change denominator to 100
- **Files**: Dashboard, My Tastings, tasting cards, review summaries

### 1.2 Average Score Calculation Bug
- **Problem**: Dashboard shows "0.0 Avg Score" despite having scored tastings
- **Fix**: Debug calculation logic - likely excluding valid scores or dividing incorrectly
- **Additional**: Implement "exclude untouched sliders" logic

### 1.3 Navigation Bug
- **Problem**: Clicking Recent Tasting card goes to Flavor Wheels instead of tasting details
- **Fix**: Correct the `href` or `onClick` handler on Dashboard tasting cards

### 1.4 Grammar in Descriptor Counts
- **Problem**: "1 descriptors" should be "1 descriptor"
- **Fix**: Add singular/plural logic to Flavor Wheels display

---

## Section 2: UI/UX Improvements

### 2.1 My Tastings Pagination & Filtering
- **Problem**: 50+ tastings in one scrollable list
- **Fix**:
  - Add pagination (20 items per page)
  - Add status filter dropdown (All / In Progress / Completed)
  - Consider encouraging unique session names via placeholder text

### 2.2 Profile Picture Consistency
- **Problem**: Dashboard shows landscape image, Edit Profile shows generic avatar, header dropdown shows initial
- **Fix**: Ensure profile picture state is fetched and displayed consistently across all 3 locations

### 2.3 Truncated Tags Fix
- **Problem**: Flavor Wheels top notes show duplicated, poorly truncated tags
- **Fix**:
  - Deduplicate tags before display
  - Show full tag text or use proper ellipsis with tooltip

### 2.4 Empty States
- **Problem**: No guidance when user has 0 followers/following
- **Fix**: Add helpful empty state messages like "Find tasters to follow" with action button

### 2.5 Slider Interaction Tracking
- **Problem**: Sliders at 0 get included in averages even when untouched
- **Fix**: Track which sliders user actually interacted with; exclude untouched from calculations

---

## Section 3: Copy Improvements

### 3.1 "Pivotal" Word Replacement
- **Problem**: "The world's most pivotal tasting app" is awkward
- **Fix**: Replace with "The world's most comprehensive tasting app"

### 3.2 "Danger Zone" Rename
- **Problem**: Developer jargon not suitable for consumer app
- **Fix**: Rename to "Delete Account" as standalone section in Settings

### 3.3 Internationalization (i18n)
- **Problem**: Spanish messages appear randomly, don't match user locale
- **Fix**:
  - Implement i18n framework (next-i18next or similar)
  - Extract all user-facing strings to translation files
  - Support English and Spanish initially
  - Messages match user's browser/app locale preference

---

## Section 4: Functionality Improvements

### 4.1 Customizable Quick Presets
- **Problem**: Whisky, Coffee, Mezcal presets are hardcoded
- **Fix**: Make presets user-configurable based on most-used categories or preferences in Settings

### 4.2 Auto-Regenerate Flavor Wheels
- **Problem**: Shows cache warning but should auto-update when data changes
- **Fix**: Detect when underlying tasting data has changed since last generation; auto-regenerate on page load if stale

### 4.3 Notification System Completion
- **Problem**: Notification bell icon exists but no dropdown or count
- **Fix**: Either implement notification dropdown with count badge, or remove icon until feature is ready

### 4.4 Session Cleanup
- **Problem**: Many abandoned "In Progress" sessions with 0 scored items
- **Fix**:
  - Add ability to bulk-delete or archive old sessions
  - Consider prompting users to complete or discard stale sessions

---

## Implementation Approach

### File Organization
Changes will span:
- **Pages**: `dashboard.tsx`, `my-tastings.tsx`, `flavor-wheels.tsx`, `settings.tsx`, `index.tsx`
- **Components**: Tasting cards, score displays, sliders, profile avatar, empty states
- **Lib**: Score calculation logic, i18n setup
- **Hooks**: Slider interaction tracking, pagination state

### Testing Strategy
- Unit tests for score calculation with untouched slider exclusion
- E2E tests for navigation (tasting click → correct page)
- Visual regression for score format changes

### Rollout Order
1. **Critical bugs** - Score format, avg calculation, navigation, grammar
2. **UI/UX fixes** - Pagination, profile pics, tags, empty states, sliders
3. **Copy improvements** - "Pivotal", "Danger Zone"
4. **Functionality** - Presets, auto-regenerate, notifications, session cleanup
5. **i18n** - Biggest scope, done last incrementally

---

## Success Criteria

- [ ] All scores display as X/100 format
- [ ] Dashboard avg score calculates correctly (excluding untouched sliders)
- [ ] Clicking tasting card navigates to tasting details
- [ ] "1 descriptor" grammar is correct
- [ ] My Tastings has pagination and status filter
- [ ] Profile picture consistent across app
- [ ] Tags not duplicated or poorly truncated
- [ ] Empty states guide users
- [ ] "Pivotal" replaced with "comprehensive"
- [ ] "Danger Zone" renamed
- [ ] i18n framework in place with EN/ES support
- [ ] Quick presets are customizable
- [ ] Flavor wheels auto-regenerate when stale
- [ ] Notification icon removed or functional
- [ ] Users can clean up abandoned sessions

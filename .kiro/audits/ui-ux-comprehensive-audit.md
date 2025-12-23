# Comprehensive UI/UX Audit Prompt

## Objective
Systematically identify and document all UI/UX shortcomings across the Flavatix application, with special focus on viewport handling, modal positioning, navigation alignment, and mobile responsiveness.

## Critical Areas to Investigate

### 1. Modal & Overlay Issues
**Investigate:**
- Modals appearing underneath navigation menus or other UI elements
- Z-index conflicts between modals, dropdowns, and fixed navigation
- Modal positioning relative to viewport (centering, overflow handling)
- Modal backdrop/overlay coverage and click-through issues
- Modal responsiveness on mobile devices (viewport height, keyboard appearance)
- Multiple modal stacking and focus management

**Files to check:**
- All modal components (`components/**/*Modal*.tsx`, `components/**/*Dialog*.tsx`)
- Overlay components
- Fixed/sticky navigation components
- Z-index usage across the codebase

**Test scenarios:**
- Open modal on mobile device
- Open modal when navigation is visible
- Open multiple modals
- Test with keyboard visible on mobile
- Test with different viewport heights

### 2. Navigation Menu Alignment Issues
**Investigate:**
- Vertical centering of menu items/icons
- Horizontal alignment of navigation elements
- Icon-to-text alignment in navigation bars
- Spacing consistency between navigation items
- Navigation bar height consistency
- Bottom navigation bar positioning and overlap issues

**Files to check:**
- Navigation components (`components/navigation/**`, `components/**/BottomNavigation*.tsx`)
- Header components with navigation
- Footer components

**Test scenarios:**
- Check alignment on different screen sizes
- Verify icon and text are vertically centered
- Check spacing between items
- Verify navigation doesn't overlap content

### 3. Viewport & Layout Issues
**Investigate:**
- Content overflow beyond viewport boundaries
- Fixed elements (nav bars, headers) covering content
- Viewport height calculations (100vh vs 100dvh)
- Safe area handling (notches, status bars on mobile)
- Horizontal scrolling on mobile (should be prevented)
- Content being cut off at viewport edges
- Proper use of viewport units (vh, vw, dvh, dvw)

**Files to check:**
- All page components (`pages/**/*.tsx`)
- Layout components
- Container components with max-width or fixed widths
- Components using viewport units

**Test scenarios:**
- Test on various screen sizes (320px to 1920px width)
- Test on various heights (short screens, tall screens)
- Test with mobile keyboard visible
- Test on devices with notches/safe areas
- Check for horizontal scroll

### 4. Mobile Responsiveness Issues
**Investigate:**
- Breakpoint usage and consistency
- Touch target sizes (minimum 44x44px)
- Text readability on small screens
- Form input sizing and spacing
- Button sizing and spacing
- Card/padding optimization for mobile
- Image optimization and sizing

**Files to check:**
- All components using responsive classes
- Form components
- Button components
- Card components

**Test scenarios:**
- Test all breakpoints (mobile, tablet, desktop)
- Verify touch targets are adequate
- Check text is readable without zooming
- Verify forms are usable on mobile

### 5. Spacing & Layout Consistency
**Investigate:**
- Inconsistent padding/margin usage
- Grid and flex layout issues
- Alignment inconsistencies
- Gap spacing in grids/flex containers
- Content width constraints (max-width usage)

**Files to check:**
- All components using spacing utilities
- Grid layouts
- Flex layouts

**Test scenarios:**
- Visual inspection of spacing consistency
- Check alignment across similar components
- Verify grid gaps are appropriate

### 6. Overflow & Text Handling
**Investigate:**
- Text overflow without truncation
- Long words breaking layouts
- Missing `overflow-hidden` on containers
- Scrollable containers without proper constraints
- Text wrapping issues

**Files to check:**
- Components displaying user-generated content
- List components
- Card components with text

**Test scenarios:**
- Test with very long text strings
- Test with special characters
- Test with different languages

### 7. Fixed/Sticky Element Issues
**Investigate:**
- Fixed navigation covering content
- Sticky headers overlapping content
- Bottom navigation covering content
- Proper padding/margin to account for fixed elements
- Z-index stacking context issues

**Files to check:**
- Fixed navigation components
- Sticky header components
- Page layouts with fixed elements

**Test scenarios:**
- Scroll pages with fixed navigation
- Check content isn't hidden behind fixed elements
- Verify proper spacing for fixed elements

### 8. Interactive Element Issues
**Investigate:**
- Button states (hover, active, disabled) not visible
- Focus states missing or inadequate
- Click/tap area too small
- Disabled state not clear
- Loading states not visible

**Files to check:**
- Button components
- Link components
- Interactive elements

**Test scenarios:**
- Test all interactive states
- Verify focus indicators
- Check touch targets

## Investigation Methodology

1. **Code Analysis:**
   - Search for z-index usage: `grep -r "z-index" components/ pages/`
   - Search for fixed/sticky positioning: `grep -r "fixed\|sticky" components/ pages/`
   - Search for viewport units: `grep -r "vh\|vw\|dvh\|dvw" components/ pages/`
   - Search for modal components: `find components -name "*Modal*" -o -name "*Dialog*"`
   - Search for navigation components: `find components -name "*Nav*" -o -name "*Menu*"`

2. **Visual Testing:**
   - Test on actual mobile devices (iOS Safari, Android Chrome)
   - Test on various screen sizes using browser dev tools
   - Test with keyboard visible
   - Test with different viewport heights
   - Test scrolling behavior

3. **Component Audit:**
   - List all modals and their z-index values
   - List all fixed/sticky elements and their z-index values
   - Document viewport unit usage
   - Document breakpoint usage

4. **Issue Documentation:**
   For each issue found, document:
   - Component/file location
   - Issue description
   - Steps to reproduce
   - Expected behavior
   - Current behavior
   - Screenshots if applicable
   - Priority (Critical, High, Medium, Low)

## Specific Issues to Look For

### Modal Issues:
- [ ] Modals with z-index < 1000 (should be higher)
- [ ] Modals without backdrop/overlay
- [ ] Modals not centered vertically/horizontally
- [ ] Modals overflowing viewport
- [ ] Modals appearing behind navigation
- [ ] Multiple modals without proper stacking

### Navigation Issues:
- [ ] Icons not vertically centered with text
- [ ] Inconsistent spacing between nav items
- [ ] Navigation covering content
- [ ] Bottom nav overlapping page content
- [ ] Navigation not respecting safe areas

### Viewport Issues:
- [ ] Using `100vh` instead of `100dvh` on mobile
- [ ] Fixed elements not accounting for safe areas
- [ ] Content overflow beyond viewport
- [ ] Horizontal scroll on mobile
- [ ] Content cut off at edges

### Layout Issues:
- [ ] Missing `min-w-0` on flex items
- [ ] Missing `overflow-hidden` on containers
- [ ] Text without `truncate` or `break-words`
- [ ] Inconsistent padding/margin
- [ ] Grid gaps too large on mobile

## Expected Output

Create a comprehensive report with:
1. **Issue Inventory:** List of all found issues categorized by type
2. **Priority Matrix:** Critical issues that block functionality
3. **Component Map:** Which components have issues
4. **Fix Recommendations:** Specific code changes needed
5. **Testing Checklist:** Items to verify after fixes

## Tools & Commands

```bash
# Find all z-index usage
grep -rn "z-index" components/ pages/ --include="*.tsx" --include="*.ts" | sort -t: -k2 -n

# Find all fixed/sticky positioning
grep -rn "fixed\|sticky" components/ pages/ --include="*.tsx" --include="*.ts"

# Find all viewport units
grep -rn "vh\|vw\|dvh\|dvw" components/ pages/ --include="*.tsx" --include="*.ts"

# Find modal components
find components -type f \( -name "*Modal*" -o -name "*Dialog*" -o -name "*Overlay*" \)

# Find navigation components
find components -type f \( -name "*Nav*" -o -name "*Menu*" -o -name "*Header*" -o -name "*Footer*" \)

# Find components using flex/grid
grep -rn "flex\|grid" components/ --include="*.tsx" | grep -i "className"
```

## Success Criteria

The audit is complete when:
- [ ] All modals properly positioned and layered
- [ ] All navigation elements properly aligned
- [ ] No content overflow beyond viewport
- [ ] All fixed elements properly accounted for
- [ ] Mobile experience is fully functional
- [ ] All interactive elements have proper states
- [ ] Consistent spacing and layout throughout


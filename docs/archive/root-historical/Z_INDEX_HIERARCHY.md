# Z-Index Hierarchy Strategy

## Problem
Multiple components use `z-50`, causing modals to appear underneath navigation and other UI elements.

## Solution: Layered Z-Index System

```
z-[100]  - Critical overlays (full-screen modals, alerts, dialogs)
z-[90]   - Toasts and notifications
z-[80]   - Dropdowns and popovers
z-[70]   - Tooltips
z-[60]   - Bottom sheets
z-50     - Bottom navigation, fixed footers
z-40     - Sticky headers, floating action buttons
z-30     - PWA install banners
z-20     - Sidebars and drawers
z-10     - Regular content overlays
z-0      - Base content
```

## Component Mapping

### z-[100] - Critical Overlays
- AlertDialog (overlay & content)
- Modal (full-screen)
- BarcodeScanner
- CommentsModal
- ShareButton modal
- Delete confirmation dialogs
- Category selector modals

### z-50 - Navigation/Fixed Elements
- BottomNavigation
- Fixed footers on pages
- Offline indicator (PWA)

### z-40 - Sticky/Floating Elements
- AppShell header
- PWA install banner

### z-10 - Minor Overlays
- Flavor wheel tooltip

## Implementation Plan
1. Update all modals/dialogs to z-[100]
2. Keep bottom nav and footers at z-50
3. Ensure sticky headers stay at z-40
4. Update PWA banners to z-30

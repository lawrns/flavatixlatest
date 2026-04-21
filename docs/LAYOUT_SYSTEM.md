# Flavatix Layout System

This document describes the unified layout system for consistent page structure and width across the Flavatix app.

## Core Components

### `PageLayout`
The primary wrapper for authenticated app pages. Provides:
- Consistent background color
- Optional sticky header with title/subtitle
- Back navigation
- Bottom navigation with safe area padding

```tsx
import { PageLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <PageLayout
      title="Page Title"
      subtitle="Optional description"
      showBack
      backUrl="/dashboard"
      containerSize="xl"
      headerRight={<button>Action</button>}
    >
      {/* Page content */}
    </PageLayout>
  );
}
```

**Props:**
- `title`: Page title for header
- `subtitle`: Optional subtitle/description
- `showBack`: Show back button (default: false)
- `backUrl`: Custom back URL (defaults to router.back())
- `headerRight`: Right side header content
- `showBottomNav`: Show bottom navigation (default: true)
- `containerSize`: Container max-width (default: `xl`)

### `Container`
The single source of truth for content width and horizontal padding.

```tsx
import { Container } from '@/components/layout';

<Container size="xl" padding>
  {/* Content */}
</Container>
```

**Sizes:**
| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 384px | Modals, narrow forms |
| `md` | 448px | Compact content |
| `lg` | 512px | Slightly wider content |
| `xl` | 576px | Standard app shell width (default) |
| `2xl` | 672px | Dense authenticated pages, forms, review/settings/profile surfaces |
| `4xl` | 896px | Very wide content, data tables, visualizations |
| `7xl` | 1280px | Marketing / landing sections |
| `full` | No limit | Edge-to-edge content |

**Padding:**
- Default: `px-4 sm:px-6` (16px mobile, 24px tablet+)
- Set `padding={false}` for edge-to-edge content

### `Stack`
Vertical spacing utility for consistent gaps.

```tsx
import { Stack } from '@/components/layout';

<Stack gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</Stack>
```

**Gaps:**
| Gap | Spacing |
|-----|---------|
| `none` | 0 |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px (default) |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 48px |

### `Section`
Content section with optional title.

```tsx
import { Section } from '@/components/layout';

<Section title="Recent Activity" subtitle="Your latest tastings">
  {/* Section content */}
</Section>
```

## Current Usage Notes

- Use `PageLayout` for authenticated pages that should inherit the shared shell and bottom navigation.
- Use `Container size="7xl"` for landing and marketing sections.
- Use `Container size="2xl"` for review, settings, profile, create/join, and other denser work surfaces.
- Use `Container size="4xl"` for wheel visualizations and other wide content blocks.

## Migration Guide

### Before (inconsistent)
```tsx
// ❌ Avoid: Different max-widths and padding across pages
<div className="max-w-4xl mx-auto px-4 py-8">
<div className="max-w-md mx-auto px-6 py-6">
<div className="container mx-auto px-md py-lg">
```

### After (unified)
```tsx
// ✅ Use PageLayout for full page structure
<PageLayout title="My Page" containerSize="xl">
  <Stack gap="lg">
    <Section title="Section 1">...</Section>
    <Section title="Section 2">...</Section>
  </Stack>
</PageLayout>

// ✅ Use Container for custom layouts
<Container size="2xl">
  <Stack gap="md">...</Stack>
</Container>
```

## Best Practices

1. **Always use PageLayout** for authenticated app pages
2. **Use Container** when you need a different width than the page default
3. **Use Stack** instead of ad-hoc `space-y-*` classes
4. **Use Section** for titled content groups
5. **Never hardcode max-width** - use the size prop
6. **Keep landing pages wider than app pages** - use `7xl` for marketing sections
7. **Keep dense work surfaces intentional** - `2xl` is the common choice for review/settings/profile flows

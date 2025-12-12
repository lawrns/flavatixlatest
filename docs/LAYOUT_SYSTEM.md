# Flavatix Layout System

This document describes the unified layout system for consistent page structure and width across the Flavatix app.

## Core Components

### `PageLayout`
The primary wrapper for all authenticated app pages. Provides:
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
      containerSize="md"
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
- `containerSize`: Container max-width (default: 'md')

### `Container`
The single source of truth for content width and horizontal padding.

```tsx
import { Container } from '@/components/layout';

<Container size="md" padding>
  {/* Content */}
</Container>
```

**Sizes:**
| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 384px | Modals, narrow forms |
| `md` | 448px | Mobile-first content (default) |
| `lg` | 512px | Slightly wider content |
| `xl` | 576px | Standard content width |
| `2xl` | 672px | Wide content, forms |
| `4xl` | 896px | Very wide content, data tables |
| `7xl` | 1280px | Full-width layouts |
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
<PageLayout title="My Page" containerSize="md">
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

## Width Guidelines

| Page Type | Recommended Size |
|-----------|------------------|
| Dashboard, Taste, Review | `md` (448px) |
| Forms, Settings | `md` or `lg` |
| My Tastings, History | `2xl` (672px) |
| Flavor Wheels, Data viz | `4xl` (896px) |
| Landing page sections | `7xl` (1280px) |

## Best Practices

1. **Always use PageLayout** for authenticated app pages
2. **Use Container** when you need a different width than the page default
3. **Use Stack** instead of ad-hoc `space-y-*` classes
4. **Use Section** for titled content groups
5. **Never hardcode max-width** - use the size prop
6. **Consistent gutters** - Container handles padding automatically

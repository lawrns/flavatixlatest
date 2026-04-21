# Flavatix Component Catalog

## Table of Contents

1. [Overview](#overview)
2. [Design System Components](#design-system-components)
3. [Layout Components](#layout-components)
4. [Feature Components](#feature-components)
5. [Accessibility Guidelines](#accessibility-guidelines)
6. [Component Usage Examples](#component-usage-examples)

---

## Overview

This document catalogs all reusable components in Flavatix, providing prop definitions, usage examples, and accessibility notes. All components follow the Gemini Design System principles and are built with TypeScript for type safety.

### Component Organization

```
/components/
├── ui/                    # Atomic UI components
├── layout/                # Layout and structure
├── quick-tasting/         # Tasting session components
├── review/                # Review and rating components
├── flavor-wheels/         # Flavor visualization
├── social/                # Social features
├── auth/                  # Authentication
├── profile/               # User profile
└── navigation/            # Navigation components
```

---

## Design System Components

### Button

**Location:** `/components/ui/Button.tsx`

**Description:** Primary interactive element with multiple variants following Gemini design principles.

**Props:**

| Prop           | Type                                                                                                | Default     | Description                            |
| -------------- | --------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `variant`      | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'success' \| 'gradient' \| 'link'` | `'primary'` | Visual style variant                   |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'icon'`                                                            | `'md'`      | Size of button                         |
| `pill`         | `boolean`                                                                                           | `false`     | Enable full rounded (pill) style       |
| `fullWidth`    | `boolean`                                                                                           | `false`     | Expand to full container width         |
| `loading`      | `boolean`                                                                                           | `false`     | Show loading spinner                   |
| `disabled`     | `boolean`                                                                                           | `false`     | Disable button interaction             |
| `icon`         | `ReactNode`                                                                                         | -           | Icon to display                        |
| `iconPosition` | `'left' \| 'right'`                                                                                 | `'left'`    | Position of icon                       |
| `ripple`       | `boolean`                                                                                           | `false`     | Enable Material Design ripple effect   |
| `asChild`      | `boolean`                                                                                           | `false`     | Render as child component (Radix Slot) |

**Variants:**

```typescript
// Primary - Solid background with brand color
<Button variant="primary">Save</Button>

// Secondary - Subtle gray background
<Button variant="secondary">Cancel</Button>

// Outline - Transparent with border
<Button variant="outline">Learn More</Button>

// Ghost - Minimal, no background
<Button variant="ghost">Skip</Button>

// Danger - Red for destructive actions
<Button variant="danger">Delete</Button>

// Success - Green for positive actions
<Button variant="success">Complete</Button>

// Gradient - Primary to accent gradient
<Button variant="gradient">Get Started</Button>

// Link - Text link style
<Button variant="link">View Details</Button>
```

**Accessibility:**

- Minimum touch target: 44x44px (meets WCAG AA)
- Focus indicator visible
- Disabled state with `aria-disabled`
- Loading state with `aria-busy`

**Example:**

```tsx
import { Button } from '@/components/ui/Button';
import { Save, Trash2 } from 'lucide-react';

// Basic usage
<Button>Click Me</Button>

// With icon
<Button icon={<Save />} iconPosition="left">
  Save Changes
</Button>

// Loading state
<Button loading loadingText="Saving...">
  Save
</Button>

// Full width on mobile
<Button fullWidth className="md:w-auto">
  Continue
</Button>

// Danger action
<Button variant="danger" icon={<Trash2 />}>
  Delete Account
</Button>
```

---

### Card

**Location:** `/components/ui/Card.tsx`

**Description:** Container component with multiple visual styles for grouping content.

**Props:**

| Prop          | Type                                                                                                  | Default     | Description                  |
| ------------- | ----------------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| `variant`     | `'default' \| 'tasting' \| 'elevated' \| 'outlined' \| 'glass' \| 'gradient' \| 'social' \| 'gemini'` | `'default'` | Visual style variant         |
| `hover`       | `boolean`                                                                                             | `true`      | Enable hover effects         |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                              | `'md'`      | Internal padding             |
| `glowBorder`  | `boolean`                                                                                             | `false`     | Add animated gradient border |
| `animate`     | `boolean`                                                                                             | `false`     | Animate on mount             |
| `interactive` | `boolean`                                                                                             | `false`     | Make card clickable          |

**Variants:**

```typescript
// Default - Clean gray background (Gemini style)
<Card variant="default">Content</Card>

// Tasting - With accent bar at top
<Card variant="tasting">Tasting Details</Card>

// Elevated - Strong shadow
<Card variant="elevated">Important Content</Card>

// Outlined - Border only, no background
<Card variant="outlined">Optional Info</Card>

// Glass - Frosted glass effect
<Card variant="glass">Modal Content</Card>

// Gradient - Subtle gradient background
<Card variant="gradient">Featured Item</Card>

// Social - Optimized for social posts
<Card variant="social">User Post</Card>
```

**Accessibility:**

- Interactive cards have `role="button"` and keyboard support
- Focus indicator visible
- `aria-label` for interactive cards

**Example:**

```tsx
import { Card } from '@/components/ui/Card';

// Basic card
<Card>
  <h3>Title</h3>
  <p>Content goes here</p>
</Card>

// Interactive card
<Card
  interactive
  onClick={handleClick}
  aria-label="View tasting details"
  hover
>
  <h3>My Tasting</h3>
  <p>Click to view</p>
</Card>

// Tasting card with glow border
<Card variant="tasting" glowBorder animate>
  <h3>Featured Tasting</h3>
  <p>Wine tasting session</p>
</Card>

// No padding (for images)
<Card padding="none">
  <img src="/photo.jpg" alt="Tasting photo" />
</Card>
```

---

### Modal

**Location:** `/components/ui/Modal.tsx`

**Description:** Dialog component for overlaying content, following Gemini modal patterns.

**Props:**

| Prop                  | Type                                     | Default     | Description                      |
| --------------------- | ---------------------------------------- | ----------- | -------------------------------- |
| `isOpen`              | `boolean`                                | `false`     | Control modal visibility         |
| `onClose`             | `() => void`                             | -           | Callback when modal closes       |
| `title`               | `string`                                 | -           | Modal title                      |
| `size`                | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`      | Modal width                      |
| `showCloseButton`     | `boolean`                                | `true`      | Show X button in top-right       |
| `closeOnEscape`       | `boolean`                                | `true`      | Close on Esc key                 |
| `closeOnOutsideClick` | `boolean`                                | `true`      | Close when clicking backdrop     |
| `footer`              | `ReactNode`                              | -           | Footer content (usually buttons) |
| `variant`             | `'default' \| 'danger'`                  | `'default'` | Visual style variant             |

**Accessibility:**

- Focus trap (tab stays within modal)
- Focus returns to trigger on close
- `aria-modal="true"`
- `role="dialog"`
- Keyboard navigation (Esc to close)

**Example:**

```tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
}
```

---

### LoadingSpinner

**Location:** `/components/ui/LoadingSpinner.tsx`

**Description:** Animated loading indicator.

**Props:**

| Prop    | Type                   | Default     | Description                           |
| ------- | ---------------------- | ----------- | ------------------------------------- |
| `size`  | `'sm' \| 'md' \| 'lg'` | `'md'`      | Spinner size                          |
| `color` | `string`               | `'primary'` | Color variant                         |
| `text`  | `string`               | -           | Loading text to display below spinner |

**Example:**

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Basic spinner
<LoadingSpinner />

// With text
<LoadingSpinner size="lg" text="Loading tastings..." />

// Custom color
<LoadingSpinner color="accent" />
```

---

### EmptyState

**Location:** `/components/ui/EmptyState.tsx`

**Description:** Placeholder for empty states with icon and action.

**Props:**

| Prop          | Type        | Default | Description        |
| ------------- | ----------- | ------- | ------------------ |
| `icon`        | `ReactNode` | -       | Icon to display    |
| `title`       | `string`    | -       | Empty state title  |
| `description` | `string`    | -       | Description text   |
| `action`      | `ReactNode` | -       | Action button/link |

**Example:**

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { Wine } from 'lucide-react';
import { Button } from '@/components/ui/Button';

<EmptyState
  icon={<Wine className="w-12 h-12 text-primary" />}
  title="No Tastings Yet"
  description="Create your first tasting session to get started"
  action={
    <Button variant="primary" href="/create-tasting">
      Create Tasting
    </Button>
  }
/>;
```

---

### ScoreRing

**Location:** `/components/ui/ScoreRing.tsx`

**Description:** Circular progress indicator for scores.

**Props:**

| Prop          | Type      | Default | Description                             |
| ------------- | --------- | ------- | --------------------------------------- |
| `score`       | `number`  | -       | Score value (0-100)                     |
| `size`        | `number`  | `120`   | Diameter in pixels                      |
| `strokeWidth` | `number`  | `8`     | Width of ring stroke                    |
| `showLabel`   | `boolean` | `true`  | Show score number inside                |
| `color`       | `string`  | -       | Custom color (auto by score if not set) |

**Example:**

```tsx
import { ScoreRing } from '@/components/ui/ScoreRing';

// Basic usage
<ScoreRing score={85} />

// Custom size and color
<ScoreRing score={92} size={160} color="gold" />

// No label
<ScoreRing score={70} showLabel={false} />
```

---

### FlavorPill

**Location:** `/components/ui/FlavorPill.tsx`

**Description:** Colored badge for flavor descriptors.

**Props:**

| Prop        | Type                   | Default   | Description                 |
| ----------- | ---------------------- | --------- | --------------------------- |
| `label`     | `string`               | -         | Flavor text                 |
| `category`  | `string`               | -         | Category (determines color) |
| `variant`   | `'solid' \| 'outline'` | `'solid'` | Visual style                |
| `removable` | `boolean`              | `false`   | Show remove button          |
| `onRemove`  | `() => void`           | -         | Callback when removed       |

**Example:**

```tsx
import { FlavorPill } from '@/components/ui/FlavorPill';

// Basic flavor pill
<FlavorPill label="Fruity" category="fruity" />

// Removable
<FlavorPill
  label="Cherry"
  category="fruity"
  removable
  onRemove={handleRemove}
/>

// Outline variant
<FlavorPill label="Floral" category="floral" variant="outline" />
```

---

### CategoryStamp

**Location:** `/components/ui/CategoryStamp.tsx`

**Description:** Category badge with icon and label.

**Props:**

| Prop       | Type                   | Default | Description   |
| ---------- | ---------------------- | ------- | ------------- |
| `category` | `string`               | -       | Category name |
| `icon`     | `ReactNode`            | -       | Category icon |
| `size`     | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size variant  |

**Example:**

```tsx
import { CategoryStamp } from '@/components/ui/CategoryStamp';
import { Wine, Coffee } from 'lucide-react';

<CategoryStamp category="Wine" icon={<Wine />} />
<CategoryStamp category="Coffee" icon={<Coffee />} size="lg" />
```

---

## Layout Components

### Container

**Location:** `/components/layout/Container.tsx`

**Description:** Responsive container with max-width constraints.

**Props:**

| Prop      | Type                                     | Default | Description            |
| --------- | ---------------------------------------- | ------- | ---------------------- |
| `size`    | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'lg'`  | Max width              |
| `padding` | `boolean`                                | `true`  | Add horizontal padding |
| `center`  | `boolean`                                | `true`  | Center horizontally    |

**Example:**

```tsx
import Container from '@/components/layout/Container';

<Container size="md">
  <h1>Page Title</h1>
  <p>Content goes here</p>
</Container>;
```

---

### Navigation

**Location:** `/components/layout/Navigation.tsx`

**Description:** Top navigation bar with responsive menu.

**Features:**

- Responsive (hamburger menu on mobile)
- User menu with dropdown
- Dark mode toggle
- Notifications badge

**Example:**

```tsx
import Navigation from '@/components/layout/Navigation';

<Navigation />;
```

---

## Feature Components

### QuickTastingSession

**Location:** `/components/quick-tasting/QuickTastingSession.tsx`

**Description:** Main component for managing tasting sessions.

**Props:**

| Prop            | Type                                | Default | Description           |
| --------------- | ----------------------------------- | ------- | --------------------- |
| `session`       | `TastingSession`                    | -       | Session data          |
| `phase`         | `'setup' \| 'tasting' \| 'summary'` | -       | Current phase         |
| `onPhaseChange` | `(phase) => void`                   | -       | Phase change callback |

**Features:**

- Real-time item updates
- Auto-save on change (debounced)
- Photo upload support
- Collaborative editing (Study Mode)

**Example:**

```tsx
import QuickTastingSession from '@/components/quick-tasting/QuickTastingSession';

<QuickTastingSession session={session} phase="tasting" onPhaseChange={setPhase} />;
```

---

### TastingItem

**Location:** `/components/quick-tasting/TastingItem.tsx`

**Description:** Form for individual tasting item.

**Props:**

| Prop         | Type                 | Default   | Description           |
| ------------ | -------------------- | --------- | --------------------- |
| `item`       | `TastingItem`        | -         | Item data             |
| `itemNumber` | `number`             | -         | Item number (display) |
| `onUpdate`   | `(updates) => void`  | -         | Update callback       |
| `onDelete`   | `() => void`         | -         | Delete callback       |
| `mode`       | `'quick' \| 'study'` | `'quick'` | Tasting mode          |

**Features:**

- Debounced auto-save (300ms)
- Photo upload with preview
- Characteristic sliders (0-100 scale)
- Text areas for notes
- Overall score slider

**Example:**

```tsx
import TastingItem from '@/components/quick-tasting/TastingItem';

<TastingItem
  item={item}
  itemNumber={1}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  mode="quick"
/>;
```

---

### CharacteristicSlider

**Location:** `/components/review/CharacteristicSlider.tsx`

**Description:** Slider for rating sensory characteristics.

**Props:**

| Prop        | Type              | Default | Description           |
| ----------- | ----------------- | ------- | --------------------- |
| `label`     | `string`          | -       | Characteristic name   |
| `value`     | `number`          | `0`     | Current value (0-100) |
| `onChange`  | `(value) => void` | -       | Change callback       |
| `min`       | `number`          | `0`     | Minimum value         |
| `max`       | `number`          | `100`   | Maximum value         |
| `step`      | `number`          | `1`     | Step size             |
| `showValue` | `boolean`         | `true`  | Show numeric value    |
| `color`     | `string`          | -       | Track color           |

**Features:**

- Touch-friendly (large thumb)
- Keyboard accessible (arrow keys)
- Live value display
- Color-coded by value

**Example:**

```tsx
import CharacteristicSlider from '@/components/review/CharacteristicSlider';

<CharacteristicSlider label="Sweetness" value={sweetness} onChange={setSweetness} color="amber" />;
```

---

### FlavorWheel

**Location:** `/components/flavor-wheels/FlavorWheel.tsx`

**Description:** D3.js visualization of flavor descriptors.

**Props:**

| Prop            | Type               | Default | Description           |
| --------------- | ------------------ | ------- | --------------------- |
| `data`          | `FlavorWheelData`  | -       | Wheel data            |
| `size`          | `number`           | `600`   | Diameter in pixels    |
| `interactive`   | `boolean`          | `true`  | Enable interactions   |
| `onSectorClick` | `(sector) => void` | -       | Sector click callback |

**Features:**

- Hierarchical visualization
- Color-coded by category
- Interactive (hover/click)
- Export as PNG/PDF
- Responsive sizing

**Example:**

```tsx
import FlavorWheel from '@/components/flavor-wheels/FlavorWheel';

<FlavorWheel data={wheelData} size={800} interactive onSectorClick={handleSectorClick} />;
```

---

### BarcodeScanner

**Location:** `/components/BarcodeScanner.tsx`

**Description:** Camera-based barcode scanner.

**Props:**

| Prop      | Type              | Default | Description           |
| --------- | ----------------- | ------- | --------------------- |
| `onScan`  | `(code) => void`  | -       | Scan success callback |
| `onError` | `(error) => void` | -       | Error callback        |
| `active`  | `boolean`         | `false` | Enable scanner        |

**Features:**

- Uses device camera
- Supports UPC/EAN codes
- Real-time detection
- Error handling

**Example:**

```tsx
import BarcodeScanner from '@/components/BarcodeScanner';

<BarcodeScanner active={isScannerActive} onScan={handleScan} onError={handleError} />;
```

---

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support keyboard navigation:

**Buttons:**

- `Enter` or `Space` to activate
- Focus indicator visible

**Modals:**

- `Esc` to close
- Focus trapped within modal
- Tab order logical

**Sliders:**

- Arrow keys to adjust value
- `Home`/`End` for min/max
- `Page Up`/`Page Down` for large steps

---

### Screen Reader Support

**Labels:**

- All inputs have associated labels
- Use `aria-label` for icon-only buttons
- Use `aria-describedby` for help text

**Live Regions:**

- Toast notifications use `role="alert"`
- Loading states use `aria-live="polite"`

**Semantic HTML:**

- Use `<nav>`, `<main>`, `<article>` appropriately
- Headings follow hierarchy (h1 → h2 → h3)

---

### Color Contrast

**Text:**

- Body text: 4.5:1 minimum (WCAG AA)
- Large text (18pt+): 3:1 minimum

**Interactive Elements:**

- Buttons: 3:1 against background
- Links: 3:1 against background

**Testing:**

- Use Chrome DevTools Lighthouse
- Test with color blindness simulators

---

### Touch Targets

**Minimum Size:**

- Buttons: 44x44px
- Links: 44x44px (with padding)
- Icons: 44x44px hit area

**Spacing:**

- 8px minimum between targets
- 16px recommended for better UX

---

## Component Usage Examples

### Form with Validation

```tsx
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function TastingForm() {
  const [sessionName, setSessionName] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!sessionName) newErrors.sessionName = 'Required';
    if (!category) newErrors.category = 'Required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="sessionName">Session Name</label>
        <input
          id="sessionName"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          aria-invalid={!!errors.sessionName}
          aria-describedby={errors.sessionName ? 'sessionName-error' : undefined}
        />
        {errors.sessionName && (
          <p id="sessionName-error" role="alert">
            {errors.sessionName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-invalid={!!errors.category}
        >
          <option value="">Select...</option>
          <option value="wine">Wine</option>
          <option value="coffee">Coffee</option>
        </select>
        {errors.category && (
          <p id="category-error" role="alert">
            {errors.category}
          </p>
        )}
      </div>

      <Button type="submit">Create Tasting</Button>
    </form>
  );
}
```

---

### Confirmation Dialog

```tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

function DeleteConfirmation({ isOpen, onClose, onConfirm, itemName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      variant="danger"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-medium">Are you sure you want to delete "{itemName}"?</p>
          <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
        </div>
      </div>
    </Modal>
  );
}
```

---

### Loading States

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';

function TastingList({ tastings, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading tastings..." />
      </div>
    );
  }

  if (tastings.length === 0) {
    return (
      <EmptyState
        icon={<Wine />}
        title="No Tastings Yet"
        description="Create your first tasting to get started"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tastings.map((tasting) => (
        <Card key={tasting.id} variant="tasting" interactive>
          <h3>{tasting.session_name}</h3>
          <p>{tasting.category}</p>
        </Card>
      ))}
    </div>
  );
}
```

---

### Responsive Layout

```tsx
import Container from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';

function ResponsivePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile: single column, Desktop: two columns */}
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content (2/3 on desktop) */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="lg">
              <h1 className="text-h1">Main Content</h1>
              <p>Content goes here...</p>
            </Card>
          </div>

          {/* Sidebar (1/3 on desktop) */}
          <aside className="space-y-4">
            <Card variant="default" padding="md">
              <h2 className="text-h3">Sidebar</h2>
              <p>Related info...</p>
            </Card>
          </aside>
        </div>
      </Container>
    </div>
  );
}
```

---

## Testing Components

### Unit Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(
      <Button loading loadingText="Saving...">
        Save
      </Button>
    );
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});
```

---

## Component Best Practices

### 1. Prop Naming Conventions

```tsx
// Use descriptive names
<Button onClick={handleSave}>Save</Button> // Good
<Button handler={handleSave}>Save</Button> // Bad

// Boolean props should start with is/has/should
<Card interactive /> // Good
<Card clickable /> // Less clear

// Event handlers start with 'on'
<Modal onClose={handleClose} /> // Good
<Modal close={handleClose} /> // Bad
```

---

### 2. Default Props

```tsx
// Provide sensible defaults
<Button size="md" variant="primary" /> // Explicitly set
<Button /> // Uses defaults

// Use defaultProps or default parameters
const Button = ({ size = 'md', variant = 'primary' }) => {
  // ...
};
```

---

### 3. Composition over Complexity

```tsx
// Good: Composable
<Card variant="tasting">
  <CardHeader title="Session Name" />
  <CardBody>Content</CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Bad: Too many props
<Card
  title="Session Name"
  content="Content"
  action={<Button>Action</Button>}
  variant="tasting"
/>
```

---

### 4. TypeScript for Type Safety

```tsx
// Define clear prop types
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = (props) => {
  // Implementation
};
```

---

## Conclusion

This catalog provides a comprehensive reference for all components in Flavatix. When creating new components:

1. **Follow Gemini Design System** principles
2. **Ensure accessibility** (WCAG AA compliance)
3. **Provide TypeScript types** for all props
4. **Write usage examples** and tests
5. **Document accessibility** features
6. **Use consistent naming** conventions

For questions or additions to this catalog, contact the development team.

---

**Last Updated:** January 2026
**Document Version:** 1.0
**Maintainer:** Development Team

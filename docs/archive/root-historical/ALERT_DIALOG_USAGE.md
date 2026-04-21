# AlertDialog Usage Guide

This guide shows how to replace `window.confirm()` with the new AlertDialog component system.

## Overview

The AlertDialog system provides:
- **Promise-based API** - Use async/await instead of blocking dialogs
- **Customizable** - Configure title, description, and button text
- **Accessible** - Built on Radix UI with full keyboard navigation
- **Styled** - Gemini design with 22px border radius

## Basic Usage

### 1. Import the hook

```tsx
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
```

### 2. Initialize in your component

```tsx
const { confirm, Dialog } = useDeleteConfirmation({
  title: 'Delete Item?',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
});
```

### 3. Render the Dialog component

Add the Dialog component to your JSX (typically at the end of your component):

```tsx
return (
  <div>
    {/* Your component content */}
    <Dialog />
  </div>
);
```

### 4. Call confirm() when needed

```tsx
const handleDelete = async () => {
  const confirmed = await confirm();
  if (!confirmed) return;

  // Proceed with deletion
  await deleteItem();
};
```

## Migration Examples

### Example 1: QuickTastingSession.tsx (Line 274)

**Before:**
```tsx
const handleDeleteLastItem = () => {
  if (items.length === 0) return;

  const lastItem = items[items.length - 1];
  const hasData =
    lastItem.descriptors.length > 0 ||
    lastItem.notes ||
    lastItem.photo_url ||
    (lastItem.study_category_data && Object.keys(lastItem.study_category_data).length > 0);

  if (hasData) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this item? This action cannot be undone.'
    );
    if (!confirmed) return;
  }

  const newItems = items.slice(0, -1);
  setItems(newItems);
  setCurrentIndex(Math.max(0, newItems.length - 1));
};
```

**After:**
```tsx
// At the top of the component
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

// Inside the component
const { confirm: confirmDelete, Dialog: DeleteDialog } = useDeleteConfirmation({
  title: 'Delete Item?',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
});

const handleDeleteLastItem = async () => {
  if (items.length === 0) return;

  const lastItem = items[items.length - 1];
  const hasData =
    lastItem.descriptors.length > 0 ||
    lastItem.notes ||
    lastItem.photo_url ||
    (lastItem.study_category_data && Object.keys(lastItem.study_category_data).length > 0);

  if (hasData) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
  }

  const newItems = items.slice(0, -1);
  setItems(newItems);
  setCurrentIndex(Math.max(0, newItems.length - 1));
};

// Add to JSX return statement
return (
  <div>
    {/* ... existing content ... */}
    <DeleteDialog />
  </div>
);
```

### Example 2: CompetitionSession.tsx (Line 218)

**Before:**
```tsx
const handleSubmit = async () => {
  saveCurrentAnswer();

  if (answers.size < items.length) {
    const unanswered = items.length - answers.size;
    if (!confirm(`You have ${unanswered} unanswered item(s). Submit anyway?`)) {
      return;
    }
  }

  setIsSubmitting(true);
  // ... submit logic
};
```

**After:**
```tsx
// At the top of the component
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

// Inside the component
const { confirm: confirmSubmit, Dialog: SubmitDialog } = useDeleteConfirmation();

const handleSubmit = async () => {
  saveCurrentAnswer();

  if (answers.size < items.length) {
    const unanswered = items.length - answers.size;

    // Create custom confirmation with dynamic description
    const submitConfirmation = useDeleteConfirmation({
      title: 'Submit Incomplete Session?',
      description: `You have ${unanswered} unanswered item(s). Submit anyway?`,
      confirmText: 'Submit',
      cancelText: 'Cancel',
    });

    const confirmed = await submitConfirmation.confirm();
    if (!confirmed) return;
  }

  setIsSubmitting(true);
  // ... submit logic
};

// Add to JSX return statement
return (
  <div>
    {/* ... existing content ... */}
    <SubmitDialog />
  </div>
);
```

### Alternative Approach for Dynamic Confirmations

If you need different confirmation messages in the same component, you can create multiple instances:

```tsx
// Multiple confirmation dialogs with different configurations
const { confirm: confirmDelete, Dialog: DeleteDialog } = useDeleteConfirmation({
  title: 'Delete Item?',
  description: 'This action cannot be undone.',
  confirmText: 'Delete',
});

const { confirm: confirmSubmit, Dialog: SubmitDialog } = useDeleteConfirmation({
  title: 'Submit Now?',
  description: 'Are you ready to submit?',
  confirmText: 'Submit',
});

// Use them separately
const handleDelete = async () => {
  if (await confirmDelete()) {
    // delete logic
  }
};

const handleSubmit = async () => {
  if (await confirmSubmit()) {
    // submit logic
  }
};

// Render both dialogs
return (
  <div>
    {/* content */}
    <DeleteDialog />
    <SubmitDialog />
  </div>
);
```

## API Reference

### `useDeleteConfirmation(options)`

**Options:**
- `title?: string` - Dialog title (default: "Are you sure?")
- `description?: string` - Dialog description (default: "This action cannot be undone.")
- `confirmText?: string` - Confirm button text (default: "Delete")
- `cancelText?: string` - Cancel button text (default: "Cancel")

**Returns:**
- `confirm: () => Promise<boolean>` - Function that shows the dialog and returns a promise
- `Dialog: React.Component` - Dialog component to render in your JSX

## Styling

The AlertDialog uses Gemini-style design:
- **Border radius:** 22px on all interactive elements
- **Animations:** Smooth fade and zoom transitions
- **Colors:**
  - Confirm button: Red (bg-red-600, hover:bg-red-700)
  - Cancel button: Gray outline (border-gray-300, hover:bg-gray-50)
- **Focus states:** Visible focus rings for accessibility

## Accessibility

The AlertDialog is built on Radix UI and includes:
- Keyboard navigation (Tab, Enter, Escape)
- Focus trapping within the dialog
- Screen reader announcements
- Proper ARIA attributes
- Escape key to cancel
- Backdrop click to cancel

## Advanced Usage

### Custom Styling

You can override styles by passing className to the Dialog:

```tsx
<AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
  Confirm
</AlertDialogAction>
```

### Imperative Usage

The hook can be used imperatively anywhere in your component:

```tsx
const { confirm } = useDeleteConfirmation();

// In an event handler
const handleClick = async () => {
  if (await confirm()) {
    console.log('Confirmed!');
  } else {
    console.log('Cancelled!');
  }
};

// In an effect
useEffect(() => {
  const checkBeforeLeave = async () => {
    if (hasUnsavedChanges) {
      const shouldLeave = await confirm();
      if (shouldLeave) {
        router.push('/');
      }
    }
  };

  checkBeforeLeave();
}, [hasUnsavedChanges]);
```

## Migration Checklist

When replacing `window.confirm()`:

1. ✅ Import `useDeleteConfirmation` hook
2. ✅ Initialize hook with appropriate options
3. ✅ Render `<Dialog />` component in JSX
4. ✅ Replace `window.confirm()` with `await confirm()`
5. ✅ Make handler function `async`
6. ✅ Test keyboard navigation (Tab, Enter, Escape)
7. ✅ Test backdrop click to cancel
8. ✅ Verify styling matches design system

## Notes

- The dialog is non-blocking and uses promises, so your handler must be `async`
- Multiple dialogs can be used in the same component
- The dialog automatically handles focus management
- The overlay click and Escape key both trigger cancel
- All text is customizable through the options object

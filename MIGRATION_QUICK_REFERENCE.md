# Quick Reference: window.confirm() Migration

## QuickTastingSession.tsx (Line 274)

### Add Import
```tsx
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
```

### Initialize Hook
```tsx
const { confirm: confirmDelete, Dialog: DeleteDialog } = useDeleteConfirmation({
  title: 'Delete Item?',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
});
```

### Update Handler (make async)
```tsx
const handleDeleteLastItem = async () => {  // Add async
  if (items.length === 0) return;

  const lastItem = items[items.length - 1];
  const hasData =
    lastItem.descriptors.length > 0 ||
    lastItem.notes ||
    lastItem.photo_url ||
    (lastItem.study_category_data && Object.keys(lastItem.study_category_data).length > 0);

  if (hasData) {
    const confirmed = await confirmDelete();  // Replace window.confirm
    if (!confirmed) return;
  }

  const newItems = items.slice(0, -1);
  setItems(newItems);
  setCurrentIndex(Math.max(0, newItems.length - 1));
};
```

### Add to JSX (before closing tag)
```tsx
return (
  <div>
    {/* ... all existing content ... */}
    <DeleteDialog />
  </div>
);
```

---

## CompetitionSession.tsx (Line 218)

### Add Import
```tsx
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
```

### Initialize Hook
```tsx
const { confirm: confirmSubmit, Dialog: SubmitDialog } = useDeleteConfirmation({
  title: 'Submit Incomplete Session?',
  description: 'You have unanswered items. Submit anyway?',
  confirmText: 'Submit',
  cancelText: 'Cancel',
});
```

### Update Handler (make async)
```tsx
const handleSubmit = async () => {  // Add async
  saveCurrentAnswer();

  if (answers.size < items.length) {
    const unanswered = items.length - answers.size;

    // For dynamic descriptions, create inline instance
    const confirmed = await useDeleteConfirmation({
      title: 'Submit Incomplete Session?',
      description: `You have ${unanswered} unanswered item(s). Submit anyway?`,
      confirmText: 'Submit',
      cancelText: 'Cancel',
    }).confirm();

    if (!confirmed) return;
  }

  setIsSubmitting(true);
  // ... rest of submit logic
};
```

### Alternative: Use State for Dynamic Description
```tsx
// If you need the Dialog component rendered
const [submitMessage, setSubmitMessage] = useState('');
const { confirm: confirmSubmit, Dialog: SubmitDialog } = useDeleteConfirmation({
  title: 'Submit Incomplete Session?',
  description: submitMessage,
  confirmText: 'Submit',
  cancelText: 'Cancel',
});

const handleSubmit = async () => {
  saveCurrentAnswer();

  if (answers.size < items.length) {
    const unanswered = items.length - answers.size;
    setSubmitMessage(`You have ${unanswered} unanswered item(s). Submit anyway?`);
    const confirmed = await confirmSubmit();
    if (!confirmed) return;
  }

  setIsSubmitting(true);
  // ... rest of submit logic
};
```

### Add to JSX (before closing tag)
```tsx
return (
  <div>
    {/* ... all existing content ... */}
    <SubmitDialog />
  </div>
);
```

---

## Key Changes Summary

1. ✅ Import `useDeleteConfirmation` hook
2. ✅ Initialize hook with options (title, description, button text)
3. ✅ Make handler function `async`
4. ✅ Replace `window.confirm()` with `await confirm()`
5. ✅ Render `<Dialog />` component in JSX

## Remember

- Handlers must be `async` to use `await`
- Dialog component must be rendered in JSX
- Each hook instance can have different options
- Multiple dialogs can coexist in same component
- Use descriptive names: `confirmDelete`, `confirmSubmit`, etc.

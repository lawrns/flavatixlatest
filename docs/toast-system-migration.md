# Toast System Migration Guide

This guide explains how to use the new unified Toast system with Sonner and how to migrate from the old `toast.js` implementation.

## Overview

The new toast system uses [Sonner](https://sonner.emilkowal.ski/) for a more powerful, theme-aware, and accessible notification experience with Gemini-inspired styling.

## Features

- Theme-aware (light/dark mode)
- Gemini-inspired design with clean, minimal styling
- Promise-based loading states
- Undo functionality
- Action buttons
- Rich colors and icons
- Top-right positioning (consistent with Gemini design)
- TypeScript support

## Installation

First, install Sonner and the required dependencies:

```bash
npm install sonner
npm install next-themes  # For theme detection
```

## Setup

### 1. Add the Toaster Component to `_app.tsx`

Replace the old `ToastContainer` from react-toastify with the new `Toaster` from Sonner:

```tsx
import { Toaster } from '@/components/ui/sonner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {/* Your app content */}
        <Component {...pageProps} />

        {/* Replace old ToastContainer with new Toaster */}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  )
}
```

### 2. Remove Old Dependencies (Optional)

If you're fully migrating, you can remove the old toast system:

```bash
npm uninstall react-toastify
```

Then remove these imports from `_app.tsx`:

```tsx
// Remove these lines
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
```

## Usage

### Basic Toast Notifications

```tsx
import { toast } from '@/lib/toast'

// Success toast
toast.success('Tasting saved successfully!')

// Error toast
toast.error('Failed to save tasting')

// Info toast
toast.info('Processing your request...')

// Warning toast
toast.warning('Your session will expire soon')
```

### Toast with Description

```tsx
toast.success('Profile updated', {
  description: 'Your profile changes have been saved successfully'
})
```

### Custom Duration

```tsx
toast.success('Quick message', { duration: 2000 })
toast.error('Important error', { duration: 10000 })
```

### Promise-Based Loading States

Perfect for async operations like API calls:

```tsx
import { toast } from '@/lib/toast'

// Basic promise toast
toast.promise(
  saveTasting(data),
  {
    loading: 'Saving tasting...',
    success: 'Tasting saved successfully!',
    error: 'Failed to save tasting'
  }
)

// With dynamic success message
toast.promise(
  fetch('/api/tasting').then(r => r.json()),
  {
    loading: 'Loading tasting...',
    success: (data) => `Loaded ${data.name}`,
    error: (err) => `Error: ${err.message}`
  }
)

// With custom duration
toast.promise(
  uploadImage(file),
  {
    loading: 'Uploading image...',
    success: 'Image uploaded!',
    error: 'Upload failed'
  },
  { duration: 5000 }
)
```

### Undo Functionality

Provide users with the ability to undo actions:

```tsx
import { toast } from '@/lib/toast'

// Basic undo
const handleDelete = (id: string) => {
  deleteTasting(id)

  toast.withUndo(
    'Tasting deleted',
    () => restoreTasting(id)
  )
}

// Undo with custom duration
toast.withUndo(
  'Comment deleted',
  async () => {
    await restoreComment(commentId)
  },
  { duration: 5000 }
)
```

### Action Buttons

Add custom action buttons to toasts:

```tsx
toast('New message received', {
  action: {
    label: 'View',
    onClick: () => router.push('/messages')
  }
})

toast.error('Failed to send message', {
  action: {
    label: 'Retry',
    onClick: () => retrySendMessage()
  }
})
```

### Dismissing Toasts

```tsx
// Dismiss all toasts
toast.dismiss()

// Dismiss specific toast
const toastId = toast.success('Processing...')
setTimeout(() => {
  toast.dismiss(toastId)
}, 2000)
```

## Migration from Old API

The new toast system maintains backward compatibility with the old API:

### Old API (still works)

```tsx
import { showSuccessToast, showErrorToast } from '@/lib/toast'

showSuccessToast('Success!')
showErrorToast('Error!')
```

### New API (recommended)

```tsx
import { toast } from '@/lib/toast'

toast.success('Success!')
toast.error('Error!')
```

### Authentication Toasts

The `authToasts` object is fully compatible:

```tsx
import { authToasts } from '@/lib/toast'

// Old and new API - both work the same
authToasts.loginSuccess()
authToasts.loginError('Invalid credentials')
authToasts.registerSuccess()
authToasts.logoutSuccess()
authToasts.sessionExpired()
authToasts.emailConfirmation()
```

## Styling Customization

The Toaster component is styled with Gemini design principles in `/components/ui/sonner.tsx`:

- Clean, minimal appearance
- Rounded corners (xl = 12px)
- Subtle shadows
- Theme-aware colors
- Top-right positioning
- Smooth animations

To customize further, edit the `toastOptions.classNames` in `sonner.tsx`.

## Examples

### Save Operation with Loading State

```tsx
const handleSave = async () => {
  toast.promise(
    saveTastingData(formData),
    {
      loading: 'Saving your tasting...',
      success: (data) => `${data.name} saved successfully!`,
      error: 'Failed to save. Please try again.'
    }
  )
}
```

### Delete with Undo

```tsx
const handleDelete = async (id: string) => {
  await deleteTasting(id)

  toast.withUndo(
    'Tasting deleted',
    async () => {
      await restoreTasting(id)
      refreshData()
    },
    { duration: 5000 }
  )
}
```

### Form Validation Error

```tsx
const handleSubmit = (data) => {
  if (!data.name) {
    toast.error('Name is required', {
      description: 'Please provide a name for your tasting'
    })
    return
  }

  toast.promise(
    submitForm(data),
    {
      loading: 'Submitting...',
      success: 'Form submitted!',
      error: 'Submission failed'
    }
  )
}
```

### Network Error with Retry

```tsx
const fetchData = async () => {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) throw new Error('Network error')
    return response.json()
  } catch (error) {
    toast.error('Failed to load data', {
      action: {
        label: 'Retry',
        onClick: () => fetchData()
      },
      duration: 6000
    })
  }
}
```

## Best Practices

1. **Use promise toasts for async operations** - They provide better UX with loading states
2. **Add descriptions for important messages** - Helps users understand context
3. **Keep messages concise** - Toast messages should be scannable
4. **Use appropriate variants** - success, error, info, warning communicate intent
5. **Provide undo for destructive actions** - Improves user confidence
6. **Add action buttons when relevant** - Reduces navigation friction
7. **Set appropriate durations** - Errors should display longer than success messages

## TypeScript Support

The new toast system is fully typed:

```tsx
import { toast } from '@/lib/toast'

// All methods are typed
toast.success(message: string, options?: ToastOptions)
toast.error(message: string, options?: ToastOptions)
toast.info(message: string, options?: ToastOptions)
toast.warning(message: string, options?: ToastOptions)

// Promise toast is typed with your data
toast.promise<TastingData>(
  fetchTasting(),
  {
    loading: 'Loading...',
    success: (data: TastingData) => `Loaded ${data.name}`,
    error: 'Failed to load'
  }
)
```

## Migration Checklist

- [ ] Install `sonner` and `next-themes`
- [ ] Add `<Toaster />` to `_app.tsx`
- [ ] Remove old `ToastContainer` (optional)
- [ ] Update imports from `@/lib/toast.js` to `@/lib/toast` (TypeScript)
- [ ] Test all toast notifications in your app
- [ ] Replace `showSuccessToast()` with `toast.success()` (optional, for consistency)
- [ ] Update any custom toast configurations
- [ ] Remove `react-toastify` if fully migrated (optional)

## Troubleshooting

### Toasts not appearing

Make sure you've added `<Toaster />` to your `_app.tsx` file.

### Theme not working

Ensure you have `next-themes` installed and configured properly.

### TypeScript errors

Make sure you're importing from `@/lib/toast` (not `@/lib/toast.js`).

### Old toasts still showing

If you haven't removed react-toastify, both systems might be active. Remove the old `ToastContainer` component.

## Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Next Themes](https://github.com/pacocoursey/next-themes)
- [Toast System Source](/lib/toast.ts)
- [Toaster Component Source](/components/ui/sonner.tsx)

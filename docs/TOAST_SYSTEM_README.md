# Unified Toast System - Complete Implementation

This document provides an overview of the unified Toast system implementation using Sonner.

## What's Included

### Core Files

1. **`/components/ui/sonner.tsx`** - Toaster component
   - Theme-aware (light/dark mode)
   - Gemini-inspired styling
   - Position: top-right
   - Rich colors and accessibility features

2. **`/lib/toast.ts`** - Unified toast API
   - TypeScript implementation
   - Success, error, info, warning variants
   - Promise-based loading states
   - Undo functionality
   - Backward compatible with old API
   - Maintains `authToasts` for authentication flows

### Documentation

3. **`/docs/toast-system-migration.md`** - Complete migration guide
   - Feature overview
   - Installation steps
   - Usage examples
   - Migration from old API
   - Best practices
   - Troubleshooting

4. **`/docs/toast-examples.tsx`** - 20 practical examples
   - Basic notifications
   - Promise-based loading
   - Undo functionality
   - Action buttons
   - Form validation
   - Network error handling
   - Social interactions
   - And more...

5. **`/docs/toast-setup-instructions.md`** - Quick setup guide
   - Step-by-step installation
   - _app.tsx integration
   - Verification checklist
   - Quick reference

6. **`/docs/TOAST_SYSTEM_README.md`** - This file

## Quick Start

### 1. Install Dependencies

```bash
npm install sonner next-themes
```

### 2. Add Toaster to _app.tsx

```tsx
import { Toaster } from '@/components/ui/sonner'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  )
}
```

### 3. Start Using Toasts

```tsx
import { toast } from '@/lib/toast'

// Basic
toast.success('Success!')
toast.error('Error!')

// With promise
toast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed!'
  }
)

// With undo
toast.withUndo('Deleted', () => restore())

// Auth toasts
authToasts.loginSuccess()
```

## Key Features

### 1. Theme-Aware
Automatically adapts to light/dark mode using `next-themes`.

### 2. Gemini Styling
- Clean, minimal design
- Rounded corners (xl = 12px)
- Subtle shadows
- Top-right positioning
- Smooth animations

### 3. Promise-Based Loading
Perfect for async operations:
```tsx
toast.promise(
  fetch('/api/data'),
  {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: 'Failed to load'
  }
)
```

### 4. Undo Functionality
Give users confidence with undo:
```tsx
toast.withUndo('Item deleted', () => restoreItem())
```

### 5. Action Buttons
Add custom actions:
```tsx
toast.error('Upload failed', {
  action: {
    label: 'Retry',
    onClick: () => retryUpload()
  }
})
```

### 6. Backward Compatible
Old API still works:
```tsx
// Old (still works)
showSuccessToast('Success!')

// New (recommended)
toast.success('Success!')
```

### 7. Full TypeScript Support
Fully typed API with IntelliSense support.

## API Reference

### Basic Methods

```tsx
toast.success(message: string, options?: ToastOptions)
toast.error(message: string, options?: ToastOptions)
toast.info(message: string, options?: ToastOptions)
toast.warning(message: string, options?: ToastOptions)
```

### Promise Method

```tsx
toast.promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  },
  options?: ToastOptions
)
```

### Undo Method

```tsx
toast.withUndo(
  message: string,
  onUndo: () => void | Promise<void>,
  options?: ToastOptions
)
```

### Dismiss Method

```tsx
toast.dismiss(toastId?: string | number)
```

### Options

```tsx
interface ToastOptions {
  duration?: number           // Default: 4000ms (4s)
  description?: string        // Additional context
  action?: {
    label: string
    onClick: () => void
  }
}
```

## Migration Path

### Phase 1: Setup (5 minutes)
1. Install dependencies
2. Add `<Toaster />` to `_app.tsx`
3. Test basic toasts

### Phase 2: Gradual Migration (ongoing)
1. Update imports as you touch files
2. Use new API for new features
3. Old API continues to work

### Phase 3: Full Migration (optional)
1. Search and replace old API calls
2. Remove `react-toastify`
3. Clean up old imports

## File Structure

```
flavatixlatest/
├── components/
│   └── ui/
│       └── sonner.tsx                 # Toaster component
├── lib/
│   └── toast.ts                       # Unified toast API
└── docs/
    ├── toast-system-migration.md      # Complete guide
    ├── toast-examples.tsx             # 20 practical examples
    ├── toast-setup-instructions.md    # Quick setup
    └── TOAST_SYSTEM_README.md         # This file
```

## Common Use Cases

### Form Validation
```tsx
if (!formData.name) {
  toast.error('Name is required', {
    description: 'Please provide a name'
  })
  return
}
```

### API Calls
```tsx
toast.promise(
  fetch('/api/save'),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save'
  }
)
```

### Destructive Actions
```tsx
await deleteItem(id)
toast.withUndo('Item deleted', () => restoreItem(id))
```

### Authentication
```tsx
authToasts.loginSuccess()
authToasts.loginError('Invalid credentials')
authToasts.sessionExpired()
```

### Copy to Clipboard
```tsx
navigator.clipboard.writeText(text)
toast.success('Copied!', { duration: 2000 })
```

## Best Practices

1. **Use promise toasts for async operations** - Better UX with loading states
2. **Add descriptions for complex messages** - Provide context
3. **Keep messages concise** - Toasts should be scannable
4. **Use appropriate variants** - Match severity with type
5. **Provide undo for destructive actions** - Improve confidence
6. **Set appropriate durations**:
   - Quick confirmations: 2-3 seconds
   - Success messages: 4 seconds
   - Errors: 5-6 seconds
   - With actions: 5-8 seconds

## Styling Customization

To customize toast appearance, edit `/components/ui/sonner.tsx`:

```tsx
toastOptions={{
  classNames: {
    toast: 'your-custom-classes',
    success: 'your-success-classes',
    error: 'your-error-classes',
    // ... etc
  }
}}
```

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS custom properties
- Flexbox

## Dependencies

- `sonner` - Toast notification library
- `next-themes` - Theme detection for dark mode

## Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Next Themes](https://github.com/pacocoursey/next-themes)
- [Migration Guide](/docs/toast-system-migration.md)
- [Examples File](/docs/toast-examples.tsx)

## Support

For issues or questions:
1. Check the migration guide
2. Review the examples file
3. Check Sonner documentation
4. Verify setup in troubleshooting section

## Version History

- **v1.0.0** - Initial implementation with Sonner
  - Basic toast variants (success, error, info, warning)
  - Promise-based loading states
  - Undo functionality
  - Theme-aware styling
  - Backward compatibility with old API
  - Full TypeScript support
  - Gemini design system integration

---

**Ready to get started?**

1. Run: `npm install sonner next-themes`
2. Add `<Toaster />` to `_app.tsx`
3. Import `toast` from `@/lib/toast`
4. Start using: `toast.success('Hello!')`

For detailed examples and migration steps, see the documentation files above.

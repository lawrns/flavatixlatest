# Toast System Setup Instructions

Quick setup guide for implementing the unified Toast system with Sonner.

## 1. Install Dependencies

```bash
npm install sonner next-themes
```

## 2. Add Toaster to _app.tsx

Replace the old `ToastContainer` with the new `Toaster`:

**Before:**
```tsx
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  )
}
```

**After:**
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

## 3. Remove Old Dependencies (Optional)

If migrating completely, uninstall react-toastify:

```bash
npm uninstall react-toastify
```

And remove the import from `_app.tsx`:
```tsx
// Remove this line
import 'react-toastify/dist/ReactToastify.css'
```

## 4. Update Imports Throughout Your App

**Old imports:**
```tsx
import { showSuccessToast, showErrorToast } from '@/lib/toast.js'
```

**New imports:**
```tsx
import { toast } from '@/lib/toast'
```

## 5. Update Toast Calls

**Old API (still works for backward compatibility):**
```tsx
showSuccessToast('Success!')
showErrorToast('Error!')
```

**New API (recommended):**
```tsx
toast.success('Success!')
toast.error('Error!')
```

## 6. Test Your Toasts

Create a test page or add temporary buttons to verify:

```tsx
import { toast } from '@/lib/toast'

export default function TestPage() {
  return (
    <div className="p-8 space-y-4">
      <button onClick={() => toast.success('Success!')}>
        Test Success
      </button>
      <button onClick={() => toast.error('Error!')}>
        Test Error
      </button>
      <button onClick={() => toast.info('Info!')}>
        Test Info
      </button>
      <button onClick={() => toast.warning('Warning!')}>
        Test Warning
      </button>
    </div>
  )
}
```

## 7. Configure Theme Provider (if not already set up)

If you don't have `next-themes` configured, wrap your app:

```tsx
import { ThemeProvider } from 'next-themes'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  )
}
```

## Verification Checklist

- [ ] `sonner` and `next-themes` installed
- [ ] `<Toaster />` added to `_app.tsx`
- [ ] Old `ToastContainer` removed (optional)
- [ ] Imports updated from `@/lib/toast.js` to `@/lib/toast`
- [ ] Test toasts working in light mode
- [ ] Test toasts working in dark mode
- [ ] Authentication toasts working
- [ ] No console errors

## Quick Reference

```tsx
// Basic notifications
toast.success('Success!')
toast.error('Error!')
toast.info('Info!')
toast.warning('Warning!')

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
authToasts.loginError('Invalid credentials')
```

## Troubleshooting

**Toasts not appearing:**
- Verify `<Toaster />` is in `_app.tsx`
- Check browser console for errors

**Wrong theme:**
- Ensure `next-themes` is properly configured
- Check `ThemeProvider` is wrapping your app

**TypeScript errors:**
- Import from `@/lib/toast` (not `@/lib/toast.js`)
- Ensure `sonner` types are installed

**Old toasts still showing:**
- Both react-toastify and sonner might be active
- Remove old `ToastContainer` component

## Files Created

1. `/components/ui/sonner.tsx` - Toaster component with Gemini styling
2. `/lib/toast.ts` - Unified toast API with TypeScript
3. `/docs/toast-system-migration.md` - Complete migration guide
4. `/docs/toast-examples.tsx` - Practical usage examples
5. `/docs/toast-setup-instructions.md` - This file

## Next Steps

1. Install dependencies: `npm install sonner next-themes`
2. Update `_app.tsx` with `<Toaster />`
3. Test basic toasts
4. Gradually migrate existing toast calls
5. Explore advanced features (promise, undo, actions)

For detailed usage examples, see `/docs/toast-system-migration.md`.

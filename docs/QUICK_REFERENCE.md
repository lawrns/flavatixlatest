# Quick Reference: Cheat Sheet

Your pocket guide to Flavatix. Print this and keep it handy.

## Essential Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Build for production
npm run start            # Run production server locally

# Code Quality
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
npm run format           # Format code
npm run type-check       # Check TypeScript types
npm run check            # Quick check (lint + types + unit tests)
npm run check:all        # Full check (lint + types + all tests)

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm run test:e2e         # End-to-end tests
npm run test:e2e:ui      # E2E with UI
npm run test:e2e:debug   # Debug E2E

# Utilities
npm install              # Install dependencies
npm audit                # Security check
```

## File Locations

```
pages/               → Routes and pages
  api/               → API endpoints
components/          → React components
hooks/               → Custom hooks
lib/                 → Utility functions
styles/              → CSS and Tailwind
public/              → Static files
__tests__/           → Unit tests
e2e/                 → End-to-end tests
docs/                → Documentation
```

## Creating Things

### New API Endpoint

Create `/pages/api/section/[id]/action.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { createApiHandler, withAuth, withValidation } from '@/lib/api/middleware'
import { sendSuccess, sendError } from '@/lib/api/responses'
import { yourSchema } from '@/lib/validations'

async function handler(req: NextApiRequest, res: NextApiResponse, context) {
  // Your logic here
  return sendSuccess(res, { data: 'result' })
}

export default createApiHandler({
  POST: withAuth(withValidation(yourSchema, handler)),
})
```

### New Hook

Create `/hooks/useYourHook.ts`:

```typescript
import { useState, useCallback } from 'react'

export function useYourHook() {
  const [state, setState] = useState(null)

  const action = useCallback(async () => {
    // Your logic here
  }, [])

  return { state, action }
}
```

### New Component

Create `/components/YourComponent.tsx`:

```typescript
export interface YourComponentProps {
  prop1: string
  prop2?: number
}

export function YourComponent({ prop1, prop2 }: YourComponentProps) {
  return <div>{prop1}</div>
}
```

### New Test

Create `/components/YourComponent.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { YourComponent } from './YourComponent'

describe('YourComponent', () => {
  test('renders content', () => {
    render(<YourComponent prop1="test" />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

## Common Patterns

### Fetch Data from API

```typescript
const { data, loading, error } = useFetch('/api/endpoint')

if (loading) return <p>Loading...</p>
if (error) return <p>Error: {error}</p>
return <div>{data}</div>
```

### Protected Route (Auth Required)

```typescript
export default function ProtectedPage() {
  useAuthGuard() // Redirects if not authenticated

  return <div>Protected content</div>
}
```

### Submit Form Data

```typescript
const handleSubmit = async (data) => {
  const res = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    showError(error.message)
    return
  }

  const result = await res.json()
  showSuccess('Success!')
}
```

### Show Toast Notification

```typescript
import { toast } from 'sonner'

// Success
toast.success('Operation succeeded!')

// Error
toast.error('Something went wrong')

// Info
toast.info('Here's some info')

// Loading
toast.loading('Please wait...')
```

### Conditional Styling

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-styles',
  condition && 'conditional-styles',
  variant === 'primary' && 'primary-styles'
)}>
  Content
</div>
```

## Debugging

### Browser DevTools (F12)

- **Console tab** - See logs and errors
- **Network tab** - See API calls
- **Elements tab** - Inspect HTML
- **Sources tab** - Set breakpoints
- **React tab** - Inspect components

### Add Logging

```typescript
console.log('value:', value)
console.warn('warning:', warning)
console.error('error:', error)
```

### Check TypeScript Errors

```bash
npm run type-check

# Or while editing - VSCode shows errors in real-time
```

### Debug Tests

```bash
npm run test:watch

# Then use screen.debug() in tests
test('example', () => {
  render(<Component />)
  screen.debug() // Prints HTML
})
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
# Edit with your values
```

**Critical variables:**

- `NEXT_PUBLIC_SUPABASE_URL` - Database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `ANTHROPIC_API_KEY` - Claude API key
- `NEXTAUTH_SECRET` - Auth encryption key
- `DATABASE_URL` - Database connection

Never commit `.env.local`!

## Testing Checklist

Before deploying:

```bash
npm run check:all
```

This runs:
- ✓ Linting (`npm run lint`)
- ✓ Types (`npm run type-check`)
- ✓ Unit tests (`npm run test:unit`)
- ✓ E2E tests (`npm run test:e2e`)

All must pass!

## Deployment

```bash
# Verify everything
npm run check:all

# Commit changes
git add .
git commit -m "feat: your feature"

# Push to main (auto-deploys)
git push origin main

# Watch deployment in Netlify
# Go to: app.netlify.com → Deploys
```

## Status Codes

```
200 - Success
201 - Created
400 - Bad request (invalid data)
401 - Unauthorized (not logged in)
403 - Forbidden (not allowed)
404 - Not found
409 - Conflict (already exists)
429 - Too many requests (rate limited)
500 - Server error
```

## API Response Format

All APIs return:

```typescript
{
  success: boolean
  data?: any
  message?: string
  error?: {
    message: string
    details?: any
  }
}
```

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest](https://jestjs.io)
- [Playwright](https://playwright.dev)

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/feature-name

# Make changes
# Test locally
npm run dev

# Commit with clear message
git commit -m "feat: add new feature"

# Push
git push origin feat/feature-name

# Create pull request on GitHub
# Wait for code review
# Merge to main

# Netlify auto-deploys main branch
```

## Common Keyboard Shortcuts

```
F12              - Open DevTools
Ctrl+Shift+P     - Command palette (VSCode)
Ctrl+/           - Comment/uncomment (VSCode)
Ctrl+Shift+F     - Find in all files (VSCode)
Cmd+K Cmd+C      - Comment line (macOS)
Cmd+L            - Select line (macOS)
```

## When Something Breaks

### Local Dev Issues

```bash
# Dependencies not installing?
rm -rf node_modules package-lock.json
npm install

# TypeScript errors?
npm run type-check

# Linting errors?
npm run lint:fix

# Tests failing?
npm run test:watch
```

### Production Issues

1. Check Sentry: [sentry.io](https://sentry.io)
2. Check Netlify logs: [app.netlify.com](https://app.netlify.com)
3. Check Supabase: [app.supabase.com](https://app.supabase.com)
4. Rollback:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Need More Help?

- **Setup issues?** → [GETTING_STARTED.md](./GETTING_STARTED.md)
- **API help?** → [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md)
- **State management?** → [ARCHITECTURE_STATE_MANAGEMENT.md](./ARCHITECTURE_STATE_MANAGEMENT.md)
- **Testing?** → [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md)
- **API errors?** → [DEBUG_API_ERRORS.md](./DEBUG_API_ERRORS.md)
- **Deployment?** → [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)
- **Full index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

## Quick Decision Tree

```
I want to...

  ├─ Get started
  │  └─ GETTING_STARTED.md

  ├─ Add a feature
  │  ├─ FEATURES_API_ENDPOINTS.md
  │  └─ ARCHITECTURE_DATABASE.md

  ├─ Write tests
  │  ├─ TESTING_UNIT_TESTS.md
  │  └─ TESTING_E2E.md

  ├─ Debug something
  │  ├─ DEBUG_API_ERRORS.md
  │  ├─ DEBUG_STATE_ISSUES.md
  │  └─ DEBUG_DEVTOOLS.md

  ├─ Deploy
  │  └─ DEPLOY_PRODUCTION.md

  └─ Learn the architecture
     ├─ ARCHITECTURE_STATE_MANAGEMENT.md
     ├─ ARCHITECTURE_API_FLOW.md
     └─ ARCHITECTURE_DATA_FETCHING.md
```

---

**Last Updated:** January 2026
**Version:** Based on Next.js 14 + React 18

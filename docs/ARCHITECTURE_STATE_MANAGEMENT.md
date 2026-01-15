# State Management Architecture: Deep Dive

Understand how Flavatix manages application state through contexts, hooks, and components.

## What You'll Learn

By the end of this guide, you will:
- Understand Flavatix's state management architecture
- Know how AuthContext works and why it matters
- Use custom hooks to access state
- Create your own custom hooks
- Debug state-related issues
- Avoid common state pitfalls

**Time estimate:** 30-40 minutes

**Prerequisites:**
- Understanding of React hooks (useState, useEffect)
- Familiarity with React Context
- [GETTING_STARTED.md](./GETTING_STARTED.md) completed

## Section 1: The Architecture (10 minutes)

### Three-Layer State Management

Flavatix uses a three-layer approach:

```
┌─────────────────────────────────────┐
│   UI Components                     │
│   (Display state, handle clicks)    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Custom Hooks                      │
│   (useAuth, useTastingSession, etc.)│
│   (Encapsulate state logic)         │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Contexts                          │
│   (AuthContext, ThemeContext)       │
│   (Global state providers)          │
└─────────────────────────────────────┘
```

### State Flows: Global vs Local

**Global State** - Shared across the entire app:
- User authentication
- Theme/dark mode
- Notifications

**Local State** - Specific to a component or feature:
- Form input values
- Modal visibility
- Loading states

**Guideline:** Use local state by default, global state only when needed.

## Section 2: AuthContext - The Foundation (15 minutes)

### How AuthContext Works

The authentication context is the foundation. Here's how:

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Step 1: Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Step 2: Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Step 3: Set up initial state (runs once on mount)
  useEffect(() => {
    const getInitialSession = async () => {
      // Ask Supabase: is there a logged-in user?
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Step 4: Listen for changes
    // If user logs in/out, update the state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Step 5: Provide the state to child components
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Step 6: Create a hook for easy access
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### How Components Use It

Components access auth state through the hook:

```typescript
// components/UserGreeting.tsx
import { useAuth } from '@/contexts/AuthContext'

export function UserGreeting() {
  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>
  if (!user) return <p>Please log in</p>

  return <p>Hello, {user.email}!</p>
}
```

### The Data Flow

When a user logs in:

```
1. User enters email/password in form
                ▼
2. Component calls supabase.auth.signInWithPassword()
                ▼
3. Supabase returns user object
                ▼
4. supabase.auth.onAuthStateChange triggers
                ▼
5. setUser() is called in AuthContext
                ▼
6. Context state updates
                ▼
7. All components using useAuth() re-render with new user
                ▼
8. Conditional rendering shows logged-in content
```

## Section 3: Custom Hooks Pattern (10 minutes)

### Why Custom Hooks?

Custom hooks encapsulate complex logic. Example:

```typescript
// Bad: All logic in component
function TastingForm() {
  const [tastings, setTastings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTastings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tastings')
      const data = await res.json()
      setTastings(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTastings()
  }, [])

  return (
    // Component code
  )
}

// Good: Logic in custom hook
function useTastings() {
  const [tastings, setTastings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/tastings')
        const data = await res.json()
        setTastings(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { tastings, loading, error }
}

function TastingForm() {
  const { tastings, loading, error } = useTastings()

  return (
    // Component code - much cleaner!
  )
}
```

### Real Example: useTastingSession Hook

Location: `/hooks/useTastingSession.ts`

```typescript
import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useTastingSession() {
  const { user } = useAuth()
  const [session, setSession] = useState<TastingSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Start a new tasting session
  const startSession = useCallback(async (config: TastingConfig) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/tastings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) throw new Error('Failed to create session')

      const data = await res.json()
      setSession(data.tasting)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // End the tasting session
  const endSession = useCallback(async () => {
    if (!session) return

    setLoading(true)
    try {
      const res = await fetch(`/api/tastings/${session.id}/end`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to end session')

      setSession(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    session,
    loading,
    error,
    startSession,
    endSession,
  }
}
```

### Using the Hook in a Component

```typescript
// pages/quick-tasting.tsx
import { useTastingSession } from '@/hooks/useTastingSession'

export default function QuickTastingPage() {
  const { session, loading, error, startSession, endSession } = useTastingSession()
  const [itemName, setItemName] = useState('')

  const handleStart = async () => {
    await startSession({
      mode: 'quick',
      category: 'wine',
      items: [{ item_name: itemName }],
    })
  }

  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {!session ? (
        <form onSubmit={e => {
          e.preventDefault()
          handleStart()
        }}>
          <input
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            placeholder="Item name"
          />
          <button disabled={loading}>
            {loading ? 'Starting...' : 'Start Tasting'}
          </button>
        </form>
      ) : (
        <div>
          <h2>Session: {session.session_name}</h2>
          <button onClick={endSession}>End Tasting</button>
        </div>
      )}
    </div>
  )
}
```

## Section 4: Creating Your Own Custom Hook (10 minutes)

### Step-by-Step: Build a useToggle Hook

Let's create a simple but useful hook:

```typescript
// hooks/useToggle.ts
import { useState, useCallback } from 'react'

/**
 * Hook for managing boolean toggle state
 * Useful for modals, dropdowns, menus
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  const open = useCallback(() => {
    setValue(true)
  }, [])

  const close = useCallback(() => {
    setValue(false)
  }, [])

  return {
    value,        // Current state
    toggle,       // Toggle the value
    open,         // Set to true
    close,        // Set to false
    set: setValue, // Set to a specific value
  }
}
```

### Using Your Hook

```typescript
// components/CreateTastingModal.tsx
import { useToggle } from '@/hooks/useToggle'

export function CreateTastingModal() {
  const { value: isOpen, open, close } = useToggle(false)

  return (
    <>
      <button onClick={open}>Create Tasting</button>

      {isOpen && (
        <modal>
          <div>Create a new tasting</div>
          <button onClick={close}>Close</button>
        </modal>
      )}
    </>
  )
}
```

### Step-by-Step: Build a useFetch Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Hook for fetching data from an API endpoint
 */
export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}
```

### Using useFetch

```typescript
// pages/flavor-wheels.tsx
import { useFetch } from '@/hooks/useFetch'

export default function FlavorWheelsPage() {
  const { data: wheels, loading, error } = useFetch('/api/flavor-wheels')

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  if (!wheels) return <p>No wheels found</p>

  return (
    <ul>
      {wheels.map(wheel => (
        <li key={wheel.id}>{wheel.name}</li>
      ))}
    </ul>
  )
}
```

## Section 5: Common Patterns & Mistakes (10 minutes)

### Pattern 1: Derived State

Don't duplicate state. Derive it instead:

```typescript
// Bad: Duplicating state
function UserStats() {
  const { user } = useAuth()
  const [userName, setUserName] = useState(user?.email)

  // If user changes, userName gets out of sync!
}

// Good: Derive from source
function UserStats() {
  const { user } = useAuth()
  const userName = user?.email || 'Guest'

  // Always up-to-date
}
```

### Pattern 2: Conditional Hooks

Hooks must be called at the top level (never in conditionals):

```typescript
// Bad: Hook inside condition
function MyComponent() {
  if (shouldFetchData) {
    const data = useFetch('/api/data') // ❌ WRONG
  }
}

// Good: Hook always called
function MyComponent() {
  const data = useFetch('/api/data') // ✓ CORRECT

  if (!data) return null
}
```

### Pattern 3: Dependency Arrays

Make sure dependencies are in the array:

```typescript
// Bad: Missing dependency
function SearchResults() {
  const [results, setResults] = useState([])
  const searchTerm = 'wine'  // Could change

  useEffect(() => {
    fetch(`/api/search?q=${searchTerm}`)
      .then(r => r.json())
      .then(setResults)
  }, []) // ❌ searchTerm not in dependencies!
}

// Good: Include all dependencies
function SearchResults({ searchTerm }: { searchTerm: string }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(`/api/search?q=${searchTerm}`)
      .then(r => r.json())
      .then(setResults)
  }, [searchTerm]) // ✓ searchTerm included
}
```

### Pattern 4: Avoiding Unnecessary Re-renders

```typescript
// Bad: Function recreated on every render
function TodoList() {
  const handleDelete = (id: string) => {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  return <Todo onDelete={handleDelete} /> // Recreated every time!
}

// Good: useCallback memoizes the function
function TodoList() {
  const handleDelete = useCallback((id: string) => {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }, [])

  return <Todo onDelete={handleDelete} /> // Stays the same
}
```

### Mistake 1: Forgetting Error Handling

```typescript
// Bad: No error handling
function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(setUser) // What if it fails?
  }, [])

  return <div>{user.name}</div> // Could crash!
}

// Good: Handle errors
function UserProfile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
  }, [])

  if (error) return <p>Error: {error}</p>
  if (!user) return <p>Loading...</p>
  return <div>{user.name}</div>
}
```

### Mistake 2: Not Cleaning Up Subscriptions

```typescript
// Bad: Memory leak
function ChatMessages() {
  useEffect(() => {
    const unsubscribe = supabase
      .from('messages')
      .on('*', () => {
        // Update messages
      })
      .subscribe()

    // ❌ Never unsubscribed!
  }, [])
}

// Good: Clean up
function ChatMessages() {
  useEffect(() => {
    const subscription = supabase
      .from('messages')
      .on('*', () => {
        // Update messages
      })
      .subscribe()

    return () => subscription.unsubscribe() // ✓ Clean up
  }, [])
}
```

## Debugging State Issues

### Problem: State doesn't update

```typescript
// Use React DevTools
// 1. Open browser DevTools (F12)
// 2. Go to React tab
// 3. Select component
// 4. See current state in right panel
// 5. Click state values to edit them temporarily
```

### Problem: Too many re-renders

```typescript
// Add logging to see why component re-renders
function MyComponent() {
  useEffect(() => {
    console.log('Component rendered')
  })

  return <div>...</div>
}

// Use DevTools Profiler tab to measure render times
```

### Problem: State out of sync

```typescript
// Use useCallback to keep functions stable
// Use useMemo to keep objects stable
// Add console.log in useEffect to see when it runs

useEffect(() => {
  console.log('Effect running with:', { state1, state2 })
}, [state1, state2])
```

## Summary

You've learned:
- How AuthContext works
- How custom hooks encapsulate logic
- How to create your own hooks
- Common state management patterns
- How to avoid mistakes
- How to debug state issues

## Next Steps

- **Ready to fetch data?** → [ARCHITECTURE_DATA_FETCHING.md](./ARCHITECTURE_DATA_FETCHING.md)
- **Want to test hooks?** → [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md)
- **Need to debug?** → [DEBUG_STATE_ISSUES.md](./DEBUG_STATE_ISSUES.md)
- **Back to index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Pro Tip:** Use React DevTools Chrome extension for easier debugging. Install it from the Chrome Web Store.

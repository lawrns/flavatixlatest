# Unit Testing: Complete Tutorial

Write effective unit tests that catch bugs early and give you confidence to refactor.

## What You'll Learn

By the end of this guide, you will:
- Understand unit testing principles
- Write your first unit test
- Test React components
- Test custom hooks
- Test utility functions
- Achieve 80%+ code coverage
- Debug failing tests

**Time estimate:** 45-60 minutes

**Prerequisites:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) completed
- Basic understanding of Jest
- Familiarity with React Testing Library

## Section 1: Testing Fundamentals (10 minutes)

### What is Unit Testing?

Unit testing means:
- **Unit** = smallest piece of code (function, hook, component)
- **Testing** = checking it works correctly
- **Automated** = no manual clicking

Example:

```typescript
// Utility function
function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

// Unit test
test('calculateScore returns correct percentage', () => {
  expect(calculateScore(8, 10)).toBe(80)
  expect(calculateScore(0, 10)).toBe(0)
  expect(calculateScore(10, 10)).toBe(100)
})
```

### The Testing Pyramid

```
        /\
       /  \  E2E Tests (Playwright)
      /----\
     /      \
    /--------\  Integration Tests
   /          \
  /            \  Unit Tests (Jest)
 /______________\
```

- **Unit Tests** (fast, many): Test individual functions
- **Integration Tests** (medium): Test components working together
- **E2E Tests** (slow, few): Test entire user flows

### The Three Parts of a Test

Every test has three parts:

```typescript
test('example', () => {
  // ARRANGE: Set up test data
  const input = { name: 'wine', category: 'red' }

  // ACT: Do something
  const result = parseTasting(input)

  // ASSERT: Check the result
  expect(result.name).toBe('wine')
})
```

## Section 2: Your First Unit Test (15 minutes)

### Test a Utility Function

Create `/lib/utils/scoreCalculator.ts`:

```typescript
/**
 * Calculate tasting score as a percentage
 */
export function calculateTastingScore(
  ratings: number[],
  maxScore: number
): number {
  if (ratings.length === 0) return 0

  const sum = ratings.reduce((a, b) => a + b, 0)
  const percentage = (sum / (ratings.length * maxScore)) * 100

  return Math.round(percentage * 10) / 10 // Round to 1 decimal
}
```

Now write a test: `/lib/utils/scoreCalculator.test.ts`

```typescript
import { calculateTastingScore } from './scoreCalculator'

describe('calculateTastingScore', () => {
  test('returns 0 for empty ratings', () => {
    // ARRANGE
    const ratings: number[] = []

    // ACT
    const result = calculateTastingScore(ratings, 5)

    // ASSERT
    expect(result).toBe(0)
  })

  test('calculates score correctly', () => {
    // A tasting with 4 ratings, each max 5
    // [5, 4, 5, 3] = 17 / (4 * 5) = 0.85 = 85%
    const ratings = [5, 4, 5, 3]
    const result = calculateTastingScore(ratings, 5)

    expect(result).toBe(85)
  })

  test('handles partial scores', () => {
    // [3.5, 2.5, 4] out of 5
    const ratings = [3.5, 2.5, 4]
    const result = calculateTastingScore(ratings, 5)

    expect(result).toBe(66.7)
  })
})
```

### Run Your Test

```bash
npm run test:unit -- scoreCalculator.test.ts

# Output:
# PASS  lib/utils/scoreCalculator.test.ts
#   calculateTastingScore
#     ✓ returns 0 for empty ratings (2 ms)
#     ✓ calculates score correctly (1 ms)
#     ✓ handles partial scores (1 ms)
```

## Section 3: Testing React Components (20 minutes)

### Test a Simple Component

Create `/components/ui/ScoreRing.tsx`:

```typescript
export interface ScoreRingProps {
  score: number
  maxScore?: number
}

export function ScoreRing({ score, maxScore = 100 }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100

  const getColor = () => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`text-4xl font-bold ${getColor()}`}>
        {Math.round(percentage)}%
      </div>
      <div className="text-sm text-gray-500">
        {score} / {maxScore}
      </div>
    </div>
  )
}
```

Write a test: `/components/ui/ScoreRing.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { ScoreRing } from './ScoreRing'

describe('ScoreRing', () => {
  test('renders score as percentage', () => {
    // ARRANGE
    render(<ScoreRing score={80} maxScore={100} />)

    // ACT (already done by render)
    // ASSERT
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('80 / 100')).toBeInTheDocument()
  })

  test('applies green color for high scores', () => {
    // High score (80+)
    const { container } = render(<ScoreRing score={85} maxScore={100} />)

    const circle = container.querySelector('.text-green-600')
    expect(circle).toBeInTheDocument()
  })

  test('applies yellow color for medium scores', () => {
    // Medium score (60-79)
    const { container } = render(<ScoreRing score={70} maxScore={100} />)

    const circle = container.querySelector('.text-yellow-600')
    expect(circle).toBeInTheDocument()
  })

  test('applies red color for low scores', () => {
    // Low score (<60)
    const { container } = render(<ScoreRing score={50} maxScore={100} />)

    const circle = container.querySelector('.text-red-600')
    expect(circle).toBeInTheDocument()
  })

  test('handles different max scores', () => {
    render(<ScoreRing score={3} maxScore={5} />)

    // 3/5 = 60%
    expect(screen.getByText('60%')).toBeInTheDocument()
  })
})
```

### Run Component Tests

```bash
npm run test:unit -- ScoreRing.test.tsx

# Output:
# PASS  components/ui/ScoreRing.test.tsx
#   ScoreRing
#     ✓ renders score as percentage (15 ms)
#     ✓ applies green color for high scores (5 ms)
#     ✓ applies yellow color for medium scores (4 ms)
#     ✓ applies red color for low scores (4 ms)
#     ✓ handles different max scores (3 ms)
```

## Section 4: Testing Hooks (15 minutes)

### Install Testing Library Hooks

```bash
npm install --save-dev @testing-library/react-hooks
```

### Test a Simple Hook

Test the `useToggle` hook from [ARCHITECTURE_STATE_MANAGEMENT.md](./ARCHITECTURE_STATE_MANAGEMENT.md):

Create `/hooks/useToggle.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  test('returns initial value', () => {
    const { result } = renderHook(() => useToggle(false))

    expect(result.current.value).toBe(false)
  })

  test('toggles the value', () => {
    const { result } = renderHook(() => useToggle(false))

    expect(result.current.value).toBe(false)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  test('has open function', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.open()
    })

    expect(result.current.value).toBe(true)
  })

  test('has close function', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.close()
    })

    expect(result.current.value).toBe(false)
  })

  test('has set function', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.set(true)
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.set(false)
    })

    expect(result.current.value).toBe(false)
  })
})
```

### Test a Hook with Async Data

Test a hook that fetches data:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from './useFetch'

// Mock fetch
global.fetch = jest.fn()

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns loading state initially', () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    })

    const { result } = renderHook(() => useFetch('/api/test'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
  })

  test('loads data successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Wine' }),
    })

    const { result } = renderHook(() => useFetch('/api/tastings'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual({ id: 1, name: 'Wine' })
    expect(result.current.error).toBe(null)
  })

  test('handles fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const { result } = renderHook(() => useFetch('/api/tastings'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error?.message).toBe('Network error')
    expect(result.current.data).toBe(null)
  })
})
```

## Section 5: Common Testing Patterns (10 minutes)

### Pattern 1: Testing Event Handlers

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)

  fireEvent.click(screen.getByText('Click me'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Pattern 2: Testing Forms

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

test('submits form with values', async () => {
  const handleSubmit = jest.fn()
  render(<LoginForm onSubmit={handleSubmit} />)

  const emailInput = screen.getByLabelText('Email')
  const passwordInput = screen.getByLabelText('Password')
  const submitButton = screen.getByRole('button', { name: /sign in/i })

  await userEvent.type(emailInput, 'user@example.com')
  await userEvent.type(passwordInput, 'password123')
  await userEvent.click(submitButton)

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
  })
})
```

### Pattern 3: Testing Conditional Rendering

```typescript
import { render, screen } from '@testing-library/react'
import { UserProfile } from './UserProfile'

test('shows loading state', () => {
  render(<UserProfile loading={true} user={null} />)

  expect(screen.getByText('Loading...')).toBeInTheDocument()
})

test('shows error state', () => {
  render(<UserProfile loading={false} error="Failed to load" user={null} />)

  expect(screen.getByText('Failed to load')).toBeInTheDocument()
})

test('shows user data when loaded', () => {
  const user = { id: '1', name: 'John Doe', email: 'john@example.com' }

  render(<UserProfile loading={false} user={user} />)

  expect(screen.getByText('John Doe')).toBeInTheDocument()
  expect(screen.getByText('john@example.com')).toBeInTheDocument()
})
```

## Section 6: Debugging Tests (10 minutes)

### Problem: Test doesn't find element

```typescript
// Use screen.debug() to see what was rendered
test('example', () => {
  render(<MyComponent />)
  screen.debug() // Prints HTML to console
})

// Run with:
npm run test:watch

// Then look at the console output
```

### Problem: Async operation not complete

```typescript
// Use waitFor to wait for async operations
test('loads user', async () => {
  render(<UserProfile />)

  // Wait for the user to appear
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Problem: Test passes locally but fails in CI

```typescript
// Use waitFor with a longer timeout in CI
await waitFor(
  () => {
    expect(result.current.data).toBeDefined()
  },
  { timeout: 3000 } // 3 second timeout
)
```

## Running All Tests

```bash
# Run all tests once
npm run test

# Run in watch mode (re-runs when files change)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm run test -- MyComponent.test.tsx

# Run tests matching a pattern
npm run test -- --testNamePattern="should load data"
```

## Best Practices

### 1. Write Descriptive Test Names

```typescript
// Bad
test('test 1', () => {})

// Good
test('should calculate total price including tax', () => {})
```

### 2. Test Behavior, Not Implementation

```typescript
// Bad: Testing implementation details
test('calls setState', () => {
  const setState = jest.fn()
  // ...
})

// Good: Testing what the user sees
test('shows error message when email is invalid', () => {
  render(<LoginForm />)
  // User enters invalid email
  // Assert error message appears
})
```

### 3. Keep Tests Simple

```typescript
// Bad: Testing too much in one test
test('form works', () => {
  // Tests validation
  // Tests submission
  // Tests error handling
  // Tests loading
})

// Good: One thing per test
test('shows validation error for empty email', () => {})
test('shows validation error for invalid email', () => {})
test('submits form when valid', () => {})
```

### 4. Use Realistic Data

```typescript
// Bad: Generic data
const user = { id: 1, name: 'a' }

// Good: Realistic data
const user = { id: 'uuid-123', name: 'John Doe', email: 'john@example.com' }
```

## Common Mistakes

### Mistake 1: Not Waiting for Async Operations

```typescript
// ❌ Wrong: Assertion runs before data loads
test('loads user', () => {
  render(<UserProfile />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
})

// ✅ Right: Wait for data
test('loads user', async () => {
  render(<UserProfile />)
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Mistake 2: Not Cleaning Up Mocks

```typescript
// ❌ Wrong: Previous test's mock affects next test
jest.mock('@/lib/api')

test('test 1', () => {
  ;(fetch as jest.Mock).mockResolvedValueOnce({ data: 1 })
  // ...
})

test('test 2', () => {
  // Mock from test 1 still active!
})

// ✅ Right: Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})
```

### Mistake 3: Testing Too Many Paths

```typescript
// ❌ Wrong: Testing every possible path
test('calculates everything', () => {
  // 50 assertions
})

// ✅ Right: Each test is focused
test('calculates price with tax', () => {})
test('calculates discount correctly', () => {})
test('handles zero price', () => {})
```

## Summary

You've learned:
- What unit testing is and why it matters
- How to write your first test
- How to test components and hooks
- Common testing patterns
- How to debug failing tests
- Best practices

## Next Steps

- **Ready for integration tests?** → [TESTING_INTEGRATION.md](./TESTING_INTEGRATION.md)
- **Want E2E tests?** → [TESTING_E2E.md](./TESTING_E2E.md)
- **Need to mock API?** → [TESTING_MOCKING.md](./TESTING_MOCKING.md)
- **Back to index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Pro Tip:** Aim for 80%+ coverage. Focus on testing important business logic, not every line of code.

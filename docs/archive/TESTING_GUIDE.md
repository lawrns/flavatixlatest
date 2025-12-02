# Testing Guide for FlavorWheel

## Overview

This guide explains how to run and write tests for the FlavorWheel application. We use a multi-layered testing approach:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test how components work together
3. **E2E Tests** - Test complete user flows in a real browser

---

## Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run Tests in Watch Mode (for development)
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

---

## Unit & Integration Tests

### Technology Stack
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Custom matchers

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Writing Unit Tests

Create test files next to the component/function you're testing with `.test.tsx` or `.test.ts` extension:

```
components/
  MyComponent.tsx
  MyComponent.test.tsx  ← Test file
```

**Example Unit Test:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyButton from './MyButton';

describe('MyButton', () => {
  it('should render with correct text', () => {
    render(<MyButton>Click me</MyButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<MyButton onClick={handleClick}>Click me</MyButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<MyButton isLoading>Click me</MyButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Best Practices for Unit Tests

1. **Test behavior, not implementation**
   - ✅ Test what the user sees and does
   - ❌ Don't test internal state or implementation details

2. **Use descriptive test names**
   - ✅ `it('should disable button when loading')`
   - ❌ `it('test button')`

3. **Follow AAA pattern**
   - **Arrange** - Set up test data
   - **Act** - Perform the action
   - **Assert** - Verify the result

4. **Mock external dependencies**
   - Mock API calls, Supabase, router, etc.
   - Use `jest.mock()` for module mocking

5. **Test edge cases**
   - Empty states
   - Error states
   - Loading states
   - Boundary conditions

---

## E2E Tests

### Technology Stack
- **Playwright** - Browser automation
- **TypeScript** - Type-safe test code

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tasting-session.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Writing E2E Tests

Create test files in `tests/e2e/` directory with `.spec.ts` extension:

```
tests/
  e2e/
    tasting-session.spec.ts
    review-flow.spec.ts
```

**Example E2E Test:**

```typescript
import { test, expect } from '@playwright/test';

test('complete tasting session flow', async ({ page }) => {
  // Navigate to page
  await page.goto('/tasting/test-session-id');
  
  // Interact with elements
  await page.click('button:has-text("Complete Tasting")');
  
  // Verify results
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Tasting session completed!')).toBeVisible();
});
```

### Best Practices for E2E Tests

1. **Test critical user journeys**
   - Focus on happy paths and common error scenarios
   - Don't test every edge case (that's for unit tests)

2. **Use data-testid for stable selectors**
   ```html
   <button data-testid="complete-button">Complete</button>
   ```
   ```typescript
   await page.getByTestId('complete-button').click();
   ```

3. **Wait for elements properly**
   ```typescript
   // ✅ Good - wait for element
   await expect(page.getByText('Success')).toBeVisible();
   
   // ❌ Bad - arbitrary timeout
   await page.waitForTimeout(3000);
   ```

4. **Clean up test data**
   - Use `beforeEach` and `afterEach` hooks
   - Reset database state between tests

5. **Test on multiple browsers**
   - Chromium, Firefox, WebKit
   - Mobile viewports

---

## Test Coverage Goals

### Current Coverage Targets

- **Unit Tests**: 70% code coverage
- **Integration Tests**: Cover all critical flows
- **E2E Tests**: Cover all user journeys

### Viewing Coverage Report

```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` in your browser to see detailed coverage report.

---

## CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions.

### Workflow Steps

1. **Unit Tests** - Run on every commit
2. **Build Test** - Ensure code compiles
3. **E2E Tests** - Run on main branch and PRs
4. **Lint & Type Check** - Code quality checks
5. **Security Audit** - Check for vulnerabilities

### Viewing Test Results

- Go to GitHub Actions tab in repository
- Click on the workflow run
- View test results and artifacts

---

## Common Testing Patterns

### Testing Forms

```typescript
test('should submit form with valid data', async () => {
  const { getByLabelText, getByText } = render(<MyForm />);
  
  // Fill form
  fireEvent.change(getByLabelText('Name'), { target: { value: 'John' } });
  fireEvent.change(getByLabelText('Email'), { target: { value: 'john@example.com' } });
  
  // Submit
  fireEvent.click(getByText('Submit'));
  
  // Verify
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
    });
  });
});
```

### Testing API Calls

```typescript
test('should fetch data on mount', async () => {
  const mockData = { id: 1, name: 'Test' };
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
  });
  
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Testing Navigation

```typescript
test('should navigate to dashboard after completion', async () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  
  const { getByText } = render(<MyComponent />);
  fireEvent.click(getByText('Complete'));
  
  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
```

### Testing Loading States

```typescript
test('should show loading spinner while fetching', async () => {
  render(<MyComponent />);
  
  // Should show loading initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Should hide loading after data loads
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
test('should show error message on failure', async () => {
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    }),
  });
  
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test MyComponent.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npm run test:e2e:debug

# Run with UI mode
npm run test:e2e:ui
```

---

## Troubleshooting

### Common Issues

**Issue: Tests timeout**
```typescript
// Increase timeout for slow operations
test('slow operation', async () => {
  // ...
}, 30000); // 30 second timeout
```

**Issue: Element not found**
```typescript
// Use waitFor for async elements
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

**Issue: Mock not working**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new features:

1. ✅ Write tests for new components
2. ✅ Update existing tests if behavior changes
3. ✅ Ensure all tests pass before committing
4. ✅ Maintain or improve code coverage

**Pre-commit checklist:**
- [ ] All tests pass (`npm run test:all`)
- [ ] Code coverage meets targets
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)


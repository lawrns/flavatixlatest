# Contributing to Flavatix

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation Standards](#documentation-standards)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- Code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/lawrns/flavatixlatest.git
cd flavatixlatest

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local

# Run development server
npm run dev
```

---

## Development Workflow

### Branch Strategy

```
main                 ← Production-ready code
  ├── feat/*        ← New features
  ├── fix/*         ← Bug fixes
  ├── docs/*        ← Documentation updates
  ├── refactor/*    ← Code refactoring
  └── test/*        ← Test additions/updates
```

### Branch Naming Convention

```bash
# Feature
git checkout -b feat/add-export-pdf

# Bug fix
git checkout -b fix/slider-flickering

# Documentation
git checkout -b docs/update-api-reference

# Refactor
git checkout -b refactor/extract-auth-logic

# Test
git checkout -b test/add-tasting-tests
```

---

## Coding Standards

### TypeScript

**Always use TypeScript for type safety.**

```typescript
// ✅ Good: Explicit types
interface TastingSession {
  id: string;
  session_name: string;
  created_at: string;
}

function createTasting(data: TastingSession): Promise<TastingSession> {
  // ...
}

// ❌ Bad: No types
function createTasting(data) {
  // ...
}
```

---

### Component Structure

```typescript
// ✅ Good: Well-structured component
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TastingCardProps {
  tasting: TastingSession;
  onDelete: (id: string) => void;
}

export const TastingCard: React.FC<TastingCardProps> = ({ tasting, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(tasting.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h3>{tasting.session_name}</h3>
      <Button onClick={handleDelete} loading={isDeleting}>
        Delete
      </Button>
    </div>
  );
};
```

---

### Naming Conventions

**Variables and Functions:**
```typescript
// ✅ camelCase
const userId = '123';
const handleSubmit = () => {};

// ❌ snake_case
const user_id = '123';
```

**Components:**
```typescript
// ✅ PascalCase
const TastingCard = () => {};
const UserProfile = () => {};

// ❌ camelCase
const tastingCard = () => {};
```

**Constants:**
```typescript
// ✅ UPPER_SNAKE_CASE
const MAX_ITEMS = 50;
const API_BASE_URL = '/api';

// ❌ camelCase
const maxItems = 50;
```

**CSS Classes:**
```css
/* ✅ kebab-case or Tailwind utilities */
.tasting-card { }
.user-profile { }

/* ❌ camelCase or snake_case */
.tastingCard { }
.tasting_card { }
```

---

### File Organization

```typescript
// ✅ Good: Organized imports
// 1. External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Internal utilities
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// 3. Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 4. Types
import type { TastingSession } from '@/lib/types';

// 5. Styles (if any)
import styles from './TastingCard.module.css';
```

---

### Error Handling

```typescript
// ✅ Good: Proper error handling
async function fetchTasting(id: string) {
  try {
    const { data, error } = await supabase
      .from('quick_tastings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Tasting', 'Failed to fetch tasting', error);
      throw new Error(`Failed to fetch tasting: ${error.message}`);
    }

    return data;
  } catch (error) {
    // Handle unexpected errors
    logger.error('Tasting', 'Unexpected error', error);
    throw error;
  }
}

// ❌ Bad: No error handling
async function fetchTasting(id: string) {
  const { data } = await supabase
    .from('quick_tastings')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}
```

---

### Comments

**Write comments for complex logic, not obvious code.**

```typescript
// ✅ Good: Explains why
// Debounce to avoid excessive database calls during slider movement
const debouncedUpdate = debounce(updateDatabase, 300);

// ❌ Bad: States the obvious
// Set the user name to the value from the input
setUserName(event.target.value);

// ✅ Good: Documents public APIs
/**
 * Creates a new tasting session.
 *
 * @param data - Tasting session data
 * @returns Created tasting session
 * @throws {Error} If user is not authenticated
 */
export async function createTasting(data: TastingData): Promise<TastingSession> {
  // ...
}
```

---

## Git Workflow

### Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Feature
git commit -m "feat(tasting): add PDF export functionality"

# Bug fix
git commit -m "fix(slider): prevent flickering on rapid updates"

# Documentation
git commit -m "docs(api): update endpoint documentation"

# Multiple lines
git commit -m "feat(tasting): add collaborative editing

- Add real-time sync via Supabase Realtime
- Update UI to show participant cursors
- Add conflict resolution for simultaneous edits

Closes #123"
```

---

### Commit Best Practices

**1. Atomic Commits**
- One logical change per commit
- Can be reverted independently

```bash
# ✅ Good: Separate commits
git commit -m "feat(ui): add Button component"
git commit -m "feat(tasting): use new Button in TastingCard"

# ❌ Bad: Multiple unrelated changes
git commit -m "Add button, fix slider, update docs"
```

**2. Test Before Committing**
```bash
# Run lint and tests
npm run lint
npm test

# Then commit
git commit -m "feat(tasting): add export feature"
```

---

## Pull Request Process

### Before Creating a PR

1. **Sync with main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all checks:**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Update documentation** if needed

---

### PR Title Format

```
<type>(<scope>): <description>
```

**Examples:**
```
feat(tasting): Add PDF export functionality
fix(auth): Resolve session timeout issue
docs(api): Update authentication guide
```

---

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes.

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console errors/warnings
```

---

### Code Review Guidelines

**For Reviewers:**
- Review within 24 hours
- Be constructive and specific
- Approve only if all concerns addressed

**For Authors:**
- Respond to all comments
- Update code based on feedback
- Re-request review after changes

**Review Checklist:**
- [ ] Code follows project standards
- [ ] Logic is clear and correct
- [ ] Edge cases handled
- [ ] Tests cover new code
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable

---

## Testing Guidelines

### Unit Tests

**Location:** `__tests__/` directory

**Naming:** `ComponentName.test.tsx`

```typescript
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
});
```

---

### Integration Tests

**Location:** `tests/` directory

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tasting Creation', () => {
  test('user can create a new tasting', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create-tasting');

    // Fill form
    await page.fill('[name="session_name"]', 'Test Tasting');
    await page.selectOption('[name="category"]', 'wine');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect
    await expect(page).toHaveURL(/\/tasting\/[a-f0-9-]+/);

    // Verify tasting created
    await expect(page.locator('h1')).toContainText('Test Tasting');
  });
});
```

---

### Test Coverage

**Minimum Requirements:**
- Unit tests: 70% coverage
- Critical paths: 90% coverage

**Check Coverage:**
```bash
npm run test:coverage
```

---

## Documentation Standards

### Component Documentation

```typescript
/**
 * Button component with multiple variants.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline';

  /** Button size */
  size?: 'sm' | 'md' | 'lg';

  /** Click handler */
  onClick?: () => void;

  /** Disable button */
  disabled?: boolean;

  /** Button content */
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
};
```

---

### API Documentation

Document all API endpoints in `API_REFERENCE.md`:

```markdown
### Create Tasting

**Endpoint:** `POST /api/tastings/create`

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "mode": "quick",
  "category": "wine",
  "session_name": "Evening Tasting"
}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "id": "...",
    "session_name": "Evening Tasting"
  }
}
\`\`\`
```

---

### Code Comments

```typescript
// ✅ Good: Explains non-obvious decisions
// Using debounce to prevent excessive API calls during slider movement.
// Without this, each pixel moved triggers a database update.
const debouncedUpdate = debounce(updateScore, 300);

// ✅ Good: Documents workarounds
// HACK: Supabase ignores undefined values in updates.
// Convert undefined to null to actually clear the field.
const updates = Object.fromEntries(
  Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
);

// ✅ Good: Warns about gotchas
// WARNING: This query bypasses RLS. Only use for admin operations.
const { data } = await supabase
  .rpc('admin_get_all_users');
```

---

## Quick Reference

### Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable issues
npm test             # Run unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# E2E Tests
npm run test:e2e     # Run Playwright tests
npm run test:e2e:ui  # Playwright UI mode
```

---

### Useful Scripts

```bash
# Create new branch
git checkout -b feat/my-feature

# Sync with main
git fetch origin
git rebase origin/main

# Interactive rebase (clean up commits)
git rebase -i HEAD~3

# Amend last commit
git commit --amend --no-edit

# Push force (after rebase)
git push --force-with-lease
```

---

## Getting Help

**Questions?**
- Check existing documentation
- Search closed issues
- Ask in discussions

**Found a Bug?**
- Check if it's already reported
- Create a detailed issue with:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots/logs

**Feature Request?**
- Open a discussion first
- Explain the use case
- Provide examples

---

Thank you for contributing to Flavatix! 🎉

**Last Updated:** January 2026
**Maintainer:** Development Team

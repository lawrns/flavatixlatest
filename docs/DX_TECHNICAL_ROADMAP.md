# Flavatix DX Technical Roadmap

**Purpose:** Provide step-by-step technical implementation details for all DX improvements

---

## Directory Structure

Create this documentation structure:

```
docs/
├── SETUP.md                    # Quick start guide
├── DEVELOPMENT.md              # Development workflow
├── TESTING.md                  # Testing strategies
├── DEBUGGING.md                # Debugging tools
├── ARCHITECTURE.md             # System design
├── DATABASE.md                 # Database schema
├── API.md                      # API endpoints
├── GIT_WORKFLOW.md             # Git conventions
├── TROUBLESHOOTING.md          # Common issues
├── DEPENDENCIES.md             # Dependency rationale
└── CONTRIBUTING.md             # Contribution guidelines
```

Reorganize root:

```
strategy/
├── FLAVATIX_RADICAL_UPGRADE_PLAN.md
├── RESEARCH_SUMMARY.md
└── [other strategic docs]
```

---

## Implementation Tasks

### 1. Setup Automation

**File:** `scripts/setup.sh`

**Benefits:**

- New developers get working environment in <5 minutes
- Consistency across team
- Prevents missed setup steps
- Automated environment validation

**Features to include:**

- Node version check
- npm ci installation
- .env.local setup
- Dev server test run
- Success/failure reporting

**Acceptance Criteria:**

- Script is executable (`chmod +x`)
- Runs without errors
- Creates .env.local
- Starts dev server successfully
- Clear error messages for failures

---

### 2. Code Quality Tools

#### Install Prettier

```bash
npm install --save-dev prettier
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

**Benefits:**

- Consistent code formatting across team
- Reduces style debate in code reviews
- Auto-fix formatting on save
- Zero configuration after setup

**Configuration:**

- Line width: 100 characters
- Trailing commas: ES5
- Single quotes for strings
- Tab width: 2 spaces

**Integration:**

- VSCode: Format on save
- Git hook: Pre-commit formatting check
- CI: Format validation

---

#### Enhance ESLint

**Current issues (23 warnings!):**

- HTML img elements should use Next Image
- Unescaped HTML entities
- Old-style anchor tags instead of Next Link
- React hook dependency issues

**New rules to add:**

```javascript
{
  "rules": {
    // Errors (fail builds)
    "@next/next/no-html-link-for-pages": "error",
    "react/no-unescaped-entities": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],

    // Warnings (require review)
    "react-hooks/exhaustive-deps": "warn",
  }
}
```

**Benefits:**

- Catch bugs early (no-unused-vars, exhaustive-deps)
- Enforce best practices (prefer-const, eqeqeq)
- Prevent console spam (no-console)
- Reduce security issues (no-var)

---

### 3. IDE Configuration

#### VSCode Settings (.vscode/settings.json)

**Key features:**

- Prettier as default formatter
- Format on save
- ESLint auto-fix on save
- TypeScript language server
- Path alias support
- Editor preferences

**Extensions to recommend:**

1. esbenp.prettier-vscode (formatting)
2. dbaeumer.vscode-eslint (linting)
3. bradlc.vscode-tailwindcss (Tailwind autocomplete)
4. ms-playwright.playwright (E2E testing)
5. eamodio.gitlens (git visualization)

**Benefits:**

- Automatic code formatting
- Real-time linting feedback
- Better autocomplete
- Integrated debugging
- Consistent experience across team

---

#### Debug Configuration (.vscode/launch.json)

**Configurations:**

1. Next.js dev server debugging
2. Jest test debugging
3. Playwright debugging (optional)

**Features:**

- Breakpoint support
- Variable inspection
- Watch expressions
- Call stack navigation
- Console debugging

**Usage:**

```
Press F5 → Select "Next.js"
→ Set breakpoints
→ Step through code
```

---

### 4. Git Workflow & Hooks

#### Husky Installation

```bash
npm install --save-dev husky
npx husky install
```

**Pre-commit Hook:**

- Run Prettier (auto-format)
- Run ESLint
- Run TypeScript type check
- Prevent commits with issues

**Commit-msg Hook:**

- Validate commit message format
- Check conventional commits
- Prevent bad commit messages

**Benefits:**

- Prevent committing code with style issues
- Enforce conventional commit format
- Quick feedback loop
- Consistent code quality

#### Commitlint Configuration

**Commit types:**

- `feat:` New feature (bumps minor version)
- `fix:` Bug fix (bumps patch version)
- `docs:` Documentation only
- `style:` Code formatting (no logic change)
- `refactor:` Code restructure (no feature change)
- `perf:` Performance improvement
- `test:` Test additions/changes
- `chore:` Build, deps, CI
- `ci:` CI/CD configuration

**Commit examples:**

```
feat: add flavor wheel filter by category
fix: resolve loading state in dashboard
docs: update API documentation
test: add tests for flavor wheel component
chore: update Next.js to 14.2.0
```

**Benefits:**

- Readable git history
- Automatic changelog generation
- Semantic versioning
- Clear commit intent

---

### 5. Development Scripts

#### npm Script Additions

**Group 1: Development**

```json
{
  "dev": "next dev -p 3000",
  "dev:debug": "DEBUG=flavatix:* next dev -p 3000",
  "dev:fresh": "rm -rf .next && npm run dev"
}
```

**Group 2: Code Quality**

```json
{
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
  "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
  "validate": "npm run lint && npm run type-check && npm run test:unit"
}
```

**Group 3: Testing**

```json
{
  "test": "jest",
  "test:unit": "jest --testPathIgnorePatterns=e2e",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage --testPathIgnorePatterns=e2e",
  "test:e2e": "playwright test",
  "test:all": "npm run test:unit && npm run test:e2e"
}
```

**Benefits:**

- Consistent command names across team
- Discoverable workflows
- Self-documenting commands
- Easy to remember

---

### 6. Structured Logging

#### Create Logger Utility

**File:** `lib/logger.ts`

**Features:**

- Log levels: debug, info, warn, error
- Timestamp included
- Environment-aware (dev vs prod)
- Sentry integration ready
- React hook support

**Usage:**

```typescript
import { logger } from '@/lib/logger';

logger.debug('User profile loaded', { userId: '123' });
logger.info('API request successful');
logger.warn('Deprecated API used');
logger.error('Failed to save data', error);

// In React components
function ProfileComponent() {
  useDebugLog('ProfileComponent', { userId });
  // ...
}
```

**Benefits:**

- Structured debugging
- Easy to filter by level
- Consistent format
- Less spammy console
- Production-ready

---

### 7. Testing Infrastructure

#### Mock Service Worker (MSW)

**Install:**

```bash
npm install --save-dev msw
npx msw init public
```

**Setup:**

```typescript
// lib/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/tastings', () => {
    return HttpResponse.json({ tastings: [] });
  }),
];
```

**Use in tests:**

```typescript
import { server } from '@/lib/mocks/server';

describe('API', () => {
  it('fetches tastings', async () => {
    const response = await fetch('/api/tastings');
    expect(response.status).toBe(200);
  });
});
```

**Benefits:**

- No real API calls in tests
- Fast test execution
- Deterministic results
- Easy error simulation

#### Test Data Builders

**File:** `__tests__/fixtures/builders.ts`

```typescript
export function createMockTasting(overrides = {}) {
  return {
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Tasting',
    description: 'A test tasting',
    createdAt: new Date(),
    userId: 'user-123',
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  };
}
```

**Benefits:**

- Reduced code duplication
- Consistent test data
- Easy to maintain
- Clear test intent

#### Test Utilities

**File:** `__tests__/utils/test-utils.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    }),
    ...renderOptions
  }: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
```

**Benefits:**

- Consistent test setup
- Less boilerplate
- All providers configured
- Easy to add more providers

---

### 8. Documentation

#### Key Documents to Create

**SETUP.md**

- System requirements
- Step-by-step setup
- Environment variables (required vs optional)
- Verification checklist
- Common issues and solutions

**DEVELOPMENT.md**

- Available npm scripts
- Development workflow examples
- Git workflow
- File structure explanation
- Testing guidelines

**TESTING.md**

- Unit test examples
- E2E test examples
- Test data usage
- Debugging tests
- Coverage targets

**DEBUGGING.md**

- VSCode debugging setup
- Debug logging usage
- Browser DevTools tips
- Network debugging
- Common debugging patterns

**ARCHITECTURE.md**

- System overview
- Component hierarchy
- Data flow
- API integration
- State management

**DATABASE.md**

- Schema overview
- Key relationships
- Migration process
- Seed data
- Backup/restore procedures

**API.md**

- Endpoint listing
- Request/response examples
- Authentication
- Error handling
- Rate limiting

**GIT_WORKFLOW.md**

- Branch naming
- Commit message format
- PR process
- Review checklist
- Merge strategy

**TROUBLESHOOTING.md**

- Common errors
- Solutions
- Debug commands
- Where to find logs
- Contact/escalation

---

## Dependency Cleanup

### Audit Current Dependencies

```bash
npm audit           # Security vulnerabilities
npm ls             # Full dependency tree
npx depcheck       # Unused dependencies
npm outdated       # Out-of-date packages
```

### Action Items

**REMOVE:**

- `puppeteer` (use only Playwright)
- Any duplicate packages

**VERIFY:**

- `node-mocks-http` (used for testing?)
- `nanoid` (still needed?)
- All major dependencies have clear purpose

**UPDATE:**

- Create dependency update policy
- Add `npm-check-updates` for automation
- Document version pinning strategy

---

## CI/CD Improvements

### Stricter Build Checks

**Update `.github/workflows/test.yml`:**

**Before:**

```yaml
- name: Run ESLint
  run: npm run lint
  continue-on-error: true # ← Allows failures!

- name: Run TypeScript type check
  run: npx tsc --noEmit
  continue-on-error: true # ← Allows failures!
```

**After:**

```yaml
- name: Run ESLint
  run: npm run lint

- name: Run TypeScript type check
  run: npx tsc --noEmit

- name: Run format check
  run: npm run format:check
```

**Benefits:**

- No code with warnings deployed
- Prevents tech debt accumulation
- Forces quality improvement
- Clearer deployment status

---

## Timeline & Effort

### Week 1: Foundation (8-10 hours)

- [ ] Install Prettier & configure
- [ ] Enhance ESLint rules
- [ ] Update VSCode settings
- [ ] Create .editorconfig
- [ ] Create setup script
- [ ] Add development npm scripts

### Week 2: Automation (6-8 hours)

- [ ] Install Husky & Commitlint
- [ ] Configure git hooks
- [ ] Create logger utility
- [ ] Create SETUP.md
- [ ] Create DEVELOPMENT.md

### Week 3: Testing (8-10 hours)

- [ ] Install & setup MSW
- [ ] Create test data builders
- [ ] Create test utilities
- [ ] Create TESTING.md
- [ ] Add test examples

### Week 4: Documentation (6-8 hours)

- [ ] Create ARCHITECTURE.md
- [ ] Create API.md
- [ ] Create DEBUGGING.md
- [ ] Create TROUBLESHOOTING.md
- [ ] Review all documentation

**Total Effort:** 28-36 hours
**Recommended Pace:** 1-2 weeks at 4 hours/day

---

## Success Metrics

### Before DX Improvements

- Setup time: 10-15 minutes
- Code review friction: High (style issues)
- New developer onboarding: 2+ hours
- Test isolation issues: Frequent
- Linting warnings: 23+

### After DX Improvements

- Setup time: 3-5 minutes
- Code review friction: Low (auto-formatted)
- New developer onboarding: 30 minutes
- Test isolation issues: Rare
- Linting warnings: 0
- Time to first contribution: 1 hour

---

## Maintenance

### Monthly

- Update security audit (`npm audit`)
- Review and approve dependency updates
- Check for deprecated packages

### Quarterly

- Review git commits for convention compliance
- Analyze test coverage trends
- Audit development workflow feedback

### Annually

- Major version upgrades (Next.js, React)
- Documentation audit
- Workflow process improvements

---

## Questions & Decisions

**Q: Should we switch to Yarn or pnpm?**
A: No. Stick with npm for simplicity and consistency.

**Q: Should we use Vitest instead of Jest?**
A: Jest is fine. Vitest is better but not necessary now.

**Q: Should we enforce TypeScript strict mode?**
A: Yes, it's already enabled. Keep `"strict": true`.

**Q: Should we add tRPC?**
A: Not needed now. API routes work well.

**Q: Should we use SWC for production builds?**
A: Already enabled (`swcMinify: true`). Good.

---

## Resources

- [Prettier Docs](https://prettier.io/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Husky Docs](https://typicode.github.io/husky/)
- [Commitlint](https://commitlint.js.org/)
- [MSW Docs](https://mswjs.io/)
- [Jest Docs](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)

---

**This roadmap provides the technical details for all DX improvements mentioned in DX_ASSESSMENT_REPORT.md**

Implement in order, and reach out with questions!

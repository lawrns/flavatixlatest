# Flavatix DX Improvements - Quick Start Implementation Guide

**Goal:** Implement high-impact, low-effort DX improvements within 4-6 hours

---

## Phase 1: Core Foundation (2-3 hours)

### Step 1: Install Prettier & ESLint Extensions

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

Create `/Users/lukatenbosch/Downloads/flavatixlatest/.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### Step 2: Create EditorConfig

Create `/Users/lukatenbosch/Downloads/flavatixlatest/.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### Step 3: Enhance VSCode Settings

Update `/Users/lukatenbosch/Downloads/flavatixlatest/.vscode/settings.json`:

```json
{
  "typescript.autoClosingTags": false,
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "search.exclude": {
    "**/node_modules": true,
    ".next": true,
    "coverage": true,
    ".playwright-mcp": true,
    ".vercel": true,
    ".netlify": true
  },
  "files.exclude": {
    "**/node_modules": true,
    ".next": true,
    "coverage": true
  },
  "editor.formatOnPaste": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

### Step 4: Create Extensions Recommendation

Create `/Users/lukatenbosch/Downloads/flavatixlatest/.vscode/extensions.json`:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "xabikos.JavaScriptSnippets",
    "eamodio.gitlens",
    "ms-playwright.playwright",
    "ms-vscode.makefile-tools"
  ]
}
```

### Step 5: Create ESLint Debug Configuration

Create `/Users/lukatenbosch/Downloads/flavatixlatest/.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Jest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--testPathPattern=${file}"],
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

---

## Phase 2: Setup Automation & Scripts (1-2 hours)

### Step 6: Create Setup Script

Create `/Users/lukatenbosch/Downloads/flavatixlatest/scripts/setup.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Flavatix Setup Script"
echo "========================"

# Check Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install Node.js first."
  exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
else
  echo "✅ Dependencies already installed"
fi

# Setup .env.local
if [ ! -f ".env.local" ]; then
  echo "📋 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your actual values"
  echo "   Required variables:"
  echo "   - NEXT_PUBLIC_SUPABASE_URL"
  echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "   - ANTHROPIC_API_KEY"
else
  echo "✅ .env.local already exists"
fi

# Test dev server
echo ""
echo "🧪 Testing dev server startup..."
timeout 10 npm run dev 2>&1 | head -5 || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your environment variables"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
```

Make it executable:

```bash
chmod +x /Users/lukatenbosch/Downloads/flavatixlatest/scripts/setup.sh
```

### Step 7: Add NPM Scripts

Update `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "dev:debug": "DEBUG=flavatix:* next dev -p 3000",
    "dev:fresh": "rm -rf .next && npm run dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "setup": "bash scripts/setup.sh",
    "test": "jest",
    "test:unit": "jest --testPathIgnorePatterns=e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --testPathIgnorePatterns=e2e",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:unit && npm run test:e2e",
    "validate": "npm run lint && npm run type-check && npm run test:unit"
  }
}
```

---

## Phase 3: Git Workflow & Hooks (1 hour)

### Step 8: Install Husky & Commitlint

```bash
npm install --save-dev husky @commitlint/config-conventional @commitlint/cli
npx husky install
```

Create `/Users/lukatenbosch/Downloads/flavatixlatest/commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Code style changes (no logic)
        'refactor', // Code refactor (no feature/bug change)
        'perf', // Performance improvements
        'test', // Test additions/changes
        'chore', // Build, deps, tools
        'ci', // CI/CD configuration
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-period': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
  },
};
```

### Step 9: Add Git Hooks

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
npx husky add .husky/pre-commit 'npm run format && npm run lint'
```

---

## Phase 4: Documentation (30-45 min)

### Step 10: Create SETUP.md

Create `/Users/lukatenbosch/Downloads/flavatixlatest/docs/SETUP.md`:

````markdown
# Setup Guide - Flavatix Development

## Quick Start (5 minutes)

```bash
npm run setup
npm run dev
# Visit http://localhost:3000
```
````

## Requirements

- Node.js 20+ (check with `node -v`)
- npm 10+ (check with `npm -v`)
- Git

## Detailed Setup

1. Clone the repository

```bash
git clone <repo-url>
cd flavatix
```

2. Run setup script

```bash
npm run setup
```

3. Configure environment variables
   Edit `.env.local` with your values:

- NEXT_PUBLIC_SUPABASE_URL (required)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (required)
- ANTHROPIC_API_KEY (required for AI features)
- NEXTAUTH_SECRET (optional - for authentication)

4. Start development server

```bash
npm run dev
```

5. Open browser
   Visit http://localhost:3000

## Troubleshooting

**Port 3000 already in use**

```bash
npm run dev -- -p 3001
# or
lsof -i :3000
kill -9 <PID>
```

**Module not found errors**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment variable errors**
Check `.env.local` exists and has required variables set.

**TypeScript errors**
Run `npm run type-check` to see full error list.

## Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow
- Read [API.md](./API.md) for API endpoints
- Check [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for commit conventions

````

### Step 11: Create DEVELOPMENT.md
Create `/Users/lukatenbosch/Downloads/flavatixlatest/docs/DEVELOPMENT.md`:
```markdown
# Development Guide

## Available Scripts

### Development
- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run dev:fresh` - Clean build + start
- `npm run dev:debug` - Start with debug logging enabled

### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:watch` - Watch mode for TDD
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - E2E tests with UI
- `npm run test:all` - Full test suite

### Code Quality
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type check
- `npm run format` - Auto-format code with Prettier
- `npm run format:check` - Check formatting
- `npm run validate` - Run all checks (lint + type-check + tests)

### Build
- `npm run build` - Build for production
- `npm start` - Run production build

## Common Workflows

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Start dev server
npm run dev

# 3. Make changes, test locally

# 4. Run tests before commit
npm run validate

# 5. Commit changes (conventional commit)
git add .
git commit -m "feat: add my feature"

# 6. Push and create PR
git push origin feat/my-feature
````

### Bug Fix

```bash
git checkout -b fix/issue-description
# ... make changes, test ...
npm run validate
git add .
git commit -m "fix: resolve issue description"
git push origin fix/issue-description
```

### Debugging

**Enable debug logging**

```bash
npm run dev:debug
```

**VSCode debugging**

- Open VSCode
- Press F5 to start debugger
- Set breakpoints and step through code

## File Structure

```
src/
├── app/          # Next.js app directory
├── components/   # Reusable React components
├── pages/        # API routes and old pages
├── lib/          # Utilities and helpers
├── hooks/        # Custom React hooks
├── styles/       # Global CSS
├── contexts/     # React contexts
└── __tests__/    # Test files
```

## Writing Tests

See [TESTING.md](./TESTING.md) for detailed guide.

Quick example:

```typescript
describe('Component', () => {
  it('should render', () => {
    const { getByText } = render(<Component />);
    expect(getByText('Expected')).toBeInTheDocument();
  });
});
```

## Git Commits

Use conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: format code`
- `test: add tests`
- `refactor: restructure code`
- `chore: update dependencies`

See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for more details.

````

### Step 12: Create Structured Logger
Create `/Users/lukatenbosch/Downloads/flavatixlatest/lib/logger.ts`:
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel(): LogLevel {
  if (typeof window === 'undefined') {
    // Server side
    return (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
  }
  // Client side
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVEL[level] >= LOG_LEVEL[currentLevel];
}

function formatLog(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  if (data) {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.debug(formatLog('debug', message), data);
    }
  },

  info: (message: string, data?: any) => {
    if (shouldLog('info')) {
      console.info(formatLog('info', message), data);
    }
  },

  warn: (message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', message), data);
    }
  },

  error: (message: string, error?: any) => {
    if (shouldLog('error')) {
      console.error(formatLog('error', message), error);
      // Optionally send to Sentry
      if (error instanceof Error) {
        // Sentry.captureException(error);
      }
    }
  },
};

// React Hook for component lifecycle logging
export function useDebugLog(componentName: string, data?: any) {
  if (typeof window === 'undefined') return; // Skip server

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_LOG_LEVEL === 'debug') {
      logger.debug(`[${componentName}] mounted`, data);
      return () => {
        logger.debug(`[${componentName}] unmounted`);
      };
    }
  }, [componentName, data]);
}
````

---

## Verification Checklist

After implementing all steps, verify:

- [ ] `.prettierrc` exists and Prettier formats on save
- [ ] `.editorconfig` exists
- [ ] `.vscode/settings.json` configured
- [ ] `.vscode/extensions.json` configured
- [ ] `.vscode/launch.json` exists for debugging
- [ ] `scripts/setup.sh` is executable and works
- [ ] `npm run setup` completes successfully
- [ ] `npm run dev` starts server
- [ ] `npm run format` formats all files
- [ ] `npm run validate` passes all checks
- [ ] Git hooks are installed (`cat .husky/pre-commit`)
- [ ] Commitlint rejects bad commit messages
- [ ] `docs/SETUP.md` exists and is readable
- [ ] `docs/DEVELOPMENT.md` exists and is readable
- [ ] `lib/logger.ts` exists and exports logger

---

## Testing the Setup

Run this command to test everything works:

```bash
#!/bin/bash
echo "Testing Flavatix DX Setup..."
npm run format:check && echo "✅ Format check passed"
npm run lint && echo "✅ Linting passed"
npm run type-check && echo "✅ Type checking passed"
npm run test:unit && echo "✅ Unit tests passed"
echo ""
echo "✅ All checks passed!"
```

---

## Estimated Time Investment

| Task              | Time       | Impact        |
| ----------------- | ---------- | ------------- |
| Prettier + ESLint | 10 min     | High          |
| VSCode config     | 10 min     | High          |
| Git hooks         | 15 min     | Medium        |
| Setup automation  | 15 min     | High          |
| Documentation     | 30 min     | High          |
| **Total**         | **80 min** | **Very High** |

---

## Next Phase (Optional)

After completing this phase, consider:

1. **Testing Infrastructure**
   - Install Mock Service Worker (MSW)
   - Create test data builders
   - Add E2E test examples

2. **Enhanced Debugging**
   - Create useDebugLog hook
   - Add API logging middleware
   - Create React DevTools setup guide

3. **Full Documentation Suite**
   - API endpoint documentation
   - Component style guide
   - Architecture diagrams
   - Database schema documentation

---

**Implementation Time:** 80-90 minutes
**Difficulty:** Easy
**Impact:** Very High

Start with Phase 1 (core foundation) - it gives you the most value in the least time.

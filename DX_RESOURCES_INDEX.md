# DX Improvements - Resources Index

A complete index of all Developer Experience improvements, resources, and how to use them.

## Quick Navigation

### I'm New and Want to Start
1. Read: `/DX_QUICK_START.md` (5 min read)
2. Run: `bash setup.sh` (5-7 min)
3. Read: `/DEVELOPMENT.md` section "Quick Start"
4. Start: `npm run dev`

### I Want to Understand All Changes
1. Read: `/DX_IMPROVEMENTS.md` (complete list)
2. Read: `/DX_IMPLEMENTATION_COMPLETE.md` (metrics)
3. Review: Configuration files (see below)

### I Want to Configure Something
1. VSCode: See `/.vscode/settings.json`
2. Linting: See `/.eslintrc.json`
3. Formatting: See `/.prettierrc.json`
4. Git: See `/.gitmessage`
5. Environment: See `/.env.local.template`

### I Need Help With...
- **Setup**: See `/setup.sh` and `/DX_QUICK_START.md`
- **Development**: See `/DEVELOPMENT.md`
- **Code Quality**: See `/.eslintrc.json` and `/.prettierrc.json`
- **Git Workflow**: See `/.gitmessage`
- **Testing**: See `/__mocks__/` directory
- **Debugging**: See `/.vscode/launch.json`
- **Environment**: See `/.env.local.template`

---

## Documentation Files

### Primary Documentation (Read These)

| File | Purpose | Length |
|------|---------|--------|
| `DX_QUICK_START.md` | Quick reference for common tasks | 5 min |
| `DEVELOPMENT.md` | Complete development guide | 20-30 min |
| `DX_IMPROVEMENTS.md` | Detailed implementation list | 15 min |
| `DX_IMPLEMENTATION_COMPLETE.md` | Full report with metrics | 20 min |

### Configuration References (Consult as Needed)

| File | Purpose |
|------|---------|
| `.prettierrc.json` | Code formatting rules |
| `.eslintrc.json` | Code quality rules |
| `.editorconfig` | Editor standards |
| `.env.local.template` | Environment variables guide |
| `.gitmessage` | Git commit format guide |
| `/Makefile` | Available make commands |

---

## Configuration Files & What They Do

### Formatting & Linting
- **`/.prettierrc.json`**
  - Code formatter configuration
  - 100 char line width, single quotes, 2 spaces
  - Applies automatically on save and commit

- **`/.eslintrc.json`**
  - Code quality rules
  - No console.log, proper hook usage, strict types
  - Checked on save, warning on commit

- **`/.prettierignore`**
  - Files excluded from formatting
  - node_modules, dist, etc.

### Editor Standards
- **`/.editorconfig`**
  - Cross-editor configuration
  - UTF-8, LF endings, 2 spaces, final newline
  - Used by all editors supporting EditorConfig

### Environment Setup
- **`/.env.local.template`**
  - Copy to `.env.local` and fill in values
  - Documents all required environment variables
  - Never commit `.env.local`

### Git Workflow
- **`/.gitmessage`**
  - Commit message template
  - Format: `type: subject`
  - Types: feat, fix, docs, refactor, test, etc.

- **`/.husky/pre-commit`**
  - Runs before each commit
  - Auto-formats code with Prettier
  - Prevents committing unformatted code

### VSCode Integration
- **`/.vscode/settings.json`**
  - Prettier on save enabled
  - ESLint integration
  - TypeScript configured
  - Formatters configured per language

- **`/.vscode/extensions.json`**
  - Recommended extensions
  - Auto-prompts to install
  - Improves IDE experience

- **`/.vscode/launch.json`**
  - Debug configurations
  - Press F5 to start debugging
  - Next.js, Jest, Playwright ready

### Build Configuration
- **`/jest.config.js`**
  - Jest test configuration
  - MSW setup integrated
  - Coverage collection enabled

- **`/jest.setup.ts`**
  - Jest setup file
  - Runs before all tests
  - MSW mocking configured

- **`/Makefile`**
  - Convenience commands
  - `make help` to see all
  - 30+ shortcuts for common tasks

---

## Testing Infrastructure

### Mock Service Worker (MSW)

**Location**: `/__mocks__/`

**API Handlers**:
- `handlers/auth.ts` - Authentication mocks
- `handlers/supabase.ts` - Supabase CRUD mocks
- `handlers/anthropic.ts` - Claude API mocks

**Test Data**:
- `fixtures/user.ts` - User mock data
- `fixtures/tasting.ts` - Tasting mock data
- `fixtures/index.ts` - Fixture exports

**Testing Utils**:
- `test-utils.tsx` - Custom render + helpers
- `server.ts` - MSW server configuration

**Usage in Tests**:
```typescript
import { render } from '__mocks__/test-utils';
import { mockUser, mockTastingSession } from '__mocks__/fixtures';

// Use mocks in your tests
```

---

## npm Scripts Quick Reference

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Check linting issues
npm run lint:fix         # Auto-fix linting
npm run format           # Format code with Prettier
npm run format:check     # Check without changes
npm run type-check       # TypeScript checking
```

### Verification
```bash
npm run check            # Quick check (5 sec)
npm run check:all        # Full check with tests
npm run security-audit   # Security audit
```

### Testing
```bash
npm run test             # All tests
npm run test:unit        # Unit tests only
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
```

### Setup
```bash
npm run setup            # Run setup.sh
npm run prepare          # Husky installation
```

---

## Make Commands

### Common Commands
```bash
make dev                 # Start development
make build               # Build for production
make test                # Run tests
make check               # Quick quality check
make check-all           # Full check
make format              # Format code
make lint                # Run linter
```

### Help
```bash
make help                # Show all commands
make setup               # Run complete setup
```

See `Makefile` for complete list of 30+ commands.

---

## First-Time Setup Checklist

- [ ] Clone repository
- [ ] Run `bash setup.sh`
- [ ] Copy `.env.local.template` to `.env.local`
- [ ] Fill in `.env.local` with your values
- [ ] VSCode will suggest extensions (install them)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Make a test commit to verify hooks
- [ ] Read `/DEVELOPMENT.md` for detailed info

---

## Commit Message Format

When committing, use the template in `/.gitmessage`:

```
feat: add user authentication

Users can now log in with email/password.
Implements OAuth2 integration.

fixes #123
```

**Format**: `<type>: <subject>`

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Build, deps, tooling
- `perf` - Performance improvement
- `ci` - CI/CD configuration

---

## Debugging

### VSCode Debugging
1. Set a breakpoint (click line number)
2. Press F5 or go to Run > Start Debugging
3. Choose configuration:
   - Next.js Dev - Debug dev server
   - Jest Current File - Debug test file
   - Jest All Tests - Debug all tests
   - Playwright Tests - Debug e2E tests
4. Step through code with F10 (next), F11 (into)
5. Use Debug Console to inspect variables

### Console Debugging
```typescript
// Good - will be caught
console.warn('warning');
console.error('error');

// Bad - will fail linting
console.log('debug');  // Warning
console.info('info');  // Warning
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001      # Use port 3001 instead
# or
make kill-port               # Kill process on 3000
```

### Dependencies Not Found
```bash
npm install                  # Reinstall dependencies
```

### Type Errors
```bash
npm run type-check          # See all type errors
```

### Code Formatting Issues
```bash
npm run format              # Auto-format all code
npm run format:check        # Check without changes
```

### Git Hook Fails
The pre-commit hook will fail if Prettier can't format code.
- Run `npm run format` to fix
- Then try committing again

### Tests Failing
```bash
npm run test:unit           # Run unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # See coverage
```

### Build Fails
```bash
npm run lint:fix            # Fix linting
npm run type-check          # Check types
npm run build               # Try building again
```

---

## File Structure

```
flavatixlatest/
├── setup.sh                      # Setup script
├── Makefile                      # Make commands
│
├── Configuration Files
├── .prettierrc.json             # Prettier config
├── .prettierignore              # Prettier exclusions
├── .eslintrc.json               # ESLint config
├── .editorconfig                # Editor standards
├── .gitmessage                  # Git template
├── .env.local.template          # Env template
│
├── VSCode Config
├── .vscode/settings.json        # VSCode settings
├── .vscode/extensions.json      # Recommended extensions
├── .vscode/launch.json          # Debug configs
│
├── Git Hooks
├── .husky/pre-commit            # Pre-commit hook
│
├── Testing
├── __mocks__/
│   ├── server.ts                # MSW server
│   ├── handlers/                # API mocks
│   ├── fixtures/                # Test data
│   └── test-utils.tsx           # Test helpers
├── jest.setup.ts                # Jest setup
│
├── Documentation
├── DEVELOPMENT.md               # Development guide
├── DX_QUICK_START.md           # Quick reference
├── DX_IMPROVEMENTS.md          # All changes
├── DX_IMPLEMENTATION_COMPLETE.md # Full report
└── DX_RESOURCES_INDEX.md       # This file
```

---

## Next Steps

1. **Run Setup**: `bash setup.sh`
2. **Read Guide**: Open `/DEVELOPMENT.md`
3. **Configure Env**: Update `.env.local`
4. **Start Dev**: `npm run dev`
5. **Make Changes**: Code with auto-formatting
6. **Commit**: Git hooks auto-format on commit
7. **Deploy**: Run `npm run build` for production

---

## Resources

### External Documentation
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/docs)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Jest](https://jestjs.io)
- [Playwright](https://playwright.dev)

### Internal Resources
- `/DEVELOPMENT.md` - Complete development guide
- `/DX_QUICK_START.md` - Quick reference
- `/.eslintrc.json` - Code quality rules
- `/.prettierrc.json` - Formatting rules
- `/.gitmessage` - Git commit guide

---

**Last Updated**: January 15, 2026

For questions, see `/DEVELOPMENT.md` or check configuration files directly.

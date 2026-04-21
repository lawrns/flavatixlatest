# Development Guide for Flavatix

Welcome to the Flavatix development guide! This document covers setup, development workflows, testing, and best practices.

## Quick Start (5-7 Minutes)

### Prerequisites

- Node.js 18+ (check with `node -v`)
- npm 9+ (check with `npm -v`)

### Setup

```bash
# Clone and setup in one command
bash setup.sh

# Or step by step:
npm install
cp .env.example .env.local
npm run build
```

Update `.env.local` with your configuration values, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Scripts

### Core Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Build for production
npm run start            # Start production server
```

### Linting & Formatting

```bash
npm run lint             # Check for linting issues
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
npm run type-check       # Run TypeScript type checking
```

### Testing

```bash
npm run test             # Run all tests (unit + e2e)
npm run test:unit        # Run unit tests only
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run e2e tests with UI
npm run test:e2e:debug   # Debug e2e tests
```

### Quality & Security

```bash
npm run check            # Quick check: lint + type + unit tests
npm run check:all        # Full check: lint + type + all tests
npm run security-audit   # Run security audit
```

## Environment Setup

### Configuration Files

- `.env.local` - Your local environment variables (never commit)
- `.env.example` - Template with all required variables

### Required Environment Variables

```
# Application
NEXT_PUBLIC_APP_NAME=Flavatix
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
DATABASE_URL=postgresql://...

# AI/LLM (required for flavor features)
ANTHROPIC_API_KEY=your-key

# Authentication
NEXTAUTH_SECRET=your-secret (generate: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics, Email, Storage
SENTRY_DSN=...
SMTP_HOST=...
CLOUDINARY_CLOUD_NAME=...
```

## IDE Setup

### VSCode (Recommended)

1. Install recommended extensions:

   ```bash
   # Extensions are suggested automatically, or install:
   code --install-extension esbenp.prettier-vscode
   code --install-extension dbaeumer.vscode-eslint
   code --install-extension bradlc.vscode-tailwindcss
   ```

2. Features enabled:
   - Format on save (Prettier)
   - Lint on save (ESLint)
   - Type checking integration
   - Debug configuration (F5)

### Debug Mode

Launch configurations in `.vscode/launch.json`:

- **Next.js Dev** - Start dev server and attach debugger
- **Jest Current File** - Debug the current test file
- **Jest All Tests** - Run all tests with debugger
- **Playwright Tests** - Run e2e tests with UI

Press `F5` to start debugging or use the Debug panel.

## Code Quality Standards

### Linting Rules

- `no-console` - Only allow `console.warn()` and `console.error()`
- `prefer-const` - Use `const` over `let`
- `no-var` - Never use `var`
- `eqeqeq` - Use `===` and `!==`
- `react-hooks/exhaustive-deps` - Proper hook dependencies

### Formatting Rules (Prettier)

- 2-space indentation
- Single quotes for strings
- 100 character line width
- Trailing commas (ES5)
- No semicolons at end of statements

### TypeScript

- Strict mode enabled
- Explicit return types recommended
- No implicit `any` types
- Import paths use `@/*` alias

### Editor Config

- UTF-8 encoding
- LF line endings
- Final newline required
- Trim trailing whitespace

## Git Workflow

### Branch Naming

```
feat/feature-name          # New features
fix/bug-name               # Bug fixes
docs/what-you-documented   # Documentation
refactor/what-changed      # Refactoring
```

### Commit Messages

Use the template in `.gitmessage`:

```
feat: add user authentication

Users can now sign up and log in securely.
Implements OAuth2 with Google and GitHub.

fixes #123
```

Format: `<type>: <description>`

- Types: feat, fix, docs, style, refactor, test, chore, perf, ci
- Be specific about what and why
- Reference issues: `fixes #123`, `relates to #456`

### Pre-commit Hooks

Before committing, hooks automatically:

1. Format code (Prettier)
2. Fix lint issues (ESLint)
3. Check git diff

If hooks fail, fix the issues and try again.

### Creating Pull Requests

1. Push your branch
2. Open PR on GitHub
3. Describe what changed and why
4. Wait for CI/CD checks to pass
5. Request review
6. Address feedback
7. Merge when approved

## Testing Strategy

### Unit Tests

- Located in `__tests__` or `.test.ts` files
- Use Jest for testing
- Test behavior, not implementation
- Aim for 80%+ coverage

```bash
npm run test:unit      # Run once
npm run test:watch     # Auto-rerun on changes
npm run test:coverage  # See coverage report
```

### E2E Tests

- Located in `e2e/` directory
- Use Playwright for browser automation
- Test critical user flows
- Run against real app

```bash
npm run test:e2e       # Headless
npm run test:e2e:ui    # With UI
npm run test:e2e:debug # Step-by-step
```

### Running Tests

```bash
npm run test            # All tests (unit + e2e)
npm run test:all        # Alias for above
npm run check           # Quick: lint + type + unit tests
npm run check:all       # Full: lint + type + all tests
```

## Troubleshooting

### Common Issues

#### "port 3000 already in use"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### "TypeScript errors"

```bash
npm run type-check     # See all type errors
npm run lint:fix       # Auto-fix linting issues
```

#### ".env.local not found"

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

#### "Next.js build fails"

```bash
npm run lint:fix       # Fix linting
npm run type-check     # Check types
npm run build          # Try build again
```

#### "Tests fail in CI but pass locally"

- Ensure `npm run check:all` passes
- Check for timing issues in tests
- Verify environment variables in CI config

### Debug Logging

Enable debug output:

```bash
DEBUG=* npm run dev    # Show all debug logs
DEBUG=app:* npm run dev # Show only app logs
```

See more at: [debug npm package](https://www.npmjs.com/package/debug)

## Architecture Notes

### Key Directories

```
/pages           - Next.js routes and API endpoints
/components      - React components
/lib             - Utility functions and helpers
/styles          - Global styles and Tailwind config
/public          - Static assets
/__tests__       - Unit tests
/e2e             - E2E tests with Playwright
```

### Key Technologies

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth
- **Testing**: Jest + Playwright
- **AI**: Anthropic Claude API
- **Monitoring**: Sentry

## Performance Tips

### Build Optimization

- Use dynamic imports for large components
- Enable SWC minification (default in Next.js)
- Check bundle size: `npm run build`

### Development Optimization

- Use `npm run dev` for HMR (hot module replacement)
- Keep `.env.local` in sync with `.env.example`
- Clear `.next` cache if builds seem stale

### Testing Optimization

- Run `npm run test:watch` during development
- Use `npm run test:coverage` to find untested code
- Run `npm run test:e2e:debug` to debug specific tests

## Getting Help

### Internal Resources

- Check `README.md` for project overview
- See `DEVELOPMENT.md` (this file) for setup & workflow
- Check GitHub Issues for known problems

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io)
- [Playwright Docs](https://playwright.dev)

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes and test locally
4. Run `npm run check:all` to verify
5. Commit with clear messages
6. Push and open a PR

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] `npm run check:all` passes
- [ ] No console.logs left in code
- [ ] Tests written for new features
- [ ] TypeScript types are explicit
- [ ] No unnecessary dependencies added
- [ ] Git commit messages are clear
- [ ] Branch is up to date with main

---

## Quick Reference

| Task           | Command                  |
| -------------- | ------------------------ |
| Start dev      | `npm run dev`            |
| Check code     | `npm run check`          |
| Format code    | `npm run format`         |
| Run tests      | `npm run test`           |
| Build          | `npm run build`          |
| Type check     | `npm run type-check`     |
| Security check | `npm run security-audit` |
| Full check     | `npm run check:all`      |

---

Last updated: January 2026
For issues or suggestions, open a GitHub issue.

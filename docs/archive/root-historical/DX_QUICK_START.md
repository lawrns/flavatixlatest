# DX Improvements - Quick Start Guide

Welcome to Flavatix with enhanced Developer Experience! This quick start guide gets you up and running in 5-7 minutes.

## One-Command Setup

```bash
bash setup.sh
```

This single command will:
1. Install all npm dependencies
2. Set up environment variables
3. Build the project
4. Configure git hooks
5. Run initial linting

That's it! You're ready to develop.

## Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Essential Commands

### Daily Development
```bash
npm run dev              # Start development server
npm run check            # Quick quality check (5 sec)
npm run format           # Format all code
npm run test:watch      # Run tests in watch mode
```

### Before Committing
```bash
npm run check:all        # Full quality check (30 sec)
git add .
git commit -m "feat: your feature"  # Auto-formats before commit
```

### Debugging
- Press `F5` in VSCode to start debugging
- See breakpoint debugging in action
- Check `.vscode/launch.json` for more configurations

## Project Structure

```
flavatixlatest/
├── setup.sh              # One-command setup script
├── Makefile             # 30+ convenience commands
├── DEVELOPMENT.md       # Comprehensive dev guide
├── DX_IMPROVEMENTS.md   # All improvements documentation
├── .prettierrc.json     # Code formatter config
├── .eslintrc.json       # Linter config
├── .editorconfig        # Editor standards
├── .gitmessage          # Git commit template
├── .husky/              # Git hooks
├── .env.local.template  # Environment variables template
├── __mocks__/           # API mocking (MSW)
├── pages/               # Next.js routes
├── components/          # React components
├── lib/                 # Utilities and helpers
└── tests/               # Test files
```

## What's New

### Automated Formatting
Code is automatically formatted when you:
- Save a file (VSCode)
- Commit changes (git hook)
- Run `npm run format`

### Enforced Code Quality
- No console.log in production
- Strict TypeScript checking
- Missing dependencies caught
- Unused variables detected

### Git Hooks
Before each commit:
1. Code is formatted with Prettier
2. ESLint issues are checked
3. Commit only proceeds if checks pass

### Mock API Responses
Tests use Mock Service Worker (MSW) for:
- Authentication endpoints
- Supabase API mocking
- Anthropic Claude API mocking
- Consistent test data via fixtures

### Debug Mode
Everything is configured for debugging:
1. Press `F5` in VSCode
2. Choose configuration (Next.js, Jest, Playwright)
3. Set breakpoints and debug

## First-Time Setup Checklist

- [ ] Run `bash setup.sh`
- [ ] Update `.env.local` with your API keys
- [ ] Install VSCode extensions (auto-prompts)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Make a small change and see auto-formatting work
- [ ] Commit the change to test git hooks

## Useful Make Commands

```bash
make help               # Show all available commands
make setup              # Run setup script
make dev                # Start development
make test               # Run tests
make check              # Quick quality check
make format             # Format code
make lint               # Run linter
make build              # Build for production
make security           # Run security audit
```

## File You Need to Configure

### .env.local
Copy from `.env.local.template` and fill in:
```bash
cp .env.local.template .env.local
# Edit .env.local with your actual values:
# - SUPABASE_URL and SUPABASE_ANON_KEY
# - ANTHROPIC_API_KEY
# - Any other secrets
```

Never commit `.env.local` - it's in `.gitignore`.

## Understanding the Improvements

### 1. Setup Time: 5-7 minutes (was 10-15 min)
The `setup.sh` script automates everything from npm install to first build.

### 2. Code Quality: Automatic
- Prettier auto-formats on save
- ESLint auto-fixes on commit
- TypeScript checks on build
- No manual formatting needed

### 3. Git Workflow: Standardized
- Commit template enforces structure
- Pre-commit hooks prevent bad code
- Message format: `type: subject`
- Types: feat, fix, docs, refactor, etc.

### 4. Testing: Ready to Mock
- MSW handles API mocking
- Test fixtures provided
- Jest configured for browser testing
- E2E tests with Playwright ready

### 5. IDE: Fully Configured
- VSCode settings for all file types
- Recommended extensions listed
- Debug configurations ready (F5)
- TypeScript integration enabled

### 6. Documentation: Comprehensive
- This file: Quick start
- `DEVELOPMENT.md`: Complete guide
- `DX_IMPROVEMENTS.md`: All changes
- Code comments: Well documented

## Troubleshooting

### Port 3000 in Use
```bash
npm run dev -- -p 3001
```

### Dependencies Not Installed
```bash
npm install
```

### Type Errors
```bash
npm run type-check
```

### Code Formatting Issues
```bash
npm run format
```

### Tests Failing
```bash
npm run test:unit       # Run unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # See coverage report
```

## Next Steps

1. Read `DEVELOPMENT.md` for detailed guidance
2. Explore `Makefile` for convenient commands
3. Check `.eslintrc.json` for code standards
4. Run tests: `npm run test:unit`
5. Build: `npm run build`

## Getting Help

- **Setup Issues**: See `setup.sh` comments or `DEVELOPMENT.md`
- **Code Standards**: Check `.eslintrc.json` or `.prettierrc.json`
- **Testing**: See MSW handlers in `/__mocks__/handlers/`
- **Debugging**: Check `.vscode/launch.json`
- **Git Workflow**: See `.gitmessage` for commit format

---

## Quick Reference Table

| Task | Command | Time |
|------|---------|------|
| Setup | `bash setup.sh` | 5-7 min |
| Dev | `npm run dev` | instant |
| Check | `npm run check` | 5 sec |
| Test | `npm run test` | varies |
| Format | `npm run format` | 3-5 sec |
| Build | `npm run build` | 30-60 sec |
| Debug | Press F5 | instant |

---

**Happy coding! The project is now optimized for your developer experience.**

Last Updated: January 15, 2026

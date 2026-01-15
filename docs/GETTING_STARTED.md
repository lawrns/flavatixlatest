# Getting Started with Flavatix

Master the fundamentals in 15 minutes and deploy your first feature in 30.

## What You'll Learn

By the end of this guide, you will:
- Set up Flavatix locally on your machine
- Understand the project structure
- Run the development server
- Make your first code change
- See your changes live in the browser

## Prerequisites

- **Node.js 18+** - [Install here](https://nodejs.org)
- **npm 9+** - Comes with Node.js
- **Git** - [Install here](https://git-scm.com)
- **Text editor** - VSCode recommended [here](https://code.visualstudio.com)
- **A Supabase account** - [Create here](https://supabase.com)

**Time estimate:** 15 minutes total

## Section 1: Project Setup (5 minutes)

### Step 1: Check Prerequisites

Open your terminal and verify you have the right versions:

```bash
node -v          # Should show v18.0.0 or higher
npm -v           # Should show 9.0.0 or higher
git --version    # Should show git version 2.x.x or higher
```

If any are missing, install from the links above.

### Step 2: Clone and Install

```bash
# Navigate to where you want the project
cd ~/projects  # or your preferred location

# Clone the repository
git clone https://github.com/yourusername/flavatix.git
cd flavatix

# Install dependencies (takes 1-2 minutes)
npm install
```

Expected output:
```
added 847 packages in 45s
```

### Step 3: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

This creates `.env.local` with placeholder values. We'll configure it next.

### Step 4: Configure Environment Variables

Open `.env.local` in your editor:

```bash
# macOS/Linux
code .env.local

# Or open manually
nano .env.local
```

You'll see:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:password@localhost:5432/flavatix

# AI/LLM
ANTHROPIC_API_KEY=your-api-key

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**For local development:**

Get these values from your Supabase project:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For Anthropic API key:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create a new API key
3. Copy it to `ANTHROPIC_API_KEY`

Example `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-v1...
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Copy the output and paste it in the file.

### Step 5: Build and Start

```bash
# Build the project (takes 1-2 minutes)
npm run build

# Start the development server
npm run dev
```

Expected output:
```
> next dev -p 3000
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  ▲ Ready in 2.5s
```

### Step 6: Open in Browser

Open [http://localhost:3000](http://localhost:3000)

You should see the Flavatix home page. If you see a login page, you're in the right place!

## Section 2: Explore the Project (5 minutes)

### Project Structure

The key directories:

```
flavatix/
├── pages/              # Routes and API endpoints
│   ├── index.tsx      # Home page
│   ├── dashboard.tsx  # Main dashboard
│   ├── api/           # API endpoints (/api/*)
│   └── ...
├── components/         # React components (UI building blocks)
│   ├── quick-tasting/
│   ├── ui/
│   └── ...
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useTastingSession.ts
│   └── ...
├── lib/               # Utility functions and helpers
│   ├── supabase.ts    # Database client
│   ├── api/           # API helpers
│   └── ...
├── styles/            # Global styles
├── public/            # Static files (images, etc.)
├── __tests__/         # Unit tests
├── e2e/               # End-to-end tests
└── docs/              # Documentation
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `.env.local` | Your local configuration |
| `next.config.js` | Next.js settings |
| `tailwind.config.js` | Styling configuration |
| `package.json` | Project dependencies |
| `tsconfig.json` | TypeScript configuration |

### Common Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Check code quality
npm run test             # Run tests
npm run test:watch       # Run tests and watch for changes
npm run type-check       # Check TypeScript types
npm run format:check     # Check code formatting
```

## Section 3: Make Your First Change (5 minutes)

### Change 1: Update the Home Page Title

Open `/pages/index.tsx`:

```bash
code pages/index.tsx
```

Find this line:
```tsx
<h1 className="text-4xl font-bold">Welcome to Flavatix</h1>
```

Change it to:
```tsx
<h1 className="text-4xl font-bold">Welcome to Flavatix - My Version</h1>
```

Save the file (Ctrl+S or Cmd+S). The development server watches for changes, so your browser should update automatically.

Refresh [http://localhost:3000](http://localhost:3000) and see your change!

### Change 2: Understand Component Structure

Let's look at a component. Open `/components/ui/Button.tsx`:

```tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded font-medium transition-colors',
          variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
          variant === 'outline' && 'border border-gray-300 hover:bg-gray-50',
          size === 'sm' && 'px-2 py-1 text-sm',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

This is a reusable button component. Notice:
- **Props interface** - Defines what the component accepts
- **cn() utility** - Conditionally applies CSS classes
- **forwardRef** - Allows parent components to access the button element
- **displayName** - Helps with debugging

### Change 3: Test Your Setup

Run the type checker to verify everything works:

```bash
npm run type-check
```

Expected output:
```
Type checking successfully passed
```

If you see errors, check:
1. Node version: `node -v` should be 18+
2. Environment file: `.env.local` has required variables
3. Dependencies: Try `npm install` again

## Section 4: Understanding Data Flow (Optional, 5 minutes)

### Where Data Comes From

Flavatix has three data sources:

```
┌──────────────────────────┐
│   Your Browser           │
│   (React Components)     │
└────────────┬─────────────┘
             │ HTTP Requests
             ▼
┌──────────────────────────┐
│   Next.js API Routes     │
│   (/api/tastings/*)      │
└────────────┬─────────────┘
             │ SQL Queries
             ▼
┌──────────────────────────┐
│   Supabase Database      │
│   (PostgreSQL)           │
└──────────────────────────┘
```

### A Real Example

When you create a tasting:

1. **UI** (React component) - Shows a form
2. **User** - Fills in details and clicks "Create"
3. **API Call** - Component sends POST request to `/api/tastings/create`
4. **Validation** - API checks the data is correct
5. **Database** - API saves data to Supabase
6. **Response** - API sends back the created tasting
7. **UI Update** - Component shows success message

You'll learn more about this in [ARCHITECTURE_API_FLOW.md](./ARCHITECTURE_API_FLOW.md).

## Section 5: Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check what's wrong
npm run type-check

# Fix automatically (if possible)
npm run lint:fix
```

### Can't Connect to Database

1. Check `.env.local` has valid Supabase URL and key
2. Verify you can access Supabase: [app.supabase.com](https://app.supabase.com)
3. Check your internet connection
4. Try restarting the dev server

### Environment Variables Not Loading

```bash
# Make sure .env.local exists
ls -la .env.local

# Delete and recreate it
rm .env.local
cp .env.example .env.local
# Edit .env.local with your values
```

## Common Mistakes

### Mistake 1: Committing `.env.local`

**Wrong:**
```bash
git add .env.local
git commit -m "add env file"
```

This exposes your API keys!

**Right:**
```bash
# .env.local is in .gitignore, so this is automatic
git add .
git commit -m "add feature"
```

### Mistake 2: Changing `.env.example`

**Wrong:**
```bash
# Don't edit .env.example with your keys
nano .env.example
```

**Right:**
```bash
# Copy to .env.local and edit that
cp .env.example .env.local
nano .env.local
```

### Mistake 3: Forgetting npm install

**Wrong:**
```bash
# Don't skip this step
git clone ...
npm run dev  # ← Missing npm install!
```

**Right:**
```bash
git clone ...
npm install  # ← Required!
npm run dev
```

## Next Steps

Congratulations! You have a working Flavatix development environment.

### What to do next depends on your goal:

- **Want to understand the code?** → Read [ARCHITECTURE_STATE_MANAGEMENT.md](./ARCHITECTURE_STATE_MANAGEMENT.md)
- **Want to add a feature?** → Read [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md)
- **Want to write tests?** → Read [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md)
- **Want to debug something?** → Read [DEBUG_DEVTOOLS.md](./DEBUG_DEVTOOLS.md)

## Summary

You've learned:
- How to set up Flavatix locally
- The basic project structure
- How to make code changes and see them live
- How to run tests and checks
- Where to go next

The next guides go deeper into each topic. Pick what interests you!

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.

**Ready to build a feature?** Go to [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md)

# Flavatix Developer Onboarding Guide

## Welcome! 👋

This guide will help you go from zero to productive Flavatix developer in under 2 hours.

## Table of Contents
1. [Quick Start (15 minutes)](#quick-start)
2. [Understanding the Architecture (30 minutes)](#understanding-the-architecture)
3. [Your First Feature (45 minutes)](#your-first-feature)
4. [Development Workflow (30 minutes)](#development-workflow)
5. [Resources](#resources)

---

## Quick Start

### Prerequisites Checklist

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm or yarn (`npm -v`)
- [ ] Git configured (`git config --list`)
- [ ] Code editor (VS Code recommended)
- [ ] GitHub account with repo access

---

### Step 1: Clone and Install (5 minutes)

```bash
# Clone repository
git clone https://github.com/lawrns/flavatixlatest.git
cd flavatixlatest

# Install dependencies
npm install

# Verify installation
npm run dev --version
```

**Expected Result:** Dependencies installed without errors

---

### Step 2: Environment Setup (5 minutes)

```bash
# Copy environment template
cp .env.example .env.local
```

**Edit `.env.local` with your credentials:**

```bash
# Get these from Supabase dashboard: https://app.supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: Anthropic AI for flavor extraction
ANTHROPIC_API_KEY=your-anthropic-key
```

**Get Supabase Credentials:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy Project URL and anon/public key

---

### Step 3: Run Development Server (5 minutes)

```bash
# Start dev server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

**Expected Result:** You see the Flavatix homepage

**Test the app:**
1. Click "Get Started"
2. Sign up with a test email
3. Create a quick tasting
4. Add an item

**If everything works: ✅ You're ready to develop!**

---

## Understanding the Architecture

### The Big Picture (10 minutes)

**Read these sections in order:**

1. **Read:** `/ARCHITECTURE.md` - Executive Summary
   - Understand: JAMstack, Next.js, Supabase, Netlify
   - Key takeaway: Server-rendered React with PostgreSQL backend

2. **Read:** `/ARCHITECTURE.md` - System Overview
   - Understand: Frontend → API Routes → Supabase → PostgreSQL
   - Key takeaway: RLS policies enforce security

3. **Read:** `/ARCHITECTURE.md` - Architecture Patterns
   - Understand: Singleton, Context, Repository patterns
   - Key takeaway: Why we use each pattern

---

### Directory Structure (10 minutes)

```
flavatixlatest/
├── pages/                   # Next.js pages (routing)
│   ├── index.tsx           # Landing page
│   ├── auth.tsx            # Login/signup
│   ├── dashboard.tsx       # User dashboard
│   ├── tasting/[id].tsx    # Dynamic tasting page
│   └── api/                # API routes (serverless)
│       ├── tastings/       # Tasting endpoints
│       └── flavor-wheels/  # Flavor wheel endpoints
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── quick-tasting/      # Tasting session components
│   ├── layout/             # Layout components
│   └── ...
├── lib/                    # Utilities and logic
│   ├── supabase.ts         # Database client
│   ├── logger.ts           # Logging utility
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
├── styles/                 # CSS and design tokens
├── contexts/               # React contexts
├── public/                 # Static assets
└── migrations/             # Database migrations
```

**Key Files to Know:**
- `/lib/supabase.ts` - Database client (READ THIS)
- `/components/quick-tasting/QuickTastingSession.tsx` - Main tasting logic
- `/pages/api/tastings/create.ts` - API endpoint example

---

### Data Flow (10 minutes)

**Tasting Creation Flow:**

```
User clicks "Create Tasting"
  ↓
Form submission → POST /api/tastings/create
  ↓
API route validates input (Zod schema)
  ↓
API inserts to Supabase (RLS checks permissions)
  ↓
Redirect to /tasting/[id]
  ↓
Page fetches tasting data
  ↓
Real-time subscription for updates
```

**Try it yourself:**
1. Create a tasting in the UI
2. Open Network tab in DevTools
3. Watch the API calls
4. Open Supabase dashboard → Table Editor
5. See the created record

---

## Your First Feature

### Exercise: Add "Duplicate Tasting" Button

**Goal:** Learn the full development cycle

**Time:** 45 minutes

---

### Step 1: Understand the Requirement (5 minutes)

**Feature:** Add button to duplicate an existing tasting

**Acceptance Criteria:**
- [ ] Button appears on tasting detail page
- [ ] Clicking creates copy with "(Copy)" suffix
- [ ] All items are duplicated
- [ ] User redirected to new tasting
- [ ] Toast notification confirms success

---

### Step 2: Plan the Implementation (10 minutes)

**What needs to change:**

1. **Database:** No schema changes needed
2. **API:** Create `/api/tastings/[id]/duplicate`
3. **UI:** Add button to tasting page
4. **Logic:** Copy tasting and items

**Read existing code:**
```bash
# Study how tastings are created
cat pages/api/tastings/create.ts

# Study tasting detail page
cat pages/tasting/[id].tsx
```

---

### Step 3: Create the API Endpoint (15 minutes)

**Create:** `/pages/api/tastings/[id]/duplicate.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const supabase = getSupabaseClient(req, res);

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch original tasting
  const { data: original, error: fetchError } = await supabase
    .from('quick_tastings')
    .select('*, quick_tasting_items(*)')
    .eq('id', id)
    .eq('user_id', user.id) // RLS check
    .single();

  if (fetchError || !original) {
    return res.status(404).json({ error: 'Tasting not found' });
  }

  // Create duplicate tasting
  const { data: duplicate, error: createError } = await supabase
    .from('quick_tastings')
    .insert({
      user_id: user.id,
      category: original.category,
      session_name: `${original.session_name} (Copy)`,
      notes: original.notes,
      mode: original.mode,
      study_approach: original.study_approach,
    })
    .select()
    .single();

  if (createError) {
    logger.error('Tasting', 'Failed to duplicate', createError);
    return res.status(500).json({ error: 'Failed to duplicate tasting' });
  }

  // Duplicate items
  const itemsToInsert = original.quick_tasting_items.map((item: any) => ({
    tasting_id: duplicate.id,
    item_name: item.item_name,
    overall_score: item.overall_score,
    aroma: item.aroma,
    flavor: item.flavor,
    notes: item.notes,
  }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase
      .from('quick_tasting_items')
      .insert(itemsToInsert);

    if (itemsError) {
      logger.error('Tasting', 'Failed to duplicate items', itemsError);
    }
  }

  logger.mutation('quick_tastings', 'duplicate', duplicate.id, user.id);

  return res.status(200).json({
    data: duplicate,
    error: null
  });
}
```

**Test the API:**
```bash
# In another terminal
curl -X POST http://localhost:3000/api/tastings/YOUR_TASTING_ID/duplicate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Step 4: Add UI Button (10 minutes)

**Edit:** `/pages/tasting/[id].tsx`

```typescript
// Add import
import { Copy } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

// Add inside component
const router = useRouter();
const [isDuplicating, setIsDuplicating] = useState(false);

const handleDuplicate = async () => {
  setIsDuplicating(true);

  try {
    const response = await fetch(`/api/tastings/${session.id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
      }
    });

    const { data, error } = await response.json();

    if (error) {
      toast.error('Failed to duplicate tasting');
      return;
    }

    toast.success('Tasting duplicated successfully');
    router.push(`/tasting/${data.id}`);
  } catch (error) {
    toast.error('An error occurred');
  } finally {
    setIsDuplicating(false);
  }
};

// Add button to JSX
<Button
  variant="outline"
  icon={<Copy />}
  onClick={handleDuplicate}
  loading={isDuplicating}
>
  Duplicate
</Button>
```

---

### Step 5: Test Your Feature (5 minutes)

**Manual Testing:**
1. Go to existing tasting
2. Click "Duplicate" button
3. Verify redirect to new tasting
4. Check toast notification
5. Verify items were copied

**Check Database:**
1. Open Supabase dashboard
2. Go to Table Editor → quick_tastings
3. See the new record with "(Copy)" suffix

**If all tests pass: ✅ Feature complete!**

---

## Development Workflow

### Daily Development (30 minutes)

**Morning Routine:**

```bash
# 1. Sync with latest code
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feat/your-feature-name

# 3. Start dev server
npm run dev
```

---

### Making Changes

**Before coding:**
1. Read relevant documentation
2. Understand existing patterns
3. Plan your approach

**While coding:**
1. Follow coding standards (`/CONTRIBUTING.md`)
2. Write TypeScript types
3. Add error handling
4. Log important operations

**Example:**
```typescript
// ✅ Good code
interface TastingData {
  session_name: string;
  category: string;
}

async function createTasting(data: TastingData): Promise<TastingSession> {
  try {
    logger.info('Tasting', 'Creating tasting', { category: data.category });

    const { data: tasting, error } = await supabase
      .from('quick_tastings')
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error('Tasting', 'Failed to create', error);
      throw new Error(`Failed to create tasting: ${error.message}`);
    }

    logger.mutation('quick_tastings', 'create', tasting.id);
    return tasting;
  } catch (error) {
    // Handle unexpected errors
    logger.error('Tasting', 'Unexpected error', error);
    throw error;
  }
}
```

---

### Testing Your Changes

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run unit tests
npm test

# Run specific test
npm test -- TastingCard

# Check test coverage
npm run test:coverage

# Build (catches TypeScript errors)
npm run build
```

---

### Committing Changes

```bash
# Stage files
git add .

# Commit with conventional format
git commit -m "feat(tasting): add duplicate functionality"

# Push to your branch
git push origin feat/your-feature-name
```

**Commit Message Format:**
```
<type>(<scope>): <description>

feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructuring
test: Tests
chore: Maintenance
```

---

### Creating a Pull Request

1. **Push your branch to GitHub**
2. **Go to GitHub repository**
3. **Click "New Pull Request"**
4. **Fill in PR template:**

```markdown
## Description
Added duplicate functionality for tastings.

## Type of Change
- [x] New feature

## Testing
- Manual testing on development server
- All existing tests pass
- Added unit tests for API endpoint

## Screenshots
[Add before/after screenshots]
```

5. **Request review from team**
6. **Address feedback**
7. **Merge after approval**

---

## Resources

### Essential Documentation

**Start with these:**
1. **ARCHITECTURE.md** - System design and patterns
2. **COMPONENT_CATALOG.md** - UI component reference
3. **API_REFERENCE.md** - API endpoints and examples
4. **DATABASE.md** - Schema and RLS policies
5. **CONTRIBUTING.md** - Coding standards and workflow
6. **TROUBLESHOOTING.md** - Common issues and solutions

---

### External Resources

**Next.js:**
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

**Supabase:**
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

**React:**
- [React Docs](https://react.dev)
- [React Hooks](https://react.dev/reference/react)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

**Tailwind CSS:**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

---

### Internal Tools

**Supabase Dashboard:**
- View/edit database tables
- Test RLS policies
- View auth users
- Monitor real-time connections

**Sentry (if configured):**
- Error tracking
- Performance monitoring
- Release tracking

**Netlify:**
- Deployment logs
- Environment variables
- Build settings

---

### Getting Help

**Stuck on something?**

1. **Check documentation** (start with TROUBLESHOOTING.md)
2. **Search GitHub issues** (might already be reported)
3. **Ask in team chat** (fastest for quick questions)
4. **Create detailed issue** (for bugs or feature requests)

**When asking for help, include:**
- What you're trying to do
- What you tried
- Error messages (full text)
- Screenshots
- Code snippets (simplified)

---

## Next Steps

**You've completed onboarding! 🎉**

**Your first week:**
- [ ] Complete "Your First Feature" exercise
- [ ] Read ARCHITECTURE.md thoroughly
- [ ] Explore codebase (focus on your team's area)
- [ ] Fix a "good first issue" from GitHub
- [ ] Join team standup/meetings

**Your first month:**
- [ ] Ship your first feature
- [ ] Review someone else's PR
- [ ] Improve documentation you found confusing
- [ ] Set up your IDE with recommended extensions
- [ ] Learn the deployment process

---

## Recommended IDE Setup

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase-vscode"
  ]
}
```

**Install:** Extensions → Search → Install

---

### VS Code Settings

**File:** `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Checklist: Am I Ready to Develop?

- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured
- [ ] Dev server running successfully
- [ ] Can create account and log in
- [ ] Can create a tasting session
- [ ] Read ARCHITECTURE.md Executive Summary
- [ ] Understand directory structure
- [ ] Know where to find documentation
- [ ] Completed "Your First Feature" exercise
- [ ] Created first commit following conventions
- [ ] Know how to run tests and linter

**All checked? You're ready! Welcome to the team! 🚀**

---

**Last Updated:** January 2026
**Maintainer:** Development Team

# Flavatix

**Sensory tasting sessions, interactive flavor wheels, and a social feed for coffee, wine, spirits, beer, tea, chocolate, and beyond.**

The current shell centers on a shared `PageLayout` and `Container` system. `/dashboard` is the overview surface, while `/taste` is the main action hub for starting or joining work.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?logo=netlify)](https://netlify.com)

---

## Features

| Area | What it does |
|------|-------------|
| **Quick Tasting** | Rapid multi-item evaluation sessions with photo capture, aroma/flavor/finish scoring, and auto-save |
| **Study Mode** | Structured deep-dive sessions with predefined or exploratory category grids and real-time collaboration |
| **Competition Mode** | Blind tasting workflows built for judging panels |
| **Review Hub** | Structured review form, prose notes, and a full review archive |
| **Flavor Wheels** | D3-powered interactive wheels with list-view alternative, scope filtering, and descriptor normalization |
| **Social Feed** | Follow users, like and comment on shared tasting sessions, filter by category |
| **Taste Hub** | Central launch surface for Quick Tasting, Study Mode, Competition, Review, and Flavor Wheels |
| **Profile & Settings** | Avatar, display name, dark mode toggle, notification preferences, and dashboard presets |
| **Shell System** | Shared width tokens, page headers, and bottom navigation across authenticated pages |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router), React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3, Framer Motion |
| Data / Auth | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Data Fetching | TanStack Query v5 |
| Visualization | D3.js v7 |
| Testing | Jest, Playwright, Testing Library |
| Deployment | Netlify (auto-deploy from `main`) |

---

## Getting Started

```bash
# 1. Install dependencies
npm ci

# 2. Configure environment
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Start dev server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

See [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) for full environment setup including Supabase local dev and seed data.

---

## Key Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check (no emit)
npm run format       # Prettier write
```

### Tests

```bash
npm run test:unit        # Jest unit + component + integration tests
npm run test:api         # Jest API route tests (sequential)
npm run test:data        # Data quality checks
npm run test:e2e:smoke   # Playwright smoke suite
npm run test:all         # Full suite (unit + api + data + smoke)
npm run check            # lint + type-check + unit + api (fast CI gate)
```

---

## Repo Layout

```
components/       UI components, organized by feature
  layout/         PageLayout, Container, BottomNavigation, AppShell
  ui/             Shared primitives (Card, Button, ModeCard, FlavorPill, …)
  social/         SocialPostCard, CommentsModal, SocialFeedFilters
  quick-tasting/  QuickTastingSession, TastingItem, SessionHeader
  review/         ReviewForm and associated sub-components
  history/        TastingHistoryList, TastingHistoryItem, stats
  auth/           AuthSection with onboarding carousel
contexts/         React context providers (auth, theme)
docs/             Maintained project documentation
hooks/            Reusable React hooks
lib/              Shared logic — Supabase client, query hooks, services
  query/hooks/    TanStack Query hooks (useFeed, useProfile, …)
migrations/       App-owned DB migrations
pages/            Next.js routes and API handlers
  api/            Server-side API routes
public/           Static assets, icons, PWA manifest
scripts/          Utility and migration scripts
styles/           globals.css, design tokens
supabase/         Supabase project config and migrations
tests/
  unit/           Pure logic tests
  components/     React component tests
  integration/    Cross-module tests
  api/            API route tests
  e2e/            Playwright end-to-end suites
  accessibility/  ARIA and keyboard nav checks
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing / marketing |
| `/auth` | Sign in / sign up with onboarding carousel |
| `/dashboard` | Authenticated home — overview, recent activity, and the entry point into Taste |
| `/taste` | Taste Hub — launch Quick Tasting, Study Mode, Competition, Review, and Flavor Wheels |
| `/quick-tasting` | Active Quick Tasting session |
| `/create-tasting` | Create Study or Competition session |
| `/competition` | Competition hub — join or create scored sessions |
| `/review` | Review Hub — structured review, quick prose note, and history |
| `/review/create` | Structured review form |
| `/review/prose` | Prose review editor |
| `/review/my-reviews` | Review archive and in-progress items |
| `/flavor-wheels` | Interactive D3 flavor wheel + list view |
| `/social` | Social feed — for you / following, filtered by category |
| `/my-tastings` | Personal tasting history |
| `/profile` | Public profile |
| `/profile/edit` | Profile edit surface |
| `/settings` | Preferences, dark mode, notification toggles, and dashboard presets |

---

## Design System

Surface classes defined in `styles/globals.css`:

| Class | Usage |
|-------|-------|
| `surface-page` | Primary page card containers |
| `surface-inset` | Inset / nested card sections |
| `surface-action-card` | Tappable mode/action cards (used by `ModeCard`) |

Shared component: `components/ui/ModeCard.tsx` is the canonical hub card used across Taste, Review, Create Tasting, and competition pages.

Shared shell: `components/layout/PageLayout.tsx` and `components/layout/Container.tsx` define the current width defaults. The shell default is `xl`, denser authenticated pages commonly use `2xl`, and marketing sections use `7xl`.

---

## Documentation

| Doc | Contents |
|-----|----------|
| [Getting Started](./docs/GETTING_STARTED.md) | Environment setup, Supabase local dev |
| [Development Guide](./docs/DEVELOPMENT.md) | Patterns, conventions, common gotchas |
| [Architecture](./docs/ARCHITECTURE.md) | System overview, data flow, state management |
| [API Reference](./docs/API_REFERENCE.md) | API routes and request/response shapes |
| [Database](./docs/DATABASE.md) | Schema, RLS policies, migration workflow |
| [Layout System](./docs/LAYOUT_SYSTEM.md) | PageLayout, Container, shell width rules |
| [Component Catalog](./docs/COMPONENT_CATALOG.md) | UI primitive reference |
| [Test Suite](./docs/TEST_SUITE_STATUS.md) | Coverage matrix and test strategy |
| [Security](./docs/SECURITY.md) | Auth, RLS, environment variable guidance |
| [Deployment](./docs/DEPLOYMENT.md) | Netlify config, env vars, cache strategy |

Historical reports and one-off delivery artifacts live under `docs/archive/`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the pull request checklist and code style guide.

Pre-commit hooks (Husky + lint-staged) run Prettier on staged files automatically.

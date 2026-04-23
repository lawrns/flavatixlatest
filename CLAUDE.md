# Flavatix Agent Notes

This is a Next.js Pages Router app. Keep public routes, Supabase contracts, hooks, API payloads, and auth behavior stable unless a task explicitly asks for backend changes.

## Separation Of Concerns

- Route files in `pages/` should compose flows and data-backed screens. Put reusable presentation patterns in `components/`.
- Shared shell, width modes, desktop navigation, mobile bottom navigation, and route spacing belong in `components/layout/`.
- Shared UI primitives and visual system components belong in `components/ui/`. Prefer existing primitives such as `Button`, `Card`, `EmptyStateCard`, and `PremiumPrimitives` before adding new styling patterns.
- Business logic and data access should stay in existing `lib/` hooks/services. Do not duplicate Supabase calls inside presentational components when a hook already exists.
- Keep route-specific UI local only when the behavior or copy is genuinely unique to that route.

## UI System Rules

- Use `PageLayout` archetypes instead of ad hoc max-width wrappers:
  - `workflow` for focused forms and guided flows.
  - `workspace` for hubs, archives, settings, and profile screens.
  - `visualCanvas` for wheel/feed/analytics-heavy layouts.
- Preserve the app-level `<main>` in `pages/_app.tsx`; layout components must not introduce another `<main>` landmark.
- If a page wraps sections in `animate-fade-in`, `PageLayout` applies `page-stack` spacing. Do not add negative margins or nested card spacing hacks to compensate.
- Keep mobile behavior primary. Desktop should add rails and density, not simply stretch mobile cards.
- Avoid large rounded panels and nested card stacks. Use `rounded-soft` for most app surfaces and reserve larger framing for true sheets or modals.

## Generated And Local Files

- Build output, Playwright output, local env files, worktrees, tool state, and reference app folders are intentionally ignored in `.gitignore`.
- Do not commit local secrets or machine-specific files.
- Public assets under `public/` are commit-eligible only when they are product assets intentionally referenced by the app.

## Verification

- Run `npm run type-check` and `npm run lint` before committing UI/system changes.
- For visual changes, verify the affected route at the running local dev server and check mobile width for horizontal overflow.

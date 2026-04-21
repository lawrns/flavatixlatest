# Flavatix - Project Context

## Overview

Flavatix es una aplicación web para catar y evaluar sabores (café, té, vino, cerveza, whisky, mezcal, spirits, chocolate, etc.). El producto actual separa claramente:

- `Home` (`/dashboard`) como superficie de resumen
- `Taste` (`/taste`) como hub de acciones
- `Review`, `Social`, `Profile` y `Settings` como superficies de trabajo dedicadas

## Tech Stack

- **Frontend**: Next.js (Pages Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting**: Netlify (auto-deploy desde `main`)
- **Repo**: https://github.com/lawrns/flavatixlatest

## Shell and Layout

- `components/layout/Container.tsx` es la fuente de verdad para ancho y padding horizontal.
- `components/layout/PageLayout.tsx` es el wrapper estándar para páginas autenticadas.
- El ancho por defecto del shell es `xl`.
- Muchas superficies densas usan `2xl`.
- El landing page y secciones de marketing usan `7xl`.

## Current Route Map

- `/dashboard` - overview surface
- `/taste` - launch hub for Quick Tasting, Study Mode, Competition, Review, and Flavor Wheels
- `/competition` - competition entry hub
- `/review` - review hub
- `/review/my-reviews` - review archive
- `/social` - feed social
- `/profile` y `/profile/edit`
- `/settings`

## Key Directories

```
/pages                    # Next.js pages (routing)
  /dashboard.tsx          # Home / overview
  /taste.tsx              # Taste hub
  /review.tsx             # Review hub
  /social.tsx             # Social feed
  /profile.tsx            # Profile view
  /profile/edit.tsx       # Profile editor
  /settings.tsx           # Settings surface
  /api/                   # API routes
/components
  /quick-tasting/         # Quick Tasting components (CRITICAL)
    QuickTastingSession.tsx   # Main session logic
    TastingItem.tsx           # Individual item form
    SessionHeader.tsx         # Header with stats
    SessionNavigation.tsx     # Navigation controls
    types.ts                  # TypeScript types
  /review/                # Review components
  /layout/                # Layout components
  /ui/                    # Reusable UI components
/lib
  /supabase.ts            # Supabase client & types
  /toast.ts               # Toast notifications
  /logger.ts              # Logging utility
/contexts
  /SimpleAuthContext.tsx  # Auth context
```

## Database Tables (Supabase)

### `quick_tastings`
- `id`, `user_id`, `category`, `custom_category_name`
- `session_name`, `mode` (`quick` | `study` | `competition`)
- `study_approach` (`predefined` | `exploratory`)
- `total_items`, `completed_items`, `average_score`
- `created_at`, `updated_at`, `completed_at`

### `quick_tasting_items`
- `id`, `tasting_id`, `item_name`, `item_number`
- `overall_score`, `photo_url`
- `aroma_notes`, `flavor_notes`, `finish_notes`
- `study_category_data` (JSONB for custom categories)
- `created_at`, `updated_at`

## Important Patterns

### Supabase & undefined vs null
**CRITICAL**: Supabase ignora campos con `undefined`. Para borrar un campo, usar `null`.

```tsx
// En QuickTastingSession.tsx, updateItem():
const dbUpdates = Object.fromEntries(
  Object.entries(updates).map(([key, value]) => [key, value === undefined ? null : value])
);
```

### Debouncing Sliders
Los sliders usan debounce de 300ms para evitar llamadas excesivas a la DB:

```tsx
const scoreDebounceRef = useRef<NodeJS.Timeout | null>(null);

const handleScoreChange = (score: number) => {
  setLocalScore(score);
  setScoreTouched(true);

  if (scoreDebounceRef.current) clearTimeout(scoreDebounceRef.current);
  scoreDebounceRef.current = setTimeout(() => {
    onUpdate({ overall_score: score });
  }, 300);
};
```

### Auto-add First Item
Quick Tasting y Study Mode (predefined) auto-crean el primer item:

```tsx
const isQuickTasting = session.mode === 'quick' && phase === 'tasting';
const isPredefinedStudy = session.mode === 'study' && session.study_approach === 'predefined';

if ((isQuickTasting || isPredefinedStudy) && items.length === 0 && !isLoading) {
  autoAddTriggeredRef.current = true;
  setTimeout(() => addNewItem(), 100);
}
```

## Session Modes

### Quick Tasting (`mode: 'quick'`)
- Sesión rápida para evaluar items
- Auto-crea Item 1 al iniciar
- Campos: Item name, Photo, Aroma, Flavor, Finish, Overall Score
- URL: `/quick-tasting`

### Study Mode (`mode: 'study'`)
- Dos enfoques: `predefined` (categorías predefinidas) o `exploratory`
- Soporta colaboración en tiempo real
- Categorías personalizables con diferentes tipos de input
- URL: `/taste/create/study/new`

### Competition Mode (`mode: 'competition'`)
- Flujo de cata con ranking o reglas de evaluación compartidas
- URL: `/taste/create/competition`

## Recent Product Updates

1. Home quedó como superficie de overview.
2. Taste pasó a ser el hub principal de acciones.
3. Se normalizaron los anchos con `PageLayout` y `Container`.
4. Se simplificó la navegación inferior para que el shell sea consistente.
5. Review, Social, Profile y Settings ahora usan superficies de trabajo más intencionales.

## URLs Importantes

- Quick Tasting: `/quick-tasting`
- Study Mode: `/taste/create/study/new`
- Competition: `/taste/create/competition`
- Taste Hub: `/taste`
- Dashboard: `/dashboard`
- My Tastings: `/my-tastings`
- Auth: `/auth`

## Deployment

- **Branch**: `main`
- **Auto-deploy**: Push a main → Netlify build automático
- **Build command**: `npm run build`
- **Cache**: Usar `Ctrl+Shift+R` para hard refresh después de deploy

## Key Files to Know

| File | Purpose |
|------|---------|
| `components/quick-tasting/QuickTastingSession.tsx` | Lógica principal de sesiones |
| `components/quick-tasting/TastingItem.tsx` | Formulario de cada item |
| `components/quick-tasting/types.ts` | TypeScript types |
| `components/layout/PageLayout.tsx` | Shell estándar de páginas autenticadas |
| `components/layout/Container.tsx` | Fuente de verdad de ancho y padding |
| `pages/taste.tsx` | Taste hub |
| `pages/dashboard.tsx` | Overview surface |
| `lib/supabase.ts` | Cliente Supabase + tipos DB |

## Contact / Repo

- GitHub: https://github.com/lawrns/flavatixlatest
- Netlify: (check dashboard for URL)

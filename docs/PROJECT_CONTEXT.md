# Flavatix - Project Context

## Overview

Flavatix es una aplicación web para catar y evaluar sabores (café, té, vino, cerveza, whisky, mezcal, spirits, chocolate, etc.). Permite a usuarios hacer sesiones de cata rápidas (Quick Tasting) o estudios más estructurados (Study Mode).

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting**: Netlify (auto-deploy desde `main` branch)
- **Repo**: https://github.com/lawrns/flavatixlatest

## Key Directories

```
/pages                    # Next.js pages (routing)
  /quick-tasting.tsx      # Quick Tasting page
  /api/                   # API routes
/components
  /quick-tasting/         # Quick Tasting components (CRITICAL)
    QuickTastingSession.tsx   # Main session logic (~1000 lines)
    TastingItem.tsx           # Individual item form
    SessionHeader.tsx         # Header with stats
    SessionNavigation.tsx     # Navigation controls
    types.ts                  # TypeScript types
  /review/                # Review components (CharacteristicSlider)
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
- `session_name`, `mode` ('quick' | 'study')
- `study_approach` ('predefined' | 'exploratory')
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
// En TastingItem.tsx
const scoreDebounceRef = useRef<NodeJS.Timeout | null>(null);

const handleScoreChange = (score: number) => {
  setLocalScore(score);  // Actualiza UI inmediatamente
  setScoreTouched(true);

  if (scoreDebounceRef.current) clearTimeout(scoreDebounceRef.current);
  scoreDebounceRef.current = setTimeout(() => {
    onUpdate({ overall_score: score });  // Guarda a DB después de 300ms
  }, 300);
};
```

### Auto-add First Item
Quick Tasting y Study Mode (predefined) auto-crean el primer item:

```tsx
// En QuickTastingSession.tsx, useEffect
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
- Categorías personalizables con diferentes tipos de input (Scale, Text, etc.)
- URL: `/taste/create/study/new`

## Common Issues & Solutions

### 1. Página vacía después de "Start Tasting"
**Causa**: `phase === 'tasting'` pero `items.length === 0`
**Solución**: useEffect que auto-crea primer item

### 2. Sliders parpadean
**Causa**: Llamadas a DB en cada movimiento → re-render
**Solución**: Debounce de 300ms + estado local

### 3. Botón X de foto no funciona
**Causa**: `onUpdate({ photo_url: undefined })` - Supabase ignora undefined
**Solución**: Convertir undefined → null en `updateItem()`

### 4. TypeScript error con null
**Causa**: Tipo `photo_url?: string` no acepta `null`
**Solución**: Convertir en `updateItem()`, no en el componente

## URLs Importantes

- Quick Tasting: `/quick-tasting`
- Study Mode: `/taste/create/study/new`
- Dashboard: `/dashboard`
- My Tastings: `/my-tastings`
- Auth: `/auth`

## Deployment

- **Branch**: `main`
- **Auto-deploy**: Push a main → Netlify build automático
- **Build command**: `npm run build`
- **Cache**: Usar `Ctrl+Shift+R` para hard refresh después de deploy

## Recent Changes (January 2026)

1. Fix empty state en Quick Tasting (auto-add first item)
2. Fix botón X para eliminar fotos (undefined → null)
3. Fix slider flickering (debounce 300ms)
4. Habilitar photo upload en Quick Tasting
5. Cambiar labels "Done/Total" → "Total items/Completed"
6. Agregar botón para eliminar último item
7. Label "Unacceptable" cuando score es 0
8. Category selector: "What are you tasting?"
9. Base category: "What's being tasted?"
10. Scroll en dropdown de categorías
11. Sliders responden sin tap previo
12. Category lock después de iniciar tasting
13. Redirect `/history` → `/my-tastings`

## Key Files to Know

| File | Purpose |
|------|---------|
| `components/quick-tasting/QuickTastingSession.tsx` | Lógica principal de sesiones |
| `components/quick-tasting/TastingItem.tsx` | Formulario de cada item |
| `components/quick-tasting/types.ts` | TypeScript types |
| `pages/quick-tasting.tsx` | Page component |
| `lib/supabase.ts` | Cliente Supabase + tipos DB |

## Contact / Repo

- GitHub: https://github.com/lawrns/flavatixlatest
- Netlify: (check dashboard for URL)

# Flavatix Architecture Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Flow](#data-flow)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [State Management](#state-management)
8. [Design System](#design-system)
9. [Security Architecture](#security-architecture)
10. [Performance Optimization](#performance-optimization)

---

## Executive Summary

Flavatix is a comprehensive tasting application built for professionals and enthusiasts to capture, analyze, and share sensory experiences. The application uses a modern JAMstack architecture with Next.js for the frontend, Supabase for backend services, and Netlify for deployment.

**Key Metrics:**

- **Architecture Type:** Server-rendered React (Next.js)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (JWT-based)
- **Real-time:** Supabase Realtime (WebSocket)
- **Deployment:** Netlify (auto-deploy from main branch)
- **Primary Use Cases:** Individual tastings, group studies, competitions, flavor analysis

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Devices                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Mobile     │  │   Tablet     │  │   Desktop    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Netlify CDN / Edge                              │
│                   (Static Assets + Edge Functions)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js Application                              │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  Frontend (React Components)                             │      │
│  │  - Pages (routing)                                       │      │
│  │  - Components (UI)                                       │      │
│  │  - Hooks (state logic)                                   │      │
│  │  - Contexts (global state)                               │      │
│  └──────────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  API Routes (Serverless Functions)                       │      │
│  │  - /api/tastings/*                                       │      │
│  │  - /api/flavor-wheels/*                                  │      │
│  │  - /api/social/*                                         │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ PostgreSQL  │  │   Auth      │  │  Storage    │                │
│  │  Database   │  │  (GoTrue)   │  │   (S3)      │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │  Realtime   │  │  Functions  │                                  │
│  │ (WebSocket) │  │  (Edge)     │                                  │
│  └─────────────┘  └─────────────┘                                  │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Anthropic │  │    Sentry   │  │   Netlify   │                │
│  │  (AI/LLM)   │  │  (Monitoring)│  │  (Deploy)   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

### System Boundaries

**Frontend Boundary:**

- Runs in user's browser
- Handles UI rendering, user interactions
- Manages local state and client-side caching
- Communicates with backend via HTTP/WebSocket

**Backend Boundary:**

- Runs on Supabase infrastructure
- Handles data persistence, authentication
- Enforces business rules via RLS policies
- Provides real-time subscriptions

**Edge Boundary:**

- Netlify Edge Functions (optional)
- API Routes in Next.js (serverless)
- CDN for static assets

---

## Architecture Patterns

### 1. **Singleton Pattern** (Supabase Client)

**Location:** `/lib/supabase.ts`

**Purpose:** Prevent multiple GoTrue (auth) instances that cause session conflicts.

```typescript
// Singleton implementation
class SupabaseClientSingleton {
  private static instance: SupabaseClient<any> | null = null;

  public static getInstance(): SupabaseClient<any> {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return SupabaseClientSingleton.instance!;
  }
}
```

**Why:** Single auth instance ensures consistent session state across the app.

---

### 2. **Context Pattern** (State Management)

**Location:** `/contexts/SimpleAuthContext.tsx`

**Purpose:** Provide global auth state without prop drilling.

```typescript
// Auth context provides user state globally
export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <SimpleAuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
```

**Why:** Auth state is needed across many components, context prevents passing props through every level.

---

### 3. **Repository Pattern** (Data Access)

**Location:** `/lib/repositories/*`

**Purpose:** Abstract database operations behind clean interfaces.

```typescript
// Example: Tasting Repository
export class TastingRepository {
  async createTasting(data: TastingData): Promise<Tasting> {
    const { data: tasting, error } = await supabase
      .from('quick_tastings')
      .insert(data)
      .select()
      .single();

    if (error) throw new DatabaseError(error);
    return tasting;
  }
}
```

**Why:** Isolates database logic, makes testing easier, provides type safety.

---

### 4. **Compound Component Pattern** (UI Components)

**Location:** `/components/quick-tasting/*`

**Purpose:** Create flexible, composable components.

```typescript
// Parent component manages state
<QuickTastingSession session={session}>
  <SessionHeader />
  <TastingItem />
  <SessionNavigation />
</QuickTastingSession>
```

**Why:** Allows flexible composition while maintaining shared state.

---

### 5. **Hook Pattern** (Reusable Logic)

**Location:** `/hooks/*`, `/lib/hooks/*`

**Purpose:** Extract and reuse stateful logic.

```typescript
// Custom hook for tasting session
export function useTastingSession(sessionId: string) {
  const [session, setSession] = useState<TastingSession | null>(null);
  const [items, setItems] = useState<TastingItem[]>([]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = supabase
      .channel(`session:${sessionId}`)
      .on('postgres_changes', handleChange)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [sessionId]);

  return { session, items, loading };
}
```

**Why:** Encapsulates complex logic, promotes reusability.

---

## Data Flow

### 1. Authentication Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Login (email/password)
       ▼
┌─────────────┐
│  Auth Page  │
│ /pages/auth │
└──────┬──────┘
       │ 2. Call supabase.auth.signInWithPassword()
       ▼
┌──────────────────┐
│ Supabase Auth    │
│ (GoTrue)         │
└──────┬───────────┘
       │ 3. Return JWT + User
       ▼
┌──────────────────┐
│ SimpleAuthContext│
│ - Sets user      │
│ - Fetches profile│
└──────┬───────────┘
       │ 4. Redirect to dashboard
       ▼
┌─────────────┐
│  Dashboard  │
│ /dashboard  │
└─────────────┘
```

**Key Points:**

- JWT stored in localStorage (Supabase handles this)
- Auth state persists across page reloads
- RLS policies use JWT to enforce access control

---

### 2. Tasting Creation Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Click "New Tasting"
       ▼
┌──────────────────┐
│ Create Page      │
│ /create-tasting  │
└──────┬───────────┘
       │ 2. Select category, mode
       │    Fill session details
       ▼
┌──────────────────┐
│ Form Submission  │
└──────┬───────────┘
       │ 3. POST /api/tastings/create
       ▼
┌──────────────────────┐
│ API Route            │
│ - Validate input     │
│ - Get user from JWT  │
└──────┬───────────────┘
       │ 4. Insert into quick_tastings
       ▼
┌──────────────────┐
│ Supabase DB      │
│ - RLS checks     │
│ - Insert row     │
└──────┬───────────┘
       │ 5. Return session ID
       ▼
┌──────────────────┐
│ Redirect         │
│ /tasting/[id]    │
└──────────────────┘
```

---

### 3. Real-time Collaboration Flow

```
┌─────────────┐         ┌─────────────┐
│  Host       │         │ Participant │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ 1. Start session      │
       ▼                       │
┌──────────────────┐           │
│ Create session   │           │
│ Generate code    │           │
└──────┬───────────┘           │
       │                       │
       │ 2. Share code         │
       ├──────────────────────>│
       │                       │
       │                       │ 3. Join with code
       │                       ▼
       │           ┌──────────────────┐
       │           │ Find session     │
       │           │ Add participant  │
       │           └──────┬───────────┘
       │                  │
       │ 4. Subscribe to realtime channel
       ▼                  ▼
┌──────────────────────────────────┐
│  Supabase Realtime               │
│  channel: session:${sessionId}   │
└────────┬──────────────────┬──────┘
         │                  │
         │ 5. Broadcast changes
         ▼                  ▼
┌─────────────┐         ┌─────────────┐
│  Host UI    │         │ Participant │
│  updates    │         │  UI updates │
└─────────────┘         └─────────────┘
```

**Key Points:**

- Uses Supabase Realtime (WebSocket)
- Each session has a unique channel
- Changes broadcast to all connected clients
- Optimistic updates for better UX

---

### 4. Flavor Wheel Generation Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Complete tasting
       │    View summary
       ▼
┌──────────────────┐
│ Summary Page     │
│ /tasting/[id]    │
└──────┬───────────┘
       │ 2. Click "Generate Flavor Wheel"
       ▼
┌──────────────────┐
│ API Route        │
│ /api/flavor-     │
│ wheels/generate  │
└──────┬───────────┘
       │ 3. Fetch tasting notes
       ▼
┌──────────────────┐
│ Extract          │
│ descriptors      │
│ (AI/regex)       │
└──────┬───────────┘
       │ 4. Group by category
       │    Count frequencies
       ▼
┌──────────────────┐
│ Store in DB      │
│ flavor_wheels    │
└──────┬───────────┘
       │ 5. Return wheel data
       ▼
┌──────────────────┐
│ D3 Visualization │
│ Render wheel     │
└──────────────────┘
```

**Key Points:**

- AI extracts flavor descriptors from notes
- Groups descriptors by category (fruity, floral, etc.)
- Caches results for performance
- Exports as PDF/PNG

---

## Frontend Architecture

### Directory Structure

```
/pages/
  ├── index.tsx              # Landing page
  ├── auth.tsx               # Login/signup
  ├── dashboard.tsx          # User dashboard
  ├── taste.tsx              # Tasting mode selector
  ├── create-tasting.tsx     # Create tasting form
  ├── tasting/[id].tsx       # Tasting session page
  ├── my-tastings.tsx        # User's tasting history
  ├── flavor-wheels.tsx      # Flavor wheel gallery
  ├── profile.tsx            # User profile
  ├── settings.tsx           # User settings
  └── api/                   # API routes
      ├── tastings/
      ├── flavor-wheels/
      └── social/

/components/
  ├── ui/                    # Reusable UI components
  │   ├── Button.tsx
  │   ├── Card.tsx
  │   ├── Modal.tsx
  │   └── LoadingSpinner.tsx
  ├── layout/                # Layout components
  │   ├── Navigation.tsx
  │   └── Container.tsx
  ├── quick-tasting/         # Tasting session components
  │   ├── QuickTastingSession.tsx
  │   ├── TastingItem.tsx
  │   └── SessionHeader.tsx
  ├── review/                # Review components
  ├── flavor-wheels/         # Flavor wheel components
  ├── social/                # Social features
  └── auth/                  # Auth components

/lib/
  ├── supabase.ts            # Supabase client
  ├── hooks/                 # Custom hooks
  ├── utils/                 # Utility functions
  └── types/                 # TypeScript types

/contexts/
  └── SimpleAuthContext.tsx  # Auth context

/hooks/
  ├── useAuth.ts
  ├── useTasting.ts
  └── useFlavorWheel.ts

/styles/
  ├── globals.css            # Global styles
  └── shadcn-tokens.css      # Design tokens
```

---

### Component Hierarchy

```
App
├── SimpleAuthProvider (Context)
├── Navigation
│   ├── Logo
│   ├── NavLinks
│   └── UserMenu
└── Page Content
    ├── Dashboard
    │   ├── StatsCard
    │   ├── RecentTastings
    │   └── QuickActions
    ├── TastingSession
    │   ├── SessionHeader
    │   ├── TastingItem (multiple)
    │   │   ├── PhotoUpload
    │   │   ├── CharacteristicSlider
    │   │   └── TextArea
    │   └── SessionNavigation
    └── FlavorWheel
        ├── WheelVisualization (D3)
        └── ExportControls
```

---

### State Management Strategy

**1. Local State (useState)**

- Use for: Component-specific UI state
- Examples: Form inputs, modal open/closed, loading states

```typescript
const [isOpen, setIsOpen] = useState(false);
```

**2. Context (React Context)**

- Use for: Globally shared state
- Examples: Auth user, theme, language

```typescript
const { user, profile } = useAuth();
```

**3. Server State (Supabase Realtime)**

- Use for: Data from database
- Examples: Tastings, items, flavor wheels

```typescript
const { data: tastings } = useQuery(['tastings'], fetchTastings);
```

**4. URL State (Next.js Router)**

- Use for: Shareable/bookmarkable state
- Examples: Active tab, filters, search

```typescript
const router = useRouter();
const { id, tab } = router.query;
```

---

## Backend Architecture

### Database Schema Overview

```
┌─────────────────┐
│   auth.users    │ (Managed by Supabase Auth)
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │ (User profiles)
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ quick_tastings  │ (Tasting sessions)
└────────┬────────┘
         │
         │ 1:N
         ▼
┌───────────────────────┐
│ quick_tasting_items   │ (Individual items)
└───────────────────────┘

┌─────────────────┐
│  profiles       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ flavor_wheels   │ (Generated wheels)
└────────┬────────┘
         │
         │ 1:N
         ▼
┌──────────────────────┐
│ flavor_descriptors   │ (Extracted flavors)
└──────────────────────┘

┌─────────────────┐
│ study_sessions  │ (Group studies)
└────────┬────────┘
         │
         │ 1:N
         ├───────────────────┐
         ▼                   ▼
┌─────────────────┐   ┌─────────────────┐
│  study_items    │   │ study_categories│
└─────────────────┘   └─────────────────┘
```

---

### Row Level Security (RLS) Policies

**Philosophy:** Every table has RLS enabled. Users can only access their own data unless explicitly shared.

**Example: quick_tastings table**

```sql
-- Users can view their own tastings
CREATE POLICY "Users can view own tastings"
ON quick_tastings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own tastings
CREATE POLICY "Users can insert own tastings"
ON quick_tastings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tastings
CREATE POLICY "Users can update own tastings"
ON quick_tastings FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tastings
CREATE POLICY "Users can delete own tastings"
ON quick_tastings FOR DELETE
USING (auth.uid() = user_id);
```

**Example: profiles table (public read)**

```sql
-- Everyone can view profiles (for social features)
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

### API Routes Architecture

**Pattern:** RESTful API with Next.js API routes

**Example Structure:**

```
/pages/api/
├── tastings/
│   ├── create.ts        # POST - Create tasting
│   ├── [id].ts          # GET/PUT/DELETE - Single tasting
│   ├── [id]/
│   │   ├── items.ts     # GET/POST - List/add items
│   │   └── complete.ts  # POST - Mark complete
│   └── study/
│       └── join.ts      # POST - Join study session
├── flavor-wheels/
│   ├── generate.ts      # POST - Generate wheel
│   └── [id].ts          # GET - Get wheel
└── social/
    ├── follow.ts        # POST - Follow user
    └── comments.ts      # GET/POST - Comments
```

**Standard API Response Format:**

```typescript
// Success
{
  data: {...},
  error: null
}

// Error
{
  data: null,
  error: {
    message: "Error message",
    code: "ERROR_CODE",
    details: {...}
  }
}
```

---

### Middleware Pattern

**Location:** API routes use middleware functions for common tasks.

```typescript
// Example: Auth middleware
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const supabase = getSupabaseClient(req, res);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user to request
    req.user = user;
    return handler(req, res);
  };
}

// Usage
export default withAuth(async (req, res) => {
  const user = req.user; // Type-safe user access
  // ... handler logic
});
```

---

## Design System

### Design Tokens

**Location:** `/styles/shadcn-tokens.css`

**Philosophy:** Design tokens provide a single source of truth for design decisions.

**Token Categories:**

1. **Colors**
   - Primary: `--color-primary-500` (#1F5D4C)
   - Secondary: `--color-secondary-500`
   - Accent: `--color-accent-500` (#C65A2E)
   - Text: `--color-text-primary`, `--color-text-secondary`
   - Background: `--color-background-app`, `--color-background-surface`
   - Border: `--color-border-subtle`, `--color-border-default`

2. **Typography**
   - Font family: Inter (sans-serif)
   - Sizes: `text-xs` to `text-6xl` (fluid/responsive)
   - Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

3. **Spacing**
   - Scale: 4px base (0.5 = 2px, 1 = 4px, 2 = 8px, etc.)
   - Responsive: `xs`, `sm`, `md`, `lg` (using clamp)

4. **Shadows**
   - Elevation system: `elevation-1` through `elevation-5`
   - Component-specific: `shadow-card`, `shadow-button`, `shadow-modal`

5. **Border Radius**
   - Small: 10px
   - Medium: 14px (buttons, inputs)
   - Large: 22px (cards)

---

### Component Variants (CVA)

**Location:** Component files use `class-variance-authority`

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-medium font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-13 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

---

### Accessibility Standards

**WCAG 2.1 Level AA Compliance:**

1. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Focus indicators visible
   - Tab order logical

2. **Screen Reader Support**
   - Semantic HTML (`<nav>`, `<main>`, `<article>`)
   - ARIA labels where needed
   - LiveRegion for dynamic content

3. **Color Contrast**
   - Text: 4.5:1 minimum contrast
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

4. **Touch Targets**
   - Minimum 44x44px (iOS/Android guidelines)
   - Spacing between targets

---

## Security Architecture

### 1. Authentication Security

**JWT-based Authentication:**

- Supabase Auth handles JWT generation/validation
- Tokens stored in localStorage (httpOnly cookies not available in static hosting)
- Automatic token refresh before expiration

**Security Measures:**

- Passwords hashed with bcrypt (handled by Supabase)
- Email verification required
- Rate limiting on auth endpoints

---

### 2. Authorization (RLS)

**Row Level Security enforces access control:**

```sql
-- Example: Users can only see their own tastings
CREATE POLICY "Users can view own tastings"
ON quick_tastings FOR SELECT
USING (auth.uid() = user_id);
```

**Benefits:**

- Authorization logic at database level
- Cannot be bypassed by API bugs
- Applies to all queries automatically

---

### 3. Input Validation

**Client-side validation:**

- React Hook Form with Zod schemas
- Immediate user feedback

**Server-side validation:**

- Zod schemas on API routes
- Never trust client input

```typescript
import { z } from 'zod';

const createTastingSchema = z.object({
  category: z.string().min(1),
  session_name: z.string().optional(),
  mode: z.enum(['quick', 'study', 'competition']),
});

// In API route
const body = createTastingSchema.parse(req.body);
```

---

### 4. XSS Prevention

**React's built-in protection:**

- Automatic escaping of strings
- dangerouslySetInnerHTML avoided except for trusted content

**Content Security Policy:**

- Defined in `next.config.js`
- Restricts script sources

---

### 5. CSRF Protection

**Stateless API with JWT:**

- No session cookies = no CSRF vulnerability
- JWT in Authorization header

---

## Performance Optimization

### 1. Code Splitting

**Next.js automatic code splitting:**

- Each page is a separate bundle
- Dynamic imports for heavy components

```typescript
// Dynamic import for heavy D3 component
const FlavorWheel = dynamic(() => import('@/components/FlavorWheel'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only
});
```

---

### 2. Image Optimization

**Next.js Image component:**

- Automatic responsive images
- WebP/AVIF format
- Lazy loading

```typescript
<Image
  src={photo_url}
  alt="Tasting photo"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

### 3. Database Query Optimization

**Strategies:**

1. **Indexes on frequently queried columns**

   ```sql
   CREATE INDEX idx_tastings_user_created
   ON quick_tastings(user_id, created_at DESC);
   ```

2. **Limit result sets**

   ```typescript
   const { data } = await supabase.from('quick_tastings').select('*').limit(20);
   ```

3. **Use select() to fetch only needed columns**
   ```typescript
   .select('id, session_name, created_at');
   ```

---

### 4. Caching Strategy

**Levels:**

1. **CDN Caching (Netlify)**
   - Static assets cached at edge
   - Cache-Control headers set

2. **Browser Caching**
   - Service worker for offline support (optional)
   - LocalStorage for user preferences

3. **Database Caching**
   - Supabase has built-in query caching
   - Realtime subscriptions reduce polling

---

### 5. Debouncing and Throttling

**Debouncing for sliders:**

```typescript
const scoreDebounceRef = useRef<NodeJS.Timeout | null>(null);

const handleScoreChange = (score: number) => {
  setLocalScore(score); // Immediate UI update

  if (scoreDebounceRef.current) {
    clearTimeout(scoreDebounceRef.current);
  }

  scoreDebounceRef.current = setTimeout(() => {
    onUpdate({ overall_score: score }); // DB update after 300ms
  }, 300);
};
```

**Why:** Prevents excessive API calls while slider is moving.

---

### 6. Monitoring and Observability

**Sentry Integration:**

- Error tracking
- Performance monitoring
- Release tracking

**Configuration:**

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

---

## Deployment Architecture

### Build Process

```
┌─────────────────┐
│  Git Push       │
│  to main        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Netlify        │
│  Webhook        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm install    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm run build  │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to      │
│  Netlify CDN    │
└─────────────────┘
```

**Build Command:** `npm run build`
**Output:** `.next/` directory (static + serverless functions)

---

### Environment Variables

**Required:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - For AI flavor extraction (server-side only)

**Optional:**

- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `SENTRY_ORG`, `SENTRY_PROJECT` - Sentry configuration

---

### Deployment Checklist

- [ ] Environment variables set in Netlify
- [ ] Build succeeds locally with `npm run build`
- [ ] Database migrations applied in Supabase
- [ ] RLS policies tested
- [ ] Sentry configured for error tracking
- [ ] Performance tested (Lighthouse score > 90)

---

## Key Architectural Decisions

### Decision 1: Why Supabase over Custom Backend?

**Rationale:**

- **Speed:** Instant PostgreSQL setup with auth
- **Security:** Built-in RLS policies
- **Real-time:** WebSocket support out-of-the-box
- **Cost:** Free tier generous for MVP

**Trade-offs:**

- Vendor lock-in (mitigated by PostgreSQL being open standard)
- Less control over infrastructure

---

### Decision 2: Why Next.js Pages Router over App Router?

**Rationale:**

- **Stability:** Pages router is mature and battle-tested
- **File-based routing:** Intuitive for team
- **API routes:** Serverless functions built-in

**Trade-offs:**

- Missing some React 18 features (Server Components)
- Will need migration to App Router eventually

---

### Decision 3: Why Netlify over Vercel?

**Rationale:**

- **Simplicity:** Easier setup for team
- **Cost:** More generous free tier
- **Features:** Edge functions, split testing

**Trade-offs:**

- Less Next.js-specific optimization than Vercel

---

### Decision 4: Why Client-side State over Server State Library (React Query)?

**Rationale:**

- **Simplicity:** Smaller learning curve
- **Real-time:** Supabase subscriptions handle data sync
- **Size:** Smaller bundle

**Trade-offs:**

- More manual cache management
- No automatic background refetching

---

## Future Architecture Considerations

### 1. Migration to App Router

- **When:** When stable and team is ready
- **Benefits:** Server Components, Suspense, Streaming
- **Effort:** High (need to refactor all pages)

### 2. Add React Query

- **When:** When manual cache management becomes painful
- **Benefits:** Automatic refetching, caching, optimistic updates
- **Effort:** Medium (can be gradual)

### 3. Offline Support

- **When:** When users request it
- **Benefits:** Works without internet
- **Effort:** High (service workers, conflict resolution)

### 4. Mobile Apps (React Native)

- **When:** After web MVP validated
- **Benefits:** Native feel, app store presence
- **Effort:** High (new codebase, but can share logic)

---

## Conclusion

Flavatix's architecture balances simplicity with scalability. The use of proven technologies (Next.js, Supabase, PostgreSQL) ensures stability, while the modular design allows for future enhancements without major rewrites.

**Key Strengths:**

- Clear separation of concerns (UI, API, Database)
- Security-first approach (RLS policies)
- Real-time collaboration built-in
- Performance optimized from the start

**Areas for Improvement:**

- Add end-to-end testing
- Implement React Query for better server state management
- Add comprehensive error boundaries
- Improve TypeScript coverage

---

**Last Updated:** January 2026
**Document Version:** 1.0
**Maintainer:** Development Team

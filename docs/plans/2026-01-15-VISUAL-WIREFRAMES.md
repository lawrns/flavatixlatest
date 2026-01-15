# FLAVATIX VISUAL WIREFRAMES
**Homepage + Login Page Design Specifications**

**Status:** ✅ Design Complete
**Created:** January 15, 2026
**Companion Document:** 2026-01-15-MASTER-IMPLEMENTATION-PLAN.md

---

## HOMEPAGE WIREFRAME

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                         HERO SECTION                               │
│                  (Gradient Background)                             │
│                                                                    │
│                                                                    │
│                    [Flavatix Logo SVG]                             │
│                     (max-width: 400px)                             │
│                                                                    │
│            The one place for all your tasting needs                │
│                    (text-2xl, white/95)                            │
│                                                                    │
│                                                                    │
│      ┌─────────┐  ┌─────────┐  ┌─────────┐                       │
│      │ Fruity  │  │ Floral  │  │ Spicy   │                       │  <- Floating
│      └─────────┘  └─────────┘  └─────────┘                       │     badges
│                                                                    │     (animated)
│           ┌─────────┐  ┌─────────┐                                │
│           │ Sweet   │  │ Earthy  │                                │
│           └─────────┘  └─────────┘                                │
│                                                                    │
│                                                                    │
│    [Tasting Notes] [Group Studies] [AI Flavor Wheels]             │  <- Feature
│     (Pills with icons, glass-soft background)                     │     pills
│                                                                    │
│                                                                    │
│                   ┌──────────────────┐                            │
│                   │  Get Started  →  │                            │  <- Primary
│                   └──────────────────┘                            │     CTA
│                  (White bg, primary text)                         │
│                                                                    │
│           Join thousands discovering new flavors                  │
│                     (text-sm, white/70)                           │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
Height: min(85vh, 800px)
Background: linear-gradient(135deg, #C63C22, #E56244, #A93019, #732516)


┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                      VALUE PROPOSITION                             │
│                   (White background / Dark: zinc-900)              │
│                                                                    │
│                        Why Flavatix?                               │
│                    (text-h2, font-bold)                            │
│                                                                    │
│                                                                    │
│    ┌─────────────────────┐      ┌─────────────────────┐          │
│    │                     │      │                     │          │
│    │  [Icon]             │      │  [Icon]             │          │
│    │                     │      │                     │          │
│    │  Comprehensive      │      │  AI-Powered         │          │
│    │  Tasting Notes      │      │  Analysis           │          │
│    │                     │      │                     │          │
│    │  Capture every      │      │  Automatic flavor   │          │
│    │  nuance with our    │      │  profile generation │          │
│    │  detailed system    │      │  and insights       │          │
│    │                     │      │                     │          │
│    └─────────────────────┘      └─────────────────────┘          │
│                                                                    │
│    ┌─────────────────────┐      ┌─────────────────────┐          │
│    │                     │      │                     │          │
│    │  [Icon]             │      │  [Icon]             │          │
│    │                     │      │                     │          │
│    │  Collaborate        │      │  Beautiful          │          │
│    │  in Real-Time       │      │  Visualizations     │          │
│    │                     │      │                     │          │
│    │  Study Mode for     │      │  Interactive flavor │          │
│    │  groups and blind   │      │  wheels and charts  │          │
│    │  tastings           │      │                     │          │
│    │                     │      │                     │          │
│    └─────────────────────┘      └─────────────────────┘          │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
Padding: py-20 (tablet: py-32)
Cards: bg-white dark:bg-zinc-800, shadow-card


┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                         SOCIAL PROOF                               │
│                 (Accent background / primary-50)                   │
│                                                                    │
│                  Trusted by tasters worldwide                      │
│                                                                    │
│                                                                    │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│    │   10K+   │    │   50K+   │    │   100+   │                  │
│    │  Users   │    │ Tastings │    │ Countries│                  │
│    └──────────┘    └──────────┘    └──────────┘                  │
│                                                                    │
│                                                                    │
│                   ┌──────────────────┐                            │
│                   │   Start Tasting  │                            │
│                   └──────────────────┘                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px - 768px)

```
┌───────────────────────┐
│                       │
│   HERO (Mobile)       │
│                       │
│   [Logo]              │
│   (max-w-xs)          │
│                       │
│   The one place       │
│   for all your        │
│   tasting needs       │
│   (text-lg)           │
│                       │
│   [Fruity]            │  <- Badges
│     [Floral]          │     stacked
│   [Spicy]             │     vertically
│                       │
│                       │
│ [Tasting]             │  <- Pills
│ [Groups]              │     stack
│ [AI Wheels]           │     vertically
│                       │
│                       │
│ ┌─────────────────┐   │
│ │ Get Started  →  │   │  <- Full
│ └─────────────────┘   │     width
│                       │     button
│  Join thousands...    │
│                       │
└───────────────────────┘
Height: 90vh (allows for browser chrome)
Text sizes: Reduce by 1 step (h2→h3, h3→h4)
Padding: px-4, py-16


┌───────────────────────┐
│                       │
│  Why Flavatix?        │
│  (text-xl)            │
│                       │
│ ┌─────────────────┐   │
│ │                 │   │  <- Cards
│ │ [Icon]          │   │     stack
│ │ Comprehensive   │   │     vertically
│ │ Tasting Notes   │   │     on mobile
│ │                 │   │
│ │ Description...  │   │
│ │                 │   │
│ └─────────────────┘   │
│                       │
│ ┌─────────────────┐   │
│ │ [Icon]          │   │
│ │ AI-Powered      │   │
│ │ ...             │   │
│ └─────────────────┘   │
│                       │
│ (etc...)              │
│                       │
└───────────────────────┘
Gap: gap-6 (smaller than desktop)
```

---

## LOGIN PAGE WIREFRAME

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                                                                    │
│                   FULL SCREEN GRADIENT                             │
│            (Same gradient as homepage hero)                        │
│                                                                    │
│                                                                    │
│                ┌─────────────────────────────┐                    │
│                │                             │                    │
│                │  GLASSMORPHIC CARD          │                    │
│                │  (glass-strong)             │                    │
│                │                             │                    │
│                │      [Flavatix Logo]        │                    │
│                │       (h-12, centered)      │                    │
│                │                             │                    │
│                │      Welcome back           │                    │
│                │      (text-2xl, bold)       │                    │
│                │                             │                    │
│                │   Sign in to continue       │                    │
│                │   your flavor journey       │                    │
│                │   (text-sm, muted)          │                    │
│                │                             │                    │
│                │                             │                    │
│                │   Email                     │                    │
│                │   ┌───────────────────────┐ │                    │
│                │   │ you@example.com       │ │  <- Input with     │
│                │   └───────────────────────┘ │     premium focus  │
│                │                             │     (ring glow)    │
│                │                             │                    │
│                │   Password                  │                    │
│                │   ┌───────────────────────┐ │                    │
│                │   │ ••••••••              │ │                    │
│                │   └───────────────────────┘ │                    │
│                │                             │                    │
│                │                             │                    │
│                │   ┌───────────────────────┐ │                    │
│                │   │     Sign in  →        │ │  <- Primary button │
│                │   └───────────────────────┘ │     (full width)   │
│                │                             │                    │
│                │                             │                    │
│                │   Don't have an account?    │                    │
│                │        Sign up              │  <- Toggle link    │
│                │   (text-sm, link)           │                    │
│                │                             │                    │
│                └─────────────────────────────┘                    │
│                      (max-width: 448px)                           │
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Card Specs:
- Width: max-w-md (448px)
- Padding: p-8
- Background: glass-strong (white/80 or zinc-900/90)
- Border: border border-white/30 or zinc-600/40
- Shadow: shadow-modal
- Border radius: rounded-card

Input Specs:
- Height: py-2.5 (40px clickable area)
- Border: 2px solid (zinc-200 / zinc-700)
- Border radius: rounded-input
- Focus: border-primary, ring-4 ring-primary/20, shadow-lg
- Transition: transition-spring-tight
```

### Mobile Layout (320px - 768px)

```
┌───────────────────────┐
│                       │
│  GRADIENT BG          │
│                       │
│ ┌─────────────────┐   │
│ │                 │   │
│ │ CARD            │   │
│ │ (glass-strong)  │   │
│ │                 │   │
│ │  [Logo]         │   │
│ │  (h-10)         │   │
│ │                 │   │
│ │  Welcome back   │   │
│ │  (text-xl)      │   │
│ │                 │   │
│ │  Sign in to     │   │
│ │  continue...    │   │
│ │                 │   │
│ │                 │   │
│ │  Email          │   │
│ │  ┌───────────┐  │   │
│ │  │           │  │   │
│ │  └───────────┘  │   │
│ │                 │   │
│ │  Password       │   │
│ │  ┌───────────┐  │   │
│ │  │           │  │   │
│ │  └───────────┘  │   │
│ │                 │   │
│ │  ┌───────────┐  │   │
│ │  │ Sign in → │  │   │
│ │  └───────────┘  │   │
│ │                 │   │
│ │  Don't have an  │   │
│ │  account?       │   │
│ │  Sign up        │   │
│ │                 │   │
│ └─────────────────┘   │
│  (max-w-full)         │
│  (m-4)                │
│                       │
└───────────────────────┘

Mobile Adjustments:
- Card padding: p-6 (reduced from p-8)
- Logo height: h-10 (reduced from h-12)
- Heading: text-xl (reduced from text-2xl)
- Full width with 16px margins (m-4)
```

---

## GRADIENT SPECIFICATIONS

### Homepage & Login Background

```css
/* Light mode gradient */
background: linear-gradient(
  135deg,
  #C63C22 0%,        /* Primary (top-left) */
  #E56244 25%,       /* Lighter primary */
  #A93019 50%,       /* Deeper primary (middle) */
  #732516 100%       /* Darkest primary (bottom-right) */
);

/* Dark mode gradient (more subdued) */
.dark {
  background: linear-gradient(
    135deg,
    #8B2715 0%,      /* Darker start */
    #A93019 25%,
    #732516 50%,
    #3F1008 100%     /* Almost black end */
  );
}
```

**Why 135deg?**
- Creates diagonal flow (top-left to bottom-right)
- More dynamic than vertical/horizontal
- Matches modern design trends (Linear, Stripe, Vercel)

---

## COLOR USAGE MAP

### Interactive Elements

| Element | Resting | Hover | Active | Focus | Disabled |
|---------|---------|-------|--------|-------|----------|
| **Primary Button** | bg-primary | bg-primary-700, shadow-button-hover, scale-102 | scale-98, shadow-button-active | ring-2 ring-primary, ring-offset-2 | opacity-50 |
| **Input Field** | border-zinc-200 | - | - | border-primary, ring-4 ring-primary/20, shadow-lg | opacity-50 |
| **Card** | shadow-card | shadow-card-hover, -translate-y-1, border-primary/30 | shadow-card-active, border-primary | - | - |
| **Link** | text-zinc-600 | text-primary | - | ring-2 ring-primary | - |

### Text Hierarchy

| Element | Light Mode | Dark Mode | Use Case |
|---------|-----------|-----------|----------|
| **Primary Text** | text-zinc-900 | text-zinc-50 | Headings, important content |
| **Secondary Text** | text-zinc-600 | text-zinc-400 | Descriptions, body text |
| **Muted Text** | text-zinc-500 | text-zinc-500 | Captions, metadata |
| **On Primary** | text-white | text-white | Text on primary color bg |

---

## ANIMATION TIMING

### Spring Easing Values

```javascript
// Fast interactions (buttons, inputs)
transition-spring-tight: 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)

// Standard interactions (cards, dropdowns)
transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)

// Slow, elegant interactions (modals, page transitions)
transition-spring-gentle: 400ms cubic-bezier(0.215, 0.61, 0.355, 1)

// Return animations (scale back to normal)
transition-spring-back: 300ms cubic-bezier(0.6, 0.04, 0.98, 0.335)
```

### Floating Badges Animation

```javascript
// Each badge has:
initial: { opacity: 0, scale: 0.8 }
animate: {
  opacity: [0.6, 0.9, 0.6],      // Pulse opacity
  scale: [0.95, 1.05, 0.95],     // Subtle scale change
  y: [0, -10, 0],                // Float up and down
}
transition: {
  duration: 4 + (index * 0.5),   // Stagger duration
  repeat: Infinity,
  ease: 'easeInOut',
  delay: index * 0.3,            // Stagger start time
}
```

---

## RESPONSIVE BREAKPOINTS

### Tailwind Default Breakpoints (Using)

```javascript
sm:  640px   // Small devices (large phones)
md:  768px   // Tablets
lg:  1024px  // Small laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

### Custom Breakpoint (If Needed)

```javascript
// Add to tailwind.config.js if needed
screens: {
  'tablet': '768px',    // Alias for md
  'laptop': '1024px',   // Alias for lg
  'desktop': '1280px',  // Alias for xl
}
```

### Component Responsive Behavior

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (1024px+) |
|-----------|----------------|---------------------|-------------------|
| **Hero Logo** | max-w-xs (320px) | max-w-sm (384px) | max-w-md (448px) |
| **Hero Text** | text-lg | text-xl | text-2xl |
| **Feature Pills** | Stack vertical | Wrap horizontal | Single row |
| **Value Cards** | Stack vertical | 2 columns | 2 columns |
| **Login Card** | Full width (m-4) | max-w-md, centered | max-w-md, centered |
| **Button** | Full width | Inline-block | Inline-block |

---

## GLASSMORPHISM DEPTH LEVELS

### Visual Hierarchy

```
Level 1 (Background)
└─ Solid gradient background
   └─ Level 2 (Soft Glass)
      └─ Feature pills, floating badges
         └─ Level 3 (Standard Glass)
            └─ Login card background
               └─ Level 4 (Strong Glass)
                  └─ Modals, dropdown menus
```

### CSS Values

```css
/* Level 2: Soft Glass (minimal depth) */
.glass-soft {
  background: rgba(255, 255, 255, 0.5);  /* or rgba(24, 24, 27, 0.6) dark */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Level 3: Standard Glass (medium depth) */
.glass {
  background: rgba(255, 255, 255, 0.7);  /* or rgba(24, 24, 27, 0.8) dark */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Level 4: Strong Glass (maximum depth) */
.glass-strong {
  background: rgba(255, 255, 255, 0.8);  /* or rgba(24, 24, 27, 0.9) dark */
  backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

## ICON USAGE

### Lucide Icons (Already Using)

Homepage:
- `FileText` - Tasting Notes feature
- `Users` - Group Tastings feature
- `PieChart` - Flavor Wheels feature

Login:
- `CheckCircle` - Success state (after successful login)
- `AlertCircle` - Error state (validation errors)

### Icon Sizing

```css
/* Small (feature pills, badges) */
w-4 h-4   /* 16px */

/* Medium (feature cards) */
w-6 h-6   /* 24px */

/* Large (empty states, hero icons) */
w-12 h-12 /* 48px */
```

---

## ACCESSIBILITY REQUIREMENTS

### Color Contrast

| Combination | Ratio | WCAG Level | Use Case |
|-------------|-------|------------|----------|
| White on Primary (#C63C22) | 4.52:1 | AA | Button text |
| zinc-900 on white | 18.69:1 | AAA | Body text (light mode) |
| zinc-50 on zinc-900 | 17.56:1 | AAA | Body text (dark mode) |
| zinc-600 on white | 6.89:1 | AA | Secondary text (light) |

### Focus Indicators

All interactive elements MUST have visible focus state:
```css
focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### Keyboard Navigation

- Tab: Navigate between inputs/buttons
- Enter: Submit form / activate button
- Escape: Close modal (if applicable)
- Space: Activate button (if focused)

### Screen Reader

All images/icons must have `alt` text or `aria-label`:
```jsx
<img src="/logos/flavatix-logo.svg" alt="Flavatix logo" />
<FileText className="w-4 h-4" aria-hidden="true" />
<span className="sr-only">Tasting Notes feature</span>
```

---

## PERFORMANCE TARGETS

### Animation Performance

- **Frame Rate:** 60fps minimum
- **Paint Time:** <16ms per frame
- **No Layout Shift:** CLS = 0
- **Reduced Motion:** Respect user preference

### Asset Optimization

| Asset | Size Target | Format |
|-------|-------------|--------|
| Flavatix Logo | <10KB | SVG (optimized) |
| Favicon | <5KB | SVG |
| Total CSS (gzipped) | <50KB | Minified |
| Total JS (gzipped) | <200KB | Code-split |

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## DARK MODE SPECIFICATIONS

### Toggle Behavior

```jsx
// Uses next-themes (already installed)
<ThemeProvider attribute="class" defaultTheme="system">
  {/* App content */}
</ThemeProvider>
```

### Color Adjustments

Dark mode is NOT just inverted colors:

| Element | Light Mode | Dark Mode | Why Different |
|---------|-----------|-----------|---------------|
| Background | white | zinc-900 | Intentional dark surface |
| Card | white | zinc-800 | Slightly lighter than bg |
| Text Primary | zinc-900 | zinc-50 | Softer white, not pure |
| Text Secondary | zinc-600 | zinc-400 | Lighter for contrast |
| Border | zinc-200 | zinc-700 | Visible in both modes |
| Shadow | rgba(0,0,0,0.1) | rgba(0,0,0,0.3) | Darker for visibility |

---

## IMPLEMENTATION NOTES

### CSS-First Approach

Prefer Tailwind utilities over custom CSS:
- ✅ `hover:shadow-button-hover hover:scale-102`
- ❌ Custom `@keyframes` unless necessary

### Motion Library

Using `framer-motion` (already installed):
- ✅ Page entrance animations
- ✅ Floating badge animations
- ✅ Stagger animations (if needed)
- ❌ Simple hover states (use CSS transitions)

### Performance Monitoring

```javascript
// Add to _app.tsx for performance tracking
if (typeof window !== 'undefined') {
  // Track animation frame rate
  const fps = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FPS:', Math.round(1000 / entry.duration));
    }
  });
  fps.observe({ entryTypes: ['measure'] });
}
```

---

**Document Version:** 1.0
**Created:** January 15, 2026
**Companion:** 2026-01-15-MASTER-IMPLEMENTATION-PLAN.md
**Status:** ✅ Ready for Implementation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>

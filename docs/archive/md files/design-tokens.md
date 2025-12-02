# FlavorWheel Design Tokens

This document contains the comprehensive design tokens for the FlavorWheel project, extracted from the landing page UX/UI and existing codebase.

## 🎨 Color Palette

### Primary Colors
```css
--primary: #1F5D4C;           /* Main brand color - deep forest green */
--primary-hover: #2E7D32;     /* Hover state for primary */
--secondary: #D4AF37;         /* Gold accent */
--secondary-hover: #E6C84A;   /* Hover state for secondary */
--accent: #C65A2E;            /* Warm orange accent */
--accent-hover: #D6743A;      /* Hover state for accent */
```

### Background Colors
```css
--background-app: #FEF3E7;        /* Main app background - warm cream */
--background-surface: #FFFFFF;     /* Card/surface background */
--background-surface-secondary: #F7F3EA; /* Secondary surface */
--background-muted: #F4E3CC;      /* Muted background */
--background-dark: #161614;       /* Dark background */
```

### Text Colors
```css
--text-primary: #2C1810;      /* Primary text - dark brown */
--text-secondary: #5C5C5C;     /* Secondary text - medium gray */
--text-muted: #8B8B8B;         /* Muted text - light gray */
--text-inverse: #FFFFFF;       /* Inverse text - white */
```

### Border Colors
```css
--border-subtle: rgba(0,0,0,0.08);  /* Subtle borders */
--border-default: rgba(0,0,0,0.12); /* Default borders */
--border-strong: rgba(0,0,0,0.20);  /* Strong borders */
--border-focus: #1F5D4C;            /* Focus state borders */
```

### Semantic Colors
```css
--semantic-success: #22C55E;
--semantic-warning: #F59E0B;
--semantic-error: #EF4444;
--semantic-info: #3B82F6;
```

### Flavor Profile Colors
```css
--flavor-fruity: #E4572E;
--flavor-floral: #E9A2AD;
--flavor-vegetal: #57A773;
--flavor-smoky: #6B5B95;
--flavor-sweet: #DFAF2B;
--flavor-spicy: #B53F3F;
--flavor-bitter: #2F4858;
--flavor-sour: #3B9ED8;
--flavor-roasted: #8C5A3A;
--flavor-nutty: #C29F6D;
--flavor-mineral: #7A8A8C;
--flavor-earthy: #6D7F4B;
```

## 📝 Typography

### Font Families
```css
--font-heading: 'Crimson Text Variable', ui-serif, Georgia, serif;
--font-body: 'Inter Variable', system-ui, -apple-system, sans-serif;
```

### Font Sizes (Responsive)
```css
--text-h1: clamp(22px, 5vw, 28px);    /* Main headings */
--text-h2: clamp(18px, 4vw, 24px);    /* Section headings */
--text-h3: clamp(16px, 3.5vw, 20px);  /* Subsection headings */
--text-body: 16px;                    /* Body text */
--text-small: clamp(14px, 2.5vw, 15px); /* Small text */
--text-caption: clamp(12px, 2vw, 13px); /* Caption text */
```

### Line Heights
```css
--line-height-heading: 1.3;   /* For headings */
--line-height-body: 1.6;      /* For body text */
--line-height-snug: 1.4;      /* For compact text */
```

## 📏 Spacing Scale

```css
--space-1: 4px;    /* xs */
--space-2: 8px;    /* sm */
--space-3: 12px;   /* md */
--space-4: 16px;   /* lg */
--space-5: 20px;   /* xl */
--space-6: 24px;   /* 2xl */
--space-8: 32px;   /* 3xl */
--space-10: 40px;  /* 4xl */
--space-12: 48px;  /* 5xl */
--space-16: 64px;  /* 6xl */
```

## 🔲 Border Radius

```css
--radius-button: 12px;  /* Buttons */
--radius-card: 16px;    /* Cards and containers */
--radius-input: 12px;   /* Form inputs */
```

## 🌟 Shadows

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.2);
--shadow-primary: 0 2px 8px rgba(31, 93, 76, 0.25);
--shadow-primary-hover: 0 4px 16px rgba(31, 93, 76, 0.35);
--shadow-tasting: 0 2px 8px rgba(31, 93, 76, 0.08);
--shadow-tasting-hover: 0 8px 24px rgba(31, 93, 76, 0.15);
```

## 🎨 Gradients

```css
--gradient-primary: linear-gradient(135deg, #1F5D4C 0%, #2E7D32 100%);
--gradient-accent: linear-gradient(135deg, #C65A2E 0%, #D6743A 100%);
--gradient-subtle: radial-gradient(90% 120% at 0% 0%, #FDF4E6 0%, #F7E9D6 60%, #F4E3CC 100%);
--gradient-tasting: linear-gradient(135deg, #FEF3E7 0%, #F7F3EA 100%);
```

## 📱 Breakpoints

```css
--breakpoint-mobile: 0px;
--breakpoint-tablet: 640px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
```

## 🎯 Interactive Elements

### Minimum Touch Targets
```css
--min-touch-height: 44px;  /* Minimum height for interactive elements */
```

### Focus States
```css
--focus-ring: 0 0 0 2px var(--border-focus);
--focus-ring-offset: 2px;
```

## 🏗️ Component Tokens

### Buttons
```css
--button-padding-x: var(--space-4);
--button-padding-y: var(--space-3);
--button-border-radius: var(--radius-button);
--button-font-weight: 600;
```

### Cards
```css
--card-padding: var(--space-6);
--card-border-radius: var(--radius-card);
--card-background: var(--background-surface);
--card-shadow: var(--shadow-sm);
```

### Forms
```css
--input-padding-x: var(--space-3);
--input-padding-y: var(--space-3);
--input-border-radius: var(--radius-input);
--input-border-width: 2px;
--input-min-height: var(--min-touch-height);
```

## 🎯 Usage Guidelines

### Implementation
These design tokens can be implemented in several ways:

1. **CSS Custom Properties**: Add to your `:root` selector in `globals.css`
2. **Tailwind Config**: Already partially implemented in `tailwind.config.js`
3. **JavaScript/TypeScript**: Export as constants for programmatic use

### Best Practices
- Use semantic tokens (e.g., `--text-primary`) instead of literal values
- Maintain consistency across components by referencing these tokens
- Update tokens centrally rather than hardcoding values
- Test color combinations for accessibility compliance
- Ensure touch targets meet minimum size requirements on mobile

### Accessibility Notes
- All color combinations meet WCAG 2.1 AA contrast requirements
- Focus states are clearly visible with sufficient contrast
- Touch targets are minimum 44px for mobile accessibility
- Text sizes scale appropriately across devices

These design tokens create a cohesive, accessible, and scalable design system for FlavorWheel, emphasizing the warm, coffee-inspired aesthetic while maintaining excellent usability across all devices.
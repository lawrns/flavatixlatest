# 🌮 FlavorWheel Project Context

## Overview
FlavorWheel is a groundbreaking mobile-first tasting app for coffee, drinks, and beyond (e.g., wine, beer, spirits, mezcal, perfume, olive oil, snacks), designed to be the most user-friendly tasting app the world has ever seen. It blends simplicity for casual enthusiasts with powerful customization for industry experts, leveraging AI-driven flavor wheel visualizations (Aroma, Flavor, Combined, Metaphor) to transform user-generated data into insightful, shareable graphics. The app fosters a social community, supports solo quick tastings, group studies, and formal competitions, all while emphasizing data privacy and seamless mobile integration.

- **Vision**: Every sip or sniff becomes a delightful, data-rich adventure.
- **Current Date**: September 16, 2025, 09:35 AM CST.

## Key Objectives
- Empower users to log, analyze, and share tasting experiences effortlessly across diverse categories.
- Generate dynamic flavor wheels with molecule info and filters (personal/universal, demographics, items) for actionable insights.
- Support quick tastings, study sessions, and competitions with blind options, rankings, and industry templates (e.g., CMS Wine Grid, SCA Coffee).
- Build a social network with profiles, feeds, messaging, and activity tracking for collaboration.

## Technical Stack
- **Frontend**: Next.js with TypeScript for a mobile-first experience (target: 375x667px, e.g., iPhone SE).
- **Authentication**: Supabase Auth (@supabase/supabase-js v2.55.0) with `auth.users` and custom `public.users` table.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) and triggers for profile sync.
- **Styling**: Tailwind CSS 3.4.9, integrated with a Mexican-inspired design system.
- **Notifications**: React Toastify 11.0.5 for user feedback.
- **Validations**: Zod 3.25.76 for form handling.
- **Routing**: React Router DOM 7.8.0 (or Next.js App Router).
- **Email**: SendGrid for SMTP (Host: `smtp.sendgrid.net`, Port: 587, Username: `apikey`, Password: API Key).
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL=https://kobuclkvlacdwvxmakvq.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYnVjbGt2bGFjZHd2eG1ha3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTYzOTIsImV4cCI6MjA2ODI3MjM5Mn0.wOq-3WWMLJyq9gKDoifb-7CqXb7kQx5hGcnv3MBCbPw`

## User Stories
### Epic: User Profile and Onboarding
- As a new user, I want to sign up/login via email or social providers, so I can start my tasting journey without barriers.
- As a user, I want to set up a profile with username, photo, and bio, so I can personalize my space.
- As a user, I want to search for users, text, or hashtags, so I can discover content and people.

### Epic: Social Features
- As a user, I want to create and share posts with pictures/text from tastings or reviews, so I can engage with the community.
- As a user, I want to view a feed of shared content with like/share buttons, so I can interact and get inspiration.
- As a user, I want to send and view messages with chat history, so I can collaborate on tastings.

### Epic: Quick Tasting
- As a user, I want to select Quick Tasting from a menu, so I can record impressions without setup.
- As a user, I want to choose a category from a dropdown (e.g., Coffee, Wine), so my tasting aligns with the item type.
- As a user, I want to add items with name, optional photo, aroma, flavor, other notes, and 0-100 score, so I capture impressions simply.
- As a user, I want to end and save the tasting with one tap, so the process feels fluid.

### Epic: Create Tasting - General
- As a tasting creator, I want to select from pre-built templates (e.g., CMS Wine Grid), so I can use industry standards.
- As a tasting creator, I want to toggle blind/not blind for participants or items, so I can control visibility.
- As a tasting creator, I want to enable ranking for participants or items, so I can measure outcomes.
- As a participant, I want to join a tasting via shared code, so I can collaborate easily.

### Epic: Create Tasting - Study Mode
- As a user, I want to create a tasting without preloading items, so I can taste informally with others.
- As a user, I want to add items and define up to 10 categories with parameters (e.g., Subjective Input, Sliding Scale), so I can customize sessions.

### Epic: Create Tasting - Competition Mode
- As a competition host, I want to preload item data and correct answers, so participants answer against fixed data.
- As a host, I want to rank participants by accuracy, so results are ordered.
- As a host, I want to limit categories to ~10, so competitions remain manageable.

### Epic: Tasting Management
- As a user, I want to view my tasting history with PDF exports, so I can review or share past sessions.
- As a user, I want to see my blind tasting score, so I can track expertise.

### Epic: Review System
- As a user, I want to enter core fields (item name, picture, batch ID, category, date), so my review has metadata.
- As a user, I want to complete a Quick Review with 14 categories (e.g., Aroma, Intensity), so I evaluate consistently.
- As a user, I want to write a Prose Review with AI descriptor extraction, so I describe naturally.
- As a user, I want to publish my review to my profile, so others can see it.

### Epic: Flavor Wheels
- As a user, I want to auto-generate wheels from my data (parsed by AI), so I visualize perceptions effortlessly.
- As a user, I want to view Aroma, Flavor, Combined, Metaphor wheels, so I explore sensory layers.
- As a user, I want to filter wheels by scope (personal, universal), so I compare perceptions.

## Design Tokens
### Metadata
- Name: FlavorWheel Design System
- Version: 1.0.0
- Description: Mexican-inspired design with warm colors, fluid typography, mobile-first
- Created: 2025-09-15
- Updated: 2025-09-16
- Inspiration: Mexican heritage, mezcal tradition, warm desert landscapes

### Colors
- **Brand**: 
  - primary: `#1F5D4C`
  - primary-hover: `#2E7D32`
  - secondary: `#D4AF37`
  - secondary-hover: `#E6C84A`
  - accent: `#C65A2E`
  - accent-hover: `#D6743A`
- **Background**: 
  - app: `#FEF3E7`
  - surface: `#FFFFFF`
  - surface-secondary: `#F7F3EA`
  - muted: `#F4E3CC`
  - dark: `#161614`
- **Text**: 
  - primary: `#2C1810`
  - secondary: `#5C5C5C`
  - muted: `#8B8B8B`
  - inverse: `#FFFFFF`
- **Border**: 
  - subtle: `rgba(0,0,0,0.08)`
  - default: `rgba(0,0,0,0.12)`
  - strong: `rgba(0,0,0,0.20)`
  - focus: `#1F5D4C`
- **Semantic**: 
  - success: `#22C55E`
  - warning: `#F59E0B`
  - error: `#EF4444`
  - info: `#3B82F6`
- **Flavor Wheel**: 
  - fruity: `#E4572E`
  - floral: `#E9A2AD`
  - vegetal: `#57A773`
  - smoky: `#6B5B95`
  - sweet: `#DFAF2B`
  - spicy: `#B53F3F`
  - bitter: `#2F4858`
  - sour: `#3B9ED8`
  - roasted: `#8C5A3A`
  - nutty: `#C29F6D`
  - mineral: `#7A8A8C`
  - earthy: `#6D7F4B`

### Typography
- **Fonts**:
  - heading: `Crimson Text Variable, ui-serif, Georgia` (weights: 400, 600, 700)
  - body: `Inter Variable, system-ui, -apple-system, sans-serif` (weights: 400, 500, 600)
- **Sizes**:
  - h1: `clamp(22px, 5vw, 28px)`
  - h2: `clamp(18px, 4vw, 24px)`
  - h3: `clamp(16px, 3.5vw, 20px)`
  - body: `16px`
  - small: `clamp(14px, 2.5vw, 15px)`
  - caption: `clamp(12px, 2vw, 13px)`
- **Line Heights**:
  - heading: 1.3
  - body: 1.6
  - snug: 1.4

### Spacing
- **Base Unit**: `8px`
- **Scale**:
  - 0: `0px`
  - 1: `4px`
  - 2: `8px`
  - 3: `12px`
  - 4: `16px`
  - 5: `20px`
  - 6: `24px`
  - 8: `32px`
  - 10: `40px`
  - 12: `48px`
  - 16: `64px`
- **Components**:
  - button: { padding_y: `12px`, padding_x: `20px`, min_height: `44px` }
  - card: { padding: `16px`, margin: `12px`, border_radius: `16px` }
  - input: { padding_y: `12px`, padding_x: `14px`, height: `44px`, border_radius: `12px` }

### Components
- **Buttons**:
  - primary: { background: `linear-gradient(135deg, #1F5D4C 0%, #2E7D32 100%)`, text: `#FFFFFF`, border_radius: `12px`, padding: `12px 20px`, min_height: `44px`, font_weight: `600`, shadow: `0 2px 8px rgba(31, 93, 76, 0.25)`, hover: { shadow: `0 4px 16px rgba(31, 93, 76, 0.35)`, transform: `translateY(-2px)` } }
  - secondary: { background: `#FFFFFF`, border: `2px solid rgba(0,0,0,0.12)`, text: `#2C1810`, border_radius: `12px`, padding: `12px 20px`, min_height: `44px`, font_weight: `500`, hover: { border_color: `#C65A2E`, shadow: `0 1px 3px rgba(0,0,0,0.1)` } }
  - ghost: { background: `transparent`, text: `#1F5D4C`, border: `1px solid #1F5D4C`, border_radius: `12px`, padding: `12px 20px`, min_height: `44px` }
- **Cards**:
  - default: { background: `#FFFFFF`, border: `1px solid rgba(0,0,0,0.12)`, border_radius: `16px`, shadow: `0 2px 8px rgba(0, 0, 0, 0.08)`, padding: `16px`, hover: { shadow: `0 8px 24px rgba(0, 0, 0, 0.12)`, transform: `translateY(-4px)` } }
  - tasting: { background: `linear-gradient(135deg, #FEF3E7 0%, #F7F3EA 100%)`, border: `1px solid rgba(31, 93, 76, 0.1)`, border_radius: `16px`, shadow: `0 2px 8px rgba(31, 93, 76, 0.08)`, hover: { shadow: `0 8px 24px rgba(31, 93, 76, 0.15)`, transform: `translateY(-2px) scale(1.01)` } }
- **Forms**:
  - input: { background: `#FFFFFF`, border: `2px solid rgba(0,0,0,0.12)`, border_radius: `12px`, padding: `12px 14px`, font_size: `16px`, min_height: `44px`, focus: { border_color: `#C65A2E`, shadow: `0 0 0 3px rgb(212 175 55 / 10%)` } }
  - label: { font_size: `14px`, font_weight: `500`, color: `#5C5C5C`, margin_bottom: `8px` }

### Effects
- **Shadows**: { xs: `0 1px 2px rgba(0,0,0,0.05)`, sm: `0 1px 3px rgba(0,0,0,0.1)`, md: `0 4px 6px rgba(0,0,0,0.1)`, lg: `0 10px 15px rgba(0,0,0,0.15)`, xl: `0 20px 25px rgba(0,0,0,0.2)` }
- **Gradients**: { primary: `linear-gradient(135deg, #1F5D4C 0%, #2E7D32 100%)`, accent: `linear-gradient(135deg, #C65A2E 0%, #D6743A 100%)`, subtle: `radial-gradient(90% 120% at 0% 0%, #FDF4E6 0%, #F4E3CC 100%)` }

### Responsive
- **Breakpoints**: { mobile: `0px`, tablet: `640px`, desktop: `1024px`, wide: `1280px` }

### Accessibility
- Contrast minimum: 4.5:1
- Touch targets: 44px
- Focus ring: `2px solid #1F5D4C`
- Reduced motion: `prefers-reduced-motion`

## Database Schema
### Table: `public.users`
- **id** (uuid, PK, FK to `auth.users.id`, default: `gen_random_uuid()`)
- **username** (text, unique, 3-20 chars, not null)
- **photo_url** (text, optional, URL format)
- **bio** (text, ≤200 chars, optional)
- **posts_count** (integer, default 0, ≥0)
- **followers_count** (integer, default 0, ≥0)
- **following_count** (integer, default 0, ≥0)
- **preferred_category** (text, optional, e.g., 'Coffee', 'Wine', etc.)
- **last_tasted_at** (timestamp with time zone, optional)
- **email_confirmed** (boolean, default false, not null)
- **tastings_count** (integer, default 0, ≥0)
- **reviews_count** (integer, default 0, ≥0)
- **created_at** (timestamp with time zone, default now(), not null)
- **updated_at** (timestamp with time zone, default now())
- **RLS**: Enable with policy `Users can view own profile` (SELECT USING auth.uid() = id)

### Trigger: `handle_new_user`
- Syncs `auth.users` inserts to `public.users`, handling `username`, `photo_url`, `bio`, `email_confirmed`.

## Project Evolution
- **MVP Focus**: Quick Tasting, Review System, Personal Flavor Wheels, User Profiles.
- **Recent Issues**: 500 (trigger constraint fix), 429 (rate limit fix with debounce).
- **Current Status**: Auth under /auth with toggle, SendGrid SMTP configured.

## Guidelines for AI
- **Priority**: Maintain user-friendliness; optimize for mobile (375x667px).
- **Security**: Use RLS, avoid hardcoded secrets, validate inputs.
- **Scalability**: Design for future epics (e.g., competitions, social features).
- **Testing**: Verify with checklists from AUDITORIA_AUTH_MODIFIED.md.
- **Revisit**: Use this file for context on features, design, and tech stack.

---
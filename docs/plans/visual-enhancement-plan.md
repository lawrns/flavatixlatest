# Flavatix Visual Enhancement Plan
## Art Skill Implementation Strategy

**Date:** January 19, 2026
**Codebase:** Flavatix - Tasting Notes & Flavor Analysis Platform
**Current State:** Strong design foundation with 30+ generated images, comprehensive design system
**Goal:** Elevate the UI with custom illustrations, enhanced visualizations, and premium visual polish

---

## Executive Summary

Flavatix has an **excellent technical and design foundation** with:
- Comprehensive design tokens and Tailwind CSS system
- 30+ existing generated images (category heroes, onboarding, empty states)
- Strong brand identity (rust red #C63C22 + Mexican green #10B981)
- Modern component library with Framer Motion and D3.js available
- Full dark mode support and accessibility compliance

**Opportunity:** Leverage the Art skill to create **custom, brand-specific visual assets** that elevate the premium feel and differentiate Flavatix from competitors.

---

## Priority Matrix

### 🔥 **HIGH IMPACT** (Weeks 1-2)
Assets that users see first and most frequently

### 🎯 **MEDIUM IMPACT** (Weeks 3-4)
Enhancements that improve specific user flows

### ✨ **POLISH** (Weeks 5-6)
Refinements that add premium feel and delight

---

## PHASE 1: High-Impact Visual Enhancements

### 1. Landing Page Hero Enhancement 🔥
**Current State:** Simple logo + glassmorphic feature cards with icons
**Opportunity:** Create an engaging, brand-defining hero illustration

**Art Skill Workflow:** `Workflows/Essay.md` (editorial illustration style)

**Assets to Create:**
- **Hero Background Illustration** (2560×800px, 16:5 aspect ratio)
  - Concept: Abstract flavor journey - swirling aromas, taste molecules, sensory pathways
  - Style: Charcoal sketch with rust red and green watercolor washes
  - Mood: Sophisticated, approachable, sensory
  - Output: `hero-background.png` + `hero-background.webp`

- **Animated Gradient Overlay** (CSS implementation)
  - Subtle animated gradient to add depth
  - Colors: primary rust red → orange → amber
  - CSS animation using existing design tokens

**Implementation:**
```tsx
// pages/index.tsx - Hero section update
<div className="relative overflow-hidden">
  {/* Hero illustration background */}
  <div className="absolute inset-0 opacity-20 dark:opacity-10">
    <OptimizedImage
      src="/generated-images/hero-background.webp"
      alt=""
      fill
      className="object-cover"
    />
  </div>

  {/* Animated gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-orange-400/5 to-amber-300/5 animate-gradient" />

  {/* Existing content */}
  <Container>...</Container>
</div>
```

**Impact:** First impression, brand identity reinforcement, premium feel
**Estimated Time:** 1 session (generate + implement)

---

### 2. Custom Empty State Illustrations 🔥
**Current State:** Material icons with gradient backgrounds
**Opportunity:** Replace generic icons with custom illustrations

**Art Skill Workflow:** `Workflows/Essay.md` (concept art style)

**Assets to Replace:**

| Empty State | Current | New Illustration Concept | Size |
|-------------|---------|--------------------------|------|
| **No Tastings** | wine_bar icon | Person holding tasting glass, looking curious | 512×512 |
| **No Results** | search_off icon | Detective with magnifying glass searching flavor molecules | 512×512 |
| **No Posts** | nutrition icon | Community circle with speech bubbles and flavor notes | 512×512 |
| **No Competition** | trophy icon | Race track with flavor flags, starting line | 512×512 |
| **No Flavor Wheel** | pie_chart icon | Artist painting a circular canvas with flavors | 512×512 |
| **No Social** | people icon | Friends clinking glasses at a tasting table | 512×512 |

**Style Guide:**
- **Medium:** Charcoal sketch with rust red/green watercolor accents
- **Mood:** Friendly, approachable, slightly whimsical
- **Complexity:** Simple, iconic, scalable
- **Background:** Transparent PNG (use `--remove-bg` flag)

**Generation Command Template:**
```bash
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "Charcoal sketch concept art: [CONCEPT]. Minimal background, white backdrop, rust red and green watercolor accents, friendly and approachable style. Simple iconic design suitable for empty state illustration." \
  --size 1K \
  --aspect-ratio 1:1 \
  --remove-bg \
  --output ~/Downloads/empty-[name].png
```

**Implementation:**
```tsx
// components/ui/EmptyState.tsx
// Replace iconElement prop with custom illustrations

export const NoTastingsEmpty: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    iconElement={
      <OptimizedImage
        src="/generated-images/empty-tastings-v2.webp"
        alt=""
        width={80}
        height={80}
      />
    }
    title="No tastings yet"
    description="Start your first tasting session to begin exploring flavors!"
    action={onStart ? { label: 'Start Tasting', onClick: onStart } : undefined}
  />
);
```

**Impact:** More engaging empty states, stronger brand personality, better user retention
**Estimated Time:** 6 sessions (one per illustration)

---

### 3. Enhanced Dashboard Quick Action Cards 🔥
**Current State:** Generic placeholder image (`dashboard-quick-action.png`)
**Opportunity:** Create category-specific action card illustrations

**Art Skill Workflow:** `Workflows/Essay.md`

**Assets to Create:**

| Category | Illustration Concept | Color Accent |
|----------|---------------------|--------------|
| **Coffee** | Pour-over coffee setup, steam rising | Brown #8C5A3A |
| **Wine** | Wine glass with swirling liquid | Red #C63C22 |
| **Tea** | Tea ceremony setup, elegant teapot | Green #57A773 |
| **Spirits** | Cocktail mixing, bar tools | Amber #DFAF2B |
| **Chocolate** | Broken chocolate bar with tasting notes | Brown #6D4C41 |

**Size:** 1200×600px (2:1 aspect ratio) for card headers

**Generation Example:**
```bash
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "Charcoal sketch editorial illustration: Pour-over coffee setup with steam rising elegantly. Top-down perspective, warm brown watercolor washes, sophisticated and inviting atmosphere. Concept art style for tasting app dashboard." \
  --size 2K \
  --aspect-ratio 2:1 \
  --output ~/Downloads/quick-action-coffee.png
```

**Implementation:**
```tsx
// pages/dashboard.tsx - Quick action cards
const categoryImages = {
  coffee: '/generated-images/quick-action-coffee.webp',
  wine: '/generated-images/quick-action-wine.webp',
  tea: '/generated-images/quick-action-tea.webp',
  // ...
};

<div className="relative overflow-hidden rounded-2xl h-48">
  <OptimizedImage
    src={categoryImages[category]}
    alt=""
    fill
    className="object-cover opacity-60"
  />
  <div className="relative z-10 p-6">
    {/* Card content */}
  </div>
</div>
```

**Impact:** More engaging dashboard, category-specific visual identity
**Estimated Time:** 5 sessions

---

### 4. Enhanced Onboarding Carousel Images 🔥
**Current State:** Basic placeholder images for 4 onboarding slides
**Opportunity:** Create compelling visual narratives for first-time users

**Art Skill Workflow:** `Workflows/Essay.md`

**Assets to Replace:**

| Slide | Current Image | New Illustration Concept | Message |
|-------|--------------|--------------------------|---------|
| **1. Taste** | Generic | Person examining tasting glass with sensory nodes highlighted | "Capture every nuance" |
| **2. Discover** | Generic | Journey through flavor landscape, paths branching | "Explore flavor territories" |
| **3. Connect** | Generic | Community circle with shared flavor wheels | "Share with fellow tasters" |
| **4. Ready** | Generic | Person confident with tasting journal, ready to start | "Your flavor journey begins" |

**Size:** 1080×1080px (1:1 for mobile-optimized carousel)

**Style:**
- Progressive complexity (simple → detailed)
- Consistent charcoal sketch + watercolor style
- Rust red and green accent colors
- Narrative flow across slides

**Impact:** Better onboarding completion rate, clearer value proposition
**Estimated Time:** 4 sessions

---

### 5. Category Hero Image Refinement 🔥
**Current State:** 5 category hero images exist but may lack brand consistency
**Opportunity:** Audit and potentially regenerate for visual cohesion

**Art Skill Workflow:** `Workflows/Essay.md`

**Existing Assets:**
- `category-coffee-hero.png` (1.6MB)
- `category-wine-hero.png` (1.5MB)
- `category-tea-hero.png` (1.4MB)
- `category-spirits-hero.png` (1.7MB)
- `category-chocolate-hero.png` (1.6MB)

**Action:**
1. Review existing images for style consistency
2. Regenerate any that don't match brand aesthetic
3. Ensure consistent composition and color treatment

**Target Specifications:**
- **Size:** 2048×1024px (2:1 landscape)
- **Style:** Charcoal sketch + category-specific watercolor wash
- **Composition:** Hero product center, context elements around
- **Mood:** Sophisticated, premium, inviting

**Impact:** Cohesive category pages, stronger visual brand
**Estimated Time:** 2-5 sessions (depending on audit results)

---

## PHASE 2: Medium-Impact Enhancements

### 6. Social Feed Engagement Visuals 🎯
**Current State:** Text-based social feed
**Opportunity:** Add visual interest to social posts

**Art Skill Workflow:** `Workflows/Stats.md` (stat cards) + `Workflows/Aphorisms.md` (quote cards)

**Assets to Create:**

**A. Achievement Badges** (256×256px, transparent PNG)
- "First Tasting" badge
- "10 Tastings" milestone
- "Flavor Explorer" (10 categories tried)
- "Community Contributor" (shared 5+ tastings)
- "Competition Winner" badge

**Generation:**
```bash
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "Minimalist badge icon design: [BADGE NAME]. Circular shape, rust red and gold accents, simple geometric patterns, suitable for achievement system. Transparent background." \
  --size 1K \
  --aspect-ratio 1:1 \
  --remove-bg \
  --output ~/Downloads/badge-[name].png
```

**B. Flavor Quote Cards** (1080×1080px for social sharing)
- Template for "Tasting Insight of the Day"
- User-generated quote card template
- Template with charcoal sketch border and watercolor accents

**Impact:** Increased social engagement, shareable content, gamification
**Estimated Time:** 8 sessions

---

### 7. Competition Mode Visuals 🎯
**Current State:** Basic UI for competition sessions
**Opportunity:** Add visual excitement to competitive tasting

**Art Skill Workflow:** `Workflows/Essay.md` + `Workflows/Stats.md`

**Assets to Create:**

**A. Competition Session Header** (1920×400px)
- Illustration: Multiple tasters at stations, focused expressions
- Scoreboard visual elements
- Dynamic energy, competitive but friendly

**B. Winner Celebration Graphic** (800×600px)
- Trophy/medal illustration with confetti
- Shareable victory screen
- Customizable text overlay area

**C. Ranking Badge Icons** (128×128px each, transparent)
- 1st place: Gold medal/trophy
- 2nd place: Silver medal
- 3rd place: Bronze medal
- Participant: Participant ribbon

**Impact:** More engaging competition experience, shareable results
**Estimated Time:** 4 sessions

---

### 8. Loading State Animations 🎯
**Current State:** Generic skeleton loaders and spinners
**Opportunity:** Brand-specific loading animations

**Art Skill Workflow:** Custom SVG animations (not image generation)

**Assets to Create:**

**A. Flavor Molecule Loading Animation**
- SVG animation of flavor molecules swirling
- Rust red and green colored particles
- CSS animation using existing animation tokens

**B. Flavor Wheel Loading Spinner**
- Rotating flavor wheel segments
- Progressive reveal animation
- Smooth spring easing

**Implementation:**
```tsx
// components/ui/LoadingState.tsx
export const FlavorMoleculeLoader = () => (
  <div className="relative w-16 h-16">
    <svg viewBox="0 0 64 64" className="animate-spin">
      {/* Custom SVG paths with rust red and green fills */}
      <circle cx="32" cy="16" r="4" fill="#C63C22" className="animate-float" />
      <circle cx="48" cy="32" r="4" fill="#10B981" className="animate-float animation-delay-200" />
      <circle cx="32" cy="48" r="4" fill="#C63C22" className="animate-float animation-delay-400" />
      <circle cx="16" cy="32" r="4" fill="#10B981" className="animate-float animation-delay-600" />
    </svg>
  </div>
);
```

**Impact:** More delightful loading experiences, brand personality during wait times
**Estimated Time:** 2 sessions (design + implement)

---

### 9. Flavor Wheel Enhancement 🎯
**Current State:** D3-based flavor wheel visualization
**Opportunity:** Add visual polish and export improvements

**Art Skill Workflow:** `Workflows/Visualize.md` + CSS enhancements

**Enhancements:**

**A. Flavor Wheel Background Texture**
- Subtle paper texture overlay
- Charcoal sketch border frame
- Watercolor wash background variants

**B. Export Template Design**
- Branded export with Flavatix logo
- Stylized frame/border
- Print-ready format (300 DPI)

**C. Category Glyph Icons** (64×64px each)
- Custom icons for each flavor category
- Replace generic labels with iconic glyphs
- Transparent PNGs for overlay on wheel

**Impact:** More shareable visualizations, premium export quality
**Estimated Time:** 4 sessions

---

## PHASE 3: Polish & Delight

### 10. Micro-Illustrations for UI Elements ✨
**Current State:** Lucide icons throughout
**Opportunity:** Add custom illustrations for key moments

**Art Skill Workflow:** `Workflows/Essay.md` (small iconography)

**Assets to Create:**

| Element | Illustration | Size | Location |
|---------|-------------|------|----------|
| **Success Checkmark** | Checkmark with sparkle particles | 128×128 | Form submissions |
| **Error Icon** | Friendly warning sign with character | 128×128 | Error messages |
| **Info Tooltip** | Lightbulb with flavor molecules | 128×128 | Help tooltips |
| **Upload Indicator** | Cloud with upload arrow, charcoal style | 128×128 | File uploads |

**Impact:** More personality in UI interactions, friendlier error states
**Estimated Time:** 4 sessions

---

### 11. Email Template Graphics ✨
**Current State:** Likely plain text emails
**Opportunity:** Branded email templates with illustrations

**Art Skill Workflow:** `Workflows/Essay.md`

**Assets to Create:**

**A. Email Header Graphic** (600×200px for email-safe size)
- Welcome email header
- Weekly digest header
- Competition results header
- Social notification header

**B. Email Footer Graphic** (600×100px)
- Flavatix branding
- Social links with custom icons

**Style:** Email-safe, simple colors, limited detail for fast loading

**Impact:** Better email engagement, consistent brand across touchpoints
**Estimated Time:** 6 sessions

---

### 12. Feature Announcement Graphics ✨
**Current State:** None
**Opportunity:** Visual assets for product updates

**Art Skill Workflow:** `Workflows/Essay.md` + `Workflows/AdHocYouTubeThumbnail.md`

**Assets to Create:**

**A. "What's New" Modal Graphics** (800×600px)
- New feature announcements
- Illustrated feature explanations
- Charcoal sketch style with highlights

**B. Changelog Page Header** (1920×400px)
- Visual timeline of updates
- Evolution illustration

**Impact:** Better feature discovery, increased feature adoption
**Estimated Time:** 3 sessions

---

### 13. 404 & Error Page Illustrations ✨
**Current State:** Likely generic error pages
**Opportunity:** Branded, helpful error experiences

**Art Skill Workflow:** `Workflows/Essay.md`

**Assets to Create:**

| Error Type | Illustration Concept | Message |
|------------|---------------------|---------|
| **404 Not Found** | Lost person with map in flavor landscape | "Looks like this flavor profile doesn't exist" |
| **500 Server Error** | Scientist with bubbling beakers, oops expression | "Something's brewing wrong on our end" |
| **403 Forbidden** | Locked tasting cabinet with key | "This tasting is private" |
| **Offline Mode** | Person with unplugged cable, holding glass | "You're offline, but your notes are safe" |

**Size:** 800×600px

**Impact:** Better error experience, reduced frustration, brand personality
**Estimated Time:** 4 sessions

---

### 14. Tasting Profile Visual Identity ✨
**Current State:** Text-based tasting profiles
**Opportunity:** Visual profile headers and summaries

**Art Skill Workflow:** `Workflows/Taxonomies.md` (flavor profile grids)

**Assets to Create:**

**A. Flavor Profile Visual Templates**
- Radar chart background illustrations
- Category distribution templates
- Visual "flavor signature" graphics

**B. Tasting Note Card Backgrounds**
- Subtle texture overlays for note cards
- Category-specific watercolor washes
- Print-ready tasting card templates

**Impact:** More shareable tasting profiles, professional appearance
**Estimated Time:** 3 sessions

---

### 15. Premium Export Templates ✨
**Current State:** Basic export functionality
**Opportunity:** Beautiful, shareable export formats

**Art Skill Workflow:** `Workflows/Essay.md` + print design

**Assets to Create:**

**A. PDF Export Template**
- Professional layout with illustrations
- Flavatix branding footer
- Charcoal sketch borders and frames

**B. Social Media Share Templates** (1080×1080, 1920×1080)
- Instagram post template
- Twitter/X card template
- LinkedIn article header template

**C. Printable Tasting Journal Pages**
- PDF pages with illustrations
- Note-taking areas with visual guides
- Category-specific page designs

**Impact:** Increased sharing, professional exports, offline usage
**Estimated Time:** 6 sessions

---

## Technical Implementation Guidelines

### Image Generation Standards

**All Art skill generations must:**
1. **Output to `~/Downloads/` FIRST** for preview
2. **Use consistent prompting:**
   ```
   "Charcoal sketch concept art: [CONCEPT]. [CONTEXT]. Rust red (#C63C22) and Mexican green (#10B981) watercolor accents. [MOOD]. Suitable for [USE CASE]."
   ```
3. **Generate both PNG and WebP** versions:
   ```bash
   # After approval, convert to WebP
   cwebp -q 85 ~/Downloads/image.png -o ~/Downloads/image.webp
   ```
4. **Create thumbnails** for large images:
   ```bash
   # Generate thumbnail (max 400px width)
   convert ~/Downloads/image.png -resize 400x400\> ~/Downloads/image-thumb.png
   ```
5. **Optimize file sizes:**
   - Target: < 200KB for full images (WebP)
   - Target: < 50KB for thumbnails (WebP)
   - Use `--size 2K` for detailed images, `1K` for icons

### File Organization

```
/public/generated-images/
  ├── hero/
  │   └── hero-background.{png,webp}
  ├── empty-states/
  │   ├── empty-tastings-v2.{png,webp}
  │   ├── empty-results-v2.{png,webp}
  │   └── empty-social-v2.{png,webp}
  ├── dashboard/
  │   ├── quick-action-coffee.{png,webp}
  │   ├── quick-action-wine.{png,webp}
  │   └── ...
  ├── onboarding/
  │   ├── onboarding-taste-v2.{png,webp}
  │   └── ...
  ├── social/
  │   ├── badge-first-tasting.{png,webp}
  │   └── ...
  ├── competition/
  │   ├── competition-header.{png,webp}
  │   └── ...
  └── errors/
      ├── 404-illustration.{png,webp}
      └── ...
```

### Component Integration Pattern

```tsx
// Pattern for replacing existing images with new versions

// Before:
<span className="material-symbols-outlined">icon_name</span>

// After:
<OptimizedImage
  src="/generated-images/[category]/[name].webp"
  alt=""
  width={64}
  height={64}
  className="object-contain"
/>
```

### CSS Animation Integration

```css
/* Add to globals.css for new animations */

@keyframes flavor-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

.animate-flavor-float {
  animation: flavor-float 3s ease-in-out infinite;
}

/* Gradient animation for hero */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}
```

---

## Workflow Mapping

| Asset Type | Art Skill Workflow | Key Parameters |
|------------|-------------------|----------------|
| Hero backgrounds | `Essay.md` | `--size 2K`, `--aspect-ratio 16:5` |
| Empty states | `Essay.md` | `--size 1K`, `--aspect-ratio 1:1`, `--remove-bg` |
| Dashboard cards | `Essay.md` | `--size 2K`, `--aspect-ratio 2:1` |
| Social badges | `Essay.md` | `--size 1K`, `--aspect-ratio 1:1`, `--remove-bg` |
| Error pages | `Essay.md` | `--size 2K`, `--aspect-ratio 4:3` |
| Stats cards | `Stats.md` | Programmatic generation |
| Quote cards | `Aphorisms.md` | Text overlay design |
| Technical diagrams | `TechnicalDiagrams.md` | Architecture visuals |
| Taxonomies | `Taxonomies.md` | Flavor classification grids |

---

## Quality Checklist

Before finalizing any generated image:

- [ ] **Preview in macOS Preview** at actual size
- [ ] **Check on both light and dark backgrounds**
- [ ] **Verify brand color consistency** (rust red, green)
- [ ] **Test at mobile sizes** (< 640px width)
- [ ] **Validate accessibility** (not relying on color alone)
- [ ] **Confirm file size** (< 200KB WebP for full images)
- [ ] **Check for visual artifacts** or blurriness
- [ ] **Ensure composition works** at intended usage size
- [ ] **Verify copyright/licensing** (all AI-generated, safe)
- [ ] **Test with loading states** (skeleton → image transition)

---

## Success Metrics

### User Engagement
- **Onboarding completion rate:** +15% target
- **Empty state action click-through:** +25% target
- **Social sharing frequency:** +40% target

### Brand Perception
- **Visual consistency score:** 95%+ (internal audit)
- **Premium perception rating:** 8.5/10+ (user survey)
- **Brand recall:** +30% improvement

### Technical Performance
- **Page load time:** Maintain < 3s (despite new images)
- **Lighthouse performance score:** Maintain 90+
- **Image optimization ratio:** 70%+ savings (PNG → WebP)

---

## Phased Rollout Plan

### Week 1-2: High-Impact Foundations
- Hero background illustration
- Empty state illustrations (6)
- Dashboard quick action cards (5)

### Week 3-4: User Journey Enhancement
- Onboarding carousel (4 images)
- Category hero audit/refresh (2-5 images)
- Social badges (5)

### Week 5-6: Competition & Social Features
- Competition visuals (4)
- Loading animations (2)
- Flavor wheel enhancements (3)

### Week 7-8: Polish & Delight
- Micro-illustrations (4)
- Error page illustrations (4)
- Email templates (6)

### Week 9-10: Premium Exports
- Feature announcements (3)
- Tasting profile templates (3)
- Export templates (6)

---

## Budget & Resources

### Time Estimate
- **Total sessions:** ~85 generation sessions
- **Average per session:** 15-30 minutes
- **Total estimated time:** 25-45 hours across 10 weeks

### Art Skill API Usage
- **Primary model:** `nano-banana-pro` (Gemini 3 Pro)
- **Estimated API calls:** ~85 generations
- **Cost estimate:** Check current Gemini API pricing

### Design Review Checkpoints
- **After Phase 1:** Review first 15 images with stakeholders
- **After Phase 2:** Mid-project review (30 images)
- **Before Phase 3:** Final approval gate (60 images)
- **After Phase 3:** Complete audit (85 images)

---

## Risk Mitigation

### Style Consistency Risk
**Mitigation:**
- Use consistent prompt templates
- Reference existing generated images
- Create style guide document with approved examples
- Use `--reference-image` flag for character/object consistency

### Performance Risk
**Mitigation:**
- Always generate WebP versions
- Use Next.js `OptimizedImage` component
- Implement lazy loading
- Monitor Lighthouse scores after each phase

### Approval Delays Risk
**Mitigation:**
- Generate 3 variations per asset initially
- Get batch approvals rather than one-by-one
- Set clear review deadlines (48hr turnaround)

### AI Generation Limitations Risk
**Mitigation:**
- Have fallback to stock illustrations if AI doesn't deliver
- Test multiple prompt variations
- Use multiple reference images for better likeness
- Budget 20% extra time for regenerations

---

## Next Steps

### Immediate Actions
1. **Review this plan** with product/design stakeholders
2. **Prioritize Phase 1** assets based on upcoming releases
3. **Set up image preview workflow** (Downloads → Finder → approval)
4. **Create brand style guide** with approved color palettes
5. **Test Art skill generation** with 1-2 sample images

### First Generation Session
**Recommended:** Start with Hero Background Illustration
- High visibility
- Sets visual tone for entire project
- Relatively forgiving (background element)
- Good test of prompt engineering

**Command:**
```bash
bun run ~/.claude/skills/Art/Tools/Generate.ts \
  --model nano-banana-pro \
  --prompt "Charcoal sketch editorial illustration: Abstract flavor journey with swirling aromas, taste molecules floating, and sensory pathways connecting. Wide panoramic composition suitable for website hero background. Rust red (#C63C22) and Mexican green (#10B981) watercolor washes. Sophisticated, approachable, sensory mood. Premium concept art style." \
  --size 2K \
  --aspect-ratio 16:5 \
  --output ~/Downloads/hero-background-v1.png
```

---

## Appendix: Brand Visual Guidelines

### Color Usage Rules
- **Primary (Rust Red #C63C22):** Main CTA elements, brand highlights, 30% of palette
- **Secondary (Mexican Green #10B981):** Success states, alternative actions, 20% of palette
- **Neutral (Zinc):** Base colors, text, backgrounds, 45% of palette
- **Accent:** Category-specific colors, 5% of palette

### Illustration Style Rules
1. **Primary medium:** Charcoal sketch linework
2. **Color treatment:** Watercolor washes (not solid fills)
3. **Complexity:** Simple to moderate (not hyper-detailed)
4. **Mood:** Sophisticated yet approachable
5. **Composition:** Balanced, breathing room, clear focal point
6. **Characters:** When used, friendly and inclusive
7. **Typography integration:** Minimal text in illustrations

### Do's and Don'ts

**DO:**
- Use rust red and green as primary accents
- Keep compositions simple and iconic
- Use charcoal sketch linework consistently
- Allow white space/breathing room
- Make illustrations scalable (simple enough for small sizes)
- Test on both light and dark backgrounds

**DON'T:**
- Use photorealistic styles (conflicts with brand)
- Overcomplicate compositions
- Use colors outside brand palette
- Create illustrations that require color to understand
- Make text a key part of illustrations
- Use generic stock photo aesthetics

---

## Conclusion

This plan leverages Flavatix's strong technical foundation to create **custom visual assets** that:
1. **Differentiate** the brand from competitors
2. **Engage** users through delightful illustrations
3. **Guide** users through key journeys (onboarding, empty states)
4. **Elevate** the premium perception of the platform
5. **Maintain** performance and accessibility standards

By following this phased approach, we'll systematically enhance the UI while maintaining the excellent design system already in place.

**Total Deliverables:** 85+ custom visual assets across 15 categories
**Timeline:** 10 weeks with clear checkpoints
**Impact:** More engaging, differentiated, premium user experience

---

**Ready to begin? Start with Phase 1, Asset #1: Hero Background Illustration.**

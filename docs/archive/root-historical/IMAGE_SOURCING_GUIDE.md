# Flavatix Image Sourcing and Photography Guide

## Table of Contents
1. [Image Source Platforms](#image-source-platforms)
2. [Licensing and Rights Management](#licensing-and-rights-management)
3. [Photography Styles and Aesthetics](#photography-styles-and-aesthetics)
4. [Landing Page Integration Techniques](#landing-page-integration-techniques)
5. [Category-Specific Recommendations](#category-specific-recommendations)
6. [Performance Optimization](#performance-optimization)
7. [Implementation Checklist](#implementation-checklist)

---

## Image Source Platforms

### Free Stock Photo Sites (Production-Ready)

#### 1. **Unsplash** (https://unsplash.com)
- **License**: Unsplash License (free for commercial use)
- **Attribution**: Not required but appreciated
- **Food/Beverage Collection**: Extensive with 50,000+ images
- **Quality**: Professional grade, shot by experienced photographers
- **Best for**: Wine, coffee, tea, spirits, artistic food compositions
- **API**: Yes (free unlimited access)
- **Strengths**:
  - Consistently high quality
  - Regular curated collections
  - Advanced search filters
  - Download statistics available
  - Perfect for modern minimalist aesthetic

#### 2. **Pexels** (https://www.pexels.com)
- **License**: Pexels License (free for commercial use)
- **Attribution**: Not required
- **Food/Beverage Collection**: 30,000+ curated images
- **Quality**: High quality, often from professional sources
- **Best for**: Lifestyle shots, tabletop photography, beverages
- **API**: Yes (free)
- **Strengths**:
  - Clean interface
  - Category-specific collections
  - Good diversity of styles
  - Fast, reliable API

#### 3. **Pixabay** (https://pixabay.com)
- **License**: Pixabay License (free for commercial use)
- **Attribution**: Not required
- **Food/Beverage Collection**: 40,000+ images
- **Quality**: Good quality, mix of professional and community
- **Best for**: General food styling, beverages, ingredients
- **API**: Yes (free with registration)
- **Strengths**:
  - Large collection
  - Illustrations available too
  - Good search functionality
  - Community contributions

#### 4. **Foodiesfeed** (https://www.foodiesfeed.com)
- **License**: Free for commercial use (food-focused)
- **Attribution**: Not required
- **Specialty**: Exclusively food and beverage photography
- **Quality**: Professional, curated specifically for food
- **Best for**: All Flavatix categories
- **Strengths**:
  - Domain-specific expertise
  - Curated quality standards
  - Minimal licensing friction

### Paid Premium Options

#### 5. **Shutterstock** (https://www.shutterstock.com)
- **Model**: Subscription-based ($49-$249/month depending on usage)
- **License**: Commercial use included
- **Food/Beverage**: 500,000+ high-quality images
- **Best for**: Premium brand positioning, mass content needs
- **Strengths**:
  - Massive selection
  - Consistent licensing
  - Commercial safety guaranteed
  - High-resolution options

#### 6. **Getty Images** (https://www.gettyimages.com)
- **Model**: Pay-per-image or subscription
- **License**: Full commercial rights available
- **Quality**: Premium, editorial, and creative collections
- **Best for**: High-end brand positioning, heritage/prestige content
- **Strengths**:
  - Curated collections
  - Editorial guidelines
  - Premium aesthetic
  - Extensive licenses available

#### 7. **Adobe Stock** (https://stock.adobe.com)
- **Model**: Subscription-based ($9.99-$79.99/month)
- **License**: Commercial use included with subscription
- **Integration**: Seamless with Adobe Creative Suite
- **Best for**: Teams using Creative Cloud
- **Strengths**:
  - Integration with Creative Suite
  - Licensed music and vectors too
  - Competitive pricing
  - Frequent searches included

### User-Generated Content (UGC) Integration

#### When to Use UGC
- **Community Discovery Features**: Users sharing their finds
- **Product Reviews**: Customer photos of products
- **Experience Sharing**: Users at wine tastings, coffee shops, etc.
- **Authenticity**: Candid moments vs. polished photography

#### UGC Management Best Practices
```markdown
- Establish clear submission guidelines
- Implement photo moderation system
- Provide attribution and user recognition
- Get explicit permission/licensing for reuse
- Create branded hashtag campaigns (#flavatixfind)
- Consider micro-influencer partnerships
- Store metadata with user identification
```

---

## Licensing and Rights Management

### License Types for Commercial Use

#### **Creative Commons Zero (CC0)**
- **What it means**: Public domain, no restrictions
- **Attribution**: Not required
- **Usage**: Unlimited commercial use
- **Examples**: Unsplash, Pexels, Pixabay
- **Risk**: Minimal

#### **Creative Commons Attribution (CC-BY)**
- **What it means**: Free use with credit required
- **Attribution**: Must credit photographer
- **Best for**: Blog content, editorial features
- **Risk**: Must maintain attribution chain

#### **Proprietary Commercial Licenses**
- **What it means**: Full commercial rights
- **Cost**: Usually per-image or subscription
- **Examples**: Shutterstock, Getty, Adobe Stock
- **Risk**: Minimal with proper license

### Rights Management for Flavatix

#### **Recommended Strategy**
1. **Hybrid Approach**:
   - Use free platforms for 60-70% of content
   - Premium subscriptions for hero/landing page images
   - UGC for authenticity and engagement

2. **License Documentation**:
   ```json
   {
     "imageMetadata": {
       "filename": "wine-glass-sunset.jpg",
       "source": "Unsplash",
       "photographer": "John Smith",
       "license": "Unsplash License (CC0-like)",
       "commercialUse": true,
       "attributionRequired": false,
       "dateAdded": "2026-01-15",
       "category": "wine",
       "variants": ["thumbnail", "hero", "social"]
     }
   }
   ```

3. **Database Storage**:
   - Store license information with image metadata
   - Create audit trail for rights verification
   - Maintain photographer attribution for credibility
   - Document source URLs for future reference

4. **Legal Safeguards**:
   - Always download images through official sources
   - Keep license copies in project archives
   - Verify commercial use explicitly in terms
   - Maintain records of all downloaded licenses
   - For UGC: require explicit consent forms

---

## Photography Styles and Aesthetics

### Style Categories

#### 1. **Flat Lay Photography**
**What it is**: Top-down arrangement of objects on flat surface

**Best for Flavatix**:
- Coffee and tea products with ingredients
- Chocolate with accoutrements
- Wine with glasses and food pairings
- Spirits with garnishes and tools

**Characteristics**:
- Clean, minimalist compositions
- High contrast between product and background
- Geometric arrangements
- Strong shadows and depth
- Typically shot with natural light

**Color Palettes**:
- Warm earth tones (burgundy, gold, cream)
- Cool minimalist (white, gray, black)
- Rich jewel tones (emerald, sapphire, ruby)

**Example Composition**:
```
[Coffee cup] [Coffee beans] [Sugar cube]
    [Spoon]     [Pastry]      [Napkin]
```

#### 2. **Lifestyle Photography**
**What it is**: Product shown in real-world context with people/environment

**Best for Flavatix**:
- Wine at social gatherings
- Coffee at morning routines
- Tea in cozy settings
- Spirits at celebrations
- Chocolate as gift or treat

**Characteristics**:
- Narrative context
- Human elements present
- Natural lighting (often outdoor)
- Emotional connection
- Authentic, less staged feel

**Mood Profiles**:
- **Morning Ritual**: Soft light, calm, personal
- **Social Gathering**: Dynamic, warm, convivial
- **Exploration**: Adventure lighting, varied settings
- **Indulgence**: Luxurious, intimate, sensory

#### 3. **Product-Focused Photography**
**What it is**: Clean, isolated product on neutral background

**Best for Flavatix**:
- Product catalogs
- Category listings
- e-commerce integration
- Comparison views
- Detail shots

**Characteristics**:
- Clean backgrounds (white, gray, minimal texture)
- Professional studio lighting
- Multiple angles available
- High resolution for zoom
- Consistent color grading

**Technical Specs**:
- **Resolution**: Minimum 2400x2400px for e-commerce
- **Background**: Pure white or subtle texture
- **Shadows**: Soft, controlled shadows
- **Angles**: Front, side, top-down variants

#### 4. **Environmental/Heritage Photography**
**What it is**: Product origin, production, or terroir storytelling

**Best for Flavatix**:
- Wine vineyards and regions
- Coffee plantations and roasteries
- Tea gardens and processing
- Spirit distilleries
- Chocolate origin stories

**Characteristics**:
- Rich context and story
- Authentic locations
- Time-of-day variety
- Environmental context
- Educational value

---

### Color Grading for Brand Consistency

#### **Flavatix Brand Color Philosophy**

**Primary Palette** (From brand guidelines):
```
Wine/Spirits: Deep burgundy, warm amber, rich brown
Coffee/Tea: Warm browns, deep charcoal, cream
Chocolate: Brown tones, warm caramel, dark espresso
Accent: Gold, copper for luxury perception
```

#### **Grading Profiles by Category**

**Wine & Spirits**:
- Warm color temperature (3500-4500K)
- Boosted reds and oranges
- Slightly elevated shadows for drama
- Golden hour preference
- Vibrant reds for wine photography

**Coffee & Tea**:
- Neutral to warm (4000-5000K)
- Rich blacks and warm creams
- Matte finish preference
- Soft, diffused lighting
- Highlights on liquid surfaces

**Chocolate**:
- Warm tones (3500-4200K)
- Deep shadow preservation
- Glossy finish highlights
- Rich brown enhancement
- Golden reflections

**Accessibility**:
- All color-graded images should maintain contrast
- Test for colorblind accessibility
- Avoid relying solely on color for information
- Consider low-light viewing conditions

---

### Aspect Ratios and Crop Strategies

#### **Standard Aspect Ratios**

| Use Case | Ratio | Dimensions | Notes |
|----------|-------|-----------|-------|
| Hero/Banner | 16:9 | 1920x1080 | Landing pages, headers |
| Card/Product | 4:3 | 800x600 | Product listings, grids |
| Square | 1:1 | 1000x1000 | Social media, icons |
| Portrait | 3:4 | 750x1000 | Vertical stories, mobile |
| Wide (Cinema) | 21:9 | 2100x900 | Premium landing sections |
| Instagram Story | 9:16 | 1080x1920 | Mobile-first content |

#### **Crop Strategy by Context**

**Hero Images (16:9)**:
- Rule of thirds for composition
- Subject positioned in upper/lower third
- Breathing room in composition
- Foreground/background depth

**Product Cards (4:3 or 1:1)**:
- Center-focused composition
- Minimal background distraction
- Consistent framing across category
- Zoom-friendly positioning

**Mobile Responsiveness**:
- Safe area: inner 80% of image
- Text overlays: avoid top 20% and bottom 20%
- Consider portrait crops for mobile viewing
- Test on 375px viewport width

---

## Landing Page Integration Techniques

### Technique 1: Overlay Gradients

#### **Purpose**
Ensure text readability and maintain visual hierarchy when text overlays images

#### **Implementation Pattern**

```css
/* Overlay gradient over food/beverage images */
.hero-image-container {
  position: relative;
  height: 500px;
  background-image: url('/images/wine-hero.jpg');
  background-size: cover;
  background-position: center;
}

/* Dark gradient overlay for text readability */
.hero-image-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  padding: 40px;
}
```

#### **Gradient Direction Strategy**

| Direction | Best For | Reason |
|-----------|----------|--------|
| Top-to-bottom | Text at bottom | Darkens top, fades naturally |
| Bottom-to-top | Text at top | Protects headline readability |
| Diagonal (135deg) | Balanced text | Works for centered content |
| Radial (center) | Central focus | Creates spotlight effect |

#### **Opacity Levels**
- **Strong**: 0.6-0.8 opacity (for light images, lots of text)
- **Medium**: 0.3-0.5 opacity (balanced, light text on light backgrounds)
- **Subtle**: 0.1-0.3 opacity (dark images with adequate contrast)

### Technique 2: Vignettes

#### **Purpose**
Draw viewer attention to center of image, fade distracting edges

#### **Implementation Pattern**

```css
/* Vignette effect */
.image-with-vignette {
  position: relative;
}

.image-with-vignette::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: 1;
  pointer-events: none;
}
```

#### **When to Use**
- Magazine-style layouts
- Product showcases
- Narrative-driven sections
- Highlighting specific elements

### Technique 3: Color Tinting

#### **Purpose**
Unify disparate images with consistent brand color treatment

#### **Implementation Pattern**

```css
/* Brand color tint overlay */
.image-tinted {
  position: relative;
}

.image-tinted::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(139, 0, 0, 0.2); /* Wine red tint */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}
```

#### **Color Tint Options for Flavatix**

| Category | Tint Color | RGB | Opacity | Blend Mode |
|----------|-----------|-----|---------|-----------|
| Wine | Burgundy | (139, 0, 0) | 0.15-0.25 | multiply |
| Coffee | Dark Brown | (60, 40, 20) | 0.1-0.2 | multiply |
| Tea | Warm Green | (100, 80, 40) | 0.1-0.15 | multiply |
| Spirits | Deep Amber | (184, 115, 51) | 0.15-0.2 | multiply |
| Chocolate | Rich Brown | (78, 35, 12) | 0.2-0.3 | multiply |

### Technique 4: Spacing and Margins

#### **Purpose**
Create visual breathing room, separate content layers, maintain focus

#### **Spacing Grid for Flavatix**

```css
/* Consistent spacing system */
:root {
  --space-xs: 0.5rem;    /* 8px */
  --space-sm: 1rem;      /* 16px */
  --space-md: 1.5rem;    /* 24px */
  --space-lg: 2rem;      /* 32px */
  --space-xl: 3rem;      /* 48px */
  --space-2xl: 4rem;     /* 64px */
}

/* Image container spacing */
.image-hero {
  margin: var(--space-2xl) 0;
  padding: var(--space-lg);
  border-radius: 8px;
  overflow: hidden;
}

/* Around images in grids */
.image-card {
  margin: var(--space-md);
  padding: var(--space-md);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

#### **Rule of Thirds Spacing**
- **Top padding**: 1/3 of viewport height
- **Side padding**: 1/6 of viewport width
- **Bottom padding**: 1/3 of viewport height
- Creates natural hierarchy and focus

### Technique 5: Responsive Image Handling

#### **Modern Responsive Pattern**

```html
<!-- Responsive image with multiple sources -->
<picture>
  <!-- Ultra-high DPI mobile -->
  <source
    media="(max-width: 640px)"
    srcset="
      /images/wine-mobile-small.webp 1x,
      /images/wine-mobile-large.webp 2x
    "
    type="image/webp"
  />

  <!-- Tablet -->
  <source
    media="(max-width: 1024px)"
    srcset="
      /images/wine-tablet.webp 1x,
      /images/wine-tablet-2x.webp 2x
    "
    type="image/webp"
  />

  <!-- Desktop -->
  <source
    srcset="
      /images/wine-desktop.webp 1x,
      /images/wine-desktop-2x.webp 2x
    "
    type="image/webp"
  />

  <!-- Fallback for older browsers -->
  <img
    src="/images/wine-desktop.jpg"
    srcset="
      /images/wine-desktop-2x.jpg 2x
    "
    alt="Premium wine selection with elegant presentation"
    loading="lazy"
  />
</picture>
```

#### **Image Optimization Workflow**

```bash
# For each image category:
# 1. Original: Full resolution for web (2400x1600px)
# 2. Generate WebP versions (20-30% smaller)
# 3. Create 2x DPI versions for retina
# 4. Generate mobile crops (narrower)
# 5. Create thumbnail versions (600x400px)

# Example with ImageMagick:
convert wine-original.jpg -resize 2400x1600 wine-web.jpg
cwebp wine-web.jpg -o wine-web.webp -q 80
convert wine-web.jpg -resize 4800x3200 wine-web-2x.jpg
```

---

## Category-Specific Recommendations

### 1. Wine & Spirits

#### **Image Types**
- **Product Shots**: Bottle with label clearly visible
- **Pouring Shots**: Wine being poured into glass, liquid color visible
- **Terroir**: Vineyard, distillery, barrel scenes
- **Pairing**: Wine with cheese, food, or appetizers
- **Experience**: Wine tasting events, elegant settings

#### **Best Sources**
- Premium: Getty Images, Adobe Stock (for vineyard/distillery shots)
- Mid-tier: Shutterstock (extensive wine collection)
- Free: Unsplash, Pexels (high-quality wine photography)

#### **Color Palette**
- **Reds**: Deep burgundy (#4a0000), wine red (#722f37)
- **Whites**: Pale gold (#faf5f0), light amber (#f5deb3)
- **Spirits**: Rich brown (#654321), warm amber (#cd853f)
- **Accents**: Gold (#daa520), copper (#b87333)

#### **Photography Specifics**
- **Lighting**: Warm, golden hour preferred
- **Backgrounds**: Dark wood, stone, white for contrast
- **Props**: Cheese, grapes, chocolates, wine glasses
- **Styling**: Upscale, sophisticated, hint of luxury
- **Aspect Ratio**: 4:3 for product cards, 16:9 for hero

#### **Sample Search Terms**
- "Premium wine glass burgundy"
- "Wine vineyard terroir landscape"
- "Wine and cheese tasting board"
- "Pouring red wine golden hour"
- "Wine bottle cellar storage"

### 2. Coffee

#### **Image Types**
- **Beverage Shots**: Cup with latte art, steam, rich color
- **Process**: Coffee beans, grinding, pouring, brewing
- **Origin**: Coffee farm, roastery, equipment
- **Ritual**: Morning coffee, workspace scenes
- **Pairing**: Coffee with pastries, breakfast

#### **Best Sources**
- Premium: Adobe Stock, Shutterstock (extensive roastery collections)
- Free: Unsplash (excellent coffee photography section)
- Domain-specific: Foodiesfeed (professional coffee photos)

#### **Color Palette**
- **Primary**: Deep espresso (#3d2414), warm brown (#5d4037)
- **Secondary**: Caramel (#c19a6b), cream (#fffdd0)
- **Accents**: Gold (#ffd700) for cups/saucers

#### **Photography Specifics**
- **Lighting**: Soft, natural, morning light preferred
- **Backgrounds**: Light wood, white, minimalist
- **Props**: Beans, grinder, pastries, notebooks
- **Styling**: Approachable, authentic, ritualistic
- **Aspect Ratio**: Square (1:1) for social, 16:9 for hero

#### **Sample Search Terms**
- "Espresso cup latte art"
- "Coffee beans macro roasting"
- "Morning coffee ritual workspace"
- "Coffee farm workers landscape"
- "Specialty coffee pour over"

### 3. Tea

#### **Image Types**
- **Brewing Shots**: Tea steeping, leaves unfurling, color bloom
- **Cup Presentations**: Elegant teacup with saucer, steam rising
- **Leaves**: Whole leaf tea, dried varieties, quality details
- **Origin**: Tea gardens, processing, landscape
- **Mindfulness**: Tea ceremony, meditative moments

#### **Best Sources**
- Premium: Getty Images (heritage/traditional tea culture)
- Free: Pexels, Pixabay (good tea photography sections)
- UGC-friendly: Allow user photos of tea moments

#### **Color Palette**
- **Green Tea**: Pale yellow-green (#d4e8d4), soft jade (#7fb3a7)
- **Black Tea**: Amber (#b8860b), deep brown (#3d2817)
- **Herbal**: Warm golds (#daa520), rust tones (#8b4513)
- **Accents**: White porcelain, natural wood

#### **Photography Specifics**
- **Lighting**: Soft, diffused, overhead light
- **Backgrounds**: Natural textures, white, light gray
- **Props**: Tea leaves, honey, lemon, books
- **Styling**: Calm, meditative, authentic, organic
- **Aspect Ratio**: 4:3 for cards, portrait (3:4) for mobile stories

#### **Sample Search Terms**
- "Loose leaf tea steeping"
- "Tea ceremony Japan traditional"
- "Herbal tea garden landscape"
- "Oolong tea leaves whole"
- "Calm tea meditation moment"

### 4. Chocolate

#### **Image Types**
- **Product Shots**: Chocolate bars, truffles, packaging detail
- **Sensory**: Broken chocolate showing snap, texture detail
- **Preparation**: Melted, tempering, crafting
- **Origin**: Cacao farm, bean processing
- **Pairing**: Chocolate with coffee, wine, berries

#### **Best Sources**
- Premium: Shutterstock, Adobe Stock (detailed product shots)
- Free: Unsplash (excellent chocolate flat lays)
- Domain-specific: Foodiesfeed (professional chocolate photography)

#### **Color Palette**
- **Dark Chocolate**: Deep brown (#1a0f00), rich espresso (#3d2414)
- **Milk Chocolate**: Medium brown (#5d4037), warm caramel (#c19a6b)
- **White Chocolate**: Cream (#faf5f0), ivory (#fffdd0)
- **Accents**: Gold foil (#daa520), contrast fruits

#### **Photography Specifics**
- **Lighting**: Soft, warm, highlight glossy finish
- **Backgrounds**: Dark wood, marble, white for contrast
- **Props**: Berries, nuts, cocoa powder, elegant plating
- **Styling**: Luxury, indulgent, artisanal, sensory
- **Aspect Ratio**: Square (1:1) for product, 16:9 for hero

#### **Sample Search Terms**
- "Artisanal chocolate bar dark"
- "Chocolate truffle luxury macro"
- "Cacao pod farm origin"
- "Chocolate melting cocoa butter"
- "Chocolate and berries pairing"

---

## Performance Optimization

### Image Optimization Checklist

#### **1. Format Selection**

| Format | Use Case | Quality | Size |
|--------|----------|---------|------|
| **WebP** | All modern browsers | Excellent | Smallest (25-35% smaller) |
| **JPEG** | Fallback, photos | Good | Small-medium |
| **PNG** | Graphics, transparency | Excellent | Large |
| **AVIF** | Future-proof | Excellent | Very small (requires conversion) |

#### **2. File Size Reduction**

```bash
# Batch convert JPEG to WebP (30% size reduction)
for file in *.jpg; do
  cwebp "$file" -o "${file%.jpg}.webp" -q 80
done

# Optimize existing JPEG (quality loss negligible)
for file in *.jpg; do
  jpegoptim --max=90 "$file"
done

# Using ImageMagick for batch resize
convert input.jpg -resize 2400x1600 -quality 85 output.jpg
```

#### **3. Lazy Loading Implementation**

```html
<!-- Lazy load images below the fold -->
<img
  src="/images/placeholder.jpg"
  data-src="/images/wine-hero.jpg"
  data-srcset="
    /images/wine-hero-small.webp 640w,
    /images/wine-hero-medium.webp 1024w,
    /images/wine-hero-large.webp 1920w
  "
  alt="Wine selection with elegant presentation"
  loading="lazy"
  class="lazy-image"
/>

<script>
// Intersection Observer for lazy loading
document.querySelectorAll('.lazy-image').forEach(img => {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.srcset = img.dataset.srcset;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
});
</script>
```

#### **4. Responsive Image Sizes**

```html
<!-- srcset with width descriptors -->
<img
  src="/images/wine-small.jpg"
  srcset="
    /images/wine-400.jpg 400w,
    /images/wine-800.jpg 800w,
    /images/wine-1200.jpg 1200w,
    /images/wine-1600.jpg 1600w
  "
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 80vw,
         60vw"
  alt="Wine selection"
/>
```

### Performance Metrics

#### **Target Performance Benchmarks**

| Metric | Target | Industry Standard |
|--------|--------|-------------------|
| Image Load Time | <200ms | <500ms |
| Core Web Vitals (LCP) | <2.5s | <2.5s |
| Total Page Load | <3s | <3s |
| Image File Size | <100KB (avg) | <150KB |
| WebP Adoption | 95%+ | 85%+ |

#### **Lighthouse Audit Checklist**
- Image elements have explicit width and height
- Images use next-gen formats (WebP)
- Off-screen images are lazy-loaded
- Properly sized images for viewport
- Inefficient CSS removed
- Async script loading for non-critical JS

---

## Implementation Checklist

### Phase 1: Image Source Acquisition

- [ ] Create accounts on free platforms (Unsplash, Pexels, Pixabay)
- [ ] Set up Shutterstock or Adobe Stock subscription (if budget approved)
- [ ] Create system for downloading and organizing images by category
- [ ] Establish image naming convention: `category-description-size.jpg`
- [ ] Create metadata JSON for each image with license info
- [ ] Store original/high-res versions in archive
- [ ] Create web-optimized versions for distribution

### Phase 2: License Documentation

- [ ] Document all licenses in spreadsheet or database
- [ ] Create legal archive of license terms
- [ ] Implement image metadata system with license tracking
- [ ] Establish UGC consent process
- [ ] Create attribution templates for where required
- [ ] Set up quarterly license audit process
- [ ] Document photographer/source information

### Phase 3: Image Processing Pipeline

- [ ] Set up ImageMagick or similar batch processing
- [ ] Create size variants (mobile, tablet, desktop, 2x DPI)
- [ ] Convert all to WebP format with JPEG fallback
- [ ] Optimize file sizes (target <100KB average)
- [ ] Create thumbnail versions
- [ ] Test image quality at all sizes
- [ ] Build automated processing script

### Phase 4: Landing Page Integration

- [ ] Choose overlay/gradient patterns per section
- [ ] Implement responsive image markup
- [ ] Set up lazy loading for below-the-fold images
- [ ] Test text contrast over images
- [ ] Verify spacing and margins implementation
- [ ] Test responsive behavior on mobile/tablet/desktop
- [ ] Optimize colors and grading per category

### Phase 5: Performance Verification

- [ ] Run Lighthouse audit
- [ ] Test Core Web Vitals
- [ ] Verify image load times in browser DevTools
- [ ] Test on low-bandwidth connections (throttle 3G)
- [ ] Verify lazy loading works correctly
- [ ] Check image quality at all breakpoints
- [ ] Test on multiple browsers

### Phase 6: Brand Consistency

- [ ] Create style guide for image selection
- [ ] Establish color grading standards
- [ ] Document approved aspect ratios
- [ ] Create visual library of approved styles
- [ ] Train team on image selection guidelines
- [ ] Implement image selection checklist
- [ ] Schedule quarterly brand alignment audits

---

## Quick Reference: Source URLs

### Free Platforms
- **Unsplash**: https://unsplash.com/search/food-beverage
- **Pexels**: https://www.pexels.com/search/food/
- **Pixabay**: https://pixabay.com/images/search/food/
- **Foodiesfeed**: https://www.foodiesfeed.com/

### Paid Platforms
- **Shutterstock**: https://www.shutterstock.com/search/food-beverage
- **Getty Images**: https://www.gettyimages.com/
- **Adobe Stock**: https://stock.adobe.com/

### Image Optimization Tools
- **ImageMagick**: Batch resizing and conversion
- **TinyPNG/TinyJPG**: Lossy compression (also via API)
- **Squoosh**: Web-based optimization tool
- **ImageOptim**: Mac application for batch optimization

### Design Resources
- **Color Palette Generator**: https://coolors.co/
- **Responsive Design Tester**: Chrome DevTools
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebP Converter**: https://convertio.co/ or command-line cwebp

---

## Conclusion

The key to successful food and beverage imagery is balancing quality with efficiency. Use free platforms for volume and variety, reserve paid subscriptions for hero/landing content, and leverage UGC for authenticity. Consistent color grading, careful overlay techniques, and responsive image implementation will ensure your imagery integrates seamlessly into Flavatix's modern interface while maintaining performance standards.

Always prioritize:
1. **License Compliance** - Never guess about commercial use rights
2. **Brand Consistency** - Maintain visual coherence across categories
3. **Performance** - Optimized images are faster and more discoverable
4. **Accessibility** - Ensure readable text and adequate contrast
5. **Authenticity** - Choose images that feel genuine and inviting

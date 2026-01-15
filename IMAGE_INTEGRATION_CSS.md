# Image Integration CSS Reference for Flavatix

## Quick CSS Snippets for Common Patterns

### 1. Hero Image with Dark Gradient Overlay

```css
.hero-section {
  position: relative;
  height: 600px;
  background-image: url('/images/wine-hero.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Parallax effect */
  overflow: hidden;
}

/* Dark gradient for readability */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  text-align: center;
  padding: 40px;
}

.hero-content h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 600px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    height: 400px;
    background-attachment: scroll; /* Disable parallax on mobile */
  }

  .hero-section::before {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }
}
```

### 2. Vignette Effect

```css
.image-with-vignette {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.image-with-vignette img {
  display: block;
  width: 100%;
  height: auto;
}

/* Vignette overlay */
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
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
  pointer-events: none;
}
```

### 3. Category Color Tinting

```css
/* Category-specific color tinting */
.image-wine {
  position: relative;
}

.image-wine::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(139, 0, 0, 0.15); /* Wine red */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}

.image-coffee {
  position: relative;
}

.image-coffee::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(60, 40, 20, 0.12); /* Deep brown */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}

.image-tea {
  position: relative;
}

.image-tea::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(100, 80, 40, 0.12); /* Warm green */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}

.image-chocolate {
  position: relative;
}

.image-chocolate::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(78, 35, 12, 0.2); /* Rich brown */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}

.image-spirits {
  position: relative;
}

.image-spirits::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(184, 115, 51, 0.18); /* Amber */
  mix-blend-mode: multiply;
  z-index: 1;
  pointer-events: none;
}
```

### 4. Lazy Loading Images

```css
/* Lazy load placeholder styling */
.lazy-image {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  filter: blur(5px);
  opacity: 0.8;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.lazy-image.loaded {
  filter: blur(0);
  opacity: 1;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 5. Responsive Image Container

```css
/* Maintain aspect ratio without knowing dimensions */
.image-container {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
}

/* 16:9 aspect ratio container */
.image-container--16-9 {
  aspect-ratio: 16 / 9;
}

/* 4:3 aspect ratio container */
.image-container--4-3 {
  aspect-ratio: 4 / 3;
}

/* 1:1 aspect ratio container (square) */
.image-container--1-1 {
  aspect-ratio: 1 / 1;
}

/* Fallback for older browsers */
@supports not (aspect-ratio: 1) {
  .image-container--16-9::before,
  .image-container--4-3::before,
  .image-container--1-1::before {
    content: '';
    display: block;
  }

  .image-container--16-9::before {
    padding-bottom: 56.25%;
  }

  .image-container--4-3::before {
    padding-bottom: 75%;
  }

  .image-container--1-1::before {
    padding-bottom: 100%;
  }
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

### 6. Product Image Card

```css
.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.product-card-image {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.product-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

.product-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  pointer-events: none;
}

.product-card:hover .product-card-overlay {
  opacity: 1;
}

.product-card-content {
  padding: 1.5rem;
}

.product-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.product-card-description {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.product-card-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #8b0000; /* Wine red */
}

/* Grid layout */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
```

### 7. Image Gallery with Lightbox

```css
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  background: #f5f5f5;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* Lightbox overlay */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.lightbox.active {
  opacity: 1;
  visibility: visible;
}

.lightbox-content {
  position: relative;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
}

.lightbox-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.lightbox-close:hover {
  transform: scale(1.2);
}
```

### 8. Parallax Scrolling Effect

```css
.parallax-section {
  position: relative;
  height: 600px;
  overflow: hidden;
}

.parallax-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%; /* Slightly larger for parallax */
  object-fit: cover;
  object-position: center;
  will-change: transform;
}

/* CSS-based parallax (no JavaScript) */
.parallax-container {
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 600px;
  position: relative;
}

/* Disable on mobile for performance */
@media (max-width: 768px) {
  .parallax-container {
    background-attachment: scroll;
  }
}
```

### 9. Image with Text Overlay (Multiple Variations)

```css
/* Bottom-aligned text overlay with gradient */
.image-text-bottom {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-text-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
}

.image-text-bottom .text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  color: white;
  z-index: 2;
}

/* Center-aligned text overlay with semi-transparent background */
.image-text-center {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-text-center::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.image-text-center .text {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 600px;
}

/* Left-aligned text overlay with partial overlay */
.image-text-left {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.image-text-left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 60%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.6) 0%,
    transparent 100%
  );
  z-index: 1;
}

.image-text-left .text {
  position: relative;
  z-index: 2;
  color: white;
  padding: 2rem;
  max-width: 50%;
}
```

### 10. Image Comparison Slider

```css
.image-comparison {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
}

.comparison-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.comparison-image-before {
  z-index: 2;
  clip-path: inset(0 50% 0 0);
  transition: clip-path 0.3s ease;
}

.image-comparison:hover .comparison-image-before {
  clip-path: inset(0 var(--position, 50%) 0 0);
}

.comparison-slider {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: white;
  z-index: 3;
  cursor: ew-resize;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.comparison-slider::before,
.comparison-slider::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
}

.comparison-slider::before {
  right: 100%;
  margin-right: 10px;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.comparison-slider::after {
  left: 100%;
  margin-left: 10px;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}
```

### 11. Spacing System

```css
/* Consistent spacing around images */
:root {
  /* Spacing scale */
  --space-xs: 0.5rem;     /* 8px */
  --space-sm: 1rem;       /* 16px */
  --space-md: 1.5rem;     /* 24px */
  --space-lg: 2rem;       /* 32px */
  --space-xl: 3rem;       /* 48px */
  --space-2xl: 4rem;      /* 64px */

  /* Image spacing */
  --image-margin-inline: var(--space-lg);
  --image-margin-block: var(--space-xl);
  --image-border-radius: 8px;
}

.image-hero {
  margin: var(--space-2xl) 0;
  padding: var(--space-lg);
  border-radius: var(--image-border-radius);
  overflow: hidden;
}

.image-card {
  margin: var(--space-md);
  padding: var(--space-md);
  background: white;
  border-radius: var(--image-border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.image-section {
  margin-block: var(--space-xl);
  padding-inline: var(--space-lg);
}

@media (max-width: 768px) {
  :root {
    --image-margin-inline: var(--space-md);
    --image-margin-block: var(--space-lg);
  }
}
```

---

## Testing Checklist

- [ ] Test all overlay gradients on various background images
- [ ] Verify text contrast meets WCAG AA standards (4.5:1 for body text)
- [ ] Test responsive behavior on mobile, tablet, desktop
- [ ] Verify lazy loading functionality
- [ ] Check image quality at different DPI levels
- [ ] Test on low-bandwidth connections (DevTools throttling)
- [ ] Verify vignette and tinting effects in different browsers
- [ ] Test hover states on product cards
- [ ] Verify parallax effect on compatible devices
- [ ] Check accessibility for all overlays and filters


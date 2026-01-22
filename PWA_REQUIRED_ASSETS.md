# PWA Assets Creation Guide

This document provides specifications for all PWA assets that need to be created.

---

## 1. PWA Icons (8 sizes required)

**Location:** `/public/icons/`

### Specifications

| Filename | Size | Purpose | Format |
|----------|------|---------|--------|
| icon-72x72.png | 72x72px | Small Android | PNG |
| icon-96x96.png | 96x96px | Medium Android | PNG |
| icon-128x128.png | 128x128px | Large Android | PNG |
| icon-144x144.png | 144x144px | Extra Large | PNG |
| icon-152x152.png | 152x152px | iPad | PNG |
| icon-192x192.png | 192x192px | Android Adaptive | PNG |
| icon-384x384.png | 384x384px | XXL Android | PNG |
| icon-512x512.png | 512x512px | Play Store | PNG |

### Design Requirements

- **Maskable:** All icons must have a "safe zone" - keep logo within 40% of center
- **Background:** Use theme color #7C3AED (purple) or transparent
- **Logo:** Use existing flavatix-icon.svg as base
- **Padding:** 10% padding on all edges

### Creation Command

Using ImageMagick (install with `apt-get install imagemagick`):

```bash
# Create icons directory
mkdir -p public/icons

# Generate PNGs from SVG
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} \
    public/logos/flavatix-icon.svg \
    public/icons/icon-${size}x${size}.png
done
```

Or use an online tool: https://realfavicongenerator.net/

---

## 2. Shortcut Icons (2 required)

**Location:** `/public/icons/`

### Specifications

| Filename | Size | Purpose | Design |
|----------|------|---------|--------|
| quick-tasting.png | 96x96px | Quick Tasting shortcut | Lightning bolt icon |
| flavor-wheel.png | 96x96px | Flavor Wheels shortcut | Wheel/circle icon |

### Design Requirements

- Same style as main icon
- Representative of feature
- Maskable (safe zone)

---

## 3. Screenshots (3 required)

**Location:** `/public/screenshots/`

### Specifications

| Filename | Size | Content | Label |
|----------|------|---------|-------|
| dashboard.png | 1280x720px | Dashboard with flavor insights | "Dashboard with flavor insights" |
| tasting.png | 1280x720px | Interactive tasting session | "Interactive tasting session" |
| flavor-wheel.png | 1280x720px | Flavor wheel visualization | "AI-powered flavor wheel visualization" |

### Creation Instructions

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Take screenshots:**
   - Open Chrome DevTools (F12)
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "screenshot" → Select "Capture full size screenshot"
   - Save at 1280x720 resolution

3. **Resize if needed:**
   ```bash
   # Using ImageMagick
   convert screenshot.png -resize 1280x720^ -gravity center -extent 1280x720 \
     public/screenshots/dashboard.png
   ```

### Tips for Great Screenshots

- Use light mode for better visibility
- Show populated data (not empty states)
- Include navigation to show app structure
- Ensure text is readable at 1280x720
- Use high-DPI display for crisp images

---

## 4. Offline Page

**Location:** `/public/offline.html`

### Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Offline - Flavatix</title>
  <style>
    body {
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(135deg, #FEF3E7 0%, #FDE8D7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(124, 58, 237, 0.1);
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
    }
    h1 {
      color: #1a1410;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      color: #6B7280;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .retry-btn {
      background: #7C3AED;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .retry-btn:hover {
      background: #6D28D9;
    }
    .pages {
      margin-top: 30px;
      text-align: left;
    }
    .pages h3 {
      font-size: 14px;
      color: #1a1410;
      margin-bottom: 10px;
    }
    .pages a {
      display: block;
      color: #7C3AED;
      text-decoration: none;
      padding: 8px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .pages a:hover {
      background: #F9FAFB;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="/logos/flavatix-icon.svg" alt="Flavatix" class="logo">
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some pages are still available below.</p>
    <button class="retry-btn" onclick="window.location.reload()">Retry Connection</button>

    <div class="pages">
      <h3>Available Offline:</h3>
      <a href="/dashboard">Dashboard</a>
      <a href="/my-tastings">My Tastings</a>
      <a href="/flavor-wheels">Flavor Wheels</a>
    </div>
  </div>

  <script>
    // Auto-retry every 10 seconds
    setInterval(() => {
      fetch('/', { method: 'HEAD' })
        .then(() => window.location.reload())
        .catch(() => {});
    }, 10000);
  </script>
</body>
</html>
```

---

## 5. 404 Page

**Location:** `/pages/404.tsx`

### Template

```tsx
import { Link } from 'react-router-dom'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <img
            src="/logos/flavatix-icon.svg"
            alt="Flavatix"
            className="w-20 h-20 mx-auto"
          />
        </div>

        <h1 className="text-6xl font-bold text-purple-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>

          <Link
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Quick Links:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/dashboard" className="text-purple-600 hover:underline">
              Dashboard
            </Link>
            <Link href="/my-tastings" className="text-purple-600 hover:underline">
              My Tastings
            </Link>
            <Link href="/flavor-wheels" className="text-purple-600 hover:underline">
              Flavor Wheels
            </Link>
            <Link href="/quick-tasting" className="text-purple-600 hover:underline">
              Quick Tasting
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 6. Social Sharing Images

**Location:** `/public/`

### Specifications

| Filename | Size | Purpose | Content |
|----------|------|---------|---------|
| og-image.png | 1200x630px | Open Graph (Facebook/LinkedIn) | Logo + tagline |
| twitter-image.png | 1200x630px | Twitter Card | Logo + tagline |

### Design Template

- **Background:** Gradient #7C3AED to #6D28D9
- **Logo:** Centered, white version
- **Tagline:** "Track, Analyze & Share Tastings"
- **Font:** Space Grotesk, bold, white
- **Padding:** 60px on edges

### Creation Tool

Use Canva, Figma, or: https://www.opengraph.xyz/

---

## 7. robots.txt

**Location:** `/public/robots.txt`

### Template

```
# Flavatix robots.txt
# Allow all crawlers

User-agent: *
Allow: /

# Disallow API routes
Disallow: /api/

# Disallow admin routes
Disallow: /admin/

# Sitemap
Sitemap: https://flavatix.com/sitemap.xml
```

---

## Summary Checklist

- [ ] Create `/public/icons/` directory with 8 PNG icons
- [ ] Create 2 shortcut icons
- [ ] Create `/public/screenshots/` directory with 3 screenshots
- [ ] Create `/public/offline.html`
- [ ] Create `/pages/404.tsx`
- [ ] Create social sharing images
- [ ] Create `/public/robots.txt`

---

## Testing After Creation

1. **Verify icons load:**
   ```bash
   # In browser DevTools Console
   fetch('/icons/icon-192x192.png').then(r => console.log(r.status))
   # Should return 200
   ```

2. **Test manifest parsing:**
   - DevTools → Application → Manifest
   - Verify all icons show "parsed successfully"

3. **Test offline page:**
   - DevTools → Network → Offline
   - Navigate to any page
   - Should see offline.html

4. **Test 404 page:**
   - Navigate to `/nonexistent-page`
   - Should see 404 page

---

**Total Estimated Time:** 2-3 hours
**Tools Needed:** ImageMagick or online icon generator, screenshot tool, text editor

# Deployment Guide for Flavatix

## Issue Fixed: Images Not Loading on Netlify

### Problem
The images in the `/public` folder (flavicon.png, coffee-bg.png) were not loading on the Netlify deployment, resulting in 404 errors.

### Root Cause
The Next.js application was not configured for static export, which is required for proper static asset handling on Netlify.

### Solution Applied

#### 1. Updated `next.config.js`
- Added `output: 'export'` for static site generation
- Added `trailingSlash: true` for better routing
- Added `unoptimized: true` for images (required for static export)
- Removed deprecated `experimental.appDir` configuration

#### 2. Created `netlify.toml`
- Set build command to `npm run build`
- Set publish directory to `out` (Next.js static export output)
- Added proper cache headers for static assets
- Added SPA routing fallback

#### 3. Verified Build Process
- Static files are now properly copied to the `out` directory
- Build completes without warnings
- All pages are statically generated

### Deployment Steps

1. **Push changes to your repository**
   ```bash
   git add .
   git commit -m "Fix image loading on Netlify deployment"
   git push origin main
   ```

2. **Netlify will automatically rebuild** using the new configuration
   - Build command: `npm run build`
   - Publish directory: `out`

3. **Verify deployment**
   - Check that images load correctly
   - Test all routes work properly
   - Verify static assets are cached correctly

### Files Modified
- `next.config.js` - Added static export configuration
- `netlify.toml` - Created Netlify deployment configuration
- `DEPLOYMENT.md` - This documentation

### Environment Variables
Make sure these are set in your Netlify dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Testing Locally
To test the static export locally:
```bash
npm run build
npx serve out
```

This will serve the static files from the `out` directory, simulating the Netlify environment.

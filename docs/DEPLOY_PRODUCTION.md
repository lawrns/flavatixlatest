# Deploying to Production: Step-by-Step Guide

Learn to deploy Flavatix to production safely and monitor it in real-time.

## What You'll Learn

By the end of this guide, you will:
- Understand the deployment architecture
- Deploy to Netlify automatically
- Configure environment variables for production
- Run pre-deployment checks
- Monitor your deployment
- Troubleshoot deployment issues
- Roll back if something breaks

**Time estimate:** 30-40 minutes for first deployment

**Prerequisites:**
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) completed
- [GETTING_STARTED.md](./GETTING_STARTED.md) completed

## Section 1: Deployment Architecture (5 minutes)

### How Flavatix Deploys

```
You push to main branch
        ↓
GitHub receives push
        ↓
Netlify sees push
        ↓
Netlify installs dependencies (npm install)
        ↓
Netlify builds (npm run build)
        ↓
Netlify runs tests (optional)
        ↓
Netlify deploys to CDN
        ↓
Your app is live at flavatix.com
        ↓
Sentry monitors for errors
```

### Key Services

- **GitHub** - Stores your code
- **Netlify** - Builds and hosts your app
- **Supabase** - Database and authentication
- **Anthropic** - AI features
- **Sentry** - Error monitoring

## Section 2: First-Time Setup (10 minutes)

### Step 1: Connect GitHub to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Connect GitHub account
5. Select "flavatix" repository
6. Click "Connect"

### Step 2: Configure Build Settings

Netlify should detect these automatically:

```
Build command:    npm run build
Publish directory: .next
Node version:     18
```

If not, set them manually:

1. Go to Settings → Build & deploy → Build settings
2. Update each field
3. Save

### Step 3: Set Environment Variables

Critical! These are needed for the build to succeed.

Go to Settings → Build & deploy → Environment:

Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL       = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY      = eyJhbGc...
DATABASE_URL                   = postgresql://...
ANTHROPIC_API_KEY              = sk-ant-v1...
NEXTAUTH_SECRET                = (generate with: openssl rand -base64 32)
NEXT_PUBLIC_BASE_URL           = https://flavatix.com (your domain)
```

**⚠️ Important:** These are production secrets. Handle with care!

### Step 4: Verify Setup

1. Go to Deploys tab
2. See "main" branch in the list
3. Click "Trigger deploy" to test

Watch the build:
```
Loading cache...
Installing dependencies...
Running "npm run build"...
Analyzing build result...
Uploading to CDN...
```

If successful:
```
✓ Deploy complete!
Site is live at: https://xyz.netlify.app
```

## Section 3: Pre-Deployment Checklist (5 minutes)

Before pushing to main, verify everything:

### Code Quality

```bash
# Check for linting issues
npm run lint

# Check TypeScript types
npm run type-check

# Run tests
npm run test:unit
```

All should pass. Fix any issues before continuing.

### Functionality

Before committing:

1. Test locally with `npm run dev`
2. Try all user flows
3. Test on different browsers
4. Test on mobile

### Documentation

- [ ] Updated README.md if needed
- [ ] Added comments to complex code
- [ ] Updated CHANGELOG.md

### Git

```bash
# Make sure branch is up to date
git pull origin main

# All changes committed?
git status
# Should show "nothing to commit"

# Check commit messages are clear
git log --oneline -5
# Should see descriptive messages
```

### Pre-Commit Checklist

```bash
# Final check before pushing
npm run check:all

# This runs:
# - npm run lint (code quality)
# - npm run type-check (type safety)
# - npm run test:unit (unit tests)
# - npm run test:e2e (end-to-end tests)
```

All should pass with 0 errors.

## Section 4: Deploying to Production (5 minutes)

### The Deployment Process

```bash
# 1. Make sure your code is perfect
npm run check:all

# 2. Push to main branch
git add .
git commit -m "feat: add new feature"
git push origin main

# 3. That's it!
# Netlify automatically:
# - Sees the push
# - Builds the app
# - Runs tests
# - Deploys to production
```

### Monitoring the Deployment

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to "Deploys" tab
4. See the latest deployment

Watch the logs:

```
6:23 PM: build-image version: abc123
6:23 PM: build-image tag: v4.10.2
6:23 PM: buildbot version: def456
6:23 PM: Installing dependencies
6:24 PM: npm WARN deprecated some-package@1.0.0
6:25 PM: npm WARN deprecated another-package@2.0.0
6:26 PM: > npm run build
6:27 PM: ▲ Next.js 14.0.4
6:28 PM: Analyzing build result...
6:29 PM: ✓ Prerendered as static content
6:29 PM: ✓ 234 functions bundled
6:30 PM: Deploy complete!
```

### If Deployment Succeeds

You'll see:

```
✓ Deploy complete!
Site live at: https://flavatix.netlify.app
Custom domain: https://flavatix.com
```

Check your live site:
1. Go to your domain (e.g., https://flavatix.com)
2. Test login
3. Test main features
4. Check console for errors (F12)

### If Deployment Fails

You'll see:

```
✗ Deploy failed
Error: npm install failed
Exit code: 1
```

**What to do:**

1. Click "View logs" to see the error
2. Read the error message (usually very helpful)
3. Common causes:
   - Missing environment variable
   - Lint error in code
   - TypeScript compilation error
   - Test failure

**How to fix:**

```bash
# 1. Reproduce the error locally
npm run build

# 2. Fix the error
# (Update code, add missing env var, etc.)

# 3. Test locally
npm run dev

# 4. Push again
git add .
git commit -m "fix: resolve build issue"
git push origin main

# 5. Netlify automatically redeploys
```

## Section 5: Monitoring Production (5 minutes)

### Monitor with Sentry

Sentry automatically catches errors in production:

1. Go to [sentry.io](https://sentry.io)
2. Select "flavatix" project
3. See errors in real-time
4. Click error to see stack trace

**Set up alerts:**
1. Go to Alerts
2. Create new alert for your email
3. Get notified when errors happen

### Monitor with Netlify Analytics

See how your site performs:

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Analytics tab
4. See:
   - Page views
   - Bandwidth used
   - Build times
   - Deployment history

### Monitor Supabase

Check database health:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select project
3. Explore → Health
4. See:
   - Database connections
   - Query performance
   - Storage usage

### Check Logs

See what's happening in production:

```bash
# Netlify functions logs (for API routes)
netlify logs

# Database logs (via Supabase)
# Go to app.supabase.com → Logs → Postgres logs
```

## Section 6: Rolling Back (If Something Breaks)

### What if Production is Broken?

Don't panic! Rollback is easy.

### Quick Rollback

1. Go to Netlify → Deploys
2. Find the last good deployment
3. Click "..." → "Redeploy"
4. Watch it deploy

Takes 1-2 minutes.

### Complete Rollback (If Last Commit Broke It)

```bash
# 1. Find the last good commit
git log --oneline

# 2. Revert the bad commit
git revert HEAD

# 3. Push the revert
git push origin main

# 4. Netlify automatically redeploys the previous version
```

### Emergency: Revert to Specific Commit

If something is catastrophically broken:

```bash
# 1. Find a known-good commit hash
git log --oneline | head -20

# 2. Create new branch from that commit
git checkout -b emergency-revert abc123def

# 3. Push it to main
git push origin emergency-revert:main

# 4. Netlify redeploys that version
```

Then later, fix the issue properly and merge.

## Common Deployment Issues

### Issue: Build Fails with "Module not found"

**Cause:** Missing dependency

**Fix:**
```bash
# Install the missing package
npm install missing-package

# Commit
git add package.json package-lock.json
git commit -m "add: missing dependency"
git push origin main
```

### Issue: Deployment Succeeds but Site Shows Error

**Cause:** Runtime error (happens when user loads page)

**Check:**
1. Go to your site
2. Open DevTools (F12)
3. Look at Console for errors
4. Check Sentry for error details
5. Fix the code
6. Push fix to main

### Issue: API Endpoints Return 500 Error

**Cause:** Environment variables not set, or database issue

**Check:**
1. Go to Netlify Settings → Environment
2. Verify all variables are set
3. Check Supabase is accessible
4. Check Sentry for error details

### Issue: Database Connection Failed

**Cause:** Wrong DATABASE_URL or Supabase is down

**Fix:**
1. Go to Supabase → Settings → Database
2. Copy correct Connection String
3. Update NEXT_PUBLIC_SUPABASE_URL in Netlify
4. Trigger redeploy

## Production Checklist

Before going live:

- [ ] All tests pass (`npm run check:all`)
- [ ] No console errors locally (`npm run dev`)
- [ ] Linting passes (`npm run lint`)
- [ ] Types check (`npm run type-check`)
- [ ] All environment variables set in Netlify
- [ ] Domain configured (DNS pointing to Netlify)
- [ ] SSL certificate working (https://)
- [ ] Sentry monitoring enabled
- [ ] Database backups configured
- [ ] Rollback procedure understood

## Deployment Commands

```bash
# Local build (test before deploying)
npm run build

# Start production server locally
npm run start

# Check everything before committing
npm run check:all

# Push to deploy
git push origin main
```

## Summary

You've learned:
- How deployment works
- How to set up Netlify
- How to configure environment variables
- How to monitor production
- How to roll back if needed
- How to debug deployment issues

## Next Steps

- **Want to monitor errors?** → [DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md)
- **Emergency happened?** → [DEPLOY_EMERGENCY.md](./DEPLOY_EMERGENCY.md)
- **Want to roll back?** → See Section 6 above
- **Back to index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Pro Tip:** Deploy often! Small deployments are safer than big ones.

**Golden Rules:**
1. Always run `npm run check:all` before pushing
2. Netlify will automatically deploy when you push to main
3. Monitor Sentry for production errors
4. Rollback is easy - don't panic if something breaks

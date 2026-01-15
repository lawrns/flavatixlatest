# Environment Configuration: Complete Reference

Master all configuration for local development, testing, and production.

## What You'll Learn

By the end of this guide, you will:
- Understand all environment variables
- Configure for local development
- Set up different environments (dev, staging, prod)
- Keep secrets secure
- Debug configuration issues
- Handle environment-specific code

**Time estimate:** 20-30 minutes

**Prerequisites:**
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Basic setup done
- Basic understanding of environment variables

## Section 1: Environment Variables Overview (5 minutes)

### What Are Environment Variables?

Environment variables are settings that change per environment:

```
Local Development:
  DATABASE_URL=postgresql://localhost:5432/flavatix_dev
  DEBUG=true

Staging:
  DATABASE_URL=postgresql://staging-server/flavatix
  DEBUG=false

Production:
  DATABASE_URL=postgresql://prod-server/flavatix
  DEBUG=false
```

### Why Separate Them?

- **Development**: Use local/test services, verbose logging
- **Staging**: Use production-like services, test environment
- **Production**: Use real services, no logging, security enabled

### Never Commit Secrets

```
✓ Commit: .env.example (template)
✗ Commit: .env.local (your secrets)
```

## Section 2: Required Configuration (10 minutes)

### Location: .env.local

This file is **never committed**. Create it locally:

```bash
cp .env.example .env.local
nano .env.local  # Edit with your values
```

### All Variables You Need

#### Application Settings

```bash
# Application name
NEXT_PUBLIC_APP_NAME=Flavatix

# Base URL (no trailing slash!)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

#### Supabase Configuration (Required)

Get these from [app.supabase.com](https://app.supabase.com):

1. Go to your project
2. Settings → API
3. Copy the values below

```bash
# Project URL (example: https://abc123.supabase.co)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anon public key (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (SECRET! Only for server-side)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database URL (from Databases section)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

**How to find them:**

1. **NEXT_PUBLIC_SUPABASE_URL:**
   - Settings → API
   - Copy "Project URL"

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Settings → API
   - Copy "anon" key

3. **SUPABASE_SERVICE_ROLE_KEY:**
   - Settings → API
   - Copy "service_role" key

4. **DATABASE_URL:**
   - Settings → Database
   - Copy "Connection String"
   - Choose "Postgres.js" option

#### Anthropic AI (Required for AI Features)

Get API key from [console.anthropic.com](https://console.anthropic.com):

```bash
# Your Claude API key
ANTHROPIC_API_KEY=sk-ant-v1-abc123...
```

**How to get it:**

1. Sign up: [console.anthropic.com](https://console.anthropic.com)
2. Click "API Keys" in the left menu
3. Create new key
4. Copy the value

#### Authentication

```bash
# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here

# Your app URL
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
# Output: aB3Cd5efG7hI9jKlMnOpQrStUvWxYzAbCdEfGhIjKlM=
```

Copy the output and paste in `.env.local`.

#### Sentry (Optional but Recommended)

Get from [sentry.io](https://sentry.io):

```bash
# Error tracking and monitoring
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project-id

# Only in production
SENTRY_AUTH_TOKEN=secret_token_for_deployment
```

#### Other Integrations (Optional)

```bash
# Email sending (if you add email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Image hosting (if you use Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Section 3: Verify Your Configuration (5 minutes)

### Quick Checklist

Run this to verify all required vars are set:

```bash
# Check each variable
echo "Checking environment variables..."

# Required
test -n "$NEXT_PUBLIC_SUPABASE_URL" && echo "✓ SUPABASE_URL" || echo "✗ Missing SUPABASE_URL"
test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" && echo "✓ SUPABASE_ANON_KEY" || echo "✗ Missing SUPABASE_ANON_KEY"
test -n "$ANTHROPIC_API_KEY" && echo "✓ ANTHROPIC_API_KEY" || echo "✗ Missing ANTHROPIC_API_KEY"
test -n "$NEXTAUTH_SECRET" && echo "✓ NEXTAUTH_SECRET" || echo "✗ Missing NEXTAUTH_SECRET"

# Check they actually have values
if grep "your-" .env.local > /dev/null; then
  echo "⚠ Warning: Still has placeholder values in .env.local"
fi
```

### Test the Configuration

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If you see the home page, everything is configured!

If you get errors:
- Check console output (it shows which var is missing)
- Check `.env.local` has all required variables
- Check values are not the placeholder text

## Section 4: Different Environments (5 minutes)

### Staging Environment (.env.staging)

For testing before production:

```bash
# Copy from .env.local
cp .env.local .env.staging

# Edit for staging
nano .env.staging
```

Change these values:

```bash
# Different URLs
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_BASE_URL=https://staging.flavatix.com
NEXTAUTH_URL=https://staging.flavatix.com

# Staging database
DATABASE_URL=postgresql://user:pass@staging-db.supabase.co:5432/postgres
```

Keep these the same:
- ANTHROPIC_API_KEY (shared with prod)
- NEXTAUTH_SECRET (can be different)

### Production Environment (Netlify)

**Never create a `.env.production` file!**

Instead, set environment variables in Netlify:

1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Settings → Build & deploy → Environment
4. Add variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ANTHROPIC_API_KEY
   - NEXTAUTH_SECRET
   - DATABASE_URL
   - NEXT_PUBLIC_BASE_URL
   - etc.

Netlify automatically uses these when building.

## Section 5: Security Best Practices (5 minutes)

### Rule 1: .env.local Is Local Only

```bash
# Check it's in .gitignore
cat .gitignore | grep env.local

# Make sure it's never committed
git status
# Should NOT show .env.local
```

### Rule 2: Public vs Secret Keys

**Public (safe to expose):**
- Variables starting with `NEXT_PUBLIC_*`
- Supabase anon key
- Cloudinary cloud name

**Secret (NEVER expose):**
- ANTHROPIC_API_KEY
- NEXTAUTH_SECRET
- Database passwords
- Service role keys

**Pattern:**
```typescript
// This is OK - public key is in code
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This is WRONG - never do this
const secret = process.env.ANTHROPIC_API_KEY // Only on server!
```

### Rule 3: Rotate Secrets Regularly

If you suspect a secret is exposed:

1. **Immediately revoke it:**
   - Anthropic: Go to console.anthropic.com, delete the key
   - Supabase: Go to Settings → API, roll service role key
   - Database: Change password in Supabase

2. **Update everywhere:**
   - Update `.env.local`
   - Update Netlify environment variables
   - Update CI/CD secrets

3. **Check for misuse:**
   - Monitor API usage in Anthropic dashboard
   - Check database logs in Supabase

### Rule 4: Don't Pass Secrets to Client

**Wrong:**
```typescript
// In a component (runs in browser)
const response = await fetch(`/api/analyze?api_key=${process.env.ANTHROPIC_API_KEY}`)
// ❌ Now the API key is exposed in the network request!
```

**Right:**
```typescript
// In a component (runs in browser)
const response = await fetch('/api/analyze')
// ✓ Safe - secret is only on server

// In pages/api/analyze.ts (runs on server)
const apiKey = process.env.ANTHROPIC_API_KEY
const result = await anthropic.messages.create({...})
```

## Common Configuration Issues

### Issue 1: "Cannot find module '@/lib/...'"

**Cause:** TypeScript alias not configured

**Solution:** Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This should already be there. If not, add it.

### Issue 2: "SUPABASE_URL is not defined"

**Cause:** Missing `.env.local` file

**Solution:**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Issue 3: "Database connection failed"

**Cause:** DATABASE_URL is wrong

**Solution:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select project
3. Settings → Database
4. Copy "Connection String"
5. Choose "Postgres.js" option
6. Paste in DATABASE_URL

### Issue 4: API calls fail with 401

**Cause:** Wrong Supabase anon key

**Solution:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Settings → API
3. Copy "anon" key
4. Paste in NEXT_PUBLIC_SUPABASE_ANON_KEY

## Environment-Specific Code

Sometimes you need different code for different environments:

```typescript
// Check the environment
if (process.env.NODE_ENV === 'development') {
  // Only in development
  console.log('Debug info:', data)
}

if (process.env.NODE_ENV === 'production') {
  // Only in production
  // Use analytics, disable debug, etc.
}

// Check a custom variable
if (process.env.NEXT_PUBLIC_BASE_URL?.includes('staging')) {
  // Only on staging
}
```

## Summary

You've learned:
- What all environment variables do
- How to configure for local development
- How to set up different environments
- Security best practices
- How to handle configuration issues

## Next Steps

- **Ready to build a feature?** → [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md)
- **Want to deploy?** → [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)
- **Having configuration issues?** → Check the "Common Issues" section
- **Back to index** → [TUTORIALS_INDEX.md](./TUTORIALS_INDEX.md)

---

**Remember:** Never commit `.env.local`. It contains your secrets!

**Files you can commit:**
- `.env.example` - Template only

**Files you CANNOT commit:**
- `.env.local` - Your local secrets
- `.env.production` - Production secrets

Netlify handles production secrets securely in the environment variables section.

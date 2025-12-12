# Security Documentation

## Overview

This document outlines the security measures implemented in Flavatix and provides guidelines for maintaining a secure production environment.

## Table of Contents

1. [Rate Limiting](#rate-limiting)
2. [CSRF Protection](#csrf-protection)
3. [Error Tracking with Sentry](#error-tracking)
4. [Secrets Management with Supabase Vault](#secrets-management)
5. [API Key Rotation](#api-key-rotation)
6. [Environment Variables](#environment-variables)
7. [Pre-commit Hooks](#pre-commit-hooks)

---

## Rate Limiting

### Implementation

Rate limiting is implemented in `lib/api/middleware.ts` using an in-memory store (for development) with the following limits:

- **Public endpoints**: 100 requests/minute per IP
- **Auth endpoints**: 10 requests/minute per IP
- **API endpoints**: 60 requests/minute per user
- **Strict endpoints** (password reset, etc.): 5 requests/15 minutes

### Usage

```typescript
import { createApiHandler, withRateLimit, RATE_LIMITS } from '@/lib/api/middleware';

export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.PUBLIC)(handler),
  POST: withRateLimit(RATE_LIMITS.AUTH)(authHandler),
});
```

### Response Headers

Rate-limited endpoints return the following headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Seconds until limit resets
- `Retry-After`: (on 429) Seconds to wait before retrying

### Production Considerations

**IMPORTANT**: The in-memory rate limiter is suitable for development and single-instance deployments. For production with multiple instances, use Redis:

```typescript
// Install redis client
npm install redis

// Update lib/api/middleware.ts to use Redis instead of Map
```

---

## CSRF Protection

### Implementation

CSRF protection is implemented using the double-submit cookie pattern in `lib/api/middleware.ts`.

### How It Works

1. Client includes CSRF token in `X-CSRF-Token` header
2. Server validates token for state-changing operations (POST/PUT/PATCH/DELETE)
3. Supabase session tokens provide built-in CSRF protection for authenticated requests

### Usage

```typescript
import { createApiHandler, withAuth, withCsrfProtection } from '@/lib/api/middleware';

export default createApiHandler({
  POST: withAuth(withCsrfProtection(handler)),
});
```

### Client-Side

Include CSRF token in API requests:

```typescript
const { data: { session } } = await supabase.auth.getSession();

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'X-CSRF-Token': session.access_token, // Use session token as CSRF token
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## Error Tracking with Sentry

### Overview

Sentry is integrated for comprehensive error tracking and performance monitoring across client-side, server-side, and API routes.

### Setup Instructions

#### 1. Create a Sentry Project

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (select "Next.js")
3. Copy your DSN from the project settings

#### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_ENVIRONMENT=production
```

**Note**: Both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` are required:
- `NEXT_PUBLIC_SENTRY_DSN`: Used by client-side code
- `SENTRY_DSN`: Used by server-side code and build process

#### 3. What Gets Tracked

**Client-Side Errors**:
- React component errors (via ErrorBoundary)
- Unhandled JavaScript exceptions
- Promise rejections
- Browser performance metrics
- User session replays (on errors)

**Server-Side Errors**:
- API route errors
- Authentication failures
- Validation errors
- Unhandled server exceptions

**Context Captured**:
- User information (ID, email when authenticated)
- Request details (method, URL, headers)
- Response status codes
- Component stack traces
- Performance metrics (API response times, memory usage)

#### 4. Configuration Files

The following files configure Sentry:

- `sentry.config.ts`: Shared configuration
- `sentry.client.config.ts`: Browser-specific setup
- `sentry.server.config.ts`: Server-specific setup
- `next.config.js`: Build integration with source maps

#### 5. Error Filtering

Sentry is configured to filter out noise:

**Ignored Errors**:
- Browser extension interference
- Network timeout errors (client-side)
- 4xx client errors (except 401/403)
- ResizeObserver notifications

**Development Mode**:
- Only critical errors (error/fatal level) are sent
- Debug mode enabled for troubleshooting

**Production Mode**:
- 20% performance sampling rate
- 10% session replay sampling
- 100% error session replay
- Source maps uploaded and hidden from bundles

#### 6. Testing Sentry Integration

Test that Sentry is working:

```typescript
// Client-side test
import * as Sentry from '@sentry/nextjs';

// Trigger a test error
Sentry.captureException(new Error('Test error from client'));

// Or throw an error in a component to test ErrorBoundary
throw new Error('Test ErrorBoundary');
```

```typescript
// Server-side test (in API route)
import * as Sentry from '@sentry/nextjs';

export default async function handler(req, res) {
  Sentry.captureException(new Error('Test error from API'));
  res.status(500).json({ error: 'Test error sent to Sentry' });
}
```

#### 7. Monitoring and Alerts

Configure alerts in your Sentry dashboard:

1. Go to **Alerts** > **Create Alert**
2. Set up alerts for:
   - Error rate increases
   - New error types
   - Performance degradation
   - Critical errors
3. Configure notification channels (email, Slack, etc.)

#### 8. Privacy and PII

Sentry is configured to protect user privacy:

- Session replay: All text masked, media blocked
- Stack traces: Normalized to depth 10
- Source maps: Hidden from client bundles
- User data: Only ID and email (no passwords or sensitive data)

#### 9. Tunnel Route for Ad-Blocker Bypass

Sentry requests are routed through `/monitoring` to bypass ad-blockers:

```typescript
// Configured in next.config.js
tunnelRoute: '/monitoring'
```

This ensures error tracking works even when users have ad-blockers enabled.

### Best Practices

1. **Always capture errors with context**:
   ```typescript
   Sentry.captureException(error, {
     tags: { feature: 'authentication' },
     extra: { userId: user.id },
     level: 'error',
   });
   ```

2. **Set user context when authenticated**:
   ```typescript
   Sentry.setUser({
     id: user.id,
     email: user.email,
   });
   ```

3. **Clear user context on logout**:
   ```typescript
   Sentry.setUser(null);
   ```

4. **Use breadcrumbs for debugging**:
   ```typescript
   Sentry.addBreadcrumb({
     category: 'auth',
     message: 'User login attempt',
     level: 'info',
   });
   ```

### Production Checklist

- [ ] SENTRY_DSN configured in production environment
- [ ] Source maps uploading successfully
- [ ] Error alerts configured
- [ ] Team notifications set up
- [ ] Test errors appearing in Sentry dashboard
- [ ] Privacy settings reviewed
- [ ] Performance monitoring enabled

---

## Secrets Management with Supabase Vault

### What is Supabase Vault?

Supabase Vault is a secure, encrypted storage solution for sensitive data like API keys, tokens, and credentials.

### Setup Instructions

#### 1. Enable Vault in Your Supabase Project

1. Log into your Supabase dashboard
2. Navigate to **Project Settings** > **Vault**
3. Enable Vault if not already enabled

#### 2. Store Secrets in Vault

Using SQL or the Supabase Dashboard:

```sql
-- Store Anthropic API key
INSERT INTO vault.secrets (name, secret)
VALUES ('ANTHROPIC_API_KEY', 'your-actual-api-key-here');

-- Store OpenAI API key
INSERT INTO vault.secrets (name, secret)
VALUES ('OPENAI_API_KEY', 'your-actual-api-key-here');
```

#### 3. Retrieve Secrets in Application

```typescript
// In your API route
import { getSupabaseClient } from '@/lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req, res);

  // Retrieve secret from Vault
  const { data, error } = await supabase
    .rpc('get_secret', { secret_name: 'ANTHROPIC_API_KEY' });

  if (error) {
    console.error('Failed to retrieve secret:', error);
    return res.status(500).json({ error: 'Failed to retrieve API key' });
  }

  const apiKey = data;
  // Use apiKey for API calls...
}
```

#### 4. Update Environment Variables

After moving secrets to Vault, update `.env.local`:

```bash
# Remove actual keys, use placeholders
ANTHROPIC_API_KEY=use-vault
OPENAI_API_KEY=use-vault
```

---

## API Key Rotation

### Rotation Schedule

- **AI API Keys** (Anthropic, OpenAI): Rotate every 90 days
- **Service Role Keys**: Rotate every 180 days
- **NEXTAUTH_SECRET**: Rotate every 365 days

### Rotation Process

1. Generate new API key in provider dashboard
2. Store new key in Supabase Vault:
   ```sql
   UPDATE vault.secrets
   SET secret = 'new-api-key-here', updated_at = NOW()
   WHERE name = 'ANTHROPIC_API_KEY';
   ```
3. Test application with new key
4. Revoke old key in provider dashboard
5. Document rotation in team changelog

### Emergency Rotation

If a key is compromised:

1. **Immediately** revoke the compromised key
2. Generate and deploy new key via Vault
3. Investigate how the key was exposed
4. Update security procedures to prevent recurrence

---

## Environment Variables

### Classification

Environment variables are classified into three categories:

#### 1. Public Variables (Safe to commit in `.env.example`)

```bash
NEXT_PUBLIC_APP_NAME=Flavatix
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_LOG_LEVEL=debug
```

#### 2. Sensitive Variables (NEVER commit)

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
NEXTAUTH_SECRET=your-secret
```

#### 3. Semi-Sensitive Variables (Use placeholders in `.env.example`)

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Best Practices

1. **NEVER commit** `.env.local` or files containing actual secrets
2. **ALWAYS use** `.env.example` with placeholder values
3. **ROTATE secrets** regularly (see rotation schedule)
4. **USE VAULT** for production secrets
5. **AUDIT regularly** - check for exposed secrets in git history

### Checking for Exposed Secrets

```bash
# Check if .env files were ever committed
git log --all --full-history -- ".env*"

# Search for potential API keys in history
git log -p | grep -i "api.*key"

# Use git-secrets tool (recommended)
git secrets --scan
```

---

## Pre-commit Hooks

### Installation

A pre-commit hook prevents accidental commits of sensitive files.

#### 1. Create Hook Script

Save as `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Prevent committing .env files with secrets
if git diff --cached --name-only | grep -E "^\.env\.local$|^\.env$"; then
  echo "ERROR: Attempting to commit .env file with potential secrets!"
  echo "Please remove sensitive files from staging:"
  echo "  git reset HEAD .env.local"
  exit 1
fi

# Check for common secret patterns in staged files
if git diff --cached | grep -iE "api[_-]?key|secret[_-]?key|password|token" | grep -v "placeholder\|example\|your-"; then
  echo "WARNING: Potential secrets detected in staged files!"
  echo "Please review changes carefully before committing."
  read -p "Continue with commit? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

exit 0
```

#### 2. Make Executable

```bash
chmod +x .git/hooks/pre-commit
```

#### 3. Test Hook

```bash
# This should be blocked
git add .env.local
git commit -m "test"

# This should work
git add .env.example
git commit -m "test"
```

### Using Git-Secrets (Recommended)

For more robust protection:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Initialize in repository
cd /path/to/flavatix
git secrets --install
git secrets --register-aws  # Prevents AWS keys

# Add custom patterns
git secrets --add 'sk-[a-zA-Z0-9]{32,}'  # Anthropic keys
git secrets --add 'SUPABASE_SERVICE_ROLE_KEY=.+'
```

---

## Security Checklist

### Development

- [ ] All sensitive data in `.env.local` (not committed)
- [ ] `.env.example` has only placeholder values
- [ ] Pre-commit hooks installed and tested
- [ ] No API keys in source code
- [ ] CSRF protection on state-changing endpoints
- [ ] Rate limiting on public endpoints

### Pre-Production

- [ ] Secrets migrated to Supabase Vault
- [ ] Rate limiting configured for production load
- [ ] All environment variables reviewed
- [ ] Git history audited for exposed secrets
- [ ] HTTPS enforced for all endpoints
- [ ] CORS properly configured
- [ ] Sentry DSN configured and tested

### Production

- [ ] Secrets in Vault only (not in env vars)
- [ ] Rate limiting using Redis (not in-memory)
- [ ] Sentry error tracking enabled and monitored
- [ ] Sentry alerts configured
- [ ] API key rotation schedule established
- [ ] Security audit completed
- [ ] Incident response plan documented

---

## Incident Response

If a security incident occurs:

1. **Assess** the scope and impact
2. **Contain** by rotating affected keys immediately
3. **Investigate** the root cause
4. **Document** findings and timeline
5. **Remediate** vulnerabilities
6. **Communicate** with affected users (if applicable)

### Emergency Contacts

- Security Lead: [Contact Info]
- DevOps Team: [Contact Info]
- Supabase Support: support@supabase.io

---

## Additional Resources

- [Supabase Vault Documentation](https://supabase.com/docs/guides/database/vault)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Anthropic API Security Best Practices](https://docs.anthropic.com/claude/docs/api-security)

---

**Last Updated**: 2025-12-11
**Version**: 1.0

# Deployment Guide

## Rate Limiting Configuration

### Development
Rate limiting uses an in-memory store by default. This is suitable for local development but **will not work** in production with multiple instances or serverless functions.

### Production

For production deployments, configure Redis-based rate limiting:

#### Option 1: Upstash Redis (Recommended for Serverless)

1. Create an Upstash Redis database at https://upstash.com/
2. Copy the REST URL and token
3. Set environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

#### Option 2: Standard Redis

1. Set up a Redis instance (AWS ElastiCache, Redis Cloud, etc.)
2. Set environment variable:
   ```bash
   REDIS_URL=redis://your-redis-host:6379
   ```

#### Option 3: Edge/Network-Level Rate Limiting

For Vercel deployments, consider using Vercel's edge middleware or a CDN-level rate limiting solution instead of application-level rate limiting.

### Verification

After deployment, check logs for rate limiting status:
- ✅ `Using Redis rate limiting` - Production-ready
- ⚠️ `Redis not available, falling back to in-memory` - Not suitable for production

## Environment Variables

### Required for Production

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

### Optional (for AI features)

```bash
ANTHROPIC_API_KEY=your-anthropic-key  # Server-side only
OPENAI_API_KEY=your-openai-key  # Server-side only
```

### Rate Limiting (Production)

```bash
REDIS_URL=redis://...  # OR
UPSTASH_REDIS_REST_URL=https://...  # AND
UPSTASH_REDIS_REST_TOKEN=...
```

## Security Checklist

- [ ] All `NEXT_PUBLIC_*` variables are safe to expose (no secrets)
- [ ] Service role keys are server-side only
- [ ] API keys are server-side only
- [ ] Rate limiting is configured (Redis or edge-level)
- [ ] RLS policies are enabled on all Supabase tables
- [ ] Environment variables are set in deployment platform (not committed)







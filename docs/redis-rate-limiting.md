# Redis Configuration for Production Rate Limiting

## Overview

Flavatix's API rate limiting uses **in-memory storage in development** and **Redis in production** for distributed rate limiting across serverless instances.

⚠️ **Critical:** In-memory rate limiting does NOT work in production serverless/multi-instance environments!

---

## Why Redis is Required for Production

### The Problem

Serverless functions (Vercel, Netlify, AWS Lambda) create multiple instances:

```
Request 1 → Instance A (tracks: user made 1 request)
Request 2 → Instance B (tracks: user made 1 request)  ← Different instance!
Request 3 → Instance A (tracks: user made 2 requests)
```

**Result:** Rate limits are per-instance, not per-user. Users can bypass limits by hitting different instances.

### The Solution

Redis provides shared state across all instances:

```
Request 1 → Instance A → Redis (increments: user made 1 request)
Request 2 → Instance B → Redis (increments: user made 2 requests)
Request 3 → Instance A → Redis (increments: user made 3 requests)
```

**Result:** Accurate rate limiting across all instances.

---

## Redis Setup Options

### Option 1: Upstash (Recommended)

**Best for:** Serverless deployments (Vercel, Netlify)

**Why:**
- Serverless-native (HTTP API, no persistent connections)
- Pay-per-request pricing
- Global edge caching
- No infrastructure management
- Free tier: 10,000 commands/day

**Setup:**

1. **Create account:** [https://upstash.com](https://upstash.com)

2. **Create Redis database:**
   - Choose region closest to your deployment
   - Enable TLS
   - Copy REST URL and token

3. **Add environment variables:**

   ```env
   # Option 1: Combined URL (recommended)
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io@your-token

   # Option 2: Separate values
   REDIS_URL=https://your-db.upstash.io
   REDIS_TOKEN=your-token
   ```

4. **Test connection:**

   ```typescript
   // lib/api/middleware.ts automatically detects Upstash URLs
   ```

**Pricing:**
- Free: 10,000 commands/day
- Pay-as-you-go: $0.20 per 100,000 commands
- Pro: $10/month (1M commands)

### Option 2: Redis Cloud (Redis Labs)

**Best for:** High-volume applications, custom configurations

**Why:**
- Official Redis managed service
- Advanced features (clustering, persistence)
- SLA guarantees
- 24/7 support

**Setup:**

1. **Create account:** [https://redis.com/try-free/](https://redis.com/try-free/)

2. **Create database:**
   - Choose region
   - Select plan (free tier available)
   - Note: Endpoint and password

3. **Add environment variable:**

   ```env
   # Format: redis[s]://[[username][:password]@][host][:port][/db-number]
   REDIS_URL=redis://default:your-password@redis-12345.c1.cloud.redislabs.com:12345
   ```

**Pricing:**
- Free: 30MB storage
- Paid: From $5/month

### Option 3: AWS ElastiCache

**Best for:** AWS-hosted applications

**Why:**
- Native AWS integration
- VPC security
- High availability
- Auto-scaling

**Setup:**

1. **Create ElastiCache cluster** (Redis)

2. **Add to VPC** with serverless function access

3. **Add environment variable:**

   ```env
   REDIS_URL=redis://your-elasticache-endpoint:6379
   ```

**Pricing:**
- From $15/month (cache.t3.micro)

### Option 4: Self-Hosted Redis

**Best for:** Complete control, existing infrastructure

**Setup:**

1. **Install Redis:**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server

   # macOS
   brew install redis

   # Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Configure for production:**

   ```redis
   # /etc/redis/redis.conf
   bind 0.0.0.0
   requirepass your-strong-password
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

3. **Add environment variable:**

   ```env
   REDIS_URL=redis://:your-password@your-server:6379
   ```

---

## Environment Variable Configuration

### Required Environment Variables

Add **ONE** of the following to your `.env` file:

```env
# Option 1: Upstash (serverless-friendly)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io@your-token

# Option 2: Standard Redis
REDIS_URL=redis://default:password@host:port

# Option 3: Separate URL and token (Upstash)
REDIS_URL=https://your-db.upstash.io
REDIS_TOKEN=your-token
```

### Vercel Deployment

```bash
# Add to Vercel project settings
vercel env add UPSTASH_REDIS_REST_URL production
```

### Netlify Deployment

```bash
# Add to Netlify site settings
netlify env:set UPSTASH_REDIS_REST_URL https://your-db.upstash.io@your-token
```

### Docker Deployment

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - REDIS_URL=redis://redis:6379
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

## Testing Redis Connection

### Local Testing

```typescript
// test-redis.ts
import { createClient } from 'redis';

async function testRedis() {
  const client = createClient({
    url: process.env.REDIS_URL
  });

  await client.connect();

  await client.set('test', 'hello');
  const value = await client.get('test');

  console.log('Redis test:', value); // Should print: hello

  await client.disconnect();
}

testRedis();
```

### Production Testing

1. **Deploy with Redis configured**

2. **Make API requests:**

   ```bash
   # First request
   curl -H "Authorization: Bearer $TOKEN" https://api.flavatix.com/api/tastings

   # Check response headers
   # X-RateLimit-Limit: 60
   # X-RateLimit-Remaining: 59
   # X-RateLimit-Reset: 45
   ```

3. **Monitor Logs:**

   Look for Redis connection messages:

   ```
   ✅ Redis rate limiting initialized
   ❌ Redis not available, falling back to in-memory store
   ```

---

## Rate Limit Configuration

### Default Rate Limits

Defined in `lib/api/middleware.ts`:

```typescript
export const RATE_LIMITS = {
  PUBLIC: { maxRequests: 100, windowMs: 60 * 1000 },     // 100 req/min
  AUTH: { maxRequests: 10, windowMs: 60 * 1000 },        // 10 req/min
  API: { maxRequests: 60, windowMs: 60 * 1000 },         // 60 req/min
  STRICT: { maxRequests: 5, windowMs: 15 * 60 * 1000 },  // 5 req/15min
};
```

### Custom Rate Limits

```typescript
withRateLimit({
  maxRequests: 30,
  windowMs: 60000,
  keyGenerator: (req) => context.user?.id || getClientIp(req),
  message: 'Too many export requests, please try again later'
})(handler)
```

### Per-User vs Per-IP

```typescript
// Per-user rate limiting (requires auth)
keyGenerator: (req) => context.user!.id

// Per-IP rate limiting (public endpoints)
keyGenerator: (req) => getClientIp(req)

// Hybrid (authenticated = per-user, anonymous = per-IP)
keyGenerator: (req) => context.user?.id || getClientIp(req)
```

---

## Monitoring and Debugging

### Check Current Configuration

The middleware automatically logs Redis status on startup:

```
✅ Redis rate limiting initialized (Upstash)
⚠️ Production environment detected but REDIS_URL not set
❌ Redis not available, using in-memory store
```

### Monitor Rate Limit Usage

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 60        # Max requests in window
X-RateLimit-Remaining: 45    # Remaining requests
X-RateLimit-Reset: 30        # Seconds until reset
```

When limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 30

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "details": {
      "limit": 60,
      "remaining": 0,
      "resetInSeconds": 30
    }
  }
}
```

### Redis Metrics to Monitor

1. **Commands per second**: Track API usage
2. **Memory usage**: Ensure sufficient capacity
3. **Connection count**: Monitor serverless connections
4. **Hit rate**: Cache effectiveness
5. **Latency**: Response time impact

---

## Troubleshooting

### Issue: "Redis not available" warning in production

**Cause:** `REDIS_URL` or `UPSTASH_REDIS_REST_URL` not set

**Solution:**
```bash
# Verify environment variable is set
echo $REDIS_URL

# Add to deployment platform
vercel env add UPSTASH_REDIS_REST_URL production
```

### Issue: Rate limits not working across instances

**Cause:** Using in-memory store instead of Redis

**Solution:**
1. Check logs for Redis initialization message
2. Verify `REDIS_URL` is set correctly
3. Test Redis connection manually

### Issue: Redis connection errors

**Cause:** Incorrect URL format or network issues

**Solution:**
```bash
# Test connection
redis-cli -u $REDIS_URL ping
# Should return: PONG

# Check URL format
# Standard: redis://user:pass@host:port
# Upstash: https://endpoint@token
```

### Issue: High latency with Redis

**Cause:** Redis server in different region

**Solution:**
1. Choose Redis region closest to deployment
2. Consider Upstash global edge for multi-region

### Issue: Redis out of memory

**Cause:** Too many rate limit keys stored

**Solution:**
```redis
# Set eviction policy
maxmemory-policy allkeys-lru

# Increase memory limit
maxmemory 512mb
```

---

## Security Best Practices

### 1. Use Strong Passwords

```env
# ❌ Bad
REDIS_URL=redis://localhost:6379

# ✅ Good
REDIS_URL=redis://:veryLongRandomPassword123!@host:6379
```

### 2. Enable TLS

```env
# Use rediss:// (with 's') for TLS
REDIS_URL=rediss://host:6380
```

### 3. Restrict Network Access

- Use VPC for AWS ElastiCache
- Whitelist IPs in Redis Cloud
- Use Upstash's built-in security

### 4. Rotate Credentials

- Change Redis passwords regularly
- Update environment variables
- Monitor for unauthorized access

### 5. Monitor for Abuse

- Set up alerts for high command rates
- Track failed auth attempts
- Monitor memory usage spikes

---

## Cost Optimization

### 1. Choose Right Tier

- **Development:** In-memory (free, local only)
- **Small apps:** Upstash free tier (10K commands/day)
- **Medium apps:** Upstash Pro ($10/month)
- **Large apps:** Redis Cloud or ElastiCache

### 2. Optimize Key Expiration

Rate limit keys auto-expire after window:

```typescript
// 1 minute window = keys expire in 1 minute
{ maxRequests: 60, windowMs: 60000 }
```

### 3. Monitor Command Usage

```bash
# Check Upstash dashboard
# Track daily command count
# Set alerts for threshold
```

### 4. Use Appropriate Window Sizes

```typescript
// Smaller windows = more Redis operations
{ maxRequests: 10, windowMs: 10000 }  // New key every 10s

// Larger windows = fewer Redis operations
{ maxRequests: 60, windowMs: 60000 }  // New key every 60s
```

---

## Migration Path

### From In-Memory to Redis

1. **Add Redis to infrastructure**
2. **Set environment variable**
3. **Deploy application**
4. **Verify Redis connection in logs**
5. **Monitor rate limit effectiveness**

**Zero downtime:** In-memory is automatic fallback if Redis fails!

### From Redis to Upstash

1. **Create Upstash database**
2. **Update environment variable from `REDIS_URL` to `UPSTASH_REDIS_REST_URL`**
3. **Deploy**
4. **Verify connection**
5. **Decommission old Redis**

---

## Related Documentation

- [API Design Patterns](./api-design-patterns.md) - Middleware architecture
- [API Versioning](./api-versioning.md) - Version strategy
- [Error Codes](./error-codes.md) - Rate limit error handling
- [Deployment Guide](./deployment.md) - Production configuration

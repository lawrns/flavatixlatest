/**
 * Middleware Tests
 *
 * Tests for API middleware including rate limiting, CSRF protection, and auth
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  withRateLimit,
  withCsrfProtection,
  generateCsrfToken,
  RATE_LIMITS,
  ApiContext,
} from '../middleware';

// Mock request and response
const createMockReq = (overrides?: Partial<NextApiRequest>): NextApiRequest => ({
  method: 'GET',
  url: '/api/test',
  headers: {},
  query: {},
  body: {},
  cookies: {},
  socket: { remoteAddress: '127.0.0.1' } as any,
  ...overrides,
} as NextApiRequest);

const createMockRes = (): NextApiResponse => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    headersSent: false,
  };
  return res;
};

const createMockContext = (): ApiContext => ({
  startTime: Date.now(),
  requestId: 'test-request-id',
});

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow requests under the limit', async () => {
    const handler = jest.fn();
    const rateLimitedHandler = withRateLimit({ maxRequests: 5, windowMs: 60000 })(handler);

    const req = createMockReq();
    const res = createMockRes();
    const context = createMockContext();

    await rateLimitedHandler(req, res, context);

    expect(handler).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
  });

  it('should block requests exceeding the limit', async () => {
    const handler = jest.fn();
    const rateLimitedHandler = withRateLimit({ maxRequests: 2, windowMs: 60000 })(handler);

    const req = createMockReq();
    const res = createMockRes();
    const context = createMockContext();

    // Make 3 requests (limit is 2)
    await rateLimitedHandler(req, res, context);
    await rateLimitedHandler(req, res, context);
    await rateLimitedHandler(req, res, context);

    // Third request should be blocked
    expect(res.status).toHaveBeenLastCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'RATE_LIMIT_EXCEEDED',
        }),
      })
    );
  });

  it('should set correct rate limit headers', async () => {
    const handler = jest.fn();
    const rateLimitedHandler = withRateLimit(RATE_LIMITS.PUBLIC)(handler);

    const req = createMockReq();
    const res = createMockRes();
    const context = createMockContext();

    await rateLimitedHandler(req, res, context);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
  });

  it('should use custom key generator', async () => {
    const handler = jest.fn();
    const keyGenerator = jest.fn().mockReturnValue('custom-key');
    const rateLimitedHandler = withRateLimit({
      maxRequests: 5,
      windowMs: 60000,
      keyGenerator,
    })(handler);

    const req = createMockReq();
    const res = createMockRes();
    const context = createMockContext();

    await rateLimitedHandler(req, res, context);

    expect(keyGenerator).toHaveBeenCalledWith(req);
  });
});

describe('CSRF Protection Middleware', () => {
  it('should allow GET requests without CSRF token', async () => {
    const handler = jest.fn();
    const csrfHandler = withCsrfProtection(handler);

    const req = createMockReq({ method: 'GET' });
    const res = createMockRes();
    const context = createMockContext();

    await csrfHandler(req, res, context);

    expect(handler).toHaveBeenCalled();
  });

  it('should block POST requests without CSRF token', async () => {
    const handler = jest.fn();
    const csrfHandler = withCsrfProtection(handler);

    const req = createMockReq({ method: 'POST' });
    const res = createMockRes();
    const context = createMockContext();

    await csrfHandler(req, res, context);

    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'CSRF_TOKEN_MISSING',
        }),
      })
    );
  });

  it('should allow POST requests with CSRF token', async () => {
    const handler = jest.fn();
    const csrfHandler = withCsrfProtection(handler);

    const req = createMockReq({
      method: 'POST',
      headers: { 'x-csrf-token': 'valid-token' },
    });
    const res = createMockRes();
    const context = createMockContext();

    await csrfHandler(req, res, context);

    expect(handler).toHaveBeenCalled();
  });

  it('should protect PUT, PATCH, and DELETE methods', async () => {
    const handler = jest.fn();
    const csrfHandler = withCsrfProtection(handler);

    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      const req = createMockReq({ method });
      const res = createMockRes();
      const context = createMockContext();

      jest.clearAllMocks();
      await csrfHandler(req, res, context);

      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    }
  });
});

describe('CSRF Token Generation', () => {
  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken('user-123');
    const token2 = generateCsrfToken('user-123');

    expect(token1).not.toBe(token2);
    expect(token1).toContain('user-123');
    expect(token2).toContain('user-123');
  });

  it('should handle anonymous users', () => {
    const token = generateCsrfToken();

    expect(token).toContain('anon');
  });
});

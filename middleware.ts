/**
 * Next.js Edge Middleware
 *
 * Runs on every request at the Edge (before page rendering)
 * Provides security headers, CSRF protection, and request validation
 *
 * IMPORTANT: This middleware runs before API routes and pages
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CSRF token validation (for state-changing operations)
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const CSRF_HEADER = 'x-csrf-token';

// Routes that require CSRF protection
const CSRF_PROTECTED_ROUTES = [
  '/api/user/delete-account',
  '/api/tastings',
  '/api/social',
  '/api/admin',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/privacy',
  '/terms',
  '/_next',
  '/api/auth',
  '/favicon.ico',
  '/logos',
  '/generated-images',
];

/**
 * Check if route requires CSRF protection
 */
function requiresCsrfProtection(pathname: string, method: string): boolean {
  if (!PROTECTED_METHODS.includes(method)) {
    return false;
  }

  return CSRF_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Validate CSRF token
 * Uses double-submit cookie pattern
 */
function validateCsrfToken(request: NextRequest): boolean {
  const csrfHeader = request.headers.get(CSRF_HEADER);
  const csrfCookie = request.cookies.get('csrf_token')?.value;

  // Both must be present and match
  if (!csrfHeader || !csrfCookie) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(csrfHeader, csrfCookie);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate CSRF token
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function middleware(request: NextRequest) {
  const { pathname, method } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Create response
  const response = NextResponse.next();

  // Additional security headers (complementing next.config.js)
  response.headers.set('X-Robots-Tag', 'index, follow');
  response.headers.set('X-Powered-By', 'Flavatix'); // Hide Next.js version

  // CSRF Protection for state-changing operations
  if (requiresCsrfProtection(pathname, method)) {
    const isValidCsrf = validateCsrfToken(request);

    if (!isValidCsrf) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'CSRF_VALIDATION_FAILED',
            message: 'CSRF token validation failed. Please refresh and try again.',
          },
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // Set CSRF token cookie if not present (for authenticated routes)
  if (!request.cookies.has('csrf_token') && !isPublicRoute(pathname)) {
    const csrfToken = generateCsrfToken();
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  }

  // Rate limiting headers for API routes
  if (pathname.startsWith('/api/')) {
    // These are informational - actual rate limiting happens in API middleware
    response.headers.set('X-RateLimit-Policy', 'See API documentation');
  }

  // Security logging for sensitive operations
  if (pathname.startsWith('/api/user/delete-account')) {
    console.log('[Security] Account deletion request', {
      method,
      pathname,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent'),
    });
  }

  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

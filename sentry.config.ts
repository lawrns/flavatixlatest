/**
 * Shared Sentry configuration
 * Used by both client and server configurations
 */

import type { BrowserOptions, NodeOptions } from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

export const getBaseConfig = (): Partial<BrowserOptions> | Partial<NodeOptions> => ({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',

  // Performance Monitoring
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.2 : 1.0,

  // Session Replay (client only, but config is shared)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enhanced error context
  attachStacktrace: true,

  // Normalize data
  normalizeDepth: 10,

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'atomicFindClose',
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    'conduitPage',
    // Network errors (client-side)
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // ResizeObserver (non-critical)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Filter before sending
  beforeSend(event, hint) {
    // Don't send events if no DSN configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Filter out 4xx client errors (except 401/403 which might indicate auth issues)
    if (event.request?.url) {
      const statusCode = event.contexts?.response?.status_code;
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403) {
        return null;
      }
    }

    // Filter out known development errors
    if (SENTRY_ENVIRONMENT === 'development') {
      // Only send critical errors in development
      if (event.level !== 'fatal' && event.level !== 'error') {
        return null;
      }
    }

    return event;
  },

  // Breadcrumbs configuration
  maxBreadcrumbs: 50,

  // Enable debug mode in development
  debug: SENTRY_ENVIRONMENT === 'development',
});

export const isSentryEnabled = (): boolean => {
  return !!SENTRY_DSN;
};

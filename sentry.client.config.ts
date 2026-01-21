/**
 * Sentry Client Configuration
 * This file configures Sentry for the browser/client-side
 */

import * as Sentry from '@sentry/nextjs';
import { getBaseConfig } from './sentry.config';

const clientConfig = getBaseConfig();

Sentry.init({
  ...clientConfig,

  // Browser-specific integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Additional browser context
  beforeSend(event, hint) {
    // Call base beforeSend
    const baseEvent = clientConfig.beforeSend?.(event, hint);
    if (!baseEvent) {return null;}

    // Add user context if available (from localStorage or state)
    if (typeof window !== 'undefined') {
      try {
        // Add viewport info
        event.contexts = {
          ...event.contexts,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          },
        };

        // Add performance info
        if (window.performance && (window.performance as any).memory) {
          event.contexts.memory = {
            jsHeapSizeLimit: (window.performance as any).memory.jsHeapSizeLimit,
            totalJSHeapSize: (window.performance as any).memory.totalJSHeapSize,
            usedJSHeapSize: (window.performance as any).memory.usedJSHeapSize,
          };
        }
      } catch (e) {
        // Ignore errors in context collection
      }
    }

    return baseEvent;
  },
});

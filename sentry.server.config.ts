/**
 * Sentry Server Configuration
 * This file configures Sentry for the server-side (API routes, SSR)
 */

import * as Sentry from '@sentry/nextjs';
import { getBaseConfig } from './sentry.config';

const serverConfig = getBaseConfig();

Sentry.init({
  ...serverConfig,

  // Server-specific integrations
  integrations: [
    // HTTP integration for tracking requests
    Sentry.httpIntegration(),
  ],

  // Additional server context
  beforeSend(event, hint) {
    // Call base beforeSend
    const baseEvent = serverConfig.beforeSend?.(event, hint);
    if (!baseEvent) return null;

    // Add server context
    try {
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: 'node',
          version: process.version,
        },
      };

      // Add memory usage
      const memUsage = process.memoryUsage();
      event.contexts.memory = {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      };
    } catch (e) {
      // Ignore errors in context collection
    }

    return baseEvent;
  },
});

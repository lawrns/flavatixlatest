import { useEffect, useState } from 'react';
import { logger } from '../../lib/logger';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const metrics: Partial<PerformanceMetrics> = {};

    // Measure page load time
    const loadTime = performance.now();
    metrics.loadTime = loadTime;

    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          metrics.largestContentfulPaint = entry.startTime;
        } else if (entry.entryType === 'first-input') {
          metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        } else if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            metrics.cumulativeLayoutShift =
              (metrics.cumulativeLayoutShift || 0) + (entry as any).value;
          }
        }
      }
    });

    // Observe all performance entry types
    try {
      observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'],
      });
    } catch (error) {
      logger.debug('Performance', 'Performance Observer not supported');
    }

    // Log metrics after page load
    const logMetrics = () => {
      // Format metric value with fallback for undefined
      const formatMetric = (value: number | undefined, suffix = 'ms'): string => {
        if (value === undefined || value === null) {
          return `N/A`;
        }
        return `${value.toFixed(2)}${suffix}`;
      };

      // CLS uses different formatting (no 'ms', 4 decimal places)
      const formatCLS = (value: number | undefined): string => {
        if (value === undefined || value === null) {
          return '0.0000 (no layout shifts detected)';
        }
        return value.toFixed(4);
      };

      logger.debug('Performance', '🚀 Performance Metrics');
      logger.debug('Performance', `Load Time: ${formatMetric(metrics.loadTime)}`);
      logger.debug('Performance', `First Contentful Paint: ${formatMetric(metrics.firstContentfulPaint)}`);
      logger.debug('Performance', `Largest Contentful Paint: ${formatMetric(metrics.largestContentfulPaint)}`);
      logger.debug('Performance', `First Input Delay: ${formatMetric(metrics.firstInputDelay)}`);
      logger.debug('Performance', `Cumulative Layout Shift: ${formatCLS(metrics.cumulativeLayoutShift)}`);
      logger.debug('Performance', `Time to Interactive: ${formatMetric(metrics.timeToInteractive)}`);
      logger.debug('Performance', `Total Blocking Time: ${formatMetric(metrics.totalBlockingTime)}`);

      // Send to analytics (if implemented)
      if (process.env.NODE_ENV === 'production') {
        // TODO(observability): Send Core Web Vitals to analytics service.
        // Options: 1) Vercel Analytics (already may be configured), 2) Custom endpoint,
        // 3) Sentry performance monitoring. Ensure LCP/FID/CLS thresholds are tracked.
        // Example: fetch('/api/analytics/vitals', { method: 'POST', body: JSON.stringify(metrics) })
      }
    };

    // Log metrics after a delay to ensure all metrics are collected
    setTimeout(logMetrics, 3000);

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceMonitor;

import { useEffect } from 'react';

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
      console.log('Performance Observer not supported:', error);
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

      console.group('🚀 Performance Metrics');
      console.log('Load Time:', formatMetric(metrics.loadTime));
      console.log('First Contentful Paint:', formatMetric(metrics.firstContentfulPaint));
      console.log('Largest Contentful Paint:', formatMetric(metrics.largestContentfulPaint));
      console.log('First Input Delay:', formatMetric(metrics.firstInputDelay));
      console.log('Cumulative Layout Shift:', formatCLS(metrics.cumulativeLayoutShift));
      console.groupEnd();

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

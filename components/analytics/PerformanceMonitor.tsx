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
    if (typeof window === 'undefined') return;

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
            metrics.cumulativeLayoutShift = (metrics.cumulativeLayoutShift || 0) + (entry as any).value;
          }
        }
      }
    });

    // Observe all performance entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.log('Performance Observer not supported:', error);
    }

    // Log metrics after page load
    const logMetrics = () => {
      console.group('🚀 Performance Metrics');
      console.log('Load Time:', `${metrics.loadTime?.toFixed(2)}ms`);
      console.log('First Contentful Paint:', `${metrics.firstContentfulPaint?.toFixed(2)}ms`);
      console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint?.toFixed(2)}ms`);
      console.log('First Input Delay:', `${metrics.firstInputDelay?.toFixed(2)}ms`);
      console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift?.toFixed(4));
      console.groupEnd();

      // Send to analytics (if implemented)
      if (process.env.NODE_ENV === 'production') {
        // TODO: Send metrics to analytics service
        // analytics.track('performance_metrics', metrics);
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

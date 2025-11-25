/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for measuring and reporting performance metrics.
 */

import { logger } from './logger';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface WebVitals {
  LCP?: number;  // Largest Contentful Paint
  FID?: number;  // First Input Delay
  CLS?: number;  // Cumulative Layout Shift
  FCP?: number;  // First Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number;  // Interaction to Next Paint
}

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
} as const;

// ============================================================================
// METRIC COLLECTION
// ============================================================================

let webVitals: WebVitals = {};
const metrics: PerformanceMetric[] = [];

/**
 * Report a Web Vital metric
 */
export function reportWebVital(name: keyof WebVitals, value: number): void {
  webVitals[name] = value;
  
  const threshold = PERFORMANCE_THRESHOLDS[name];
  const status = value <= threshold.good 
    ? 'good' 
    : value <= threshold.needsImprovement 
      ? 'needs-improvement' 
      : 'poor';
  
  logger.debug('Performance', `${name}: ${value.toFixed(2)}ms (${status})`);
  
  // In production, you might send this to an analytics service
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: send to analytics
    // analytics.track('web_vital', { name, value, status });
  }
}

/**
 * Record a custom performance metric
 */
export function recordMetric(name: string, value: number, unit: string = 'ms'): void {
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
  };
  
  metrics.push(metric);
  logger.debug('Performance', `${name}: ${value}${unit}`);
}

/**
 * Get all collected metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get Web Vitals
 */
export function getWebVitals(): WebVitals {
  return { ...webVitals };
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
  webVitals = {};
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Measure the execution time of a function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    recordMetric(`${name}_error`, duration);
    throw error;
  }
}

/**
 * Measure the execution time of a synchronous function
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    recordMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    recordMetric(`${name}_error`, duration);
    throw error;
  }
}

/**
 * Create a performance mark
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two marks
 */
export function measureBetweenMarks(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      const measure = performance.measure(name, startMark, endMark);
      recordMetric(name, measure.duration);
      return measure.duration;
    } catch (error) {
      logger.warn('Performance', `Failed to measure ${name}`, { error });
      return null;
    }
  }
  return null;
}

// ============================================================================
// COMPONENT PERFORMANCE
// ============================================================================

/**
 * Create a render time tracker for React components
 */
export function createRenderTracker(componentName: string) {
  let renderCount = 0;
  let totalRenderTime = 0;
  
  return {
    startRender: () => {
      mark(`${componentName}_render_start_${renderCount}`);
    },
    endRender: () => {
      mark(`${componentName}_render_end_${renderCount}`);
      const duration = measureBetweenMarks(
        `${componentName}_render_${renderCount}`,
        `${componentName}_render_start_${renderCount}`,
        `${componentName}_render_end_${renderCount}`
      );
      if (duration !== null) {
        totalRenderTime += duration;
        renderCount++;
      }
    },
    getStats: () => ({
      renderCount,
      totalRenderTime,
      averageRenderTime: renderCount > 0 ? totalRenderTime / renderCount : 0,
    }),
  };
}

// ============================================================================
// NETWORK PERFORMANCE
// ============================================================================

/**
 * Get network timing information
 */
export function getNetworkTiming(): {
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }
  return {};
}

/**
 * Get resource timing entries
 */
export function getResourceTimings(): PerformanceResourceTiming[] {
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }
  return [];
}

/**
 * Get slow resources (above threshold)
 */
export function getSlowResources(thresholdMs: number = 1000): PerformanceResourceTiming[] {
  return getResourceTimings().filter(
    resource => resource.duration > thresholdMs
  );
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize performance monitoring
 * Call this in _app.tsx
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Report navigation timing
  if (performance.timing) {
    const timing = performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    if (pageLoadTime > 0) {
      recordMetric('page_load_time', pageLoadTime);
    }
    if (domContentLoaded > 0) {
      recordMetric('dom_content_loaded', domContentLoaded);
    }
  }

  // Log network info
  const networkInfo = getNetworkTiming();
  if (networkInfo.effectiveType) {
    logger.debug('Performance', 'Network info', networkInfo);
  }
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Wait for page load
  if (document.readyState === 'complete') {
    initPerformanceMonitoring();
  } else {
    window.addEventListener('load', initPerformanceMonitoring);
  }
}

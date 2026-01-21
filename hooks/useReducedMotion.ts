/**
 * useReducedMotion Hook
 * 
 * Detects if the user prefers reduced motion.
 * Respects the prefers-reduced-motion media query.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to check if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') {return;}

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook that returns animation duration based on reduced motion preference
 * @param normalDuration - Duration in ms when motion is allowed
 * @param reducedDuration - Duration in ms when motion is reduced (default: 0)
 * @returns The appropriate duration
 */
export function useAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedDuration : normalDuration;
}

/**
 * Hook that returns animation config based on reduced motion preference
 * @param config - Animation configuration object
 * @returns Modified config respecting reduced motion
 */
export function useMotionConfig<T extends Record<string, unknown>>(
  config: T,
  reducedConfig?: Partial<T>
): T {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion && reducedConfig) {
    return { ...config, ...reducedConfig };
  }
  
  return config;
}

/**
 * Returns CSS transition string respecting reduced motion
 * @param property - CSS property to transition
 * @param duration - Duration in ms
 * @param easing - Easing function
 * @returns CSS transition string or 'none' if reduced motion
 */
export function useTransition(
  property: string = 'all',
  duration: number = 200,
  easing: string = 'ease-in-out'
): string {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return 'none';
  }
  
  return `${property} ${duration}ms ${easing}`;
}

export default useReducedMotion;

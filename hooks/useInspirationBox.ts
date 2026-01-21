'use client';

import { useState, useEffect, useRef } from 'react';

interface UseInspirationBoxOptions {
  threshold?: number; // Minimum whitespace required in pixels
  mobileThreshold?: number; // Different threshold for mobile
}

export const useInspirationBox = (options: UseInspirationBoxOptions = {}) => {
  const { threshold = 200, mobileThreshold = 120 } = options;
  const [shouldShow, setShouldShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkWhitespace = () => {
      if (!containerRef.current) {return;}

      const viewportHeight = window.innerHeight;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerBottom = containerRect.bottom;
      const whitespace = viewportHeight - containerBottom;

      const currentThreshold = isMobile ? mobileThreshold : threshold;
      setShouldShow(whitespace >= currentThreshold);
    };

    // Initial check
    checkWhitespace();

    // Set up observer to watch for changes
    if (containerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(() => {
            // Debounce the whitespace check
            setTimeout(checkWhitespace, 100);
          });
        },
        {
          root: null,
          threshold: 0,
          rootMargin: '0px'
        }
      );

      observerRef.current.observe(containerRef.current);
    }

    // Also check on resize and scroll
    const handleResize = () => setTimeout(checkWhitespace, 100);
    const handleScroll = () => setTimeout(checkWhitespace, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, mobileThreshold, isMobile]);

  return {
    shouldShow,
    containerRef,
    isMobile
  };
};

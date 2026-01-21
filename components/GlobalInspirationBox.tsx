'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with viewport calculations
const _InspirationBox = dynamic(() => import('./ui/inspiration-box'), {
  ssr: false,
  loading: () => null,
});

interface GlobalInspirationBoxProps {
  children: React.ReactNode;
}

// Simple whitespace detector that can be used in page components
export const usePageWhitespace = () => {
  const [hasWhitespace, setHasWhitespace] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkWhitespace = () => {
      if (!containerRef.current) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerBottom = containerRect.bottom;
      const whitespace = viewportHeight - containerBottom;

      // Check for genuine whitespace (not just short content)
      const threshold = isMobile ? 120 : 200;
      const hasEnoughWhitespace = whitespace >= threshold;

      // Exclude pages where content fills >70% of viewport
      const contentHeight = containerRect.height;
      const contentFillsViewport = contentHeight > viewportHeight * 0.7;

      setHasWhitespace(hasEnoughWhitespace && !contentFillsViewport);
    };

    // Check after a delay to ensure DOM is stable
    const timeoutId = setTimeout(checkWhitespace, 1000);

    // Re-check on resize and scroll
    const handleResize = () => setTimeout(checkWhitespace, 100);
    const handleScroll = () => setTimeout(checkWhitespace, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  return { hasWhitespace, containerRef };
};

const GlobalInspirationBox: React.FC<GlobalInspirationBoxProps> = ({ children }) => {
  // This is now a pass-through component - the actual logic should be in page components
  return <>{children}</>;
};

export default GlobalInspirationBox;

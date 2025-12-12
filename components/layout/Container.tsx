/**
 * Container Component
 * 
 * The single source of truth for content width and horizontal padding.
 * All pages should use this component to ensure consistent layout.
 * 
 * Sizes:
 * - 'sm': max-w-sm (384px) - Modals, narrow forms
 * - 'md': max-w-md (448px) - Mobile-first content (default for app pages)
 * - 'lg': max-w-lg (512px) - Slightly wider content
 * - 'xl': max-w-xl (576px) - Standard content width
 * - '2xl': max-w-2xl (672px) - Wide content
 * - '4xl': max-w-4xl (896px) - Very wide content
 * - '7xl': max-w-7xl (1280px) - Full-width layouts
 * - 'full': No max-width constraint
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';

interface ContainerProps {
  children: React.ReactNode;
  /** Container max-width. Default: 'md' (448px, mobile-first) */
  size?: ContainerSize;
  /** Horizontal padding. Default: true */
  padding?: boolean;
  /** Additional className */
  className?: string;
  /** HTML element to render. Default: 'div' */
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: 'max-w-sm',      // 384px
  md: 'max-w-md',      // 448px
  lg: 'max-w-lg',      // 512px
  xl: 'max-w-xl',      // 576px
  '2xl': 'max-w-2xl',  // 672px
  '4xl': 'max-w-4xl',  // 896px
  '7xl': 'max-w-7xl',  // 1280px
  full: 'max-w-full',
};

// Consistent padding: px-4 on mobile, px-6 on sm+
const PADDING_CLASSES = 'px-4 sm:px-6';

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'md',
  padding = true,
  className,
  as: Component = 'div',
}) => {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padding && PADDING_CLASSES,
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Container;

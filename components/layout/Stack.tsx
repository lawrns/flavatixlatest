/**
 * Stack Component
 * 
 * Vertical spacing utility for consistent gaps between elements.
 * Use this instead of ad-hoc space-y-* classes for consistency.
 */

import React from 'react';
import { cn } from '@/lib/utils';

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface StackProps {
  children: React.ReactNode;
  /** Gap between items. Default: 'md' */
  gap?: StackGap;
  /** Additional className */
  className?: string;
  /** HTML element to render. Default: 'div' */
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
}

const gapClasses: Record<StackGap, string> = {
  none: 'space-y-0',
  xs: 'space-y-1',   // 4px
  sm: 'space-y-2',   // 8px
  md: 'space-y-4',   // 16px
  lg: 'space-y-6',   // 24px
  xl: 'space-y-8',   // 32px
  '2xl': 'space-y-12', // 48px
};

export const Stack: React.FC<StackProps> = ({
  children,
  gap = 'md',
  className,
  as: Component = 'div',
}) => {
  return (
    <Component className={cn(gapClasses[gap], className)}>
      {children}
    </Component>
  );
};

export default Stack;

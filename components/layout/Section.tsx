/**
 * Section Component
 * 
 * Content section with optional title and consistent spacing.
 * Use for grouping related content within a page.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Additional className */
  className?: string;
  /** Title size variant */
  titleSize?: 'sm' | 'md' | 'lg';
}

const titleSizeClasses = {
  sm: 'text-base font-semibold',
  md: 'text-lg font-semibold',
  lg: 'text-xl font-bold',
};

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  className,
  titleSize = 'md',
}) => {
  return (
    <section className={cn('space-y-3', className)}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h2 className={cn(
              'text-gemini-text-dark dark:text-zinc-50',
              titleSizeClasses[titleSize]
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gemini-text-gray dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;

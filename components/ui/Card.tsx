import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'tasting' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'social';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Add animated gradient border */
  glowBorder?: boolean;
  /** Animation on mount */
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'md',
  glowBorder = false,
  animate = false,
  ...props
}) => {
  const baseClasses = cn(
    'rounded-2xl transition-all duration-300 ease-out',
    animate && 'animate-scale-in'
  );
  
  const variantClasses = {
    default: cn(
      'bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80',
      'shadow-sm dark:shadow-zinc-900/20'
    ),
    tasting: cn(
      'bg-gradient-to-br from-orange-50/80 to-white dark:from-zinc-800 dark:to-zinc-800/80',
      'border border-primary/10 dark:border-primary/20',
      'shadow-lg shadow-orange-500/5 dark:shadow-orange-500/10',
      'relative overflow-hidden',
      // Top accent bar
      'before:absolute before:inset-x-0 before:top-0 before:h-1',
      'before:bg-gradient-to-r before:from-primary before:via-orange-400 before:to-amber-400'
    ),
    elevated: cn(
      'bg-white dark:bg-zinc-800',
      'border border-zinc-100 dark:border-zinc-700',
      'shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/50'
    ),
    outlined: cn(
      'bg-transparent border-2 border-zinc-300 dark:border-zinc-600',
      'hover:border-primary/50'
    ),
    glass: cn(
      'bg-white/70 dark:bg-zinc-800/70',
      'backdrop-blur-xl backdrop-saturate-150',
      'border border-white/50 dark:border-zinc-700/50',
      'shadow-xl shadow-black/5'
    ),
    gradient: cn(
      'bg-gradient-to-br from-primary/5 via-white to-amber-50/50',
      'dark:from-primary/10 dark:via-zinc-800 dark:to-amber-900/10',
      'border border-primary/10 dark:border-primary/20',
      'shadow-lg shadow-primary/5'
    ),
    social: cn(
      'bg-white dark:bg-zinc-800',
      'border border-zinc-100 dark:border-zinc-700/50',
      'shadow-sm hover:shadow-md'
    ),
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
    xl: 'p-6 sm:p-8',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99]' 
    : '';
  
  const glowBorderClasses = glowBorder
    ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
    : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        glowBorderClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex items-start justify-between', className)} {...props}>
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700', className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };

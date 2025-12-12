import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'tasting' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'social' | 'gemini';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Add animated gradient border */
  glowBorder?: boolean;
  /** Animation on mount */
  animate?: boolean;
  /** Make card interactive (clickable) */
  interactive?: boolean;
  /** Accessible label for interactive cards */
  'aria-label'?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'md',
  glowBorder = false,
  animate = false,
  interactive = false,
  'aria-label': ariaLabel,
  onClick,
  ...props
}) => {
  const baseClasses = cn(
    'rounded-[22px] transition-all duration-300 ease-out',
    animate && 'animate-scale-in'
  );
  
  const variantClasses = {
    // Gemini-style default card - clean, minimal, soft gray background
    default: cn(
      'bg-gemini-card dark:bg-zinc-800/90',
      'shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
    ),
    // Gemini variant - explicit Gemini styling
    gemini: cn(
      'bg-gemini-card dark:bg-zinc-800/90',
      'shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
    ),
    tasting: cn(
      'bg-gemini-card dark:from-zinc-800 dark:to-zinc-800/80',
      'border border-primary/10 dark:border-primary/20',
      'shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
      'relative overflow-hidden',
      // Top accent bar
      'before:absolute before:inset-x-0 before:top-0 before:h-1',
      'before:bg-primary'
    ),
    elevated: cn(
      'bg-white dark:bg-zinc-800',
      'shadow-lg'
    ),
    outlined: cn(
      'bg-transparent border-2 border-gemini-border dark:border-zinc-600',
      'hover:border-primary/50'
    ),
    glass: cn(
      'bg-white/70 dark:bg-zinc-800/70',
      'backdrop-blur-xl backdrop-saturate-150',
      'border border-white/50 dark:border-zinc-700/50',
      'shadow-lg shadow-black/5'
    ),
    gradient: cn(
      'bg-gradient-to-br from-primary/5 via-white to-red-50/50',
      'dark:from-primary/10 dark:via-zinc-800 dark:to-red-900/10',
      'border border-primary/10 dark:border-primary/20',
      'shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
    ),
    social: cn(
      'bg-gemini-card dark:bg-zinc-800',
      'shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
    ),
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-md active:scale-[0.98] transition-transform' 
    : '';
  
  const interactiveClasses = interactive
    ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
    : '';
  
  const glowBorderClasses = glowBorder
    ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
    : '';

  // Handle keyboard navigation for interactive cards
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        glowBorderClasses,
        interactiveClasses,
        className
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={handleKeyDown}
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

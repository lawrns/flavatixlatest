import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'inset';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  'aria-label'?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'md',
  interactive = false,
  'aria-label': ariaLabel,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-pane transition-[transform,box-shadow,border-color] duration-150 ease-out';

  const variantClasses = {
    default: cn(
      'bg-bg-surface dark:bg-bg-surface/90',
      'border border-line dark:border-line',
      'shadow-sm'
    ),
    inset: cn(
      'bg-bg-inset dark:bg-bg-surface/80',
      'border border-line dark:border-line'
    ),
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const hoverClasses = hover && variant === 'default'
    ? 'hover:shadow-md active:scale-[0.98] transition-transform'
    : '';

  const interactiveClasses = interactive
    ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
    : '';

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
          <h3 className="text-h3 font-semibold text-fg dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-body-sm text-fg-muted dark:text-fg-subtle mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
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
    <div className={cn('mt-4 pt-4 border-t border-line dark:border-line', className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };

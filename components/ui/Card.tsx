import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'tasting' | 'elevated' | 'outlined';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  padding = 'md',
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 shadow-sm',
    tasting: 'bg-zinc-50 dark:bg-zinc-800/50 border border-primary/10 shadow-sm',
    elevated: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md',
    outlined: 'bg-transparent border-2 border-zinc-300 dark:border-zinc-600'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
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

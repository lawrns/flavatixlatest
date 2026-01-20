/**
 * EmptyState Component
 * 
 * Beautiful empty state displays for when lists/content is empty.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Icon name (Material Symbols) or emoji */
  icon?: string;
  /** Custom icon element */
  iconElement?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  iconElement,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'text-4xl mb-3',
      title: 'text-base',
      description: 'text-sm',
      iconSize: 'w-12 h-12',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'text-5xl mb-4',
      title: 'text-lg',
      description: 'text-base',
      iconSize: 'w-16 h-16',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'text-6xl mb-5',
      title: 'text-xl',
      description: 'text-base',
      iconSize: 'w-20 h-20',
    },
  };

  const sizes = sizeClasses[size];
  // Check if icon looks like an emoji (simple heuristic)
  const isEmoji = icon.length <= 4 && !/^[a-z_]+$/i.test(icon);

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        'animate-fade-in',
        className
      )}
    >
      {/* Icon/Illustration */}
      <div className={cn(
        'relative mb-4',
        sizes.iconSize
      )}>
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-300/20 rounded-full blur-xl" />
        
        {/* Icon container */}
        <div className={cn(
          'relative flex items-center justify-center',
          sizes.iconSize,
          'rounded-2xl',
          'bg-gradient-to-br from-primary/10 to-orange-100/50',
          'dark:from-primary/20 dark:to-orange-900/20',
          'border border-primary/10'
        )}>
          {iconElement ? (
            iconElement
          ) : isEmoji ? (
            <span className={sizes.icon}>{icon}</span>
          ) : (
            <span 
              className={cn(
                'material-symbols-outlined text-primary/70',
                size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-4xl' : 'text-5xl'
              )}
            >
              {icon}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-zinc-900 dark:text-white mb-2',
        sizes.title
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          'text-zinc-500 dark:text-zinc-400 max-w-xs mb-6',
          sizes.description
        )}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'px-6 py-2.5 rounded-xl font-semibold transition-[transform,box-shadow] duration-200',
                'hover:-translate-y-0.5 active:scale-[0.98]',
                action.variant === 'secondary'
                  ? 'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:border-primary/50'
                  : 'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-primary transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Preset empty states for common scenarios
 */
export const NoTastingsEmpty: React.FC<{ onStart?: () => void }> = ({ onStart }) => (
  <EmptyState
    icon="wine_bar"
    title="No tastings yet"
    description="Start your first tasting session to begin exploring flavors!"
    action={onStart ? { label: 'Start Tasting', onClick: onStart } : undefined}
  />
);

export const NoResultsEmpty: React.FC<{ query?: string }> = ({ query }) => (
  <EmptyState
    icon="search_off"
    title="No results found"
    description={query ? `We couldn't find anything matching "${query}"` : 'Try adjusting your search or filters'}
    size="sm"
  />
);

export const NoPostsEmpty: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon="nutrition"
    title="No posts yet"
    description="Be the first to share your tasting experience with the community!"
    action={onRefresh ? { label: 'Refresh', onClick: onRefresh, variant: 'secondary' } : undefined}
  />
);

export default EmptyState;

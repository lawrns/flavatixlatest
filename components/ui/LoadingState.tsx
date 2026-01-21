/**
 * LoadingState Component
 *
 * Unified loading state wrapper that provides consistent loading UX.
 * Supports multiple loading variants and respects reduced motion preferences.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  CardSkeleton,
  ListSkeleton,
  FormSkeleton,
  PageSkeleton,
  FeedSkeleton,
  TastingItemSkeleton,
  StatsSkeleton,
  DefaultLoadingSpinner,
} from '@/lib/dynamicImports';

// ============================================================================
// TYPES
// ============================================================================

type LoadingVariant =
  | 'spinner'
  | 'skeleton-card'
  | 'skeleton-list'
  | 'skeleton-form'
  | 'skeleton-page'
  | 'skeleton-feed'
  | 'skeleton-tasting'
  | 'skeleton-stats'
  | 'dots'
  | 'pulse'
  | 'none';

interface LoadingStateProps {
  /** Whether content is loading */
  isLoading: boolean;
  /** Loading variant to display */
  variant?: LoadingVariant;
  /** Children to render when not loading */
  children: React.ReactNode;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Minimum loading time in ms (prevents flash) */
  minLoadingTime?: number;
  /** Error state */
  error?: Error | string | null;
  /** Error component */
  errorComponent?: React.ReactNode;
  /** Empty state */
  isEmpty?: boolean;
  /** Empty component */
  emptyComponent?: React.ReactNode;
  /** Count for list/feed skeletons */
  skeletonCount?: number;
  /** Fields for form skeleton */
  formFields?: number;
  /** Accessible loading message */
  loadingMessage?: string;
  /** Delay before showing loading state (prevents flash for fast loads) */
  delay?: number;
}

// ============================================================================
// LOADING VARIANTS
// ============================================================================

const DotsLoader: React.FC<{ className?: string }> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full bg-primary',
            !prefersReducedMotion && 'animate-bounce'
          )}
          style={{
            animationDelay: prefersReducedMotion ? '0ms' : `${i * 150}ms`,
          }}
        />
      ))}
    </div>
  );
};

const PulseLoader: React.FC<{ className?: string }> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'w-12 h-12 rounded-full bg-primary/20',
          !prefersReducedMotion && 'animate-pulse'
        )}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  variant = 'spinner',
  children,
  loadingComponent,
  className,
  error,
  errorComponent,
  isEmpty,
  emptyComponent,
  skeletonCount = 3,
  formFields = 4,
  loadingMessage = 'Loading...',
}) => {
  const _prefersReducedMotion = useReducedMotion();

  // Error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          {typeof error === 'string' ? error : error.message || 'Something went wrong'}
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    // Custom loading component
    if (loadingComponent) {
      return (
        <div className={className} role="status" aria-label={loadingMessage}>
          {loadingComponent}
          <span className="sr-only">{loadingMessage}</span>
        </div>
      );
    }

    // Variant-based loading
    const LoadingContent = () => {
      switch (variant) {
        case 'skeleton-card':
          return <CardSkeleton />;
        case 'skeleton-list':
          return <ListSkeleton count={skeletonCount} />;
        case 'skeleton-form':
          return <FormSkeleton fields={formFields} />;
        case 'skeleton-page':
          return <PageSkeleton />;
        case 'skeleton-feed':
          return <FeedSkeleton count={skeletonCount} />;
        case 'skeleton-tasting':
          return <TastingItemSkeleton />;
        case 'skeleton-stats':
          return <StatsSkeleton count={skeletonCount} />;
        case 'dots':
          return <DotsLoader />;
        case 'pulse':
          return <PulseLoader />;
        case 'none':
          return null;
        case 'spinner':
        default:
          return <DefaultLoadingSpinner />;
      }
    };

    return (
      <div
        className={cn(
          variant === 'spinner' || variant === 'dots' || variant === 'pulse'
            ? 'flex items-center justify-center min-h-[200px]'
            : '',
          className
        )}
        role="status"
        aria-label={loadingMessage}
      >
        <LoadingContent />
        <span className="sr-only">{loadingMessage}</span>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">No items found</p>
      </div>
    );
  }

  // Content
  return <>{children}</>;
};

// ============================================================================
// INLINE LOADING
// ============================================================================

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin text-primary', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// ============================================================================
// BUTTON LOADING
// ============================================================================

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
}) => {
  if (isLoading) {
    return (
      <span className="flex items-center gap-2">
        <InlineLoading size="sm" />
        <span>{loadingText}</span>
      </span>
    );
  }

  return <>{children}</>;
};

export default LoadingState;

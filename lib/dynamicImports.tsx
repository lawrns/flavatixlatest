/**
 * Dynamic Import Utilities
 * 
 * Provides lazy loading wrappers for heavy components to improve initial load time.
 */

import React, { ComponentType } from 'react';
import dynamic from 'next/dynamic';

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

/**
 * Default loading component for dynamic imports
 */
export const DefaultLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

/**
 * Skeleton loading for cards
 */
export const CardSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-zinc-800 rounded-lg p-4">
    <div className="bg-zinc-200 dark:bg-zinc-700 rounded-lg h-48 w-full"></div>
    <div className="mt-4 space-y-3">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
    </div>
  </div>
);

/**
 * Skeleton loading for lists
 */
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-zinc-200 dark:bg-zinc-700 h-12 w-12 flex-shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton loading for forms
 */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-6 animate-pulse">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
      </div>
    ))}
    <div className="flex justify-end gap-3 pt-4">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
      <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-32"></div>
    </div>
  </div>
);

/**
 * Skeleton loading for page content
 */
export const PageSkeleton = () => (
  <div className="animate-pulse space-y-6 p-4">
    {/* Header */}
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
      <div className="space-y-2 flex-1">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-48"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32"></div>
      </div>
    </div>
    {/* Content */}
    <div className="space-y-4">
      <div className="h-40 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
        <div className="h-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton loading for social feed posts
 */
export const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white dark:bg-zinc-800 rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-32"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
          </div>
        </div>
        {/* Content */}
        <div className="space-y-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/5"></div>
        </div>
        {/* Image placeholder */}
        <div className="h-48 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
        {/* Actions */}
        <div className="flex gap-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton loading for tasting items
 */
export const TastingItemSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-zinc-800 rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-16"></div>
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-20"></div>
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-14"></div>
    </div>
  </div>
);

/**
 * Skeleton loading for stats/metrics
 */
export const StatsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white dark:bg-zinc-800 rounded-lg p-4 space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

// ============================================================================
// DYNAMIC COMPONENT IMPORTS
// ============================================================================

/**
 * Dynamically import FlavorWheel component (heavy SVG rendering)
 */
export const DynamicFlavorWheel = dynamic(
  () => import('@/components/quick-tasting/FlavorWheel'),
  {
    loading: () => <DefaultLoadingSpinner />,
    ssr: false, // Disable SSR for canvas/SVG heavy components
  }
);

/**
 * Dynamically import FlavorWheelListView
 */
export const DynamicFlavorWheelListView = dynamic(
  () => import('@/components/flavor-wheels/FlavorWheelListView'),
  {
    loading: () => <ListSkeleton count={5} />,
    ssr: true,
  }
);

/**
 * Dynamically import QuickTastingSession (large component)
 */
export const DynamicQuickTastingSession = dynamic(
  () => import('@/components/quick-tasting/QuickTastingSession'),
  {
    loading: () => <DefaultLoadingSpinner />,
    ssr: true,
  }
);

/**
 * Dynamically import CommentsModal
 */
export const DynamicCommentsModal = dynamic(
  () => import('@/components/social/CommentsModal'),
  {
    loading: () => <DefaultLoadingSpinner />,
    ssr: false,
  }
);

/**
 * Dynamically import EditTastingDashboard
 */
export const DynamicEditTastingDashboard = dynamic(
  () => import('@/components/quick-tasting/EditTastingDashboard').then(mod => mod.EditTastingDashboard),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
);

/**
 * Dynamically import CompetitionRanking
 */
export const DynamicCompetitionRanking = dynamic(
  () => import('@/components/quick-tasting/CompetitionRanking'),
  {
    loading: () => <ListSkeleton count={5} />,
    ssr: true,
  }
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a dynamic import with custom loading component
 */
export function createDynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: () => JSX.Element | null;
    ssr?: boolean;
  } = {}
) {
  return dynamic(importFn, {
    loading: options.loading ?? (() => <DefaultLoadingSpinner />),
    ssr: options.ssr ?? true,
  });
}

/**
 * Preload a dynamic component
 * Call this on hover or when you anticipate the user will need the component
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  // Trigger the import to start loading
  importFn().catch(() => {
    // Silently fail - component will load when actually needed
  });
}

// ============================================================================
// PRELOAD TRIGGERS
// ============================================================================

/**
 * Preload flavor wheel components when user hovers over flavor wheels link
 */
export function preloadFlavorWheelComponents(): void {
  preloadComponent(() => import('@/components/quick-tasting/FlavorWheel'));
  preloadComponent(() => import('@/components/flavor-wheels/FlavorWheelListView'));
}

/**
 * Preload tasting components when user starts a tasting
 */
export function preloadTastingComponents(): void {
  preloadComponent(() => import('@/components/quick-tasting/QuickTastingSession'));
  preloadComponent(() => import('@/components/quick-tasting/TastingItem'));
}

/**
 * Preload social components when user navigates to social
 */
export function preloadSocialComponents(): void {
  preloadComponent(() => import('@/components/social/CommentsModal'));
  preloadComponent(() => import('@/components/social/SocialFeedWidget'));
}

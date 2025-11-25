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
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
    <div className="mt-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
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

/**
 * React Query Client Configuration
 * 
 * SINGLE SOURCE OF TRUTH for React Query configuration.
 * Provides optimized defaults for caching, retries, and error handling.
 * 
 * Usage:
 *   // In _app.tsx
 *   import { queryClient, QueryProvider } from '@/lib/query/queryClient';
 *   
 *   <QueryProvider>
 *     <Component {...pageProps} />
 *   </QueryProvider>
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { logger } from '../logger';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const STALE_TIME = {
  /** Data that rarely changes (user profile, categories) */
  LONG: 1000 * 60 * 30, // 30 minutes
  /** Data that changes occasionally (tastings list) */
  MEDIUM: 1000 * 60 * 5, // 5 minutes
  /** Data that changes frequently (real-time features) */
  SHORT: 1000 * 60 * 1, // 1 minute
  /** Data that should always be fresh */
  NONE: 0,
} as const;

const CACHE_TIME = {
  /** Keep in cache for a long time */
  LONG: 1000 * 60 * 60, // 1 hour
  /** Standard cache time */
  MEDIUM: 1000 * 60 * 10, // 10 minutes
  /** Short cache time */
  SHORT: 1000 * 60 * 2, // 2 minutes
} as const;

/**
 * Create a new QueryClient with optimized defaults
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in development (annoying)
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        
        // Retry failed requests up to 3 times with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Default stale time (can be overridden per query)
        staleTime: STALE_TIME.MEDIUM,
        
        // Keep unused data in cache
        gcTime: CACHE_TIME.MEDIUM,
        
        // Don't refetch on mount if data is fresh
        refetchOnMount: 'always',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        
        // Log mutation errors
        onError: (error: any) => {
          logger.error('Query', 'Mutation failed', error);
        },
      },
    },
  });
}

// Singleton for server-side rendering
let browserQueryClient: QueryClient | undefined;

/**
 * Get or create the query client
 * Creates a new client on the server, reuses on the client
 */
export function getQueryClient(): QueryClient {
  // Server: always create a new client
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  
  // Browser: reuse existing client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  
  return browserQueryClient;
}

// ============================================================================
// QUERY PROVIDER COMPONENT
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider wrapper for _app.tsx
 * Handles client creation properly for SSR
 */
export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  // Create client once per component instance (handles SSR properly)
  const [queryClient] = useState(() => getQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Centralized query keys for cache management
 * Using factory pattern for type-safe, consistent keys
 */
export const queryKeys = {
  // Profile queries
  profile: {
    all: ['profile'] as const,
    byId: (userId: string) => ['profile', userId] as const,
    current: () => ['profile', 'current'] as const,
    stats: (userId: string) => ['profile', userId, 'stats'] as const,
  },
  
  // Tasting queries
  tastings: {
    all: ['tastings'] as const,
    lists: () => ['tastings', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['tastings', 'list', filters] as const,
    byId: (id: string) => ['tastings', id] as const,
    items: (tastingId: string) => ['tastings', tastingId, 'items'] as const,
    stats: (userId: string) => ['tastings', 'stats', userId] as const,
    recent: (userId: string, limit?: number) => ['tastings', 'recent', userId, limit] as const,
  },
  
  // Flavor wheel queries
  flavorWheels: {
    all: ['flavorWheels'] as const,
    byUser: (userId: string) => ['flavorWheels', 'user', userId] as const,
    byType: (type: string, scope: string) => ['flavorWheels', type, scope] as const,
    descriptors: (userId: string) => ['flavorWheels', 'descriptors', userId] as const,
  },
  
  // Study session queries
  study: {
    all: ['study'] as const,
    session: (id: string) => ['study', 'session', id] as const,
    items: (sessionId: string) => ['study', 'items', sessionId] as const,
    participants: (sessionId: string) => ['study', 'participants', sessionId] as const,
    responses: (sessionId: string) => ['study', 'responses', sessionId] as const,
  },
  
  // Review queries
  reviews: {
    all: ['reviews'] as const,
    list: (filters: Record<string, unknown>) => ['reviews', 'list', filters] as const,
    byId: (id: string) => ['reviews', id] as const,
    byUser: (userId: string) => ['reviews', 'user', userId] as const,
  },
  
  // Social queries
  social: {
    feed: (page?: number) => ['social', 'feed', page] as const,
    comments: (tastingId: string) => ['social', 'comments', tastingId] as const,
    likes: (tastingId: string) => ['social', 'likes', tastingId] as const,
    followers: (userId: string) => ['social', 'followers', userId] as const,
    following: (userId: string) => ['social', 'following', userId] as const,
  },
  
  // Category/taxonomy queries
  categories: {
    all: ['categories'] as const,
    taxonomy: (category: string) => ['categories', 'taxonomy', category] as const,
  },
} as const;

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate all queries matching a key prefix
 */
export function invalidateQueries(
  queryClient: QueryClient,
  ...keys: readonly unknown[]
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: keys });
}

/**
 * Prefetch a query (useful for hover prefetching)
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  staleTime: number = STALE_TIME.MEDIUM
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { STALE_TIME, CACHE_TIME };
export type { QueryProviderProps };

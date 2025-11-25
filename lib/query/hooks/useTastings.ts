/**
 * Tasting Query Hooks
 * 
 * React Query hooks for tasting data fetching and mutations.
 * Handles caching, pagination, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '../../supabase';
import { queryKeys, STALE_TIME } from '../queryClient';
import { logger } from '../../logger';
import { LIMITS } from '../../constants';
import type { Tasting, TastingItem, TastingCategory, TastingMode } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface TastingFilters {
  category?: TastingCategory | null;
  mode?: TastingMode | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  completed?: boolean | null;
}

export interface TastingListResult {
  tastings: Tasting[];
  total: number;
  hasMore: boolean;
}

export interface TastingStats {
  totalTastings: number;
  completedTastings: number;
  averageScore: number | null;
  categoryCounts: Record<string, number>;
  recentActivity: number; // tastings in last 30 days
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchTastings(
  userId: string,
  filters: TastingFilters = {},
  page: number = 1,
  pageSize: number = LIMITS.DEFAULT_PAGE_SIZE
): Promise<TastingListResult> {
  const supabase = getSupabaseClient() as any;
  
  let query = supabase
    .from('quick_tastings')
    .select('*, quick_tasting_items(count)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  
  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.mode) {
    query = query.eq('mode', filters.mode);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }
  if (filters.completed !== null && filters.completed !== undefined) {
    if (filters.completed) {
      query = query.not('completed_at', 'is', null);
    } else {
      query = query.is('completed_at', null);
    }
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    logger.error('Tastings', 'Failed to fetch tastings', error, { userId, filters });
    throw error;
  }
  
  const total = count || 0;
  
  return {
    tastings: data as Tasting[],
    total,
    hasMore: page * pageSize < total,
  };
}

async function fetchTastingById(id: string): Promise<Tasting & { items: TastingItem[] }> {
  const supabase = getSupabaseClient() as any;
  
  const { data, error } = await supabase
    .from('quick_tastings')
    .select(`
      *,
      quick_tasting_items(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    logger.error('Tastings', 'Failed to fetch tasting', error, { id });
    throw error;
  }
  
  return {
    ...data,
    items: data.quick_tasting_items || [],
  } as Tasting & { items: TastingItem[] };
}

async function fetchRecentTastings(
  userId: string,
  limit: number = 5
): Promise<Tasting[]> {
  const supabase = getSupabaseClient() as any;
  
  const { data, error } = await supabase
    .from('quick_tastings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    logger.error('Tastings', 'Failed to fetch recent tastings', error, { userId });
    throw error;
  }
  
  return data as Tasting[];
}

async function fetchTastingStats(userId: string): Promise<TastingStats> {
  const supabase = getSupabaseClient() as any;
  
  // Get all tastings for stats calculation
  const { data, error } = await supabase
    .from('quick_tastings')
    .select('id, category, completed_at, average_score, created_at')
    .eq('user_id', userId);
  
  if (error) {
    logger.error('Tastings', 'Failed to fetch tasting stats', error, { userId });
    throw error;
  }
  
  interface TastingRow {
    id: string;
    category: string;
    completed_at: string | null;
    average_score: number | null;
    created_at: string;
  }
  
  const tastings: TastingRow[] = data || [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Calculate stats
  const completedTastings = tastings.filter((t) => t.completed_at);
  const scores = completedTastings
    .map((t) => t.average_score)
    .filter((s): s is number => s !== null);
  
  const categoryCounts: Record<string, number> = {};
  tastings.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });
  
  const recentActivity = tastings.filter(
    (t) => new Date(t.created_at) >= thirtyDaysAgo
  ).length;
  
  return {
    totalTastings: tastings.length,
    completedTastings: completedTastings.length,
    averageScore: scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : null,
    categoryCounts,
    recentActivity,
  };
}

async function deleteTasting(id: string): Promise<void> {
  const supabase = getSupabaseClient() as any;
  
  const { error } = await supabase
    .from('quick_tastings')
    .delete()
    .eq('id', id);
  
  if (error) {
    logger.error('Tastings', 'Failed to delete tasting', error, { id });
    throw error;
  }
  
  logger.info('Tastings', 'Tasting deleted', { id });
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch paginated tastings with filters
 */
export function useTastings(
  userId: string | undefined,
  filters: TastingFilters = {},
  page: number = 1,
  pageSize: number = LIMITS.DEFAULT_PAGE_SIZE
) {
  return useQuery({
    queryKey: queryKeys.tastings.list({ userId, ...filters, page, pageSize }),
    queryFn: () => fetchTastings(userId!, filters, page, pageSize),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook to fetch infinite scrolling tastings
 */
export function useInfiniteTastings(
  userId: string | undefined,
  filters: TastingFilters = {},
  pageSize: number = LIMITS.DEFAULT_PAGE_SIZE
) {
  return useInfiniteQuery({
    queryKey: queryKeys.tastings.list({ userId, ...filters, infinite: true }),
    queryFn: ({ pageParam = 1 }) => fetchTastings(userId!, filters, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => 
      lastPage.hasMore ? allPages.length + 1 : undefined,
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook to fetch a single tasting with items
 */
export function useTasting(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tastings.byId(id || ''),
    queryFn: () => fetchTastingById(id!),
    enabled: !!id,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook to fetch recent tastings
 */
export function useRecentTastings(userId: string | undefined, limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.tastings.recent(userId || '', limit),
    queryFn: () => fetchRecentTastings(userId!, limit),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook to fetch tasting statistics
 */
export function useTastingStats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tastings.stats(userId || ''),
    queryFn: () => fetchTastingStats(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook to delete a tasting
 */
export function useDeleteTasting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTasting,
    
    onSuccess: (_, id) => {
      // Invalidate all tasting lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tastings.lists() });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.tastings.byId(id) });
      
      logger.debug('Tastings', 'Cache invalidated after delete');
    },
    
    onError: (error) => {
      logger.error('Tastings', 'Delete mutation failed', error);
    },
  });
}

/**
 * Hook to prefetch a tasting (for hover states)
 */
export function usePrefetchTasting() {
  const queryClient = useQueryClient();
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tastings.byId(id),
      queryFn: () => fetchTastingById(id),
      staleTime: STALE_TIME.SHORT,
    });
  };
}

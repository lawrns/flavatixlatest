/**
 * Profile Query Hooks
 * 
 * React Query hooks for profile data fetching and mutations.
 * Provides caching, automatic refetching, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../../supabase';
import { queryKeys, STALE_TIME } from '../queryClient';
import { logger } from '../../logger';
import type { Profile, ProfileUpdate } from '../../types';

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchCurrentProfile(): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    logger.error('Profile', 'Failed to fetch current profile', error);
    throw error;
  }
  
  return data as Profile;
}

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    logger.error('Profile', 'Failed to fetch profile', error, { userId });
    throw error;
  }
  
  return data as Profile;
}

async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await (supabase as any)
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    logger.error('Profile', 'Failed to update profile', error, { userId });
    throw error;
  }
  
  logger.info('Profile', 'Profile updated', { userId });
  return data as Profile;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch the current user's profile
 */
export function useCurrentProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: fetchCurrentProfile,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Hook to fetch a profile by user ID
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.byId(userId || ''),
    queryFn: () => fetchProfileById(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: ProfileUpdate }) =>
      updateProfile(userId, updates),
    
    onSuccess: (data, { userId }) => {
      // Update cache with new data
      queryClient.setQueryData(queryKeys.profile.byId(userId), data);
      queryClient.setQueryData(queryKeys.profile.current(), data);
      
      logger.debug('Profile', 'Cache updated after profile update');
    },
    
    onError: (error) => {
      logger.error('Profile', 'Profile update mutation failed', error);
    },
  });
}

/**
 * Hook to prefetch a profile (for hover states, etc.)
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient();
  
  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.profile.byId(userId),
      queryFn: () => fetchProfileById(userId),
      staleTime: STALE_TIME.LONG,
    });
  };
}

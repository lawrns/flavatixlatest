/**
 * Social Feed Query Hooks
 *
 * React Query hooks for social feed data fetching and mutations.
 * Handles infinite scrolling, optimistic updates, and real-time sync.
 */

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '../../supabase';
import { queryKeys, STALE_TIME } from '../queryClient';
import { logger } from '../../logger';

// ============================================================================
// TYPES
// ============================================================================

export interface TastingPost {
  id: string;
  user_id: string;
  category: string;
  session_name: string | null;
  notes: string | null;
  average_score: number | null;
  created_at: string;
  completed_at: string | null;
  total_items: number;
  completed_items: number;
  user: {
    user_id?: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  isFollowed: boolean;
  items: TastingItem[];
  photos: string[];
}

export interface TastingItem {
  id: string;
  item_name: string;
  photo_url?: string | null;
  overall_score?: number | null;
  notes?: string | null;
}

export interface FeedFilters {
  tab?: 'all' | 'following';
  category?: string;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchSocialFeed(
  userId: string,
  pageParam: number = 0,
  filters: FeedFilters = {},
  postsPerPage: number = 10
): Promise<{
  posts: TastingPost[];
  nextPage: number | undefined;
  hasMore: boolean;
}> {
  const supabase = getSupabaseClient();

  const offset = pageParam * postsPerPage;

  // Fetch completed tastings
  const { data: tastingsData, error: tastingsError } = await supabase
    .from('quick_tastings')
    .select('*')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .range(offset, offset + postsPerPage - 1);

  if (tastingsError) {
    logger.error('Feed', 'Failed to fetch tastings', tastingsError);
    throw tastingsError;
  }

  if (!tastingsData || tastingsData.length === 0) {
    return { posts: [], nextPage: undefined, hasMore: false };
  }

  // Fetch profiles
  const userIds = tastingsData.map((t: any) => t.user_id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, full_name, username, avatar_url')
    .in('user_id', userIds);

  // Fetch tasting items
  const tastingIds = tastingsData.map((t: any) => t.id);
  const { data: itemsData } = await supabase
    .from('quick_tasting_items')
    .select('id, tasting_id, item_name, photo_url, overall_score, notes')
    .in('tasting_id', tastingIds)
    .order('overall_score', { ascending: false });

  // Fetch social stats
  let likesData: any[] = [];
  let commentsData: any[] = [];
  let sharesData: any[] = [];
  let userLikes = new Set<string>();
  let userFollows = new Set<string>();

  try {
    const likesResult = await supabase
      .from('tasting_likes')
      .select('tasting_id, user_id')
      .in('tasting_id', tastingIds);
    likesData = likesResult.data || [];
  } catch (error) {
    logger.debug('Feed', 'Likes table not available');
  }

  try {
    const commentsResult = await supabase
      .from('tasting_comments')
      .select('tasting_id')
      .in('tasting_id', tastingIds);
    commentsData = commentsResult.data || [];
  } catch (error) {
    logger.debug('Feed', 'Comments table not available');
  }

  try {
    const sharesResult = await supabase
      .from('tasting_shares')
      .select('tasting_id')
      .in('tasting_id', tastingIds);
    sharesData = sharesResult.data || [];
  } catch (error) {
    logger.debug('Feed', 'Shares table not available');
  }

  // Fetch user-specific data
  try {
    const { data: userLikesData } = await supabase
      .from('tasting_likes')
      .select('tasting_id')
      .eq('user_id', userId)
      .in('tasting_id', tastingIds);
    userLikes = new Set((userLikesData || []).map((l: any) => l.tasting_id));
  } catch (error) {
    logger.debug('Feed', 'User likes query failed');
  }

  try {
    const { data: userFollowsData } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);
    userFollows = new Set((userFollowsData || []).map((f: any) => f.following_id));
  } catch (error) {
    logger.debug('Feed', 'User follows query failed');
  }

  // Transform data
  const posts: TastingPost[] = tastingsData.map((tasting: any) => {
    const likes = likesData.filter((l) => l.tasting_id === tasting.id);
    const comments = commentsData.filter((c) => c.tasting_id === tasting.id);
    const shares = sharesData.filter((s) => s.tasting_id === tasting.id);
    const postItems = (itemsData || []).filter((item: any) => item.tasting_id === tasting.id);
    const photos = postItems
      .map((item: any) => item.photo_url)
      .filter((url): url is string => url != null);

    return {
      id: tasting.id,
      user_id: tasting.user_id,
      category: tasting.category,
      session_name: tasting.session_name,
      notes: tasting.notes,
      average_score: tasting.average_score,
      created_at: tasting.created_at,
      completed_at: tasting.completed_at,
      total_items: tasting.total_items,
      completed_items: tasting.completed_items,
      user: (profilesData || []).find((p: any) => p.user_id === tasting.user_id) || {},
      stats: {
        likes: likes.length,
        comments: comments.length,
        shares: shares.length,
      },
      isLiked: userLikes.has(tasting.id),
      isFollowed: userFollows.has(tasting.user_id),
      items: postItems.map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        photo_url: item.photo_url,
        overall_score: item.overall_score,
        notes: item.notes,
      })),
      photos,
    };
  });

  const hasMore = tastingsData.length === postsPerPage;

  return {
    posts,
    nextPage: hasMore ? pageParam + 1 : undefined,
    hasMore,
  };
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch infinite scrolling social feed
 */
export function useInfiniteFeed(
  userId: string | undefined,
  filters: FeedFilters = {},
  postsPerPage: number = 10
) {
  return useInfiniteQuery({
    queryKey: queryKeys.social.feed(filters.tab === 'following' ? 1 : undefined),
    queryFn: ({ pageParam = 0 }) => fetchSocialFeed(userId!, pageParam, filters, postsPerPage),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook to like/unlike a tasting
 */
export function useLikeTasting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tastingId,
      userId,
      isLiking,
    }: {
      tastingId: string;
      userId: string;
      isLiking: boolean;
    }) => {
      const supabase = getSupabaseClient();

      if (isLiking) {
        const { error } = await (supabase as any)
          .from('tasting_likes')
          .insert({ user_id: userId, tasting_id: tastingId });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await (supabase as any)
          .from('tasting_likes')
          .delete()
          .eq('user_id', userId)
          .eq('tasting_id', tastingId);

        if (error) {
          throw error;
        }
      }
    },

    // Optimistic update
    onMutate: async ({ tastingId, isLiking }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.social.feed() });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKeys.social.feed());

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.social.feed(), (old: any) => {
        if (!old?.pages) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: TastingPost) =>
              post.id === tastingId
                ? {
                    ...post,
                    isLiked: isLiking,
                    stats: {
                      ...post.stats,
                      likes: isLiking ? post.stats.likes + 1 : Math.max(0, post.stats.likes - 1),
                    },
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },

    // On error, roll back
    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.social.feed(), context.previousData);
      }
      logger.error('Feed', 'Failed to toggle like', err);
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.social.feed() });
    },
  });
}

/**
 * Hook to follow/unfollow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      currentUserId,
      isFollowing,
    }: {
      targetUserId: string;
      currentUserId: string;
      isFollowing: boolean;
    }) => {
      const supabase = getSupabaseClient();

      if (isFollowing) {
        const { error } = await (supabase as any)
          .from('user_follows')
          .insert({ follower_id: currentUserId, following_id: targetUserId });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await (supabase as any)
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId);

        if (error) {
          throw error;
        }
      }
    },

    // Optimistic update
    onMutate: async ({ targetUserId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.social.feed() });

      const previousData = queryClient.getQueryData(queryKeys.social.feed());

      queryClient.setQueryData(queryKeys.social.feed(), (old: any) => {
        if (!old?.pages) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: TastingPost) =>
              post.user_id === targetUserId ? { ...post, isFollowed: isFollowing } : post
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.social.feed(), context.previousData);
      }
      logger.error('Feed', 'Failed to toggle follow', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.social.feed() });
    },
  });
}

/**
 * Hook to share a tasting
 */
export function useShareTasting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tastingId, userId }: { tastingId: string; userId: string }) => {
      const supabase = getSupabaseClient();

      const { error } = await (supabase as any)
        .from('tasting_shares')
        .insert({ user_id: userId, tasting_id: tastingId });

      if (error && !error.message?.includes('duplicate key')) {
        throw error;
      }
    },

    onMutate: async ({ tastingId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.social.feed() });

      const previousData = queryClient.getQueryData(queryKeys.social.feed());

      queryClient.setQueryData(queryKeys.social.feed(), (old: any) => {
        if (!old?.pages) {
          return old;
        }

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: TastingPost) =>
              post.id === tastingId
                ? {
                    ...post,
                    stats: {
                      ...post.stats,
                      shares: post.stats.shares + 1,
                    },
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.social.feed(), context.previousData);
      }
      logger.error('Feed', 'Failed to record share', err);
    },
  });
}

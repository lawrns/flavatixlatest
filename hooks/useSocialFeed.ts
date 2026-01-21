/**
 * useSocialFeed Hook
 * 
 * Manages social feed data fetching, filtering, and interactions.
 * Uses API client for social interactions (likes, follows) with optimistic updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';
import { logger } from '../lib/logger';
import { apiClient, ApiClientError } from '../lib/api/client';

// ============================================================================
// TYPES
// ============================================================================

export interface TastingItem {
  id: string;
  item_name: string;
  photo_url?: string;
  overall_score?: number;
  notes?: string;
}

export interface TastingPost {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  notes?: string;
  average_score?: number;
  created_at: string;
  completed_at?: string;
  total_items: number;
  completed_items: number;
  user: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  isFollowed: boolean;
  items?: TastingItem[];
  photos?: string[];
}

export type FeedTab = 'all' | 'following';

interface UseSocialFeedOptions {
  userId: string | undefined;
  postsPerPage?: number;
}

interface UseSocialFeedReturn {
  // State
  posts: TastingPost[];
  filteredPosts: TastingPost[];
  loadingPosts: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  activeTab: FeedTab;
  categoryFilter: string;
  expandedPosts: Set<string>;
  
  // Actions
  loadSocialFeed: (pageNum?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  handleLike: (postId: string) => Promise<void>;
  handleFollow: (targetUserId: string, targetUserName: string) => Promise<void>;
  handleShare: (postId: string) => Promise<void>;
  togglePostExpanded: (postId: string) => void;
  setActiveTab: (tab: FeedTab) => void;
  setCategoryFilter: (category: string) => void;
  
  // Helpers
  formatTimeAgo: (dateString: string) => string;
  getCategoryColor: (category: string) => string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_COLORS: Record<string, string> = {
  coffee: 'text-amber-600',
  wine: 'text-red-600',
  whiskey: 'text-orange-600',
  beer: 'text-yellow-600',
  spirits: 'text-purple-600',
  tea: 'text-green-600',
  chocolate: 'text-pink-600'
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useSocialFeed({
  userId,
  postsPerPage = 10,
}: UseSocialFeedOptions): UseSocialFeedReturn {
  const [posts, setPosts] = useState<TastingPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<TastingPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Filter posts based on active tab and category
  useEffect(() => {
    let filtered = [...posts];

    if (activeTab === 'following') {
      filtered = filtered.filter(post => post.isFollowed);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, categoryFilter]);

  const loadSocialFeed = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!userId) {return;}

    try {
      if (!append) {
        setLoadingPosts(true);
      } else {
        setLoadingMore(true);
      }

      const supabase = getSupabaseClient() as any;
      const offset = pageNum * postsPerPage;

      // OPTIMIZED: Single query to fetch tastings with related profiles and items
      // This replaces 3 separate queries (tastings, profiles, items) with 1
      const { data: tastingsWithRelations, error: tastingsError } = await supabase
        .from('quick_tastings')
        .select(`
          *,
          profiles:user_id(user_id, full_name, username, avatar_url),
          quick_tasting_items(id, tasting_id, item_name, photo_url, overall_score, notes)
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .range(offset, offset + postsPerPage - 1);

      if (tastingsError) {
        logger.error('SocialFeed', 'Error fetching tastings', tastingsError);
        throw tastingsError;
      }

      const tastingIds = (tastingsWithRelations as any[])?.map((t: any) => t.id) || [];
      const userIds = (tastingsWithRelations as any[])?.map((t: any) => t.user_id) || [];

      // Skip social queries if no tastings found
      if (tastingIds.length === 0) {
        setHasMore(false);
        if (!append) {
          setPosts([]);
        }
        setPage(pageNum);
        return;
      }

      // OPTIMIZED: Batch fetch all social data in parallel (3 queries instead of 5+)
      // Previously: separate queries for likes count, comments count, shares count, user likes, user follows
      // Now: 3 parallel queries that fetch all needed data
      const [likesResult, commentsResult, sharesResult, userFollowsResult] = await Promise.all([
        // Single query gets all likes for all tastings (includes user_id to check user's likes)
        supabase
          .from('tasting_likes')
          .select('tasting_id, user_id')
          .in('tasting_id', tastingIds),
        // Single query gets all comments for all tastings
        supabase
          .from('tasting_comments')
          .select('tasting_id')
          .in('tasting_id', tastingIds),
        // Single query gets all shares for all tastings
        supabase
          .from('tasting_shares')
          .select('tasting_id')
          .in('tasting_id', tastingIds),
        // Single query gets user's follows (only for users in current feed)
        supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId)
          .in('following_id', userIds)
      ]);

      const likesData = likesResult.data || [];
      const commentsData = commentsResult.data || [];
      const sharesData = sharesResult.data || [];

      // Extract user's likes from the likes data (no separate query needed)
      const userLikes = new Set<string>(
        likesData
          .filter((l: any) => l.user_id === userId)
          .map((l: any) => l.tasting_id)
      );

      const userFollows = new Set<string>(
        (userFollowsResult.data as any[])?.map((f: any) => f.following_id) || []
      );

      // Pre-compute counts for each tasting (O(n) instead of O(n*m))
      const likesCountMap = new Map<string, number>();
      const commentsCountMap = new Map<string, number>();
      const sharesCountMap = new Map<string, number>();

      for (const like of likesData) {
        likesCountMap.set(like.tasting_id, (likesCountMap.get(like.tasting_id) || 0) + 1);
      }
      for (const comment of commentsData) {
        commentsCountMap.set(comment.tasting_id, (commentsCountMap.get(comment.tasting_id) || 0) + 1);
      }
      for (const share of sharesData) {
        sharesCountMap.set(share.tasting_id, (sharesCountMap.get(share.tasting_id) || 0) + 1);
      }

      // Transform data using the pre-fetched relations
      const transformedPosts: TastingPost[] = (tastingsWithRelations as any[])?.map((tasting: any) => {
        // Profile is already embedded in the tasting from the join
        const profile = tasting.profiles;
        // Items are already embedded in the tasting from the join
        const postItems = tasting.quick_tasting_items || [];
        // Sort items by overall_score descending
        postItems.sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0));
        const photos = postItems.map((item: any) => item.photo_url).filter(Boolean) as string[];

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
          user: profile || {},
          stats: {
            likes: likesCountMap.get(tasting.id) || 0,
            comments: commentsCountMap.get(tasting.id) || 0,
            shares: sharesCountMap.get(tasting.id) || 0
          },
          isLiked: userLikes.has(tasting.id),
          isFollowed: userFollows.has(tasting.user_id),
          items: postItems.map((item: any) => ({
            id: item.id,
            item_name: item.item_name,
            photo_url: item.photo_url,
            overall_score: item.overall_score,
            notes: item.notes
          })),
          photos
        };
      }) || [];

      setHasMore(transformedPosts.length === postsPerPage);

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      setPage(pageNum);
    } catch (error) {
      logger.error('SocialFeed', 'Error loading social feed', error);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, [userId, postsPerPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) {return;}
    await loadSocialFeed(page + 1, true);
  }, [hasMore, loadingMore, page, loadSocialFeed]);

  const handleLike = useCallback(async (postId: string) => {
    if (!userId) {
      toast.error('Please sign in to like posts');
      return;
    }

    const isCurrentlyLiked = likedPosts.has(postId);
    const previousLikedPosts = new Set(likedPosts);
    const previousPosts = [...posts];

    // Optimistic update
    if (isCurrentlyLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, likes: Math.max(0, post.stats.likes - 1) }, isLiked: false }
          : post
      ));
    } else {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.add(postId);
        return newSet;
      });
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 }, isLiked: true }
          : post
      ));
    }

    try {
      // Use API client for like toggle
      const result = await apiClient.post<{ liked: boolean; like_count: number }>(
        '/api/social/likes',
        { tasting_id: postId }
      );

      // Update with actual count from server
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, likes: result.like_count }, isLiked: result.liked }
          : post
      ));

      if (result.liked) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }

      // Success toast only after operation completes
      if (!isCurrentlyLiked) {
        toast.success('Post liked!');
      }
    } catch (error) {
      // Rollback optimistic update on error
      setLikedPosts(previousLikedPosts);
      setPosts(previousPosts);

      if (error instanceof ApiClientError) {
        logger.error('SocialFeed', 'API error toggling like', error, { code: error.code, status: error.status });
      } else {
        logger.error('SocialFeed', 'Error toggling like', error);
      }
      toast.error('Failed to update like');
    }
  }, [userId, likedPosts, posts]);

  const handleFollow = useCallback(async (targetUserId: string, targetUserName: string) => {
    if (!userId) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (targetUserId === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    const post = posts.find(p => p.user_id === targetUserId);
    const isCurrentlyFollowing = post?.isFollowed || false;
    const previousPosts = [...posts];

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.user_id === targetUserId
        ? { ...p, isFollowed: !isCurrentlyFollowing }
        : p
    ));

    try {
      // Use API client for follow toggle
      const result = await apiClient.post<{ following: boolean; follower_count: number }>(
        '/api/social/follows',
        { following_id: targetUserId }
      );

      // Update with actual state from server
      setPosts(prev => prev.map(p =>
        p.user_id === targetUserId
          ? { ...p, isFollowed: result.following }
          : p
      ));

      // Success toast only after operation completes
      if (result.following) {
        toast.success(`Following ${targetUserName}`);
      } else {
        toast.success(`Unfollowed ${targetUserName}`);
      }
    } catch (error) {
      // Rollback optimistic update on error
      setPosts(previousPosts);

      if (error instanceof ApiClientError) {
        logger.error('SocialFeed', 'API error toggling follow', error, { code: error.code, status: error.status });
        if (error.code === 'FORBIDDEN') {
          toast.error('You cannot follow yourself');
          return;
        }
      } else {
        logger.error('SocialFeed', 'Error toggling follow', error);
      }
      toast.error('Failed to update follow');
    }
  }, [userId, posts]);

  const handleShare = useCallback(async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/tasting/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this tasting!',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }

      // Record share in database
      if (userId) {
        const supabase = getSupabaseClient() as any;
        try {
          await supabase
            .from('tasting_shares')
            .insert({ user_id: userId, tasting_id: postId });
        } catch (error) {
          logger.debug('SocialFeed', 'Shares table not available');
        }
      }
    } catch (error) {
      logger.error('SocialFeed', 'Error sharing', error);
    }
  }, [userId]);

  const togglePostExpanded = useCallback((postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {return 'Just now';}
    if (diffInHours < 24) {return `${diffInHours}h`;}
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {return `${diffInDays}d`;}
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  }, []);

  const getCategoryColor = useCallback((category: string): string => {
    return CATEGORY_COLORS[category.toLowerCase()] || 'text-primary';
  }, []);

  return {
    posts,
    filteredPosts,
    loadingPosts,
    loadingMore,
    hasMore,
    activeTab,
    categoryFilter,
    expandedPosts,
    loadSocialFeed,
    loadMore,
    handleLike,
    handleFollow,
    handleShare,
    togglePostExpanded,
    setActiveTab,
    setCategoryFilter,
    formatTimeAgo,
    getCategoryColor,
  };
}

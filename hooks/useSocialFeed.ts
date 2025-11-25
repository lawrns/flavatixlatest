/**
 * useSocialFeed Hook
 * 
 * Manages social feed data fetching, filtering, and interactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';
import { logger } from '../lib/logger';

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
    if (!userId) return;

    try {
      if (!append) {
        setLoadingPosts(true);
      } else {
        setLoadingMore(true);
      }
      
      const supabase = getSupabaseClient() as any;
      const offset = pageNum * postsPerPage;

      // Fetch completed tastings
      const { data: tastingsData, error: tastingsError } = await supabase
        .from('quick_tastings')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .range(offset, offset + postsPerPage - 1);

      if (tastingsError) {
        logger.error('SocialFeed', 'Error fetching tastings', tastingsError);
        throw tastingsError;
      }

      // Fetch profiles for users
      const userIds = (tastingsData as any[])?.map((t: any) => t.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      // Fetch tasting items
      const tastingIds = (tastingsData as any[])?.map((t: any) => t.id) || [];
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
        logger.debug('SocialFeed', 'Likes table not available');
      }

      try {
        const commentsResult = await supabase
          .from('tasting_comments')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        commentsData = commentsResult.data || [];
      } catch (error) {
        logger.debug('SocialFeed', 'Comments table not available');
      }

      try {
        const sharesResult = await supabase
          .from('tasting_shares')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        sharesData = sharesResult.data || [];
      } catch (error) {
        logger.debug('SocialFeed', 'Shares table not available');
      }

      // Fetch user's likes and follows
      if (userId) {
        try {
          const { data: userLikesData } = await supabase
            .from('tasting_likes')
            .select('tasting_id')
            .eq('user_id', userId)
            .in('tasting_id', tastingIds);
          userLikes = new Set((userLikesData as any[])?.map((l: any) => l.tasting_id) || []);
        } catch (error) {
          logger.debug('SocialFeed', 'User likes query failed');
        }

        try {
          const { data: userFollowsData } = await supabase
            .from('user_follows')
            .select('following_id')
            .eq('follower_id', userId);
          userFollows = new Set((userFollowsData as any[])?.map((f: any) => f.following_id) || []);
        } catch (error) {
          logger.debug('SocialFeed', 'User follows query failed');
        }
      }

      // Transform data
      const transformedPosts: TastingPost[] = (tastingsData as any[])?.map((tasting: any) => {
        const profile = (profilesData as any[])?.find((p: any) => p.user_id === tasting.user_id);
        const likes = likesData?.filter(l => l.tasting_id === tasting.id) || [];
        const comments = commentsData?.filter(c => c.tasting_id === tasting.id) || [];
        const shares = sharesData?.filter(s => s.tasting_id === tasting.id) || [];
        const postItems = (itemsData as any[])?.filter(item => item.tasting_id === tasting.id) || [];
        const photos = postItems.map(item => item.photo_url).filter(Boolean) as string[];

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
            likes: likes.length,
            comments: comments.length,
            shares: shares.length
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
    if (!hasMore || loadingMore) return;
    await loadSocialFeed(page + 1, true);
  }, [hasMore, loadingMore, page, loadSocialFeed]);

  const handleLike = useCallback(async (postId: string) => {
    if (!userId) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const supabase = getSupabaseClient() as any;
      const isCurrentlyLiked = likedPosts.has(postId);

      if (isCurrentlyLiked) {
        try {
          await supabase
            .from('tasting_likes')
            .delete()
            .eq('user_id', userId)
            .eq('tasting_id', postId);
        } catch (dbError) {
          logger.debug('SocialFeed', 'Likes table not available');
        }

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
        try {
          await supabase
            .from('tasting_likes')
            .insert({ user_id: userId, tasting_id: postId });
        } catch (dbError) {
          logger.debug('SocialFeed', 'Likes table not available');
        }

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

        toast.success('Post liked!');
      }
    } catch (error) {
      logger.error('SocialFeed', 'Error toggling like', error);
      toast.error('Failed to update like');
    }
  }, [userId, likedPosts]);

  const handleFollow = useCallback(async (targetUserId: string, targetUserName: string) => {
    if (!userId) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (targetUserId === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      const supabase = getSupabaseClient() as any;
      const post = posts.find(p => p.user_id === targetUserId);
      const isCurrentlyFollowing = post?.isFollowed || false;

      if (isCurrentlyFollowing) {
        try {
          await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', userId)
            .eq('following_id', targetUserId);
        } catch (dbError) {
          logger.debug('SocialFeed', 'Follows table not available');
        }

        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: false }
            : post
        ));

        toast.success(`Unfollowed ${targetUserName}`);
      } else {
        try {
          await supabase
            .from('user_follows')
            .insert({ follower_id: userId, following_id: targetUserId });
        } catch (dbError) {
          logger.debug('SocialFeed', 'Follows table not available');
        }

        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: true }
            : post
        ));

        toast.success(`Following ${targetUserName}`);
      }
    } catch (error) {
      logger.error('SocialFeed', 'Error toggling follow', error);
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

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
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

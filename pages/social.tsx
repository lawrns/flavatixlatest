import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../lib/supabase';
import { toast } from '../lib/toast';
import CommentsModal from '../components/social/CommentsModal';

type TastingItem = {
  id: string;
  item_name: string;
  photo_url?: string;
  overall_score?: number;
  notes?: string;
};

type TastingPost = {
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
};

export default function SocialPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<TastingPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<TastingPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const router = useRouter();

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      setPage(0);
      setHasMore(true);
      loadSocialFeed(0, false);
    }
  }, [user, loading, router]);

  // Filter posts based on active tab and category
  useEffect(() => {
    let filtered = [...posts];

    // Filter by tab (all or following)
    if (activeTab === 'following') {
      filtered = filtered.filter(post => post.isFollowed);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, categoryFilter]);

  const loadSocialFeed = async (pageNum: number = 0, append: boolean = false) => {
    if (!user?.id) return;

    try {
      if (!append) {
        setLoadingPosts(true);
      } else {
        setLoadingMore(true);
      }
      const supabase = getSupabaseClient();

      // First, let's just get completed tastings without joins to debug
      const offset = pageNum * POSTS_PER_PAGE;
      const { data: tastingsData, error: tastingsError } = await supabase
        .from('quick_tastings')
        .select('*')
        .not('completed_at', 'is', null) // Only completed tastings
        .order('completed_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (tastingsError) {
        console.error('Error fetching tastings:', tastingsError);
        throw tastingsError;
      }

      // Now get profiles for these users
      const userIds = (tastingsData as any[])?.map((t: any) => t.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Get social stats for each tasting (likes, comments, shares)
      const tastingIds = (tastingsData as any[])?.map((t: any) => t.id) || [];

      // Fetch tasting items with photos
      const { data: itemsData } = await supabase
        .from('quick_tasting_items')
        .select('id, tasting_id, item_name, photo_url, overall_score, notes')
        .in('tasting_id', tastingIds)
        .order('overall_score', { ascending: false });

      let likesData: any[] = [];
      let commentsData: any[] = [];
      let sharesData: any[] = [];
      let userLikes = new Set<string>();
      let userFollows = new Set<string>();

      try {
        // Get likes count for each tasting
        const likesResult = await supabase
          .from('tasting_likes')
          .select('tasting_id, user_id')
          .in('tasting_id', tastingIds);
        likesData = likesResult.data || [];
      } catch (error) {
        console.log('Likes table not available yet, using defaults');
      }

      try {
        // Get comments count for each tasting
        const commentsResult = await supabase
          .from('tasting_comments')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        commentsData = commentsResult.data || [];
      } catch (error) {
        console.log('Comments table not available yet, using defaults');
      }

      try {
        // Get shares count for each tasting
        const sharesResult = await supabase
          .from('tasting_shares')
          .select('tasting_id')
          .in('tasting_id', tastingIds);
        sharesData = sharesResult.data || [];
      } catch (error) {
        console.log('Shares table not available yet, using defaults');
      }

      if (user?.id) {
        try {
          const { data: userLikesData } = await supabase
            .from('tasting_likes')
            .select('tasting_id')
            .eq('user_id', user.id)
            .in('tasting_id', tastingIds);
          userLikes = new Set((userLikesData as any[])?.map((l: any) => l.tasting_id) || []);
        } catch (error) {
          console.log('User likes query failed, using defaults');
        }

        try {
          const { data: userFollowsData } = await supabase
            .from('user_follows')
            .select('following_id')
            .eq('follower_id', user.id);
          userFollows = new Set((userFollowsData as any[])?.map((f: any) => f.following_id) || []);
        } catch (error) {
          console.log('User follows query failed, using defaults');
        }
      }

      // Combine the data
      const data = (tastingsData as any[])?.map((tasting: any) => ({
        ...tasting,
        profiles: (profilesData as any[])?.find((p: any) => p.user_id === tasting.user_id)
      }));

      // Transform the data to match our interface
      const transformedPosts: TastingPost[] = (data as any[])?.map(post => {
        const likes = likesData?.filter(l => l.tasting_id === post.id) || [];
        const comments = commentsData?.filter(c => c.tasting_id === post.id) || [];
        const shares = sharesData?.filter(s => s.tasting_id === post.id) || [];

        // Get items for this tasting
        const postItems = (itemsData as any[])?.filter(item => item.tasting_id === post.id) || [];

        // Extract photos
        const photos = postItems
          .map(item => item.photo_url)
          .filter(url => url != null) as string[];

        return {
          id: post.id,
          user_id: post.user_id,
          category: post.category,
          session_name: post.session_name,
          notes: post.notes,
          average_score: post.average_score,
          created_at: post.created_at,
          completed_at: post.completed_at,
          total_items: post.total_items,
          completed_items: post.completed_items,
          user: Array.isArray(post.profiles) ? post.profiles[0] || {} : post.profiles || {},
          stats: {
            likes: likes.length,
            comments: comments.length,
            shares: shares.length
          },
          isLiked: userLikes.has(post.id),
          isFollowed: userFollows.has(post.user_id),
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

      // Check if there are more posts
      setHasMore(transformedPosts.length === POSTS_PER_PAGE);

      // Append or replace posts
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error loading social feed:', error);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      coffee: 'text-amber-600',
      wine: 'text-red-600',
      whiskey: 'text-orange-600',
      beer: 'text-yellow-600',
      spirits: 'text-purple-600',
      tea: 'text-green-600',
      chocolate: 'text-pink-600'
    };
    return colors[category.toLowerCase()] || 'text-primary';
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const isCurrentlyLiked = likedPosts.has(postId);

      if (isCurrentlyLiked) {
        // Unlike
        try {
          const { error } = await (supabase as any)
            .from('tasting_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('tasting_id', postId);

          if (error) throw error;
        } catch (dbError) {
          console.log('Likes table not available, using local state only');
        }

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        // Update post stats
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, stats: { ...post.stats, likes: Math.max(0, post.stats.likes - 1) }, isLiked: false }
            : post
        ));
      } else {
        // Like
        try {
          const { error } = await (supabase as any)
            .from('tasting_likes')
            .insert({
              user_id: user.id,
              tasting_id: postId
            });

          if (error) throw error;
        } catch (dbError) {
          console.log('Likes table not available, using local state only');
        }

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });

        // Update post stats
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 }, isLiked: true }
            : post
        ));

        toast.success('Post liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleFollow = async (targetUserId: string, targetUserName: string) => {
    if (!user?.id) {
      toast.error('Please sign in to follow users');
      return;
    }

    if (targetUserId === user.id) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const post = posts.find(p => p.user_id === targetUserId);
      const isCurrentlyFollowing = post?.isFollowed || false;

      if (isCurrentlyFollowing) {
        // Unfollow
        try {
          const { error } = await (supabase as any)
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);

          if (error) throw error;
        } catch (dbError) {
          console.log('Follows table not available, using local state only');
        }

        // Update post
        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: false }
            : post
        ));

        toast.success(`Unfollowed ${targetUserName}`);
      } else {
        // Follow
        try {
          const { error } = await (supabase as any)
            .from('user_follows')
            .insert({
              follower_id: user.id,
              following_id: targetUserId
            });

          if (error) throw error;
        } catch (dbError) {
          console.log('Follows table not available, using local state only');
        }

        // Update post
        setPosts(prev => prev.map(post =>
          post.user_id === targetUserId
            ? { ...post, isFollowed: true }
            : post
        ));

        toast.success(`Following ${targetUserName}!`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleComment = (postId: string) => {
    setActivePostId(postId);
    setCommentsModalOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsModalOpen(false);
    setActivePostId(null);
    // Reload feed to update comment counts
    loadSocialFeed(0, false);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSocialFeed(nextPage, true);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingPosts) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loadingMore, loadingPosts, page]);

  const handleShare = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to share posts');
      return;
    }

    try {
      const supabase = getSupabaseClient();

      // Record the share in database (if table exists)
      try {
        const { error } = await (supabase as any)
          .from('tasting_shares')
          .insert({
            user_id: user.id,
            tasting_id: postId
          });

        if (error && !error.message.includes('duplicate key')) {
          throw error;
        }
      } catch (dbError) {
        console.log('Shares table not available, skipping database record');
      }

      // Update post stats
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, stats: { ...post.stats, shares: post.stats.shares + 1 } }
          : post
      ));

      // Use Web Share API or clipboard
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this tasting!',
          text: 'I found an interesting tasting session',
          url: `${window.location.origin}/social`
        });
        toast.success('Post shared!');
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/social`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share post');
    }
  };

  // Skeleton Loading Component
  const SkeletonPost = () => (
    <div className="bg-white p-4 animate-pulse">
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-12 h-12 bg-zinc-200 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-zinc-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-zinc-200 rounded w-1/4" />
        </div>
      </div>
      <div className="h-3 bg-zinc-200 rounded w-1/6 mb-3" />
      <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2" />
      <div className="h-3 bg-zinc-200 rounded w-full mb-2" />
      <div className="h-3 bg-zinc-200 rounded w-4/5 mb-3" />
      <div className="h-48 bg-zinc-200 rounded-xl mb-3" />
      <div className="flex gap-4 pt-2 border-t border-zinc-100">
        <div className="h-8 bg-zinc-200 rounded flex-1" />
        <div className="h-8 bg-zinc-200 rounded flex-1" />
        <div className="h-8 bg-zinc-200 rounded flex-1" />
      </div>
    </div>
  );

  if (loading || loadingPosts) {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 min-h-screen pb-20">
        <div className="flex h-screen flex-col">
          <header className="border-b border-zinc-200 bg-background-light p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
              <div className="h-6 bg-zinc-200 rounded w-32 animate-pulse" />
              <div className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto divide-y divide-zinc-200">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </main>
        </div>
      </div>
    );
  }

  const categories = ['all', 'coffee', 'wine', 'beer', 'spirits', 'tea', 'chocolate'];

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 min-h-screen pb-20">
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-background-light sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Social Feed</h1>
            <button
              onClick={() => router.push('/quick-tasting')}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-zinc-100"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              For You
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Following
            </button>
          </div>

          {/* Category Filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 p-3 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    categoryFilter === cat
                      ? 'bg-primary text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="divide-y divide-zinc-200">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mb-4">
                  <span className="material-symbols-outlined text-6xl text-orange-500">local_bar</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No tastings yet</h3>
                <p className="text-zinc-600 mb-4">
                  Be the first to share your tasting experience!
                </p>
                <button
                  onClick={() => router.push('/quick-tasting')}
                  className="btn-primary"
                >
                  Start Tasting
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="bg-white p-4 hover:bg-zinc-50 transition-colors">
                  {/* User Header */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {post.user.avatar_url ? (
                        <img
                          src={post.user.avatar_url}
                          alt={`${post.user.full_name || 'User'}'s avatar`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (post.user.full_name || 'U')[0].toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-zinc-900 truncate">
                            {post.user.full_name || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {formatTimeAgo(post.completed_at || post.created_at)}
                          </p>
                        </div>
                        {user?.id !== post.user_id && (
                          <button
                            onClick={() => handleFollow(post.user_id, post.user.full_name || 'User')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                              post.isFollowed
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {post.isFollowed ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(post.category)} bg-opacity-10`}
                      style={{ backgroundColor: `${getCategoryColor(post.category).replace('text-', '')}15` }}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* Session Name */}
                  {post.session_name && (
                    <h3 className="font-bold text-lg text-zinc-900 mb-2">
                      {post.session_name}
                    </h3>
                  )}

                  {/* Notes */}
                  {post.notes && (
                    <p className="text-zinc-700 mb-3 leading-relaxed">
                      {post.notes}
                    </p>
                  )}

                  {/* Photo Grid */}
                  {post.photos && post.photos.length > 0 && (
                    <div className={`mb-3 rounded-xl overflow-hidden ${
                      post.photos.length === 1 ? '' :
                      post.photos.length === 2 ? 'grid grid-cols-2 gap-1' :
                      post.photos.length === 3 ? 'grid grid-cols-3 gap-1' :
                      'grid grid-cols-2 gap-1'
                    }`}>
                      {post.photos.slice(0, 4).map((photo, idx) => (
                        <div key={idx} className="relative aspect-square bg-zinc-100">
                          <img
                            src={photo}
                            alt={`Tasting photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 3 && post.photos && post.photos.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">
                                +{post.photos.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Items Preview */}
                  {post.items && post.items.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedPosts);
                          if (newExpanded.has(post.id)) {
                            newExpanded.delete(post.id);
                          } else {
                            newExpanded.add(post.id);
                          }
                          setExpandedPosts(newExpanded);
                        }}
                        className="flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-primary transition-colors mb-2"
                      >
                        <span className="material-symbols-outlined text-base">
                          {expandedPosts.has(post.id) ? 'expand_less' : 'expand_more'}
                        </span>
                        {post.total_items} items tasted
                        {post.average_score && (
                          <span className="text-zinc-500 font-normal">
                            • Avg: {post.average_score.toFixed(0)}/100
                          </span>
                        )}
                      </button>

                      {expandedPosts.has(post.id) && (
                        <div className="space-y-2 pl-6">
                          {post.items.slice(0, 5).map((item, idx) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-zinc-400">{idx + 1}.</span>
                                <span className="text-zinc-900 truncate">{item.item_name}</span>
                              </div>
                              {item.overall_score && (
                                <span className={`font-semibold ml-2 ${
                                  item.overall_score >= 80 ? 'text-green-600' :
                                  item.overall_score >= 60 ? 'text-yellow-600' :
                                  'text-orange-600'
                                }`}>
                                  {item.overall_score}/100
                                </span>
                              )}
                            </div>
                          ))}
                          {post.items.length > 5 && (
                            <p className="text-xs text-zinc-500 pl-5">
                              +{post.items.length - 5} more items
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex items-center gap-4 text-sm text-zinc-500 py-2 border-t border-zinc-100">
                    <span>{post.stats.likes} likes</span>
                    <span>•</span>
                    <span>{post.stats.comments} comments</span>
                  </div>

                  {/* Engagement Buttons */}
                  <div className="flex justify-around border-t border-zinc-100 pt-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 transition-colors ${
                        post.isLiked ? 'text-red-500' : 'text-zinc-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {post.isLiked ? 'favorite' : 'favorite_border'}
                      </span>
                      <span className="text-sm font-medium">Like</span>
                    </button>
                    <button
                      onClick={() => handleComment(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 transition-colors text-zinc-600"
                    >
                      <span className="material-symbols-outlined text-xl">mode_comment</span>
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 transition-colors text-zinc-600"
                    >
                      <span className="material-symbols-outlined text-xl">share</span>
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Infinite Scroll Sentinel */}
            {!loadingPosts && filteredPosts.length > 0 && (
              <div id="scroll-sentinel" className="h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
                {!hasMore && !loadingMore && (
                  <p className="text-sm text-zinc-400">You've reached the end!</p>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-background-light">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/dashboard">
              <span className="material-symbols-outlined">home</span>
              <span className="text-xs font-medium">Home</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/taste">
              <span className="material-symbols-outlined">restaurant</span>
              <span className="text-xs font-medium">Taste</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/review">
              <span className="material-symbols-outlined">reviews</span>
              <span className="text-xs font-medium">Review</span>
            </a>
            <a className="flex flex-col items-center gap-1 p-2 text-zinc-500" href="/flavor-wheels">
              <span className="material-symbols-outlined">donut_small</span>
              <span className="text-xs font-medium">Wheels</span>
            </a>
          </nav>
        </footer>
      </div>

      {/* Comments Modal */}
      {activePostId && (
        <CommentsModal
          tastingId={activePostId}
          isOpen={commentsModalOpen}
          onClose={handleCloseComments}
          initialCommentCount={posts.find(p => p.id === activePostId)?.stats.comments || 0}
        />
      )}
    </div>
  );
}

// Disable static generation for this page
export async function getServerSideProps() {
  return { props: {} };
}

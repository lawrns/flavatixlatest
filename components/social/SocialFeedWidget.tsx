import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '../../lib/supabase';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

type TastingPost = {
  id: string;
  user_id: string;
  category: string;
  session_name?: string;
  average_score?: number;
  created_at: string;
  total_items: number;
  user: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  stats: {
    likes: number;
    comments: number;
  };
  isLiked: boolean;
  photos?: string[];
};

interface SocialFeedWidgetProps {
  userId: string;
  limit?: number;
}

export default function SocialFeedWidget({ userId, limit = 5 }: SocialFeedWidgetProps) {
  const [posts, setPosts] = useState<TastingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRecentPosts();
  }, [userId]);

  const loadRecentPosts = async () => {
    try {
      const supabase = getSupabaseClient();

      // Get recent completed tastings with user info
      const { data: tastings, error } = await supabase
        .from('quick_tastings')
        .select(`
          id,
          user_id,
          category,
          session_name,
          average_score,
          created_at,
          completed_at,
          total_items,
          completed_items,
          profiles!inner (
            full_name,
            username,
            avatar_url
          )
        `)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch stats for each tasting
      const postsWithStats = await Promise.all(
        (tastings || []).map(async (tasting: any) => {
          const [likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from('tasting_likes').select('id', { count: 'exact' }).eq('tasting_id', tasting.id),
            supabase.from('tasting_comments').select('id', { count: 'exact' }).eq('tasting_id', tasting.id),
            supabase.from('tasting_likes').select('id').eq('tasting_id', tasting.id).eq('user_id', userId).maybeSingle()
          ]);

          // Get first photo from items
          const { data: items }: { data: { photo_url: string }[] | null } = await supabase
            .from('quick_tasting_items')
            .select('photo_url')
            .eq('tasting_id', tasting.id)
            .not('photo_url', 'is', null)
            .limit(1);

          return {
            id: tasting.id,
            user_id: tasting.user_id,
            category: tasting.category,
            session_name: tasting.session_name,
            average_score: tasting.average_score,
            created_at: tasting.created_at,
            total_items: tasting.total_items,
            user: Array.isArray(tasting.profiles)
              ? tasting.profiles[0]
              : tasting.profiles,
            stats: {
              likes: likesResult.count || 0,
              comments: commentsResult.count || 0,
            },
            isLiked: !!userLikeResult.data,
            photos: items && items.length > 0 ? items.map(i => i.photo_url).filter(Boolean) : [],
          };
        })
      );

      setPosts(postsWithStats);
    } catch (error) {
      console.error('Error loading social feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = getSupabaseClient();
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    try {
      if (post.isLiked) {
        await (supabase as any)
          .from('tasting_likes')
          .delete()
          .eq('tasting_id', postId)
          .eq('user_id', userId);

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: false, stats: { ...p.stats, likes: p.stats.likes - 1 } }
            : p
        ));
      } else {
        await (supabase as any)
          .from('tasting_likes')
          .insert({ tasting_id: postId, user_id: userId });

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: true, stats: { ...p.stats, likes: p.stats.likes + 1 } }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Recent Activity</h3>
          <LoadingSpinner text="Loading recent activity..." />
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm mb-4">No recent activity yet</p>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => router.push('/taste')}
            >
              Start Your First Tasting
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent Activity</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/social')}
          >
            View All
          </Button>
        </div>

      <div className="space-y-3">
        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => router.push('/social')}
            className="bg-zinc-50 dark:bg-zinc-700 p-3 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {post.user.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                    {(post.user.full_name || post.user.username || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50 text-sm truncate">
                    {post.user.full_name || post.user.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-200 truncate">
                  {post.session_name || `${post.category} tasting`} • {post.total_items} items
                  {post.average_score && ` • ${post.average_score.toFixed(1)}⭐`}
                </p>
              </div>

              {/* Photo thumbnail */}
              {post.photos && post.photos.length > 0 && (
                <img
                  src={post.photos[0]}
                  alt="Tasting"
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 ml-10">
              <button
                onClick={(e) => handleLike(post.id, e)}
                className={`flex items-center gap-1 touch-manipulation min-h-[44px] min-w-[44px] justify-center ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
                aria-label={`${post.isLiked ? 'Unlike' : 'Like'} this tasting`}
              >
                <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                <span className="ml-1">{post.stats.likes}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement comments
                }}
                className="flex items-center gap-1 hover:text-primary transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
                aria-label="View comments"
              >
                <MessageCircle size={16} />
                <span className="ml-1">{post.stats.comments}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement sharing
                }}
                className="flex items-center gap-1 hover:text-primary transition-colors touch-manipulation min-h-[44px] min-w-[44px] justify-center"
                aria-label="Share this tasting"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

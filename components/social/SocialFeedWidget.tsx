import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getSupabaseClient } from '../../lib/supabase';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import notificationService from '@/lib/notificationService';

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

const SocialFeedWidget = React.memo(
  function SocialFeedWidget({ userId, limit = 5 }: SocialFeedWidgetProps) {
    const [posts, setPosts] = useState<TastingPost[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadRecentPosts = useCallback(async () => {
      try {
        const supabase = getSupabaseClient();

        // Get recent completed tastings WITHOUT profile join to avoid Supabase PostgREST issues
        const { data: tastings, error } = await supabase
          .from('quick_tastings')
          .select(
            `
          id,
          user_id,
          category,
          session_name,
          average_score,
          created_at,
          completed_at,
          total_items,
          completed_items
        `
          )
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw error;
        }
        if (!tastings || tastings.length === 0) {
          setPosts([]);
          return;
        }

        // Extract all tasting IDs and user IDs for batch queries
        const tastingIds = tastings.map((t: any) => t.id);
        const userIds = Array.from(new Set(tastings.map((t: any) => t.user_id)));

        // Fetch all stats AND profiles in parallel with aggregated queries (no N+1)
        const [likesData, commentsData, userLikesData, photosData, profilesData] =
          await Promise.all([
            // Get all likes counts in one query
            supabase
              .from('tasting_likes')
              .select('tasting_id', { count: 'exact' })
              .in('tasting_id', tastingIds),

            // Get all comments counts in one query
            supabase
              .from('tasting_comments')
              .select('tasting_id', { count: 'exact' })
              .in('tasting_id', tastingIds),

            // Get all user likes in one query
            supabase
              .from('tasting_likes')
              .select('tasting_id')
              .in('tasting_id', tastingIds)
              .eq('user_id', userId),

            // Get first photo for each tasting in one query
            supabase
              .from('quick_tasting_items')
              .select('tasting_id, photo_url')
              .in('tasting_id', tastingIds)
              .not('photo_url', 'is', null),

            // Get all user profiles in one query
            supabase
              .from('profiles')
              .select('user_id, full_name, username, avatar_url')
              .in('user_id', userIds),
          ]);

        // Create lookup maps for O(1) access
        const likesMap = new Map<string, number>();
        const commentsMap = new Map<string, number>();
        const userLikesSet = new Set(userLikesData.data?.map((l) => l.tasting_id) || []);
        const photosMap = new Map<string, string>();
        const profilesMap = new Map<string, any>();

        // Aggregate likes by tasting_id
        likesData.data?.forEach((like: any) => {
          likesMap.set(like.tasting_id, (likesMap.get(like.tasting_id) || 0) + 1);
        });

        // Aggregate comments by tasting_id
        commentsData.data?.forEach((comment: any) => {
          commentsMap.set(comment.tasting_id, (commentsMap.get(comment.tasting_id) || 0) + 1);
        });

        // Get first photo for each tasting
        photosData.data?.forEach((item: any) => {
          if (!photosMap.has(item.tasting_id)) {
            photosMap.set(item.tasting_id, item.photo_url);
          }
        });

        // Build profiles map
        profilesData.data?.forEach((profile: any) => {
          profilesMap.set(profile.user_id, profile);
        });

        // Map tastings to posts with O(1) lookups
        const postsWithStats = tastings.map((tasting: any) => {
          const photoUrl = photosMap.get(tasting.id);
          const profile = profilesMap.get(tasting.user_id);
          return {
            id: tasting.id,
            user_id: tasting.user_id,
            category: tasting.category,
            session_name: tasting.session_name,
            average_score: tasting.average_score,
            created_at: tasting.created_at,
            total_items: tasting.total_items,
            user: profile || {
              full_name: null,
              username: null,
              avatar_url: null,
            },
            stats: {
              likes: likesMap.get(tasting.id) || 0,
              comments: commentsMap.get(tasting.id) || 0,
            },
            isLiked: userLikesSet.has(tasting.id),
            photos: photoUrl ? [photoUrl] : [],
          };
        });

        setPosts(postsWithStats);
      } catch (error) {
        console.error('Error loading social feed:', error);
      } finally {
        setLoading(false);
      }
    }, [userId, limit]);

    useEffect(() => {
      loadRecentPosts();
    }, [loadRecentPosts]);

    const handleLike = async (postId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const supabase = getSupabaseClient();
      const post = posts.find((p) => p.id === postId);

      if (!post) {
        return;
      }

      try {
        if (post.isLiked) {
          await (supabase as any)
            .from('tasting_likes')
            .delete()
            .eq('tasting_id', postId)
            .eq('user_id', userId);

          setPosts(
            posts.map((p) =>
              p.id === postId
                ? { ...p, isLiked: false, stats: { ...p.stats, likes: p.stats.likes - 1 } }
                : p
            )
          );
        } else {
          await (supabase as any)
            .from('tasting_likes')
            .insert({ tasting_id: postId, user_id: userId });

          setPosts(
            posts.map((p) =>
              p.id === postId
                ? { ...p, isLiked: true, stats: { ...p.stats, likes: p.stats.likes + 1 } }
                : p
            )
          );

          // Send notification to post owner (if not liking own post)
          if (post.user_id !== userId) {
            // Get current user's name for the notification
            const { data: currentUser } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', userId)
              .single();

            const likerName = currentUser?.full_name || 'Someone';
            await notificationService.notifyLike(
              userId,
              post.user_id,
              likerName,
              'tasting',
              postId
            );
          }
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    };

    if (loading) {
      return (
        <Card hover={false} className="rounded-soft">
          <CardContent className="mt-0">
            <h3 className="mb-4 text-lg font-semibold text-fg">Recent Activity</h3>
            <LoadingSpinner text="Loading recent activity..." />
          </CardContent>
        </Card>
      );
    }

    if (posts.length === 0) {
      return (
        <Card hover={false} className="rounded-soft">
          <CardContent className="mt-0">
            <h3 className="mb-4 text-lg font-semibold text-fg">Recent Activity</h3>
            <div className="text-center py-8">
              <User className="w-12 h-12 text-fg-subtle mx-auto mb-3" />
              <p className="text-body-sm text-fg-muted mb-4">
                No activity yet — start your first flight
              </p>
              <Button variant="primary" size="sm" onClick={() => router.push('/quick-tasting')}>
                Start a Tasting
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card hover={false} className="overflow-hidden rounded-soft" padding="none">
        <CardContent className="mt-0">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="text-lg font-semibold text-fg">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/social')}>
              View All
            </Button>
          </div>

          <div className="divide-y divide-line">
            {posts.map((post) => {
              return (
                <div key={post.id}>
                  <div
                    onClick={() => router.push('/social')}
                    className="cursor-pointer bg-bg-surface px-4 py-3 transition-colors hover:bg-bg-inset"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {post.user.avatar_url ? (
                          <Image
                            src={post.user.avatar_url}
                            alt={post.user.full_name || 'User'}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-soft object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-soft bg-primary/10 text-xs font-semibold text-primary">
                            {(post.user.full_name || post.user.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-sm font-semibold text-fg">
                            {post.user.full_name || post.user.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-fg-subtle">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="truncate text-sm text-fg-muted">
                          {post.session_name || `${post.category} tasting`} • {post.total_items}{' '}
                          items
                          {post.average_score && (
                            <>
                              {' '}
                              • {post.average_score.toFixed(1)}
                              <span className="material-symbols-outlined text-xs align-middle ml-0.5">
                                star
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Photo thumbnail */}
                      {post.photos && post.photos.length > 0 && (
                        <Image
                          src={post.photos[0]}
                          alt="Tasting"
                          width={48}
                          height={48}
                          className="h-12 w-12 flex-shrink-0 rounded-soft object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="ml-10 flex items-center gap-3 text-xs text-fg-subtle">
                      <button
                        onClick={(e) => handleLike(post.id, e)}
                        className={`flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center gap-1 rounded-sharp transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                        aria-label={`${post.isLiked ? 'Unlike' : 'Like'} this tasting`}
                      >
                        <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                        <span className="ml-1">{post.stats.likes}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO(social): Implement comments modal. Requires:
                          // 1. CommentModal component with input, list, and submit
                          // 2. API route POST /api/social/comments for CRUD
                          // 3. Real-time subscription for new comments
                          // 4. Notification to post owner via notificationService.notifyComment()
                        }}
                        className="flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center gap-1 rounded-sharp transition-colors hover:text-primary"
                        aria-label="View comments"
                      >
                        <MessageCircle size={16} />
                        <span className="ml-1">{post.stats.comments}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO(social): Implement sharing. Use useSocialFeed.handleShare() which already
                          // supports Web Share API with clipboard fallback. Wire up postId parameter.
                        }}
                        className="flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center gap-1 rounded-sharp transition-colors hover:text-primary"
                        aria-label="Share this tasting"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if userId or limit changes
    return prevProps.userId === nextProps.userId && prevProps.limit === nextProps.limit;
  }
);

SocialFeedWidget.displayName = 'SocialFeedWidget';

export default SocialFeedWidget;

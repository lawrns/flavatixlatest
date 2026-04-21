import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import CommentsModal from './CommentsModal';
import { SocialPostCard } from './SocialPostCard';
import { SocialFeedFilters } from './SocialFeedFilters';
import notificationService from '@/lib/notificationService';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import PageLayout from '@/components/layout/PageLayout';
import {
  useInfiniteFeed,
  useLikeTasting,
  useFollowUser,
  useShareTasting,
} from '../../lib/query/hooks/useFeed';

const SkeletonPost = () => (
  <div className="rounded-[1.5rem] border border-line bg-white p-4 animate-pulse">
    <div className="mb-3 flex items-start space-x-3">
      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex-1">
        <div className="mb-2 h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
    <div className="mb-3 h-3 w-1/6 rounded bg-zinc-200 dark:bg-zinc-700" />
    <div className="mb-2 h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
    <div className="mb-2 h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
    <div className="mb-3 h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
    <div className="mb-3 h-48 rounded-[1.25rem] bg-zinc-200 dark:bg-zinc-700" />
    <div className="flex gap-4 border-t border-zinc-100 pt-2 dark:border-zinc-700">
      <div className="h-8 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-8 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-8 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  </div>
);

const SocialFeedPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const router = useRouter();

  const POSTS_PER_PAGE = 10;

  const {
    data,
    isLoading: loadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteFeed(user?.id, { tab: activeTab }, POSTS_PER_PAGE);

  const likeMutation = useLikeTasting();
  const followMutation = useFollowUser();
  const shareMutation = useShareTasting();

  const posts = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    return data.pages.flatMap((page) => page.posts);
  }, [data]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (activeTab === 'following') {
      filtered = filtered.filter((post) => post.isFollowed);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (post) => post.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    return filtered;
  }, [posts, activeTab, categoryFilter]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }
  }, [user, authLoading, router]);

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to like posts');
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return;
    }

    likeMutation.mutate(
      {
        tastingId: postId,
        userId: user.id,
        isLiking: !post.isLiked,
      },
      {
        onSuccess: () => {
          if (!post.isLiked) {
            toast.success('Post liked!');
          }
        },
        onError: () => {
          toast.error('Failed to update like');
        },
      }
    );
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

    const post = posts.find((p) => p.user_id === targetUserId);
    if (!post) {
      return;
    }

    followMutation.mutate(
      {
        targetUserId,
        currentUserId: user.id,
        isFollowing: !post.isFollowed,
      },
      {
        onSuccess: async () => {
          if (!post.isFollowed) {
            const supabase = getSupabaseClient();
            const { data: currentUser } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', user.id)
              .single();

            const followerName = currentUser?.full_name || 'Someone';
            await notificationService.notifyFollow(user.id, targetUserId, followerName);

            toast.success(`Following ${targetUserName}!`);
          } else {
            toast.success(`Unfollowed ${targetUserName}`);
          }
        },
        onError: () => {
          toast.error('Failed to update follow status');
        },
      }
    );
  };

  const handleComment = (postId: string) => {
    setActivePostId(postId);
    setCommentsModalOpen(true);
  };

  const handleCloseComments = () => {
    setCommentsModalOpen(false);
    setActivePostId(null);
    refetch();
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !loadingPosts) {
          fetchNextPage();
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
  }, [hasNextPage, isFetchingNextPage, loadingPosts, fetchNextPage]);

  const handleShare = async (postId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to share posts');
      return;
    }

    shareMutation.mutate(
      { tastingId: postId, userId: user.id },
      {
        onSuccess: async () => {
          try {
            if (navigator.share) {
              await navigator.share({
                title: 'Check out this tasting!',
                text: 'I found an interesting tasting session',
                url: `${window.location.origin}/social`,
              });
              toast.success('Post shared!');
            } else {
              await navigator.clipboard.writeText(`${window.location.origin}/social`);
              toast.success('Link copied to clipboard!');
            }
          } catch (error) {
            console.error('Error using share API:', error);
          }
        },
        onError: () => {
          toast.error('Failed to share post');
        },
      }
    );
  };

  const categories = ['all', 'coffee', 'wine', 'beer', 'spirits', 'tea', 'chocolate'];

  if (authLoading || loadingPosts) {
    return (
      <PageLayout
        title="Social"
        subtitle="A feed of recent tastings, reactions, and conversations."
        showBack
        backUrl="/dashboard"
        containerSize="2xl"
      >
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-line bg-white/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)]">
            <div className="grid gap-4 sm:grid-cols-3">
              {['Feed', 'Following', 'Categories'].map((label) => (
                <div
                  key={label}
                  className="h-16 rounded-[1.25rem] border border-line bg-bg-surface animate-pulse"
                />
              ))}
            </div>
          </section>

          <div className="grid gap-3">
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout
        title="Social"
        subtitle="See what the community is tasting and jump into a conversation."
        showBack
        backUrl="/dashboard"
        containerSize="2xl"
        headerRight={
          <button
            onClick={() => router.push('/quick-tasting')}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-fg transition-colors hover:border-fg-muted/30 hover:text-fg-muted"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            Start tasting
          </button>
        }
      >
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-line bg-white/90 p-5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="max-w-4xl">
              <p className="text-caption uppercase tracking-[0.24em] text-fg-muted">
                Feed controls
              </p>
              <div className="mt-4">
                <SocialFeedFilters
                  activeTab={activeTab}
                  categoryFilter={categoryFilter}
                  categories={categories}
                  onTabChange={setActiveTab}
                  onCategoryChange={setCategoryFilter}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            {filteredPosts.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-line bg-[#fbfaf7] p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[28px]">local_bar</span>
                </div>
                <h3 className="text-h3 font-semibold text-fg">No tastings yet</h3>
                <p className="mx-auto mt-3 max-w-lg text-body-sm leading-relaxed text-fg-muted">
                  Be the first to share a tasting and start the feed moving.
                </p>
                <button
                  onClick={() => router.push('/quick-tasting')}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  Start Tasting
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  isExpanded={expandedPosts.has(post.id)}
                  onToggleExpand={() => {
                    const newExpanded = new Set(expandedPosts);
                    if (newExpanded.has(post.id)) {
                      newExpanded.delete(post.id);
                    } else {
                      newExpanded.add(post.id);
                    }
                    setExpandedPosts(newExpanded);
                  }}
                  onLike={() => handleLike(post.id)}
                  onComment={() => handleComment(post.id)}
                  onShare={() => handleShare(post.id)}
                  onFollow={() => handleFollow(post.user_id, post.user.full_name || 'User')}
                />
              ))
            )}

            {!loadingPosts && filteredPosts.length > 0 && (
              <div id="scroll-sentinel" className="flex h-20 items-center justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                ) : !hasNextPage ? (
                  <p className="text-sm text-fg-muted">You&apos;ve reached the end.</p>
                ) : null}
              </div>
            )}
          </section>
        </div>

        {activePostId && (
          <CommentsModal
            tastingId={activePostId}
            tastingOwnerId={posts.find((p) => p.id === activePostId)?.user_id}
            isOpen={commentsModalOpen}
            onClose={handleCloseComments}
            initialCommentCount={posts.find((p) => p.id === activePostId)?.stats.comments || 0}
          />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};

export default SocialFeedPage;

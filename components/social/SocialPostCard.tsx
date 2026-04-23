/**
 * SocialPostCard Component
 *
 * Displays a single social feed post with user info, content, photos, and engagement buttons.
 */
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCategoryColors } from '@/lib/colors';
import type { TastingPost } from '@/lib/query/hooks/useFeed';

// Re-export types for backward compatibility
export type { TastingPost };

interface SocialPostCardProps {
  post: TastingPost;
  currentUserId?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFollow: () => void;
}

/**
 * Get color class for category badge
 * Uses centralized color system from lib/colors.ts
 */
export const getCategoryColor = (category: string) => {
  return getCategoryColors(category);
};

/**
 * Format relative time
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'Just now';
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }
  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d ago`;
  }
  return date.toLocaleDateString();
};

export const SocialPostCard: React.FC<SocialPostCardProps> = React.memo(
  ({ post, currentUserId, isExpanded, onToggleExpand, onLike, onComment, onShare, onFollow }) => {
    return (
      <article
        className={cn(
          'bg-bg-surface p-4 sm:p-5',
          'border border-line',
          'rounded-soft shadow-sm',
          'transition-all duration-200 ease-out',
          'hover:bg-bg-inset/40',
          'animate-fade-in'
        )}
      >
        {/* User Header */}
        <div className="flex items-start space-x-3 mb-4">
          {/* Avatar with ring effect */}
          <div
            className={cn(
              'relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-soft text-sm font-semibold text-primary',
              'border border-line bg-bg'
            )}
          >
            {post.user.avatar_url ? (
              <Image
                src={post.user.avatar_url}
                alt={`${post.user.full_name || 'User'}'s avatar`}
                width={44}
                height={44}
                className="h-full w-full rounded-soft object-cover"
              />
            ) : (
              (post.user.full_name || 'U')[0].toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-fg dark:text-fg truncate">
                  {post.user.full_name || 'Anonymous User'}
                </p>
                <p className="text-sm text-fg-subtle dark:text-fg-muted">
                  {formatTimeAgo(post.completed_at || post.created_at)}
                </p>
              </div>
              {currentUserId !== post.user_id && (
                <button
                  onClick={onFollow}
                  className={`rounded-sharp px-3 py-1.5 text-sm font-medium transition-colors ${
                    post.isFollowed
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-bg-inset dark:bg-bg-inset text-fg-muted dark:text-fg-muted hover:bg-line dark:hover:bg-fg-muted'
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
          <span
            className={cn(
              'inline-block rounded-sharp px-2.5 py-1 text-xs font-semibold capitalize',
              getCategoryColor(post.category).bg,
              getCategoryColor(post.category).text
            )}
          >
            {post.category}
          </span>
        </div>

        {/* Session Name */}
        {post.session_name && (
          <h3 className="mb-2 text-lg font-semibold text-fg">{post.session_name}</h3>
        )}

        {/* Notes */}
        {post.notes && <p className="mb-3 leading-relaxed text-fg-muted">{post.notes}</p>}

        {/* Photo Grid */}
        {post.photos && post.photos.length > 0 && (
          <div
            className={`mb-3 rounded-pane overflow-hidden ${
              post.photos.length === 1
                ? ''
                : post.photos.length === 2
                  ? 'grid grid-cols-2 gap-1'
                  : post.photos.length === 3
                    ? 'grid grid-cols-3 gap-1'
                    : 'grid grid-cols-2 gap-1'
            }`}
          >
            {post.photos.slice(0, 4).map((photo, idx) => (
              <div key={idx} className="relative aspect-square bg-bg-inset dark:bg-bg-surface">
                <Image
                  src={photo}
                  alt={`Tasting photo ${idx + 1}`}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-full object-cover"
                />
                {idx === 3 && post.photos && post.photos.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{post.photos.length - 4}</span>
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
              onClick={onToggleExpand}
              className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg-muted transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
              {post.total_items} items tasted
              {post.average_score && (
                <span className="text-fg-subtle font-normal">
                  • Avg: {post.average_score.toFixed(0)}/100
                </span>
              )}
            </button>

            {isExpanded && (
              <div className="space-y-2 pl-6">
                {post.items.slice(0, 5).map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-fg-subtle">{idx + 1}.</span>
                      <span className="text-fg dark:text-fg truncate">{item.item_name}</span>
                    </div>
                    {item.overall_score && (
                      <span
                        className={`font-semibold ml-2 ${
                          item.overall_score >= 80
                            ? 'text-green-600'
                            : item.overall_score >= 60
                              ? 'text-yellow-600'
                              : 'text-orange-600'
                        }`}
                      >
                        {item.overall_score}/100
                      </span>
                    )}
                  </div>
                ))}
                {post.items.length > 5 && (
                  <p className="text-xs text-fg-subtle pl-5">+{post.items.length - 5} more items</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center gap-4 border-t border-line py-2 text-sm text-fg-subtle">
          <span>{post.stats.likes} likes</span>
          <span>•</span>
          <span>{post.stats.comments} comments</span>
        </div>

        {/* Engagement Buttons */}
        <div className="flex justify-between gap-2 border-t border-line px-2 pt-3">
          <button
            onClick={onLike}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-soft hover:bg-bg-inset dark:hover:bg-bg-inset transition-colors ${
              post.isLiked ? 'text-red-500' : 'text-fg-muted dark:text-fg-muted'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {post.isLiked ? 'favorite' : 'favorite_border'}
            </span>
            <span className="text-sm font-medium">Like</span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-soft hover:bg-bg-inset dark:hover:bg-bg-inset transition-colors text-fg-muted dark:text-fg-muted"
          >
            <span className="material-symbols-outlined text-xl">mode_comment</span>
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-soft hover:bg-bg-inset dark:hover:bg-bg-inset transition-colors text-fg-muted dark:text-fg-muted"
          >
            <span className="material-symbols-outlined text-xl">share</span>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </article>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.isLiked === nextProps.post.isLiked &&
      prevProps.post.isFollowed === nextProps.post.isFollowed &&
      prevProps.post.stats.likes === nextProps.post.stats.likes &&
      prevProps.post.stats.comments === nextProps.post.stats.comments &&
      prevProps.post.stats.shares === nextProps.post.stats.shares &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  }
);

SocialPostCard.displayName = 'SocialPostCard';

export default SocialPostCard;

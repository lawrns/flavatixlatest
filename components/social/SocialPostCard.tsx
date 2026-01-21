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

export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  post,
  currentUserId,
  isExpanded,
  onToggleExpand,
  onLike,
  onComment,
  onShare,
  onFollow,
}) => {
  return (
    <article
      className={cn(
        'bg-white dark:bg-zinc-800/90 p-4 sm:p-5',
        'border-b border-zinc-100 dark:border-zinc-700/50',
        'transition-all duration-200 ease-out',
        'hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30',
        'animate-fade-in'
      )}
    >
      {/* User Header */}
      <div className="flex items-start space-x-3 mb-4">
        {/* Avatar with ring effect */}
        <div
          className={cn(
            'relative w-11 h-11 rounded-full flex-shrink-0',
            'bg-gradient-to-br from-primary to-orange-500',
            'p-[2px] shadow-lg shadow-primary/20'
          )}
        >
          {post.user.avatar_url ? (
            <Image
              src={post.user.avatar_url}
              alt={`${post.user.full_name || 'User'}'s avatar`}
              width={44}
              height={44}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (post.user.full_name || 'U')[0].toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">
                {post.user.full_name || 'Anonymous User'}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-300">
                {formatTimeAgo(post.completed_at || post.created_at)}
              </p>
            </div>
            {currentUserId !== post.user_id && (
              <button
                onClick={onFollow}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  post.isFollowed
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600'
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
            'inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize',
            getCategoryColor(post.category).bg,
            getCategoryColor(post.category).text
          )}
        >
          {post.category}
        </span>
      </div>

      {/* Session Name */}
      {post.session_name && (
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-2">
          {post.session_name}
        </h3>
      )}

      {/* Notes */}
      {post.notes && (
        <p className="text-zinc-700 dark:text-zinc-200 mb-3 leading-relaxed">{post.notes}</p>
      )}

      {/* Photo Grid */}
      {post.photos && post.photos.length > 0 && (
        <div
          className={`mb-3 rounded-xl overflow-hidden ${
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
            <div key={idx} className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
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
            className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-primary transition-colors mb-2"
          >
            <span className="material-symbols-outlined text-base">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {post.total_items} items tasted
            {post.average_score && (
              <span className="text-zinc-500 font-normal">
                • Avg: {post.average_score.toFixed(0)}/100
              </span>
            )}
          </button>

          {isExpanded && (
            <div className="space-y-2 pl-6">
              {post.items.slice(0, 5).map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-zinc-400">{idx + 1}.</span>
                    <span className="text-zinc-900 dark:text-zinc-50 truncate">
                      {item.item_name}
                    </span>
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
                <p className="text-xs text-zinc-500 pl-5">+{post.items.length - 5} more items</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 py-2 border-t border-zinc-100 dark:border-zinc-700">
        <span>{post.stats.likes} likes</span>
        <span>•</span>
        <span>{post.stats.comments} comments</span>
      </div>

      {/* Engagement Buttons */}
      <div className="flex justify-around border-t border-zinc-100 dark:border-zinc-700 pt-2">
        <button
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors ${
            post.isLiked ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {post.isLiked ? 'favorite' : 'favorite_border'}
          </span>
          <span className="text-sm font-medium">Like</span>
        </button>
        <button
          onClick={onComment}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
        >
          <span className="material-symbols-outlined text-xl">mode_comment</span>
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300"
        >
          <span className="material-symbols-outlined text-xl">share</span>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </article>
  );
};

export default SocialPostCard;

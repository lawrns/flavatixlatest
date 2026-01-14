import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { toast } from '@/lib/toast';
import { CommentWithUser } from '@/lib/types/comments';
import notificationService from '@/lib/notificationService';

type Comment = CommentWithUser;

type CommentsModalProps = {
  tastingId: string;
  tastingOwnerId?: string;
  isOpen: boolean;
  onClose: () => void;
  initialCommentCount: number;
};

export default function CommentsModal({ tastingId, tastingOwnerId, isOpen, onClose, initialCommentCount }: CommentsModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      // Focus the close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = '';
      // Return focus to previous element when modal closes
      previousActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, comments, loading]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, tastingId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('tasting_comments')
        .select('*')
        .eq('tasting_id', tastingId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (commentsError) {
        // Table might not exist yet
        console.error('Error loading comments:', commentsError);
        setComments([]);
        setLoading(false);
        return;
      }

      // Get user IDs
      const userIdsSet = new Set((commentsData || []).map((c: any) => c.user_id));
      const userIds = Array.from(userIdsSet);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', userIds);

      // Fetch comment likes
      const commentIds = (commentsData || []).map((c: any) => c.id);
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

      // Get user's likes
      let userLikes = new Set<string>();
      if (user?.id) {
        const { data: userLikesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);
        userLikes = new Set((userLikesData || []).map((l: any) => l.comment_id));
      }

      // Transform data
      const transformedComments: Comment[] = (commentsData || []).map((comment: any) => {
        const profile = (profilesData || []).find((p: any) => p.user_id === comment.user_id);
        const likes = (likesData || []).filter((l: any) => l.comment_id === comment.id);

        return {
          ...comment,
          user: profile || {},
          likes_count: likes.length,
          is_liked: userLikes.has(comment.id),
          replies: []
        };
      });

      // Build comment tree (nest replies)
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      transformedComments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      transformedComments.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    try {
      setSubmitting(true);
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('tasting_comments')
        .insert({
          tasting_id: tastingId,
          user_id: user.id,
          parent_comment_id: replyingTo,
          comment_text: commentText.trim()
        } as any);

      if (error) {
        console.error('Error posting comment:', error);
        toast.error('Comments system not yet set up. Please run the database migration.');
        return;
      }

      // Send notification to tasting owner (if not commenting on own tasting)
      if (tastingOwnerId && tastingOwnerId !== user.id) {
        const { data: currentUser } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        const commenterName = currentUser?.full_name || 'Someone';
        await notificationService.notifyComment(
          user.id,
          tastingOwnerId,
          commenterName,
          'tasting',
          tastingId,
          commentText.trim()
        );
      }

      setCommentText('');
      setReplyingTo(null);
      toast.success('Comment posted!');
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const comment = findComment(comments, commentId);
      if (!comment) return;

      if (comment.is_liked) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          } as any);
      }

      loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to update like');
    }
  };

  const findComment = (commentList: Comment[], id: string): Comment | null => {
    for (const comment of commentList) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findComment(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-12 mt-3' : 'mt-4'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
          {comment.user.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.full_name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (comment.user.full_name || 'U')[0].toUpperCase()
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-zinc-50 rounded-2xl px-4 py-2">
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 dark:text-zinc-50">
              {comment.user.full_name || 'Anonymous'}
            </p>
            <p className="text-zinc-800 dark:text-zinc-100 text-sm mt-1 break-words">
              {comment.comment_text}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 px-4 text-xs text-zinc-500">
            <span>{formatTimeAgo(comment.created_at)}</span>
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`font-semibold hover:text-primary ${
                comment.is_liked ? 'text-red-500' : ''
              }`}
            >
              {comment.is_liked ? 'Liked' : 'Like'}
              {comment.likes_count > 0 && ` (${comment.likes_count})`}
            </button>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="font-semibold hover:text-primary"
            >
              Reply
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-modal-title"
        className="bg-white dark:bg-zinc-800 w-full sm:max-w-2xl sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] flex flex-col pb-safe"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 id="comments-modal-title" className="text-lg font-bold">Comments ({comments.length})</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close comments"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 pb-safe" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {replyingTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-primary font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-primary text-base"
              disabled={submitting}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              className="px-6 py-2 bg-primary text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * API Route: Social Comments
 * GET /api/social/comments - Get comments for a tasting
 * POST /api/social/comments - Create a comment
 * DELETE /api/social/comments - Delete a comment
 * 
 * Requires authentication for POST/DELETE
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import {
  createApiHandler,
  withAuth,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendNotFound,
  sendForbidden,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const createCommentSchema = z.object({
  tasting_id: z.string().uuid('Invalid tasting ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  parent_comment_id: z.string().uuid('Invalid parent comment ID').optional().nullable(),
});

const deleteCommentSchema = z.object({
  comment_id: z.string().uuid('Invalid comment ID'),
});

// GET /api/social/comments - Get comments for a tasting
async function getCommentsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { tasting_id } = req.query;

  if (!tasting_id || typeof tasting_id !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const supabase = getSupabaseClient(req, res);

  try {
    // Verify tasting exists
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id')
      .eq('id', tasting_id)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Fetch comments with user profiles
    const { data: comments, error: commentsError } = await supabase
      .from('tasting_comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        updated_at,
        parent_comment_id,
        profiles:user_id (
          user_id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('tasting_id', tasting_id)
      .is('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: true });

    if (commentsError) {
      logger.error('API', 'Failed to fetch comments', commentsError, { tasting_id });
      return sendServerError(res, commentsError, 'Failed to fetch comments');
    }

    // Fetch replies for each comment
    if (comments && comments.length > 0) {
      const commentIds = comments.map(c => c.id);
      const { data: replies } = await supabase
        .from('tasting_comments')
        .select(`
          id,
          user_id,
          content,
          created_at,
          updated_at,
          parent_comment_id,
          profiles:user_id (
            user_id,
            full_name,
            username,
            avatar_url
          )
        `)
        .in('parent_comment_id', commentIds)
        .order('created_at', { ascending: true });

      // Attach replies to their parent comments
      const commentsWithReplies = comments.map(comment => ({
        ...comment,
        replies: replies?.filter(r => r.parent_comment_id === comment.id) || [],
      }));

      return sendSuccess(res, commentsWithReplies, 'Comments retrieved successfully');
    }

    return sendSuccess(res, [], 'Comments retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to retrieve comments');
  }
}

// POST /api/social/comments - Create a comment
async function createCommentHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const { tasting_id, content, parent_comment_id } = req.body as {
    tasting_id: string;
    content: string;
    parent_comment_id?: string | null;
  };

  try {
    // Verify tasting exists
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id')
      .eq('id', tasting_id)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // If replying, verify parent comment exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('tasting_comments')
        .select('id, tasting_id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError || !parentComment || parentComment.tasting_id !== tasting_id) {
        return sendNotFound(res, 'Parent comment');
      }
    }

    // Create comment
    logger.mutation('tasting_comments', 'create', undefined, userId, { tasting_id });

    const { data: newComment, error: insertError } = await supabase
      .from('tasting_comments')
      .insert({
        user_id: userId,
        tasting_id: tasting_id,
        content: content.trim(),
        parent_comment_id: parent_comment_id || null,
      })
      .select(`
        *,
        profiles:user_id (
          user_id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (insertError || !newComment) {
      logger.error('API', 'Failed to create comment', insertError, { tasting_id, userId });
      return sendServerError(res, insertError, 'Failed to create comment');
    }

    return sendSuccess(res, newComment, 'Comment created successfully', 201);
  } catch (error) {
    return sendServerError(res, error, 'Failed to create comment');
  }
}

// DELETE /api/social/comments - Delete a comment
async function deleteCommentHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const { comment_id } = req.body as { comment_id: string };

  try {
    // Verify comment exists and belongs to user
    const { data: comment, error: commentError } = await supabase
      .from('tasting_comments')
      .select('id, user_id')
      .eq('id', comment_id)
      .single();

    if (commentError || !comment) {
      return sendNotFound(res, 'Comment');
    }

    if (comment.user_id !== userId) {
      return sendForbidden(res, 'You can only delete your own comments');
    }

    // Delete comment (replies will be handled by CASCADE if configured)
    logger.mutation('tasting_comments', 'delete', comment_id, userId);

    const { error: deleteError } = await supabase
      .from('tasting_comments')
      .delete()
      .eq('id', comment_id)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('API', 'Failed to delete comment', deleteError, { comment_id, userId });
      return sendServerError(res, deleteError, 'Failed to delete comment');
    }

    return sendSuccess(res, { id: comment_id }, 'Comment deleted successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to delete comment');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.PUBLIC)(getCommentsHandler), // Public endpoint
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(createCommentSchema, createCommentHandler))),
  DELETE: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(deleteCommentSchema, deleteCommentHandler))),
});


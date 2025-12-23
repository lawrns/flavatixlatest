/**
 * API Route: Social Likes
 * POST /api/social/likes - Toggle like on a tasting (create or delete)
 * 
 * Requires authentication
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
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const toggleLikeSchema = z.object({
  tasting_id: z.string().uuid('Invalid tasting ID'),
});

// POST /api/social/likes - Toggle like (create if not exists, delete if exists)
async function toggleLikeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const { tasting_id } = req.body as { tasting_id: string };

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

    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('tasting_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('tasting_id', tasting_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected if like doesn't exist
      logger.error('API', 'Error checking existing like', checkError, { tasting_id, userId });
      return sendServerError(res, checkError, 'Failed to check like status');
    }

    if (existingLike) {
      // Unlike - delete existing like
      logger.mutation('tasting_likes', 'delete', existingLike.id, userId);

      const { error: deleteError } = await supabase
        .from('tasting_likes')
        .delete()
        .eq('id', existingLike.id)
        .eq('user_id', userId);

      if (deleteError) {
        logger.error('API', 'Failed to unlike', deleteError, { tasting_id, userId });
        return sendServerError(res, deleteError, 'Failed to unlike');
      }

      // Get updated like count
      const { count } = await supabase
        .from('tasting_likes')
        .select('*', { count: 'exact', head: true })
        .eq('tasting_id', tasting_id);

      return sendSuccess(res, {
        liked: false,
        like_count: count || 0,
      }, 'Post unliked successfully');
    } else {
      // Like - create new like
      logger.mutation('tasting_likes', 'create', undefined, userId, { tasting_id });

      const { data: newLike, error: insertError } = await supabase
        .from('tasting_likes')
        .insert({
          user_id: userId,
          tasting_id: tasting_id,
        })
        .select()
        .single();

      if (insertError) {
        logger.error('API', 'Failed to like', insertError, { tasting_id, userId });
        return sendServerError(res, insertError, 'Failed to like');
      }

      // Get updated like count
      const { count } = await supabase
        .from('tasting_likes')
        .select('*', { count: 'exact', head: true })
        .eq('tasting_id', tasting_id);

      return sendSuccess(res, {
        liked: true,
        like_count: count || 0,
      }, 'Post liked successfully');
    }
  } catch (error) {
    return sendServerError(res, error, 'Failed to toggle like');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(toggleLikeSchema, toggleLikeHandler))),
});


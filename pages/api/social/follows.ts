/**
 * API Route: Social Follows
 * POST /api/social/follows - Toggle follow (create or delete)
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
  sendForbidden,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const toggleFollowSchema = z.object({
  following_id: z.string().uuid('Invalid user ID'),
}).refine(
  (_data) => {
    // This will be checked in the handler with actual user context
    return true;
  },
  { message: 'Cannot follow yourself' }
);

// POST /api/social/follows - Toggle follow (create if not exists, delete if exists)
async function toggleFollowHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const { following_id } = req.body as { following_id: string };

  try {
    // Prevent self-follow
    if (following_id === userId) {
      return sendForbidden(res, 'You cannot follow yourself');
    }

    // Verify target user exists
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, full_name, username')
      .eq('user_id', following_id)
      .single();

    if (userError || !targetUser) {
      return sendNotFound(res, 'User');
    }

    // Check if follow already exists
    const { data: existingFollow, error: checkError } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', following_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected if follow doesn't exist
      logger.error('API', 'Error checking existing follow', checkError, { following_id, userId });
      return sendServerError(res, checkError, 'Failed to check follow status');
    }

    if (existingFollow) {
      // Unfollow - delete existing follow
      logger.mutation('user_follows', 'delete', existingFollow.id, userId);

      const { error: deleteError } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existingFollow.id)
        .eq('follower_id', userId);

      if (deleteError) {
        logger.error('API', 'Failed to unfollow', deleteError, { following_id, userId });
        return sendServerError(res, deleteError, 'Failed to unfollow');
      }

      // Get updated follower count
      const { count: followerCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', following_id);

      return sendSuccess(res, {
        following: false,
        follower_count: followerCount || 0,
      }, `Unfollowed ${targetUser.full_name || targetUser.username || 'user'}`);
    } else {
      // Follow - create new follow
      logger.mutation('user_follows', 'create', undefined, userId, { following_id });

      const { error: insertError } = await supabase
        .from('user_follows')
        .insert({
          follower_id: userId,
          following_id: following_id,
        })
        .select()
        .single();

      if (insertError) {
        logger.error('API', 'Failed to follow', insertError, { following_id, userId });
        return sendServerError(res, insertError, 'Failed to follow');
      }

      // Get updated follower count
      const { count: followerCount } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', following_id);

      // TODO(social): Send follow notification to target user.
      // Import notificationService and call:
      // await notificationService.notifyFollow(userId, following_id, currentUserName);
      // Need to fetch current user's name from profiles table first.

      return sendSuccess(res, {
        following: true,
        follower_count: followerCount || 0,
      }, `Following ${targetUser.full_name || targetUser.username || 'user'}`);
    }
  } catch (error) {
    return sendServerError(res, error, 'Failed to toggle follow');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(toggleFollowSchema, toggleFollowHandler))),
});

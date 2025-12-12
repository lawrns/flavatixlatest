import { NextApiRequest, NextApiResponse } from 'next';
import { studyModeService } from '@/lib/studyModeService';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withOptionalAuth,
  withAuth,
  withValidation,
  sendError,
  sendSuccess,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const submitSuggestionSchema = z.object({
  participant_id: z.string().uuid('Invalid participant ID'),
  item_name: z
    .string()
    .min(1, 'item_name must be a non-empty string')
    .max(100, 'item_name must be 100 characters or less'),
});

async function handleGetSuggestions(
  tastingId: string,
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { status } = req.query;

  // userId is optional for GET - allows viewing suggestions without auth
  // but if provided, filters to user's own suggestions if not moderator
  const userId = context.user?.id || null;

  try {
    const suggestions = await studyModeService.getSuggestions(
      tastingId,
      userId || undefined,
      status as 'pending' | 'approved' | 'rejected' | undefined
    );

    return sendSuccess(res, suggestions);
  } catch (error: any) {
    return sendError(res, 'INTERNAL_ERROR', error.message || 'Failed to get suggestions', 500);
  }
}

async function handlePostSuggestion(
  tastingId: string,
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // POST requires authentication - get user_id from authenticated context
  // NEVER trust user_id from client - always use authenticated context
  const userId = context.user?.id;
  if (!userId) {
    return sendError(res, 'AUTH_REQUIRED', 'Authentication required', 401);
  }

  // Request body is already validated by withValidation middleware
  const { participant_id, item_name } = req.body as { participant_id: string; item_name: string };

  // Verify the participant_id belongs to the current user
  const supabase = getSupabaseClient(req, res);
  const { data: participant, error: participantError } = await supabase
    .from('tasting_participants')
    .select('user_id, tasting_id')
    .eq('id', participant_id)
    .eq('tasting_id', tastingId)
    .single();

  if (participantError || !participant) {
    return sendError(res, 'NOT_FOUND', 'Participant not found', 404);
  }

  if ((participant as any).user_id !== userId) {
    return sendError(res, 'FORBIDDEN', 'You can only submit suggestions for yourself', 403);
  }

  try {
    const suggestion = await studyModeService.submitSuggestion(
      tastingId,
      participant_id,
      item_name.trim()
    );

    return sendSuccess(
      res,
      { suggestion },
      'Suggestion submitted successfully',
      201
    );
  } catch (error: any) {
    // Handle specific error cases
    if (error.message.includes('Suggestions only allowed')) {
      return sendError(res, 'NOT_FOUND', error.message, 404);
    }
    if (error.message.includes('does not have permission')) {
      return sendError(res, 'FORBIDDEN', error.message, 403);
    }

    return sendError(res, 'INTERNAL_ERROR', error.message || 'Failed to submit suggestion', 500);
  }
}

export default createApiHandler({
  GET: withOptionalAuth(async (req, res, context) => {
    const { id: tastingId } = req.query;
    if (!tastingId || typeof tastingId !== 'string') {
      return sendError(res, 'INVALID_INPUT', 'Invalid tasting ID', 400);
    }
    return handleGetSuggestions(tastingId, req, res, context);
  }),
  POST: withAuth(withValidation(submitSuggestionSchema, async (req, res, context) => {
    const { id: tastingId } = req.query;
    if (!tastingId || typeof tastingId !== 'string') {
      return sendError(res, 'INVALID_INPUT', 'Invalid tasting ID', 400);
    }
    return handlePostSuggestion(tastingId, req, res, context);
  })),
});



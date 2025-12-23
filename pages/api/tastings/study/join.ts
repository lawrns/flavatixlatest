import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withOptionalAuth,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendError,
  sendSuccess,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const joinSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  displayName: z.string().max(100, 'Display name too long').optional(),
});

async function joinSessionHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Request body is already validated by withValidation middleware
  const { sessionId, displayName } = req.body as { sessionId: string; displayName?: string };

  // Get Supabase client with optional user context
  const supabase = getSupabaseClient(req, res);
  
  // userId is optional - allows anonymous participation
  const userId = context.user?.id || null;

  // Check if session exists and is active
  const { data: session, error: sessionError } = await supabase
    .from('study_sessions')
    .select('id, status')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return sendError(res, 'NOT_FOUND', 'Session not found', 404);
  }

  if (session.status === 'finished') {
    return sendError(res, 'BAD_REQUEST', 'This session has ended', 400);
  }

  // Check if participant already exists (only if authenticated)
  if (userId) {
    const { data: existing } = await supabase
      .from('study_participants')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return sendSuccess(res, { participantId: existing.id }, 'Already joined');
    }
  }

  // Create participant
  const { data: participant, error: participantError } = await supabase
    .from('study_participants')
    .insert({
      session_id: sessionId,
      user_id: userId,
      display_name: displayName || 'Anonymous',
      role: 'participant'
    })
    .select()
    .single();

  if (participantError) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to join session: ${participantError.message}`, 500);
  }

  return sendSuccess(res, { participantId: participant.id }, 'Successfully joined session');
}

export default createApiHandler({
  POST: withOptionalAuth(withValidation(joinSessionSchema, joinSessionHandler)),
});

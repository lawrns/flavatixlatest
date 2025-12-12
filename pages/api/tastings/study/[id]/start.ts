import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withAuth,
  sendError,
  sendSuccess,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';

async function startSessionHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid session ID', 400);
  }

  // Get authenticated user ID from context (set by withAuth middleware)
  const user_id = requireUser(context).id;

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res);

  // Verify user is host
  const { data: session, error: sessionError } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('id', id)
    .eq('host_id', user_id)
    .single();

  if (sessionError || !session) {
    return sendError(res, 'NOT_FOUND', 'Session not found or access denied', 404);
  }

  // Update session status to active
  const { error: updateError } = await supabase
    .from('study_sessions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to start session: ${updateError.message}`, 500);
  }

  return sendSuccess(res, { status: 'active' }, 'Session started successfully');
}

export default createApiHandler({
  POST: withAuth(startSessionHandler),
});

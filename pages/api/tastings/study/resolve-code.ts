import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  createApiHandler,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendError,
  sendSuccess,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This endpoint uses service-role because it needs to resolve session codes
// without authentication. RLS may prevent anonymous reads of study_sessions.
// Rate limiting is critical here to prevent code enumeration attacks.
const resolveCodeSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters').max(10, 'Code too long'),
});

async function resolveCodeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Request body is already validated by withValidation middleware
  const { code } = req.body as { code: string };

  // Use service-role client for public code resolution
  // This bypasses RLS which may prevent anonymous reads
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: session, error } = await supabase
    .from('study_sessions')
    .select('id, name, status')
    .eq('session_code', code.toUpperCase())
    .single();

  if (error || !session) {
    return sendError(res, 'NOT_FOUND', 'Session not found', 404);
  }

  if (session.status === 'finished') {
    return sendError(res, 'BAD_REQUEST', 'This session has ended', 400);
  }

  return sendSuccess(res, {
    sessionId: session.id,
    sessionName: session.name,
    requiresAuth: false
  });
}

export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.STRICT)(withValidation(resolveCodeSchema, resolveCodeHandler)),
});

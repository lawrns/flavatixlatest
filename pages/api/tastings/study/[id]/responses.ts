import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withAuth,
  withValidation,
  sendError,
  sendSuccess,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const saveResponsesSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  responses: z.array(z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    textValue: z.string().optional().nullable(),
    scaleValue: z.number().min(0).max(100).optional().nullable(),
    boolValue: z.boolean().optional().nullable(),
  })).min(1, 'At least one response is required'),
});

async function saveResponsesHandler(
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

  // Request body is already validated by withValidation middleware
  const { itemId, responses } = req.body as {
    itemId: string;
    responses: Array<{
      categoryId: string;
      textValue?: string | null;
      scaleValue?: number | null;
      boolValue?: boolean | null;
    }>;
  };

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res);

  // Get participant ID for this user in this session
  const { data: participant, error: participantError } = await supabase
    .from('study_participants')
    .select('id')
    .eq('session_id', id)
    .eq('user_id', user_id)
    .single();

  if (participantError || !participant) {
    return sendError(res, 'FORBIDDEN', 'Not a participant in this session', 403);
  }

  // Prepare responses for insertion
  const responsesData = responses.map((r) => ({
    session_id: id,
    item_id: itemId,
    participant_id: participant.id,
    category_id: r.categoryId,
    text_value: r.textValue || null,
    scale_value: r.scaleValue ?? null,
    bool_value: r.boolValue ?? null
  }));

  const { error: responsesError } = await supabase
    .from('study_responses')
    .insert(responsesData);

  if (responsesError) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to save responses: ${responsesError.message}`, 500);
  }

  // Update participant progress - FIX: Use count property, not data
  const { count: totalItems } = await supabase
    .from('study_items')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', id);

  const { count: completedItems } = await supabase
    .from('study_responses')
    .select('item_id', { count: 'exact', head: true })
    .eq('session_id', id)
    .eq('participant_id', participant.id);

  const progress = totalItems ? (completedItems || 0) : 0;

  const { error: updateError } = await supabase
    .from('study_participants')
    .update({ progress })
    .eq('id', participant.id);

  if (updateError) {
    // Log but don't fail - responses were saved successfully
    console.error('Error updating participant progress:', updateError);
  }

  return sendSuccess(res, { saved: true, progress }, 'Responses saved successfully');
}

export default createApiHandler({
  POST: withAuth(withValidation(saveResponsesSchema, saveResponsesHandler)),
});

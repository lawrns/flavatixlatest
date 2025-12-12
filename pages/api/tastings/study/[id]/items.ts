import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withOptionalAuth,
  withAuth,
  withValidation,
  sendError,
  sendSuccess,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const addItemsSchema = z.object({
  items: z.array(z.object({
    label: z.string().min(1, 'Item label is required').max(200, 'Item label too long'),
    sortOrder: z.number().optional(),
  })).min(1, 'At least one item is required'),
});

async function getItemsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid session ID', 400);
  }

  // Get Supabase client with optional user context
  const supabase = getSupabaseClient(req, res);

  const { data: items, error } = await supabase
    .from('study_items')
    .select('*')
    .eq('session_id', id)
    .order('sort_order');

  if (error) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to fetch items: ${error.message}`, 500);
  }

  return sendSuccess(res, { items: items || [] });
}

async function addItemsHandler(
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
  const { items } = req.body as { items: Array<{ label: string; sortOrder?: number }> };

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res);

  // Verify user is host
  const { data: session, error: sessionError } = await supabase
    .from('study_sessions')
    .select('host_id')
    .eq('id', id)
    .single();

  if (sessionError || !session || session.host_id !== user_id) {
    return sendError(res, 'FORBIDDEN', 'Only the host can add items', 403);
  }

  // Prepare items for insertion
  const itemsData = items.map((item, index) => ({
    session_id: id,
    label: item.label,
    sort_order: item.sortOrder ?? index,
    created_by: user_id
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from('study_items')
    .insert(itemsData)
    .select();

  if (itemsError) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to create items: ${itemsError.message}`, 500);
  }

  return sendSuccess(res, { items: createdItems || [] }, 'Items added successfully', 201);
}

export default createApiHandler({
  GET: withOptionalAuth(getItemsHandler),
  POST: withAuth(withValidation(addItemsSchema, addItemsHandler)),
});

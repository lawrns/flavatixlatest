/**
 * API Route: Tasting CRUD Operations
 * GET /api/tastings/[id] - Get a tasting by ID
 * PUT /api/tastings/[id] - Update a tasting
 * DELETE /api/tastings/[id] - Delete a tasting
 * 
 * All operations require authentication and ownership verification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { updateTastingSchema } from '@/lib/validations/index';
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

// GET /api/tastings/[id] - Get a tasting with its items
async function getTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // Fetch tasting with items
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select(`
        *,
        quick_tasting_items (
          id,
          item_name,
          notes,
          aroma,
          flavor,
          flavor_scores,
          overall_score,
          photo_url,
          correct_answers,
          include_in_ranking,
          study_category_data,
          item_order,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      logger.query('quick_tastings', 'select', id, userId, { error: tastingError });
      return sendNotFound(res, 'Tasting');
    }

    logger.query('quick_tastings', 'select', id, userId);
    return sendSuccess(res, tasting, 'Tasting retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to retrieve tasting');
  }
}

// PUT /api/tastings/[id] - Update a tasting
async function updateTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify ownership
    const { data: existingTasting, error: checkError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingTasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Request body is already validated by withValidation middleware
    const updateData = req.body as Partial<{
      session_name: string | null;
      notes: string | null;
      completed_at: string | null;
    }>;

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.session_name !== undefined) {
      updates.session_name = updateData.session_name;
    }
    if (updateData.notes !== undefined) {
      updates.notes = updateData.notes;
    }
    if (updateData.completed_at !== undefined) {
      updates.completed_at = updateData.completed_at;
    }

    // Update the tasting
    logger.mutation('quick_tastings', 'update', id, userId, updates);

    const { data: updatedTasting, error: updateError } = await supabase
      .from('quick_tastings')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updatedTasting) {
      logger.error('API', 'Failed to update tasting', updateError, { id, userId });
      return sendServerError(res, updateError, 'Failed to update tasting');
    }

    return sendSuccess(res, updatedTasting, 'Tasting updated successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to update tasting');
  }
}

// DELETE /api/tastings/[id] - Delete a tasting and its items
async function deleteTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify ownership
    const { data: existingTasting, error: checkError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingTasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Delete tasting (items will be cascade deleted due to foreign key)
    logger.mutation('quick_tastings', 'delete', id, userId);

    const { error: deleteError } = await supabase
      .from('quick_tastings')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('API', 'Failed to delete tasting', deleteError, { id, userId });
      return sendServerError(res, deleteError, 'Failed to delete tasting');
    }

    return sendSuccess(res, { id }, 'Tasting deleted successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to delete tasting');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getTastingHandler)),
  PUT: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(updateTastingSchema, updateTastingHandler))),
  DELETE: withRateLimit(RATE_LIMITS.API)(withAuth(deleteTastingHandler)),
});


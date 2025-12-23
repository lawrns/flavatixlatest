/**
 * API Route: Single Tasting Item CRUD Operations
 * GET /api/tastings/[id]/items/[itemId] - Get a single item
 * PUT /api/tastings/[id]/items/[itemId] - Update an item
 * DELETE /api/tastings/[id]/items/[itemId] - Delete an item
 * 
 * All operations require authentication and tasting ownership verification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { updateTastingItemSchema } from '@/lib/validations/index';
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

// GET /api/tastings/[id]/items/[itemId] - Get a single item
async function getItemHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId, itemId } = req.query;
  
  if (!tastingId || typeof tastingId !== 'string') {
    return sendNotFound(res, 'Tasting');
  }
  
  if (!itemId || typeof itemId !== 'string') {
    return sendNotFound(res, 'Item');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify tasting ownership
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Fetch the item
    const { data: item, error: itemError } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .eq('id', itemId)
      .eq('tasting_id', tastingId)
      .single();

    if (itemError || !item) {
      logger.debug('API', 'Error fetching item', { itemId, userId, error: itemError });
      return sendNotFound(res, 'Item');
    }

    logger.debug('API', 'Item fetched', { itemId, userId });
    return sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to retrieve item');
  }
}

// PUT /api/tastings/[id]/items/[itemId] - Update an item
async function updateItemHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId, itemId } = req.query;
  
  if (!tastingId || typeof tastingId !== 'string') {
    return sendNotFound(res, 'Tasting');
  }
  
  if (!itemId || typeof itemId !== 'string') {
    return sendNotFound(res, 'Item');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify tasting ownership
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Verify item exists and belongs to this tasting
    const { data: existingItem, error: itemCheckError } = await supabase
      .from('quick_tasting_items')
      .select('id, tasting_id')
      .eq('id', itemId)
      .eq('tasting_id', tastingId)
      .single();

    if (itemCheckError || !existingItem) {
      return sendNotFound(res, 'Item');
    }

    // Request body is already validated by withValidation middleware
    const updateData = req.body as Partial<{
      item_name: string;
      notes: string | null;
      aroma: string | null;
      flavor: string | null;
      flavor_scores: Record<string, number> | null;
      overall_score: number | null;
      photo_url: string | null;
      correct_answers: Record<string, unknown> | null;
      include_in_ranking: boolean;
      study_category_data: Record<string, unknown> | null;
      item_order: number;
    }>;

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Add only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        updates[key] = updateData[key as keyof typeof updateData];
      }
    });

    // Update the item
    logger.debug('API', 'Updating item', { itemId, userId, updates });

    const { data: updatedItem, error: updateError } = await supabase
      .from('quick_tasting_items')
      .update(updates)
      .eq('id', itemId)
      .eq('tasting_id', tastingId)
      .select()
      .single();

    if (updateError || !updatedItem) {
      logger.error('API', 'Failed to update item', updateError, { itemId, tastingId, userId });
      return sendServerError(res, updateError, 'Failed to update item');
    }

    return sendSuccess(res, updatedItem, 'Item updated successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to update item');
  }
}

// DELETE /api/tastings/[id]/items/[itemId] - Delete an item
async function deleteItemHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId, itemId } = req.query;
  
  if (!tastingId || typeof tastingId !== 'string') {
    return sendNotFound(res, 'Tasting');
  }
  
  if (!itemId || typeof itemId !== 'string') {
    return sendNotFound(res, 'Item');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify tasting ownership
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Verify item exists and belongs to this tasting
    const { data: existingItem, error: itemCheckError } = await supabase
      .from('quick_tasting_items')
      .select('id, tasting_id')
      .eq('id', itemId)
      .eq('tasting_id', tastingId)
      .single();

    if (itemCheckError || !existingItem) {
      return sendNotFound(res, 'Item');
    }

    // Delete the item
    logger.debug('API', 'Deleting item', { itemId, userId });

    const { error: deleteError } = await supabase
      .from('quick_tasting_items')
      .delete()
      .eq('id', itemId)
      .eq('tasting_id', tastingId);

    if (deleteError) {
      logger.error('API', 'Failed to delete item', deleteError, { itemId, tastingId, userId });
      return sendServerError(res, deleteError, 'Failed to delete item');
    }

    // Update tasting item count
    await supabase.rpc('increment', {
      table_name: 'quick_tastings',
      column_name: 'total_items',
      id: tastingId,
      amount: -1,
    }).catch(() => {
      // If RPC doesn't exist, manually update
      supabase
        .from('quick_tastings')
        .update({ total_items: supabase.raw('GREATEST(total_items - 1, 0)') })
        .eq('id', tastingId);
    });

    return sendSuccess(res, { id: itemId }, 'Item deleted successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to delete item');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getItemHandler)),
  PUT: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(updateTastingItemSchema, updateItemHandler))),
  DELETE: withRateLimit(RATE_LIMITS.API)(withAuth(deleteItemHandler)),
});


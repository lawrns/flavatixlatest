/**
 * API Route: Tasting Items CRUD Operations
 * GET /api/tastings/[id]/items - Get all items for a tasting
 * POST /api/tastings/[id]/items - Create a new item for a tasting
 * 
 * All operations require authentication and tasting ownership verification
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { createTastingItemSchema } from '@/lib/validations/index';
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

// GET /api/tastings/[id]/items - Get all items for a tasting
async function getItemsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId } = req.query;
  
  if (!tastingId || typeof tastingId !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify ownership
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .eq('tasting_id', tastingId)
      .order('item_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (itemsError) {
      logger.error('API', 'Failed to fetch items', itemsError, { tastingId, userId });
      return sendServerError(res, itemsError, 'Failed to fetch items');
    }

    logger.query('quick_tasting_items', 'select', tastingId, userId);
    return sendSuccess(res, items || [], 'Items retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to retrieve items');
  }
}

// POST /api/tastings/[id]/items - Create a new item for a tasting
async function createItemHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId } = req.query;
  
  if (!tastingId || typeof tastingId !== 'string') {
    return sendNotFound(res, 'Tasting');
  }

  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  try {
    // First verify ownership
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id, mode')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Competition mode doesn't allow adding items after creation
    if (tasting.mode === 'competition') {
      return sendForbidden(res, 'Cannot add items to competition mode tastings after creation');
    }

    // Request body is already validated by withValidation middleware
    const itemData = req.body as {
      item_name: string;
      notes?: string | null;
      aroma?: string | null;
      flavor?: string | null;
      flavor_scores?: Record<string, number> | null;
      overall_score?: number | null;
      photo_url?: string | null;
      correct_answers?: Record<string, unknown> | null;
      include_in_ranking?: boolean;
      study_category_data?: Record<string, unknown> | null;
      item_order?: number;
    };

    // Get current max item_order to set next item
    const { data: existingItems } = await supabase
      .from('quick_tasting_items')
      .select('item_order')
      .eq('tasting_id', tastingId)
      .order('item_order', { ascending: false })
      .limit(1);

    const nextOrder = existingItems && existingItems.length > 0
      ? (existingItems[0].item_order || 0) + 1
      : (itemData.item_order || 0);

    // Create the item
    const newItem = {
      tasting_id: tastingId,
      item_name: itemData.item_name,
      notes: itemData.notes ?? null,
      aroma: itemData.aroma ?? null,
      flavor: itemData.flavor ?? null,
      flavor_scores: itemData.flavor_scores ?? null,
      overall_score: itemData.overall_score ?? null,
      photo_url: itemData.photo_url ?? null,
      correct_answers: itemData.correct_answers ?? null,
      include_in_ranking: itemData.include_in_ranking ?? true,
      study_category_data: itemData.study_category_data ?? null,
      item_order: nextOrder,
    };

    logger.mutation('quick_tasting_items', 'create', undefined, userId, { tastingId });

    const { data: createdItem, error: createError } = await supabase
      .from('quick_tasting_items')
      .insert(newItem)
      .select()
      .single();

    if (createError || !createdItem) {
      logger.error('API', 'Failed to create item', createError, { tastingId, userId });
      return sendServerError(res, createError, 'Failed to create item');
    }

    // Update tasting item count
    await supabase.rpc('increment', {
      table_name: 'quick_tastings',
      column_name: 'total_items',
      id: tastingId,
      amount: 1,
    }).catch(() => {
      // If RPC doesn't exist, manually update
      supabase
        .from('quick_tastings')
        .update({ total_items: supabase.raw('total_items + 1') })
        .eq('id', tastingId);
    });

    return sendSuccess(res, createdItem, 'Item created successfully', 201);
  } catch (error) {
    return sendServerError(res, error, 'Failed to create item');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getItemsHandler)),
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(createTastingItemSchema, createItemHandler))),
});


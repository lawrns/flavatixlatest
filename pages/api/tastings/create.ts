/**
 * API Route: Create Tasting Session
 * POST /api/tastings/create
 * 
 * Creates a new tasting session (quick, study, or competition mode)
 * Requires authentication via Bearer token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { createTastingSchema, type CreateTastingInput } from '@/lib/validations/index';
import {
  createApiHandler,
  withAuth,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendServerError,
  sendUnauthorized,
  type ApiContext,
} from '@/lib/api/middleware';

// Handler for POST /api/tastings/create
async function createTastingHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Request body is already validated by withValidation middleware
  const {
    mode,
    study_approach,
    category,
    session_name,
    notes,
    rank_participants,
    ranking_type,
    is_blind_participants,
    is_blind_items,
    is_blind_attributes,
    items,
  } = req.body as CreateTastingInput;

  // Get authenticated user ID from context (set by withAuth middleware)
  // NEVER trust user_id from client - always use authenticated context
  const user_id = context.user?.id;
  if (!user_id) {
    return sendUnauthorized(res, 'Authentication required');
  }

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res) as any;

  // Generate default session name if not provided
  const defaultSessionName = `${category.charAt(0).toUpperCase() + category.slice(1)} ${
    mode === 'competition' ? 'Competition' : mode === 'study' ? 'Study' : 'Quick Tasting'
  }`;

  // Create the tasting session
  logger.mutation('quick_tastings', 'create', undefined, user_id, { category, mode });

  const { data: tasting, error: tastingError } = await supabase
    .from('quick_tastings')
    .insert({
      user_id,
      category,
      session_name: session_name || defaultSessionName,
      notes,
      mode,
      study_approach: mode === 'study' ? study_approach : null,
      rank_participants,
      ranking_type: rank_participants ? ranking_type : null,
      is_blind_participants,
      is_blind_items,
      is_blind_attributes,
    })
    .select()
    .single();

  if (tastingError) {
    logger.error('Tasting', 'Error creating tasting', tastingError, { user_id, category, mode });
    return sendServerError(res, tastingError, 'Failed to create tasting session');
  }

  logger.mutation('quick_tastings', 'create', tasting.id, user_id, { category, mode });

  let createdItems: any[] = [];

  // Add items for competition mode and pre-defined study mode
  const shouldAddItems =
    (mode === 'competition' && items.length > 0) ||
    (mode === 'study' && study_approach === 'predefined' && items.length > 0);

  if (shouldAddItems) {
    const itemsToInsert = items.map((item) => ({
      tasting_id: tasting.id,
      item_name: item.item_name,
      correct_answers: item.correct_answers || null,
      include_in_ranking: item.include_in_ranking !== false,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('quick_tasting_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      logger.error('Tasting', 'Error creating tasting items', itemsError, { tasting_id: tasting.id });
      
      // Clean up the tasting if items creation failed
      await supabase.from('quick_tastings').delete().eq('id', tasting.id);
      
      return sendServerError(res, itemsError, 'Failed to create tasting items');
    }

    createdItems = insertedItems || [];
  }

  logger.info('Tasting', 'Tasting created successfully', {
    tasting_id: tasting.id,
    mode,
    category,
    items_count: createdItems.length,
  });

  return sendSuccess(
    res,
    { tasting, items: createdItems },
    'Tasting session created successfully',
    201
  );
}

// Export handler with middleware chain:
// 1. Method routing (createApiHandler)
// 2. Error handling & logging (automatic in createApiHandler)
// 3. Authentication (withAuth)
// 4. Input validation (withValidation)
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(createTastingSchema, createTastingHandler))),
});


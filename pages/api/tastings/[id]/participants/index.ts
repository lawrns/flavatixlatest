/**
 * API Route: Tasting Participants Management
 * GET /api/tastings/[id]/participants - Get all participants for a tasting
 * POST /api/tastings/[id]/participants - Add a participant to a tasting
 * DELETE /api/tastings/[id]/participants - Remove a participant from a tasting
 * 
 * All operations require authentication and host-only access for management
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
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
import { z } from 'zod';

const addParticipantSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['host', 'participant', 'both']).default('participant'),
  can_moderate: z.boolean().default(false),
  can_add_items: z.boolean().default(false),
});

const removeParticipantSchema = z.object({
  participant_id: z.string().uuid('Invalid participant ID'),
});

// GET /api/tastings/[id]/participants - Get all participants for a tasting
async function getParticipantsHandler(
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
    // Verify user has access to this tasting (either owner or participant)
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Check if user is owner or participant
    const isOwner = tasting.user_id === userId;
    const { data: participant } = await supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .eq('user_id', userId)
      .single();

    if (!isOwner && !participant) {
      return sendForbidden(res, 'You do not have access to this tasting');
    }

    // Fetch all participants with user profiles
    const { data: participants, error: participantsError } = await supabase
      .from('tasting_participants')
      .select(`
        id,
        user_id,
        role,
        score,
        rank,
        can_moderate,
        can_add_items,
        created_at,
        profiles:user_id (
          user_id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('tasting_id', tastingId)
      .order('created_at', { ascending: true });

    if (participantsError) {
      logger.error('API', 'Failed to fetch participants', participantsError, { tastingId, userId });
      return sendServerError(res, participantsError, 'Failed to fetch participants');
    }

    logger.query('tasting_participants', 'select', tastingId, userId);
    return sendSuccess(res, participants || [], 'Participants retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to retrieve participants');
  }
}

// POST /api/tastings/[id]/participants - Add a participant to a tasting
async function addParticipantHandler(
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
    // Verify user is the host/owner
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Request body is already validated by withValidation middleware
    const participantData = req.body as {
      user_id: string;
      role?: 'host' | 'participant' | 'both';
      can_moderate?: boolean;
      can_add_items?: boolean;
    };

    // Check if participant already exists
    const { data: existing } = await supabase
      .from('tasting_participants')
      .select('id')
      .eq('tasting_id', tastingId)
      .eq('user_id', participantData.user_id)
      .single();

    if (existing) {
      return sendForbidden(res, 'Participant already exists in this tasting');
    }

    // Create participant
    const newParticipant = {
      tasting_id: tastingId,
      user_id: participantData.user_id,
      role: participantData.role || 'participant',
      can_moderate: participantData.can_moderate || false,
      can_add_items: participantData.can_add_items || false,
    };

    logger.mutation('tasting_participants', 'create', undefined, userId, { tastingId });

    const { data: createdParticipant, error: createError } = await supabase
      .from('tasting_participants')
      .insert(newParticipant)
      .select(`
        *,
        profiles:user_id (
          user_id,
          full_name,
          username,
          avatar_url
        )
      `)
      .single();

    if (createError || !createdParticipant) {
      logger.error('API', 'Failed to add participant', createError, { tastingId, userId });
      return sendServerError(res, createError, 'Failed to add participant');
    }

    return sendSuccess(res, createdParticipant, 'Participant added successfully', 201);
  } catch (error) {
    return sendServerError(res, error, 'Failed to add participant');
  }
}

// DELETE /api/tastings/[id]/participants - Remove a participant from a tasting
async function removeParticipantHandler(
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
    // Verify user is the host/owner
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .select('id, user_id')
      .eq('id', tastingId)
      .eq('user_id', userId)
      .single();

    if (tastingError || !tasting) {
      return sendNotFound(res, 'Tasting');
    }

    // Request body is already validated by withValidation middleware
    const { participant_id } = req.body as { participant_id: string };

    // Verify participant exists and belongs to this tasting
    const { data: participant, error: participantError } = await supabase
      .from('tasting_participants')
      .select('id, user_id')
      .eq('id', participant_id)
      .eq('tasting_id', tastingId)
      .single();

    if (participantError || !participant) {
      return sendNotFound(res, 'Participant');
    }

    // Prevent removing the host
    if (participant.user_id === userId) {
      return sendForbidden(res, 'Cannot remove the host from their own tasting');
    }

    // Delete participant
    logger.mutation('tasting_participants', 'delete', participant_id, userId);

    const { error: deleteError } = await supabase
      .from('tasting_participants')
      .delete()
      .eq('id', participant_id)
      .eq('tasting_id', tastingId);

    if (deleteError) {
      logger.error('API', 'Failed to remove participant', deleteError, { participant_id, tastingId, userId });
      return sendServerError(res, deleteError, 'Failed to remove participant');
    }

    return sendSuccess(res, { id: participant_id }, 'Participant removed successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to remove participant');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getParticipantsHandler)),
  POST: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(addParticipantSchema, addParticipantHandler))),
  DELETE: withRateLimit(RATE_LIMITS.API)(withAuth(withValidation(removeParticipantSchema, removeParticipantHandler))),
});


import { NextApiRequest, NextApiResponse } from 'next';
import { roleService, ParticipantRole } from '@/lib/roleService';
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

const updateRoleSchema = z.object({
  role: z.enum(['host', 'participant', 'both'], {
    errorMap: () => ({ message: 'role must be one of: host, participant, both' }),
  }),
});

async function updateRoleHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId, participantId } = req.query;

  if (!tastingId || typeof tastingId !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid tasting ID', 400);
  }

  if (!participantId || typeof participantId !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid participant ID', 400);
  }

  // Get authenticated user ID from context (set by withAuth middleware)
  // NEVER trust user_id from client - always use authenticated context
  const user_id = requireUser(context).id;

  // Request body is already validated by withValidation middleware
  const { role } = req.body as { role: ParticipantRole };

  try {
    const updatedParticipant = await roleService.updateParticipantRole(
      tastingId,
      participantId,
      role,
      user_id
    );

    return sendSuccess(
      res,
      { participant: updatedParticipant },
      'Participant role updated successfully'
    );
  } catch (error: any) {
    // Handle specific error cases
    if (error.message.includes('does not have permission')) {
      return sendError(res, 'FORBIDDEN', error.message, 403);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 'NOT_FOUND', error.message, 404);
    }
    if (error.message.includes('Only one host allowed')) {
      return sendError(res, 'CONFLICT', error.message, 409);
    }

    return sendError(res, 'INTERNAL_ERROR', error.message || 'Failed to update participant role', 500);
  }
}

export default createApiHandler({
  PATCH: withAuth(withValidation(updateRoleSchema, updateRoleHandler)),
});



import { NextApiRequest, NextApiResponse } from 'next';
import { studyModeService } from '@/lib/studyModeService';
import {
  createApiHandler,
  withAuth,
  sendError,
  sendSuccess,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

const moderateSuggestionSchema = z.object({
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'action must be either "approve" or "reject"' }),
  }),
});

async function moderateSuggestionHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id: tastingId, suggestionId } = req.query;

  if (!tastingId || typeof tastingId !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid tasting ID', 400);
  }

  if (!suggestionId || typeof suggestionId !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid suggestion ID', 400);
  }

  // Get authenticated user ID from context (set by withAuth middleware)
  // NEVER trust user_id from client - always use authenticated context
  const actingUserId = requireUser(context).id;

  // Validate action from request body
  const validationResult = moderateSuggestionSchema.safeParse(req.body);
  if (!validationResult.success) {
    return sendError(res, 'VALIDATION_FAILED', 'action must be either "approve" or "reject"', 400);
  }

  const { action } = validationResult.data;

  // Validate action
  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      error: 'action must be either "approve" or "reject"'
    });
  }

  try {
    const updatedSuggestion = await studyModeService.moderateSuggestion(
      suggestionId,
      actingUserId,
      action,
      tastingId
    );

    return sendSuccess(
      res,
      { suggestion: updatedSuggestion },
      `Suggestion ${action}d successfully`
    );
  } catch (error: any) {
    // Handle specific error cases
    if (error.message.includes('does not have permission')) {
      return sendError(res, 'FORBIDDEN', error.message, 403);
    }
    if (error.message.includes('not found') || error.message.includes('already been moderated')) {
      return sendError(res, 'CONFLICT', error.message, 409);
    }

    return sendError(res, 'INTERNAL_ERROR', error.message || 'Failed to moderate suggestion', 500);
  }
}

export default createApiHandler({
  POST: withAuth(moderateSuggestionHandler),
});



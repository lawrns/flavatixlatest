import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  getOrGenerateFlavorWheel,
  FlavorWheelData,
  WheelGenerationOptions
} from '@/lib/flavorWheelGenerator';
import {
  createApiHandler,
  withAuth,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

// Validation schema for generate flavor wheel request
const generateWheelSchema = z.object({
  wheelType: z.enum(['aroma', 'flavor', 'combined', 'metaphor'], {
    errorMap: () => ({ message: 'Wheel type must be aroma, flavor, combined, or metaphor' }),
  }),
  scopeType: z.enum(['personal', 'universal', 'item', 'category', 'tasting'], {
    errorMap: () => ({ message: 'Scope type must be personal, universal, item, category, or tasting' }),
  }),
  scopeFilter: z.object({
    userId: z.string().uuid().optional(),
    itemName: z.string().optional(),
    itemCategory: z.string().optional(),
    tastingId: z.string().uuid().optional(),
  }).optional(),
  forceRegenerate: z.boolean().optional().default(false),
});

type GenerateWheelInput = z.infer<typeof generateWheelSchema>;

interface GenerateResponse {
  wheelData: FlavorWheelData;
  wheelId: string;
  cached: boolean;
  warning?: string;
}

/**
 * API Endpoint: Generate flavor wheel visualization
 * POST /api/flavor-wheels/generate
 */
async function generateWheelHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const {
    wheelType,
    scopeType,
    scopeFilter = {},
    forceRegenerate,
  } = req.body as GenerateWheelInput;

  try {
    // For personal scope, ensure userId matches authenticated user
    if (scopeType === 'personal') {
      scopeFilter.userId = userId;
    }

    // Build generation options
    const options: WheelGenerationOptions & { userId?: string } = {
      wheelType,
      scopeType,
      scopeFilter,
      userId: scopeType === 'personal' ? userId : undefined
    };

    // If force regenerate, delete existing wheel first
    if (forceRegenerate) {
      let deleteQuery = supabase
        .from('flavor_wheels')
        .delete()
        .eq('wheel_type', wheelType)
        .eq('scope_type', scopeType);

      if (scopeType === 'personal') {
        deleteQuery = deleteQuery.eq('user_id', userId);
      }

      await deleteQuery;
    }

    // Generate or retrieve cached wheel
    const { wheelData, wheelId, cached } = await getOrGenerateFlavorWheel(
      supabase,
      options
    );

    // Check if wheel has data
    const responseData: GenerateResponse = {
      wheelData,
      wheelId,
      cached,
    };

    if (wheelData.categories.length === 0) {
      responseData.warning = 'No flavor descriptors found for the specified scope. Try adding some tasting notes or reviews first.';
    }

    return sendSuccess(
      res,
      responseData,
      cached ? 'Flavor wheel retrieved from cache' : 'Flavor wheel generated successfully',
      200
    );
  } catch (error) {
    return sendServerError(res, error, 'Failed to generate flavor wheel');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(generateWheelSchema, generateWheelHandler)
    )
  ),
});

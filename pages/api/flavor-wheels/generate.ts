import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  getOrGenerateFlavorWheel,
  FlavorWheelData,
  WheelGenerationOptions
} from '@/lib/flavorWheelGenerator';

interface GenerateRequest {
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor';
  scopeType: 'personal' | 'universal' | 'item' | 'category' | 'tasting';
  scopeFilter?: {
    userId?: string;
    itemName?: string;
    itemCategory?: string;
    tastingId?: string;
  };
  forceRegenerate?: boolean;
}

interface GenerateResponse {
  success: boolean;
  wheelData?: FlavorWheelData;
  wheelId?: string;
  cached?: boolean;
  error?: string;
}

/**
 * API Endpoint: Generate flavor wheel visualization
 * POST /api/flavor-wheels/generate
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get auth token from Authorization header (like other APIs)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized - missing Bearer token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient(req, res);

    // Get authenticated user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized - invalid token' });
    }

    const {
      wheelType,
      scopeType,
      scopeFilter = {},
      forceRegenerate = false
    } = req.body as GenerateRequest;

    // Validate request
    if (!wheelType || !scopeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: wheelType, scopeType'
      });
    }

    // Validate wheel type
    if (!['aroma', 'flavor', 'combined', 'metaphor'].includes(wheelType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wheelType. Must be: aroma, flavor, combined, or metaphor'
      });
    }

    // Validate scope type
    if (!['personal', 'universal', 'item', 'category', 'tasting'].includes(scopeType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scopeType. Must be: personal, universal, item, category, or tasting'
      });
    }

    // For personal scope, ensure userId matches authenticated user
    if (scopeType === 'personal') {
      scopeFilter.userId = user.id;
    }

    // Build generation options
    const options: WheelGenerationOptions & { userId?: string } = {
      wheelType,
      scopeType,
      scopeFilter,
      userId: scopeType === 'personal' ? user.id : undefined
    };

    // If force regenerate, delete existing wheel first
    if (forceRegenerate) {
      let deleteQuery = supabase
        .from('flavor_wheels')
        .delete()
        .eq('wheel_type', wheelType)
        .eq('scope_type', scopeType);

      if (scopeType === 'personal') {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      }

      await deleteQuery;
    }

    // Generate or retrieve cached wheel
    const { wheelData, wheelId, cached } = await getOrGenerateFlavorWheel(
      supabase,
      options
    );

    // Check if wheel has data
    if (wheelData.categories.length === 0) {
      return res.status(200).json({
        success: true,
        wheelData,
        wheelId,
        cached: false,
        error: 'No flavor descriptors found for the specified scope. Try adding some tasting notes or reviews first.'
      });
    }

    return res.status(200).json({
      success: true,
      wheelData,
      wheelId,
      cached
    });

  } catch (error) {
    console.error('Error in generate wheel:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  extractDescriptorsWithIntensity,
  extractFromStructuredReview,
  ExtractedDescriptor
} from '@/lib/flavorDescriptorExtractor';

interface ExtractRequest {
  sourceType: 'quick_tasting' | 'quick_review' | 'prose_review';
  sourceId: string;
  text?: string;
  structuredData?: {
    aroma_notes?: string;
    flavor_notes?: string;
    texture_notes?: string;
    other_notes?: string;
    aroma_intensity?: number;
    flavor_intensity?: number;
  };
  itemContext?: {
    itemName?: string;
    itemCategory?: string;
  };
}

interface ExtractResponse {
  success: boolean;
  descriptors?: ExtractedDescriptor[];
  savedCount?: number;
  error?: string;
}

/**
 * API Endpoint: Extract and save flavor descriptors
 * POST /api/flavor-wheels/extract-descriptors
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractResponse>
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
      sourceType,
      sourceId,
      text,
      structuredData,
      itemContext
    } = req.body as ExtractRequest;

    // Validate request
    if (!sourceType || !sourceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sourceType, sourceId'
      });
    }

    if (!text && !structuredData) {
      return res.status(400).json({
        success: false,
        error: 'Either text or structuredData must be provided'
      });
    }

    // Extract descriptors
    let descriptors: ExtractedDescriptor[];

    if (structuredData) {
      descriptors = extractFromStructuredReview(structuredData);
    } else if (text) {
      descriptors = extractDescriptorsWithIntensity(text);
    } else {
      return res.status(400).json({
        success: false,
        error: 'No content provided for extraction'
      });
    }

    if (descriptors.length === 0) {
      return res.status(200).json({
        success: true,
        descriptors: [],
        savedCount: 0
      });
    }

    // Save descriptors to database
    const descriptorRecords = descriptors.map(descriptor => ({
      user_id: user.id,
      source_type: sourceType,
      source_id: sourceId,
      descriptor_text: descriptor.text,
      descriptor_type: descriptor.type,
      category: descriptor.category,
      subcategory: descriptor.subcategory,
      confidence_score: descriptor.confidence,
      intensity: descriptor.intensity,
      item_name: itemContext?.itemName || null,
      item_category: itemContext?.itemCategory || null
    }));

    // Use upsert to handle duplicates
    const { data: savedDescriptors, error: saveError } = await (supabase as any)
      .from('flavor_descriptors')
      .upsert(descriptorRecords, {
        onConflict: 'source_type,source_id,descriptor_text,descriptor_type',
        ignoreDuplicates: false
      })
      .select('id');

    if (saveError) {
      console.error('Error saving descriptors:', saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save descriptors'
      });
    }

    return res.status(200).json({
      success: true,
      descriptors,
      savedCount: savedDescriptors?.length || 0
    });

  } catch (error) {
    console.error('Error in extract-descriptors:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

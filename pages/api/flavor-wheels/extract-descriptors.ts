import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  extractDescriptorsWithIntensity,
  extractFromStructuredReview,
  ExtractedDescriptor
} from '@/lib/flavorDescriptorExtractor';
import { extractDescriptorsWithAI } from '@/lib/ai/descriptorExtractionService';

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
  category?: string;
  useAI?: boolean; // Flag to enable AI extraction
}

interface ExtractResponse {
  success: boolean;
  descriptors?: ExtractedDescriptor[];
  savedCount?: number;
  tokensUsed?: number;
  processingTimeMs?: number;
  extractionMethod?: 'keyword' | 'ai';
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
      itemContext,
      category,
      useAI = true // Default to AI extraction
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

    // Combine text from all fields
    let combinedText = text || '';
    if (structuredData && !text) {
      combinedText = [
        structuredData.aroma_notes || '',
        structuredData.flavor_notes || '',
        structuredData.texture_notes || '',
        structuredData.other_notes || ''
      ].filter(Boolean).join('. ');
    }

    // Extract descriptors using AI or keyword-based
    let descriptors: ExtractedDescriptor[];
    let tokensUsed = 0;
    let processingTimeMs = 0;
    let extractionMethod: 'keyword' | 'ai' = 'keyword';

    if (useAI && process.env.ANTHROPIC_API_KEY && combinedText.trim()) {
      try {
        // Get category taxonomy for context
        let taxonomyContext = null;
        if (category) {
          const { data: taxonomy } = await supabase
            .from('category_taxonomies')
            .select('taxonomy_data')
            .eq('normalized_name', category.toLowerCase())
            .single();

          taxonomyContext = taxonomy?.taxonomy_data;
        }

        // Use AI extraction
        const aiResult = await extractDescriptorsWithAI(
          combinedText,
          category,
          taxonomyContext
        );

        descriptors = aiResult.descriptors.map(d => ({
          text: d.text,
          type: d.type,
          category: d.category || null,
          subcategory: d.subcategory || null,
          confidence: d.confidence
        }));

        tokensUsed = aiResult.tokensUsed;
        processingTimeMs = aiResult.processingTimeMs;
        extractionMethod = 'ai';

        // Log AI extraction
        await supabase.from('ai_extraction_logs').insert({
          user_id: user.id,
          tasting_id: sourceId,
          source_type: sourceType,
          input_text: combinedText.substring(0, 1000),
          input_category: category,
          model_used: 'claude-haiku-3-20240307',
          tokens_used: tokensUsed,
          processing_time_ms: processingTimeMs,
          descriptors_extracted: descriptors.length,
          extraction_successful: true,
          raw_ai_response: { descriptors }
        });

      } catch (aiError) {
        console.error('AI extraction failed, falling back to keyword:', aiError);
        // Fall back to keyword-based extraction
        if (structuredData) {
          descriptors = extractFromStructuredReview(structuredData);
        } else {
          descriptors = extractDescriptorsWithIntensity(combinedText);
        }
        extractionMethod = 'keyword';
      }
    } else {
      // Use keyword-based extraction
      if (structuredData) {
        descriptors = extractFromStructuredReview(structuredData);
      } else {
        descriptors = extractDescriptorsWithIntensity(combinedText);
      }
      extractionMethod = 'keyword';
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
      item_category: itemContext?.itemCategory || null,
      ai_extracted: extractionMethod === 'ai',
      extraction_model: extractionMethod === 'ai' ? 'claude-haiku-3-20240307' : null
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
      savedCount: savedDescriptors?.length || 0,
      tokensUsed: extractionMethod === 'ai' ? tokensUsed : undefined,
      processingTimeMs: extractionMethod === 'ai' ? processingTimeMs : undefined,
      extractionMethod
    });

  } catch (error) {
    console.error('Error in extract-descriptors:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

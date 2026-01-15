import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  extractDescriptorsWithIntensity,
  extractFromStructuredReview,
  ExtractedDescriptor,
} from '@/lib/flavorDescriptorExtractor';
import { extractDescriptorsWithAI } from '@/lib/ai/descriptorExtractionService';
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

// Validation schema for extract descriptors request
const extractDescriptorsSchema = z.object({
  sourceType: z.enum(['quick_tasting', 'quick_review', 'prose_review'], {
    errorMap: () => ({ message: 'Source type must be quick_tasting, quick_review, or prose_review' }),
  }),
  sourceId: z.string().uuid('Source ID must be a valid UUID'),
  text: z.string().optional(),
  structuredData: z.object({
    aroma_notes: z.string().optional(),
    flavor_notes: z.string().optional(),
    texture_notes: z.string().optional(),
    other_notes: z.string().optional(),
    aroma_intensity: z.number().min(0).max(10).optional(),
    flavor_intensity: z.number().min(0).max(10).optional(),
  }).optional(),
  itemContext: z.object({
    itemName: z.string().optional(),
    itemCategory: z.string().optional(),
  }).optional(),
  category: z.string().optional(),
  useAI: z.boolean().optional().default(true),
}).refine(
  (data) => data.text || data.structuredData,
  { message: 'Either text or structuredData must be provided' }
);

type ExtractDescriptorsInput = z.infer<typeof extractDescriptorsSchema>;

interface ExtractResponse {
  descriptors: ExtractedDescriptor[];
  savedCount: number;
  tokensUsed?: number;
  processingTimeMs?: number;
  extractionMethod: 'keyword' | 'ai';
}

/**
 * API Endpoint: Extract and save flavor descriptors
 * POST /api/flavor-wheels/extract-descriptors
 */
async function extractDescriptorsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const {
    sourceType,
    sourceId,
    text,
    structuredData,
    itemContext,
    category,
    useAI,
  } = req.body as ExtractDescriptorsInput;

  try {

    // Combine text from all fields
    let combinedText = text || '';
    if (structuredData && !text) {
      combinedText = [
        structuredData.aroma_notes || '',
        structuredData.flavor_notes || '',
        structuredData.texture_notes || '',
        structuredData.other_notes || '',
      ]
        .filter(Boolean)
        .join('. ');
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

          taxonomyContext = (taxonomy as any)?.taxonomy_data ?? null;
        }

        // Use AI extraction
        const aiResult = await extractDescriptorsWithAI(combinedText, category, taxonomyContext);

        descriptors = aiResult.descriptors.map((d) => ({
          text: d.text,
          type: d.type,
          category: d.category || null,
          subcategory: d.subcategory || null,
          confidence: d.confidence,
        }));

        tokensUsed = aiResult.tokensUsed;
        processingTimeMs = aiResult.processingTimeMs;
        extractionMethod = 'ai';

        // Log AI extraction (store full input text, no truncation)
        // @ts-ignore - Supabase type inference issue
        await supabase.from('ai_extraction_logs').insert({
          user_id: userId,
          tasting_id: sourceId,
          source_type: sourceType,
          input_text: combinedText, // Store full text, no arbitrary truncation
          input_category: category,
          model_used: 'claude-3-haiku-20240307',
          tokens_used: tokensUsed,
          processing_time_ms: processingTimeMs,
          descriptors_extracted: descriptors.length,
          extraction_successful: true,
          raw_ai_response: { descriptors },
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
      return sendSuccess(
        res,
        {
          descriptors: [],
          savedCount: 0,
          extractionMethod,
        } as ExtractResponse,
        'No descriptors extracted'
      );
    }

    // Save descriptors to database with case-insensitive deduplication
    const descriptorRecords = descriptors.map((descriptor) => ({
      user_id: userId,
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
      normalized_form: descriptor.text.toLowerCase().trim(), // Case-insensitive normalization
      ai_extracted: extractionMethod === 'ai',
      extraction_model: extractionMethod === 'ai' ? 'claude-haiku-3-20240307' : null,
    }));

    // Use upsert with normalized form to prevent case-sensitive duplicates
    // The unique constraint is on (user_id, normalized_form, descriptor_type)
    // This will prevent "Chocolate" and "chocolate" from both being inserted
    const { data: savedDescriptors, error: saveError } = await (supabase as any)
      .from('flavor_descriptors')
      .upsert(descriptorRecords, {
        onConflict: 'user_id,normalized_form,descriptor_type',
        ignoreDuplicates: false, // Update existing records with new data
      })
      .select('id');

    if (saveError) {
      return sendServerError(res, saveError, 'Failed to save descriptors');
    }

    const responseData: ExtractResponse = {
      descriptors,
      savedCount: savedDescriptors?.length || 0,
      extractionMethod,
    };

    if (extractionMethod === 'ai') {
      responseData.tokensUsed = tokensUsed;
      responseData.processingTimeMs = processingTimeMs;
    }

    return sendSuccess(res, responseData, 'Descriptors extracted successfully', 200);
  } catch (error) {
    return sendServerError(res, error, 'Failed to extract descriptors');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(extractDescriptorsSchema, extractDescriptorsHandler)
    )
  ),
});

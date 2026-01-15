import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { generateCategoryTaxonomy } from '@/lib/ai/taxonomyGenerationService';
import {
  createApiHandler,
  withAuth,
  withValidation,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendError,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';
import { z } from 'zod';

// Validation schema for taxonomy request
const taxonomySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required').max(100, 'Category name too long'),
});

type TaxonomyInput = z.infer<typeof taxonomySchema>;

interface TaxonomyResponse {
  taxonomy: any;
  cached: boolean;
  warning?: string;
}

/**
 * API Endpoint: Get or create category taxonomy
 * POST /api/categories/get-or-create-taxonomy
 */
async function getTaxonomyHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const userId = requireUser(context).id;
  const supabase = getSupabaseClient(req, res);

  // Request body is already validated by withValidation middleware
  const { categoryName } = req.body as TaxonomyInput;

  try {
    const normalizedName = categoryName.toLowerCase().trim();

    // Check if taxonomy already exists
    const { data: existingTaxonomy } = await supabase
      .from('category_taxonomies')
      .select('*')
      .eq('normalized_name', normalizedName)
      .single();

    if (existingTaxonomy) {
      // Increment usage count
      await supabase
        .from('category_taxonomies')
        // @ts-ignore - Supabase type inference issue
        .update({
          usage_count: (existingTaxonomy as any).usage_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existingTaxonomy as any).id);

      const responseData: TaxonomyResponse = {
        taxonomy: existingTaxonomy,
        cached: true,
      };

      return sendSuccess(
        res,
        responseData,
        'Taxonomy retrieved from cache',
        200
      );
    }

    // Check if AI key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return sendError(
        res,
        'AI_NOT_AVAILABLE',
        'AI taxonomy generation not available (API key not configured)',
        503,
        { categoryName, normalizedName }
      );
    }

    // Generate new taxonomy with AI
    const taxonomy = await generateCategoryTaxonomy(categoryName);

    // Save to database
    const { data: savedTaxonomy, error: saveError } = await supabase
      .from('category_taxonomies')
      // @ts-ignore - Supabase type inference issue
      .insert({
        category_name: taxonomy.categoryName,
        normalized_name: taxonomy.normalizedName,
        taxonomy_data: taxonomy.taxonomyData,
        first_used_by: userId,
        usage_count: 1,
      })
      .select()
      .single();

    if (saveError) {
      return sendServerError(res, saveError, 'Failed to save taxonomy');
    }

    const responseData: TaxonomyResponse = {
      taxonomy: savedTaxonomy,
      cached: false,
    };

    return sendSuccess(
      res,
      responseData,
      'Taxonomy generated successfully',
      201
    );
  } catch (error) {
    return sendServerError(res, error, 'Failed to get or create taxonomy');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  POST: withRateLimit(RATE_LIMITS.API)(
    withAuth(
      withValidation(taxonomySchema, getTaxonomyHandler)
    )
  ),
});

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { generateCategoryTaxonomy } from '@/lib/ai/taxonomyGenerationService';

interface TaxonomyRequest {
  categoryName: string;
}

interface TaxonomyResponse {
  success: boolean;
  taxonomy?: any;
  cached?: boolean;
  error?: string;
}

/**
 * API Endpoint: Get or create category taxonomy
 * POST /api/categories/get-or-create-taxonomy
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaxonomyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient(req, res);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { categoryName } = req.body as TaxonomyRequest;
    if (!categoryName) {
      return res.status(400).json({ success: false, error: 'categoryName required' });
    }

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
        .update({
          usage_count: (existingTaxonomy as any).usage_count + 1,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', (existingTaxonomy as any).id);

      return res.status(200).json({
        success: true,
        taxonomy: existingTaxonomy,
        cached: true,
      });
    }

    // Check if AI key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(200).json({
        success: true,
        taxonomy: null,
        cached: false,
        error: 'AI taxonomy generation not available (no API key)',
      });
    }

    // Generate new taxonomy with AI
    const taxonomy = await generateCategoryTaxonomy(categoryName);

    // Save to database
    const { data: savedTaxonomy, error: saveError } = await supabase
      .from('category_taxonomies')
      .insert({
        category_name: taxonomy.categoryName,
        normalized_name: taxonomy.normalizedName,
        taxonomy_data: taxonomy.taxonomyData,
        first_used_by: user.id,
        usage_count: 1,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving taxonomy:', saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save taxonomy',
      });
    }

    return res.status(200).json({
      success: true,
      taxonomy: savedTaxonomy,
      cached: false,
    });

  } catch (error) {
    console.error('Taxonomy generation error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

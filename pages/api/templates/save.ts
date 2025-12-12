import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
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

const categoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  hasText: z.boolean(),
  hasScale: z.boolean(),
  hasBoolean: z.boolean(),
  scaleMax: z.number().min(5).max(100).optional(),
  rankInSummary: z.boolean(),
});

const saveTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name must be 120 characters or less'),
  baseCategory: z.string().min(1, 'Base category is required'),
  categories: z.array(categoryInputSchema).min(1, 'At least one category is required').max(20, 'Maximum 20 categories allowed'),
});

async function saveTemplateHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  // Get authenticated user ID from context (set by withAuth middleware)
  const user_id = requireUser(context).id;

  // Request body is already validated by withValidation middleware
  const { name, baseCategory, categories } = req.body as {
    name: string;
    baseCategory: string;
    categories: Array<{
      name: string;
      hasText: boolean;
      hasScale: boolean;
      hasBoolean: boolean;
      scaleMax?: number;
      rankInSummary: boolean;
    }>;
  };

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res);

  // Normalize categories structure
  const normalizedCategories = categories.map((cat, index) => ({
    name: cat.name,
    hasText: cat.hasText,
    hasScale: cat.hasScale,
    hasBoolean: cat.hasBoolean,
    scaleMax: cat.hasScale ? (cat.scaleMax || 100) : null,
    rankInSummary: cat.rankInSummary,
    sortOrder: index
  }));

  const { data, error } = await supabase
    .from('study_templates')
    .insert({
      user_id,
      name,
      base_category: baseCategory,
      categories: JSON.stringify(normalizedCategories)
    })
    .select()
    .single();

  if (error) {
    return sendError(res, 'INTERNAL_ERROR', `Failed to save template: ${error.message}`, 500);
  }

  return sendSuccess(
    res,
    { templateId: data.id, template: data },
    'Template saved successfully',
    201
  );
}

export default createApiHandler({
  POST: withAuth(withValidation(saveTemplateSchema, saveTemplateHandler)),
});

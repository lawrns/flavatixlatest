import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
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

interface CategoryInput {
  name: string;
  hasText: boolean;
  hasScale: boolean;
  hasBoolean: boolean;
  scaleMax?: number;
  rankInSummary: boolean;
}

interface CreateStudySessionRequest {
  name: string;
  baseCategory: string;
  categories: CategoryInput[];
}

const categoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  hasText: z.boolean(),
  hasScale: z.boolean(),
  hasBoolean: z.boolean(),
  scaleMax: z.number().min(5).max(100).optional(),
  rankInSummary: z.boolean(),
}).refine(
  (data) => data.hasText || data.hasScale || data.hasBoolean,
  { message: 'Each category must have at least one parameter type' }
);

const createStudySessionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name must be between 1 and 120 characters'),
  baseCategory: z.string().min(1, 'Base category is required'),
  categories: z.array(categoryInputSchema).min(1, 'At least one category is required').max(20, 'Maximum 20 categories allowed'),
});

async function createStudySessionHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  try {
    logger.debug('API', 'createStudySessionHandler started');
    // Get authenticated user ID from context (set by withAuth middleware)
    const user_id = requireUser(context).id;
    logger.debug('API', 'User ID', { userId: user_id });

    // Request body is already validated by withValidation middleware
    const { name, baseCategory, categories } = req.body as CreateStudySessionRequest;
    logger.debug('API', 'Request body', { name, baseCategory, categoriesCount: categories.length });

    // Get Supabase client with user context (RLS will enforce permissions)
    const supabase = getSupabaseClient(req, res);

    // Normalize base category to lowercase for consistency
    const normalizedCategory = baseCategory.toLowerCase().replace(/\s+/g, '_');

    // Store categories as structured data in notes field
    const studyMetadata = {
      baseCategory,
      categories: categories.map((cat, index) => ({
        name: cat.name,
        hasText: cat.hasText,
        hasScale: cat.hasScale,
        hasBoolean: cat.hasBoolean,
        scaleMax: cat.hasScale ? (cat.scaleMax || 100) : null,
        rankInSummary: cat.rankInSummary,
        sortOrder: index
      })),
      studyMode: true
    };

    const { data: session, error: sessionError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id,
        session_name: name,
        category: normalizedCategory === 'other' ? 'other' : normalizedCategory,
        custom_category_name: normalizedCategory === 'other' ? baseCategory : null,
        mode: 'study',
        study_approach: 'predefined',
        notes: JSON.stringify(studyMetadata),
        total_items: 0,
        completed_items: 0
      })
      .select()
      .single();

    if (sessionError) {
      logger.error('API', 'Session Error', sessionError);
      // Check if it's a column not found error (migration not applied)
      if (sessionError.message?.includes('column') && (sessionError.message?.includes('mode') || sessionError.message?.includes('study_approach'))) {
        return sendError(
          res,
          'INTERNAL_ERROR',
          'Database migration required. Please run flavorwheel_upgrade_migration.sql on your database.',
          500,
          { details: sessionError.message }
        );
      }

      return sendError(res, 'INTERNAL_ERROR', `Failed to create study session: ${sessionError.message}`, 500);
    }

    logger.debug('API', 'Session created:', session.id);

    return sendSuccess(
      res,
      { sessionId: session.id, session },
      'Study session created successfully',
      201
    );
  } catch (error) {
    logger.error('API', 'createStudySessionHandler error', error);
    return sendError(res, 'INTERNAL_ERROR', `Unexpected error: ${error instanceof Error ? error.message : String(error)}`, 500);
  }
}

export default createApiHandler({
  POST: withAuth(withValidation(createStudySessionSchema, createStudySessionHandler)),
});

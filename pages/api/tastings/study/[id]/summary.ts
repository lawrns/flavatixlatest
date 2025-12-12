import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withAuth,
  sendError,
  sendSuccess,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';

async function getSummaryHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  const { id } = req.query;
  const view = (req.query.view as string) || 'all';

  if (!id || typeof id !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Invalid session ID', 400);
  }

  // Get authenticated user ID from context (set by withAuth middleware)
  const user_id = requireUser(context).id;

  // Get Supabase client with user context (RLS will enforce permissions)
  const supabase = getSupabaseClient(req, res);

  // Verify user has access
  const { data: participant, error: participantError } = await supabase
    .from('study_participants')
    .select('id, role')
    .eq('session_id', id)
    .eq('user_id', user_id)
    .single();

  if (participantError || !participant) {
    return sendError(res, 'FORBIDDEN', 'Not authorized to view this session', 403);
  }

  // Fetch all data in parallel to avoid N+1 queries
  const [categoriesResult, itemsResult, responsesResult] = await Promise.all([
    // Get categories that should be ranked
    supabase
      .from('study_categories')
      .select('*')
      .eq('session_id', id)
      .eq('rank_in_summary', true)
      .eq('has_scale', true),
    // Get items
    supabase
      .from('study_items')
      .select('*')
      .eq('session_id', id)
      .order('sort_order'),
    // Get all scale responses for this session in one query (FIX: avoids N+1)
    supabase
      .from('study_responses')
      .select('item_id, category_id, scale_value')
      .eq('session_id', id)
      .not('scale_value', 'is', null)
  ]);

  if (categoriesResult.error || itemsResult.error || responsesResult.error) {
    return sendError(res, 'INTERNAL_ERROR', 'Failed to fetch summary data', 500);
  }

  const categories = categoriesResult.data || [];
  const items = itemsResult.data || [];
  const allResponses = responsesResult.data || [];

  // Calculate rankings from fetched data (in-memory aggregation)
  const ranking: Array<{
    itemId: string;
    itemLabel: string;
    categoryId: string;
    categoryName: string;
    score: number;
    responseCount: number;
  }> = [];

  if (items.length > 0 && categories.length > 0) {
    // Group responses by item_id and category_id for efficient lookup
    const responseMap = new Map<string, number[]>();
    for (const response of allResponses) {
      const key = `${response.item_id}:${response.category_id}`;
      if (!responseMap.has(key)) {
        responseMap.set(key, []);
      }
      responseMap.get(key)!.push(response.scale_value as number);
    }

    // Calculate averages for each item-category combination
    for (const item of items) {
      for (const category of categories) {
        const key = `${item.id}:${category.id}`;
        const scores = responseMap.get(key);
        if (scores && scores.length > 0) {
          const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
          ranking.push({
            itemId: item.id,
            itemLabel: item.label,
            categoryId: category.id,
            categoryName: category.name,
            score: Math.round(avgScore * 10) / 10,
            responseCount: scores.length
          });
        }
      }
    }
  }

  // Sort by score descending
  ranking.sort((a, b) => b.score - a.score);

  // Get AI insights if view=me
  let aiInsights: any[] = [];
  if (view === 'me') {
    const { data: insights } = await supabase
      .from('study_ai_cache')
      .select('*')
      .eq('session_id', id)
      .eq('participant_id', participant.id);

    aiInsights = insights || [];
  }

  return sendSuccess(res, {
    ranking,
    aiInsights,
    items,
    categories
  });
}

export default createApiHandler({
  GET: withAuth(getSummaryHandler),
});

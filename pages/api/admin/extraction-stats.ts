/**
 * Extraction Statistics API
 * Monitors descriptor extraction success rates in production
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import {
  createApiHandler,
  withAuth,
  withRateLimit,
  RATE_LIMITS,
  sendSuccess,
  sendServerError,
  requireUser,
  type ApiContext,
} from '@/lib/api/middleware';

interface ExtractionStats {
  period: string;
  totalItems: number;
  itemsWithContent: number;
  itemsExtracted: number;
  extractionRate: number;
  recentExtractions: Array<{
    date: string;
    count: number;
  }>;
  byCategory: Array<{
    category: string;
    total: number;
    extracted: number;
    rate: number;
  }>;
}

/**
 * GET /api/admin/extraction-stats
 * Get extraction statistics for monitoring
 */
async function getExtractionStatsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
) {
  requireUser(context); // Verify authentication
  const supabase = getSupabaseClient(req, res);

  try {
    const period = (req.query.period as string) || '7d';

    // Calculate date range
    const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get items with content created in period
    const { data: items, error: itemsError } = await (supabase as any)
      .from('quick_tasting_items')
      .select('id, tasting_id, notes, aroma, flavor, created_at')
      .gte('created_at', startDate.toISOString());

    if (itemsError) {
      return sendServerError(res, itemsError, 'Failed to fetch items');
    }

    // Filter items with content
    const itemsWithContent = (items || []).filter(
      (item: any) => item.notes?.trim() || item.aroma?.trim() || item.flavor?.trim()
    );

    // Get extracted descriptors for these items
    const itemIds = itemsWithContent.map((item: any) => item.id);
    const { data: descriptors, error: descriptorsError } = await (supabase as any)
      .from('flavor_descriptors')
      .select('source_id, created_at')
      .eq('source_type', 'quick_tasting')
      .in('source_id', itemIds);

    if (descriptorsError) {
      return sendServerError(res, descriptorsError, 'Failed to fetch descriptors');
    }

    // Calculate extraction statistics
    const extractedItemIds = new Set(
      (descriptors || []).map((d: any) => d.source_id)
    );

    const itemsExtracted = itemsWithContent.filter((item: any) =>
      extractedItemIds.has(item.id)
    ).length;

    const extractionRate = itemsWithContent.length > 0
      ? (itemsExtracted / itemsWithContent.length) * 100
      : 0;

    // Group by date for trend
    const extractionsByDate = new Map<string, number>();
    (descriptors || []).forEach((d: any) => {
      const date = new Date(d.created_at).toISOString().split('T')[0];
      extractionsByDate.set(date, (extractionsByDate.get(date) || 0) + 1);
    });

    const recentExtractions = Array.from(extractionsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get tastings to group by category
    const tastingIds = Array.from(new Set(itemsWithContent.map((item: any) => item.tasting_id)));
    const { data: tastings, error: tastingsError } = await (supabase as any)
      .from('quick_tastings')
      .select('id, category')
      .in('id', tastingIds);

    if (tastingsError) {
      return sendServerError(res, tastingsError, 'Failed to fetch tastings');
    }

    const tastingCategoryMap = new Map(
      (tastings || []).map((t: any) => [t.id, t.category])
    );

    // Group by category
    const categoryStats = new Map<string, { total: number; extracted: number }>();

    itemsWithContent.forEach((item: any) => {
      const category = (tastingCategoryMap.get(item.tasting_id) as string) || 'unknown';
      const stats = categoryStats.get(category) || { total: 0, extracted: 0 };
      stats.total++;
      if (extractedItemIds.has(item.id)) {
        stats.extracted++;
      }
      categoryStats.set(category, stats);
    });

    const byCategory = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      extracted: stats.extracted,
      rate: Math.round((stats.extracted / stats.total) * 100 * 100) / 100
    }));

    const response: ExtractionStats = {
      period,
      totalItems: (items || []).length,
      itemsWithContent: itemsWithContent.length,
      itemsExtracted,
      extractionRate: Math.round(extractionRate * 100) / 100,
      recentExtractions,
      byCategory
    };

    return sendSuccess(res, response, 'Extraction statistics retrieved successfully');
  } catch (error) {
    return sendServerError(res, error, 'Failed to get extraction statistics');
  }
}

// Export handler with middleware chain
export default createApiHandler({
  GET: withRateLimit(RATE_LIMITS.API)(withAuth(getExtractionStatsHandler)),
});

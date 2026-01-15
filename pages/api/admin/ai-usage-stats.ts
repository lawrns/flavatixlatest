import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { withAdminAuth, AdminPermission, createAuditLog } from '@/lib/admin/rbac';

interface UsageStats {
  period: string;
  totalRequests: number;
  totalTokens: number;
  estimatedCost: string;
  avgProcessingTimeMs: number;
  tokensPerRequest: number;
  successRate: number;
  extractionMethods: {
    ai: number;
    keyword: number;
  };
}

/**
 * API Endpoint: Get AI usage statistics
 * GET /api/admin/ai-usage-stats
 *
 * SECURITY: Requires admin role with AI_USAGE_READ permission
 * Uses fail-closed RBAC with comprehensive audit logging
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; stats?: UsageStats; error?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader!.replace('Bearer ', '');
    const supabase = getSupabaseClient(req, res);

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get usage stats from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ai_extraction_logs')
      .select('tokens_used, processing_time_ms, extraction_successful, created_at')
      .gte('created_at', thirtyDaysAgo);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          period: 'Last 30 days',
          totalRequests: 0,
          totalTokens: 0,
          estimatedCost: '$0.00',
          avgProcessingTimeMs: 0,
          tokensPerRequest: 0,
          successRate: 0,
          extractionMethods: { ai: 0, keyword: 0 },
        },
      });
    }

    const totalTokens = data.reduce((sum, log) => sum + ((log as any).tokens_used || 0), 0);
    const totalProcessingTime = data.reduce((sum, log) => sum + ((log as any).processing_time_ms || 0), 0);
    const successfulRequests = data.filter(log => (log as any).extraction_successful).length;

    // Cost calculation (Claude Haiku: $0.25/MTok input, $1.25/MTok output)
    // Assume 60/40 input/output split
    const estimatedCost =
      (totalTokens * 0.6 * 0.25 / 1_000_000) +
      (totalTokens * 0.4 * 1.25 / 1_000_000);

    const stats: UsageStats = {
      period: 'Last 30 days',
      totalRequests: data.length,
      totalTokens,
      estimatedCost: `$${estimatedCost.toFixed(4)}`,
      avgProcessingTimeMs: Math.round(totalProcessingTime / data.length),
      tokensPerRequest: Math.round(totalTokens / data.length),
      successRate: Math.round((successfulRequests / data.length) * 100),
      extractionMethods: {
        ai: data.length, // All logs are AI extractions
        keyword: 0, // Keyword extractions don't create logs
      },
    };

    return res.status(200).json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching AI usage stats:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

// Export with admin auth wrapper and AI_USAGE_READ permission
export default withAdminAuth(handler, AdminPermission.AI_USAGE_READ);

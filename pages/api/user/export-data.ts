/**
 * GDPR Data Export API
 *
 * Allows users to export all their personal data in JSON format
 * Complies with GDPR Article 20 (Right to Data Portability)
 *
 * POST /api/user/export-data
 * Authorization: Bearer <token>
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createApiHandler,
  withAuth,
  requireUser,
  sendSuccess,
  sendServerError,
  ApiContext,
} from '@/lib/api/middleware';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface ExportedData {
  exportDate: string;
  userData: {
    id: string;
    email: string;
    fullName?: string;
    createdAt: string;
    lastSignIn?: string;
  };
  profile?: any;
  tastings: any[];
  tastingItems: any[];
  flavorWheels: any[];
  reviews: any[];
  socialData: {
    likes: any[];
    comments: any[];
    follows: any[];
  };
  studyModeResponses: any[];
  aiExtractionLogs: any[];
}

async function handleExport(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
): Promise<void> {
  try {
    const user = requireUser(context);
    const supabase = getSupabaseClient(req, res);

    logger.info('DataExport', `User ${user.id} requested data export`, { userId: user.id });

    // Initialize export data structure
    const exportData: ExportedData = {
      exportDate: new Date().toISOString(),
      userData: {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name,
        createdAt: user.created_at || '',
        lastSignIn: user.last_sign_in_at || undefined,
      },
      tastings: [],
      tastingItems: [],
      flavorWheels: [],
      reviews: [],
      socialData: {
        likes: [],
        comments: [],
        follows: [],
      },
      studyModeResponses: [],
      aiExtractionLogs: [],
    };

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      exportData.profile = profile;
    }

    // Fetch tastings
    const { data: tastings } = await supabase.from('tastings').select('*').eq('user_id', user.id);

    if (tastings) {
      exportData.tastings = tastings;
    }

    // Fetch tasting items
    const { data: tastingItems } = await supabase
      .from('tasting_items')
      .select('*')
      .eq('user_id', user.id);

    if (tastingItems) {
      exportData.tastingItems = tastingItems;
    }

    // Fetch flavor wheels
    const { data: flavorWheels } = await supabase
      .from('flavor_wheels')
      .select('*')
      .eq('user_id', user.id);

    if (flavorWheels) {
      exportData.flavorWheels = flavorWheels;
    }

    // Fetch reviews
    const { data: reviews } = await supabase.from('reviews').select('*').eq('user_id', user.id);

    if (reviews) {
      exportData.reviews = reviews;
    }

    // Fetch social data - likes
    const { data: likes } = await supabase.from('likes').select('*').eq('user_id', user.id);

    if (likes) {
      exportData.socialData.likes = likes;
    }

    // Fetch social data - comments
    const { data: comments } = await supabase.from('comments').select('*').eq('user_id', user.id);

    if (comments) {
      exportData.socialData.comments = comments;
    }

    // Fetch social data - follows
    const { data: follows } = await supabase.from('follows').select('*').eq('follower_id', user.id);

    if (follows) {
      exportData.socialData.follows = follows;
    }

    // Fetch study mode responses
    const { data: studyResponses } = await supabase
      .from('study_mode_responses')
      .select('*')
      .eq('user_id', user.id);

    if (studyResponses) {
      exportData.studyModeResponses = studyResponses;
    }

    // Fetch AI extraction logs (last 90 days for privacy)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: aiLogs } = await supabase
      .from('ai_extraction_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', ninetyDaysAgo.toISOString());

    if (aiLogs) {
      exportData.aiExtractionLogs = aiLogs;
    }

    // Log successful export
    logger.info('DataExport', `Data export completed for user ${user.id}`, {
      userId: user.id,
      dataSize: JSON.stringify(exportData).length,
    });

    // Create audit log entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'data_export',
          resource_type: 'user_data',
          resource_id: user.id,
          metadata: {
            export_date: exportData.exportDate,
            data_size: JSON.stringify(exportData).length,
          },
        });
    } catch (err) {
      // Don't fail export if audit log fails
      logger.warn('DataExport', 'Failed to create audit log');
    }

    return sendSuccess(
      res,
      {
        export: exportData,
        format: 'json',
        exportDate: exportData.exportDate,
        dataSize: JSON.stringify(exportData).length,
      },
      'Data export completed successfully'
    );
  } catch (error) {
    logger.error('DataExport', 'Failed to export user data', error, {
      userId: context.user?.id,
    });
    return sendServerError(res, error, 'Failed to export data');
  }
}

export default createApiHandler({
  POST: withAuth(handleExport),
});

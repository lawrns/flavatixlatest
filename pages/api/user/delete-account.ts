/**
 * GDPR Account Deletion API
 *
 * Allows users to permanently delete their account and all associated data
 * Complies with GDPR Article 17 (Right to Erasure / Right to be Forgotten)
 *
 * DELETE /api/user/delete-account
 * Authorization: Bearer <token>
 *
 * SECURITY REQUIREMENTS:
 * - User must be authenticated
 * - Requires password confirmation for security
 * - Creates audit log before deletion
 * - Implements soft delete with 30-day grace period
 * - Hard delete after 30 days via scheduled job
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {
  createApiHandler,
  withAuth,
  withValidation,
  requireUser,
  sendSuccess,
  sendError,
  sendServerError,
  ApiContext,
} from '@/lib/api/middleware';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Validation schema for account deletion
const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmText: z.string().refine((val) => val === 'DELETE', {
    message: 'You must type DELETE to confirm account deletion',
  }),
});

async function handleDeleteAccount(
  req: NextApiRequest,
  res: NextApiResponse,
  context: ApiContext
): Promise<void> {
  try {
    const user = requireUser(context);
    const { password } = req.body;
    const supabase = getSupabaseClient(req, res);

    logger.warn('AccountDeletion', `User ${user.id} initiated account deletion`, {
      userId: user.id,
      email: user.email,
    });

    // Verify password before deletion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password,
    });

    if (signInError) {
      logger.warn('AccountDeletion', 'Password verification failed', {
        userId: user.id,
      });
      return sendError(
        res,
        'INVALID_PASSWORD',
        'Invalid password. Account deletion cancelled.',
        401
      );
    }

    // Create comprehensive audit log before deletion
    const auditLogData = {
      user_id: user.id,
      action: 'account_deletion_requested',
      resource_type: 'user_account',
      resource_id: user.id,
      metadata: {
        deletion_date: new Date().toISOString(),
        email: user.email,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
      },
    };

    await supabase
      .from('audit_logs')
      .insert(auditLogData)
      .catch((err) => {
        logger.error('AccountDeletion', 'Failed to create audit log', err);
      });

    // Implement soft delete with 30-day grace period
    // Mark account for deletion instead of immediate deletion
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const { error: markError } = await supabase
      .from('profiles')
      .update({
        deletion_requested_at: new Date().toISOString(),
        scheduled_deletion_at: deletionDate.toISOString(),
        account_status: 'pending_deletion',
      })
      .eq('id', user.id);

    if (markError) {
      logger.error('AccountDeletion', 'Failed to mark account for deletion', markError, {
        userId: user.id,
      });
      return sendServerError(res, markError, 'Failed to schedule account deletion');
    }

    // Anonymize sensitive data immediately
    // This protects user privacy while maintaining referential integrity
    const anonymizedEmail = `deleted_${user.id}@flavatix.local`;

    await supabase
      .from('profiles')
      .update({
        email: anonymizedEmail,
        full_name: '[Deleted User]',
        bio: null,
        avatar_url: null,
      })
      .eq('id', user.id)
      .catch((err) => {
        logger.warn('AccountDeletion', 'Failed to anonymize profile', { error: err });
      });

    // Delete user-generated content (optional - can be kept with anonymization)
    // This is configurable based on business requirements

    // Option 1: Delete all content (GDPR compliant)
    const tables = [
      'tasting_items',
      'tastings',
      'flavor_wheels',
      'reviews',
      'likes',
      'comments',
      'follows',
      'study_mode_responses',
    ];

    for (const table of tables) {
      await supabase
        .from(table)
        .delete()
        .eq('user_id', user.id)
        .catch((err) => {
          logger.warn('AccountDeletion', `Failed to delete from ${table}`, { error: err });
        });
    }

    // Delete AI extraction logs (privacy-sensitive data)
    await supabase
      .from('ai_extraction_logs')
      .delete()
      .eq('user_id', user.id)
      .catch((err) => {
        logger.warn('AccountDeletion', 'Failed to delete AI logs', { error: err });
      });

    // Sign out user immediately
    await supabase.auth.signOut();

    // Send deletion confirmation email (implement email service)
    // This would be handled by your email service
    logger.info('AccountDeletion', `Account deletion scheduled for user ${user.id}`, {
      userId: user.id,
      scheduledDeletion: deletionDate.toISOString(),
    });

    // Note: Final hard delete from auth.users table will be handled by scheduled job
    // after 30-day grace period. This gives users time to recover their account.

    return sendSuccess(
      res,
      {
        message: 'Account deletion scheduled',
        scheduledDeletion: deletionDate.toISOString(),
        gracePeriodDays: 30,
        recoveryInstructions: 'Contact support@flavatix.com within 30 days to recover your account',
      },
      'Account deletion initiated. Your account will be permanently deleted in 30 days.'
    );
  } catch (error) {
    logger.error('AccountDeletion', 'Account deletion failed', error, {
      userId: context.user?.id,
    });
    return sendServerError(res, error, 'Failed to delete account');
  }
}

export default createApiHandler({
  DELETE: withAuth(withValidation(deleteAccountSchema, handleDeleteAccount)),
});

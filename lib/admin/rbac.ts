/**
 * Role-Based Access Control (RBAC) for Admin Operations
 *
 * SECURITY: Fail-closed approach - deny by default, explicit allow required
 * Implements comprehensive audit logging for all admin operations
 */

import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum AdminPermission {
  // User management
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  USER_BAN = 'user:ban',

  // Content moderation
  CONTENT_READ = 'content:read',
  CONTENT_MODERATE = 'content:moderate',
  CONTENT_DELETE = 'content:delete',

  // AI and analytics
  AI_USAGE_READ = 'ai:usage:read',
  AI_LOGS_READ = 'ai:logs:read',
  ANALYTICS_READ = 'analytics:read',

  // System administration
  SYSTEM_CONFIG = 'system:config',
  AUDIT_LOGS_READ = 'audit:logs:read',
}

// Role -> Permission mapping
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    // Super admin has all permissions
    AdminPermission.USER_READ,
    AdminPermission.USER_WRITE,
    AdminPermission.USER_DELETE,
    AdminPermission.USER_BAN,
    AdminPermission.CONTENT_READ,
    AdminPermission.CONTENT_MODERATE,
    AdminPermission.CONTENT_DELETE,
    AdminPermission.AI_USAGE_READ,
    AdminPermission.AI_LOGS_READ,
    AdminPermission.ANALYTICS_READ,
    AdminPermission.SYSTEM_CONFIG,
    AdminPermission.AUDIT_LOGS_READ,
  ],
  [AdminRole.ADMIN]: [
    // Admin has most permissions except system config
    AdminPermission.USER_READ,
    AdminPermission.USER_WRITE,
    AdminPermission.USER_BAN,
    AdminPermission.CONTENT_READ,
    AdminPermission.CONTENT_MODERATE,
    AdminPermission.CONTENT_DELETE,
    AdminPermission.AI_USAGE_READ,
    AdminPermission.AI_LOGS_READ,
    AdminPermission.ANALYTICS_READ,
    AdminPermission.AUDIT_LOGS_READ,
  ],
  [AdminRole.MODERATOR]: [
    // Moderator has limited permissions
    AdminPermission.USER_READ,
    AdminPermission.CONTENT_READ,
    AdminPermission.CONTENT_MODERATE,
    AdminPermission.AI_USAGE_READ,
  ],
};

/**
 * Check if user has admin role
 * FAIL-CLOSED: Returns false by default, requires explicit role grant
 */
export async function isAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
): Promise<{ isAdmin: boolean; role?: AdminRole; error?: string }> {
  try {
    const supabase = getSupabaseClient(req, res);

    // Query user_roles table - MUST exist in production
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    // FAIL-CLOSED: If table doesn't exist or query fails, DENY access
    if (roleError) {
      const errorObj = typeof roleError === 'string' ? new Error(roleError) : (roleError as Error);
      logger.error('RBAC', 'Failed to query user_roles table', errorObj, {
        userId,
      });

      // Send to Sentry for monitoring
      Sentry.captureException(roleError, {
        tags: {
          security: true,
          rbac: true,
          userId,
        },
        level: 'error',
        extra: {
          message: 'user_roles table query failed - CRITICAL SECURITY ISSUE',
          userId,
        },
      });

      return {
        isAdmin: false,
        error: 'Authorization system unavailable. Access denied for security.',
      };
    }

    // Check if user has admin role
    if (!userRole || !userRole.role) {
      logger.info('RBAC', 'User has no admin role', { userId });
      return { isAdmin: false };
    }

    const role = userRole.role as AdminRole;

    // Validate role is a known admin role
    if (!Object.values(AdminRole).includes(role)) {
      logger.warn('RBAC', 'User has unknown role', { userId, role });
      return { isAdmin: false, error: 'Invalid role' };
    }

    // User is admin
    logger.info('RBAC', 'Admin access granted', { userId, role });
    return { isAdmin: true, role };
  } catch (error) {
    logger.error('RBAC', 'Admin check failed', error, { userId });

    Sentry.captureException(error, {
      tags: {
        security: true,
        rbac: true,
        userId,
      },
      level: 'error',
    });

    // FAIL-CLOSED: On any error, deny access
    return { isAdmin: false, error: 'Authorization check failed' };
  }
}

/**
 * Check if user has specific permission
 * FAIL-CLOSED: Requires valid role with explicit permission grant
 */
export async function hasPermission(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  permission: AdminPermission
): Promise<boolean> {
  const { isAdmin: userIsAdmin, role } = await isAdmin(req, res, userId);

  if (!userIsAdmin || !role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Require admin access (middleware-style function)
 * Throws error if user is not admin
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
): Promise<AdminRole> {
  const { isAdmin: userIsAdmin, role, error } = await isAdmin(req, res, userId);

  if (!userIsAdmin || !role) {
    const errorMessage = error || 'Admin access required';

    logger.warn('RBAC', 'Admin access denied', {
      userId,
      url: req.url,
      method: req.method,
    });

    throw new Error(errorMessage);
  }

  return role;
}

/**
 * Require specific permission
 * Throws error if user doesn't have permission
 */
export async function requirePermission(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
  permission: AdminPermission
): Promise<void> {
  const hasRequiredPermission = await hasPermission(req, res, userId, permission);

  if (!hasRequiredPermission) {
    logger.warn('RBAC', 'Permission denied', {
      userId,
      permission,
      url: req.url,
      method: req.method,
    });

    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Audit log interface
 */
interface AuditLogEntry {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create audit log for admin action
 * CRITICAL: All admin actions MUST be logged
 */
export async function createAuditLog(
  req: NextApiRequest,
  res: NextApiResponse,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const supabase = getSupabaseClient(req, res);

    const auditEntry = {
      ...entry,
      ip_address: entry.ip_address || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: entry.user_agent || req.headers['user-agent'],
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert(auditEntry);

    if (error) {
      logger.error('RBAC', 'Failed to create audit log - CRITICAL', error, {
        entry: auditEntry,
      });

      // Send to Sentry - audit log failure is CRITICAL
      Sentry.captureException(error, {
        tags: {
          security: true,
          audit: true,
          critical: true,
        },
        level: 'error',
        extra: {
          auditEntry,
          message: 'Audit log creation failed',
        },
      });

      // Don't throw - we don't want to break the operation
      // But we've logged the failure for investigation
    } else {
      logger.info('RBAC', 'Audit log created', { action: entry.action, userId: entry.user_id });
    }
  } catch (error) {
    logger.error('RBAC', 'Audit log exception', error, { entry });

    Sentry.captureException(error, {
      tags: {
        security: true,
        audit: true,
        critical: true,
      },
      level: 'error',
    });
  }
}

/**
 * Middleware wrapper for admin-only endpoints
 * Usage:
 *   export default withAdminAuth(handler, AdminPermission.USER_READ);
 */
export function withAdminAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, role: AdminRole) => Promise<void>,
  requiredPermission?: AdminPermission
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get user from auth header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseClient(req, res);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
        });
      }

      // Check admin access
      const role = await requireAdmin(req, res, user.id);

      // Check specific permission if required
      if (requiredPermission) {
        await requirePermission(req, res, user.id, requiredPermission);
      }

      // Create audit log
      await createAuditLog(req, res, {
        user_id: user.id,
        action: `admin_${req.method?.toLowerCase()}_${req.url}`,
        resource_type: 'admin_endpoint',
        resource_id: req.url,
        metadata: {
          role,
          permission: requiredPermission,
          method: req.method,
        },
      });

      // Call handler with role
      return handler(req, res, role);
    } catch (error) {
      logger.error('RBAC', 'Admin auth middleware error', error);

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: error instanceof Error ? error.message : 'Admin access required',
        },
      });
    }
  };
}

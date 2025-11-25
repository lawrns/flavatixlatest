/**
 * API Middleware Layer
 * 
 * Centralized middleware for all API routes providing:
 * - Authentication
 * - Input validation
 * - Error handling
 * - Request logging
 * - Rate limiting (TODO)
 * 
 * Usage:
 *   import { withAuth, withValidation, createApiHandler } from '@/lib/api/middleware';
 *   
 *   export default createApiHandler({
 *     POST: withAuth(withValidation(createTastingSchema, handler)),
 *     GET: publicHandler,
 *   });
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../supabase';
import { logger } from '../logger';
import { ERROR_CODES, API } from '../constants';
import { formatZodErrors, getFirstError } from '../validations/index';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiContext {
  user?: User;
  startTime: number;
}

export type ApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  context: ApiContext
) => Promise<void> | void;

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HandlerMap {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  PATCH?: ApiHandler;
  DELETE?: ApiHandler;
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  message?: string,
  status: number = 200
): void {
  res.status(status).json({
    success: true,
    data,
    message,
  } as ApiSuccessResponse<T>);
}

export function sendError(
  res: NextApiResponse,
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): void {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  } as ApiErrorResponse);
}

export function sendValidationError(
  res: NextApiResponse,
  errors: Record<string, string>
): void {
  sendError(res, ERROR_CODES.VALIDATION_FAILED, 'Validation failed', 400, errors);
}

export function sendUnauthorized(res: NextApiResponse, message: string = 'Unauthorized'): void {
  sendError(res, ERROR_CODES.AUTH_REQUIRED, message, 401);
}

export function sendNotFound(res: NextApiResponse, resource: string = 'Resource'): void {
  sendError(res, ERROR_CODES.NOT_FOUND, `${resource} not found`, 404);
}

export function sendForbidden(res: NextApiResponse, message: string = 'Forbidden'): void {
  sendError(res, ERROR_CODES.FORBIDDEN, message, 403);
}

export function sendServerError(
  res: NextApiResponse,
  error: unknown,
  message: string = 'Internal server error'
): void {
  logger.error('API', message, error);
  sendError(res, ERROR_CODES.INTERNAL_ERROR, message, 500);
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Middleware that requires authentication
 * Extracts user from Bearer token and adds to context
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req, res, context) => {
    try {
      // Get auth token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendUnauthorized(res, 'Missing or invalid Bearer token');
      }

      const token = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseClient(req, res);

      // Verify token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.debug('Auth', 'Invalid token', { error: error?.message });
        return sendUnauthorized(res, 'Invalid or expired token');
      }

      // Add user to context
      context.user = user;

      // Call the wrapped handler
      return handler(req, res, context);
    } catch (error) {
      logger.error('Auth', 'Authentication error', error);
      return sendServerError(res, error, 'Authentication error');
    }
  };
}

/**
 * Middleware that optionally authenticates
 * User will be undefined if not authenticated
 */
export function withOptionalAuth(handler: ApiHandler): ApiHandler {
  return async (req, res, context) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabaseClient(req, res);
        const { data: { user } } = await supabase.auth.getUser(token);
        context.user = user || undefined;
      }

      return handler(req, res, context);
    } catch (error) {
      // Don't fail on auth error, just proceed without user
      logger.debug('Auth', 'Optional auth failed', { error });
      return handler(req, res, context);
    }
  };
}

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Middleware that validates request body against a Zod schema
 * Validated data replaces req.body
 */
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: ApiHandler
): ApiHandler {
  return async (req, res, context) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        logger.debug('Validation', 'Validation failed', { errors });
        return sendValidationError(res, errors);
      }

      // Replace body with validated data
      req.body = result.data;

      return handler(req, res, context);
    } catch (error) {
      logger.error('Validation', 'Validation error', error);
      return sendServerError(res, error, 'Validation error');
    }
  };
}

/**
 * Middleware that validates query parameters
 */
export function withQueryValidation<T extends z.ZodSchema>(
  schema: T,
  handler: ApiHandler
): ApiHandler {
  return async (req, res, context) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = formatZodErrors(result.error);
        return sendValidationError(res, errors);
      }

      // Add validated query to request
      (req as any).validatedQuery = result.data;

      return handler(req, res, context);
    } catch (error) {
      logger.error('Validation', 'Query validation error', error);
      return sendServerError(res, error, 'Query validation error');
    }
  };
}

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

/**
 * Middleware that logs request/response
 */
export function withLogging(handler: ApiHandler): ApiHandler {
  return async (req, res, context) => {
    const { method, url } = req;
    const start = context.startTime;

    // Log request
    logger.api(method || 'UNKNOWN', url || '');

    // Wrap res.json to log response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const duration = performance.now() - start;
      logger.api(method || 'UNKNOWN', url || '', res.statusCode, Math.round(duration));
      return originalJson(body);
    };

    return handler(req, res, context);
  };
}

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Middleware that catches and handles errors
 */
export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, res, context) => {
    try {
      return await handler(req, res, context);
    } catch (error) {
      logger.error('API', `Unhandled error in ${req.method} ${req.url}`, error);
      
      // Don't send error if headers already sent
      if (res.headersSent) {
        return;
      }

      return sendServerError(res, error);
    }
  };
}

// ============================================================================
// MAIN API HANDLER FACTORY
// ============================================================================

/**
 * Create a standardized API handler with method routing
 * 
 * @example
 * export default createApiHandler({
 *   GET: withOptionalAuth(getHandler),
 *   POST: withAuth(withValidation(schema, createHandler)),
 * });
 */
export function createApiHandler(handlers: HandlerMap): (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const context: ApiContext = {
      startTime: performance.now(),
    };

    // Get handler for method
    const method = req.method as keyof HandlerMap;
    const handler = handlers[method];

    if (!handler) {
      const allowedMethods = Object.keys(handlers).join(', ');
      res.setHeader('Allow', allowedMethods);
      return sendError(
        res,
        'METHOD_NOT_ALLOWED',
        `Method ${method} not allowed`,
        405
      );
    }

    // Wrap with error handling and logging
    const wrappedHandler = withErrorHandling(withLogging(handler));

    return wrappedHandler(req, res, context);
  };
}

// ============================================================================
// UTILITY MIDDLEWARE COMPOSERS
// ============================================================================

/**
 * Compose multiple middleware into one
 */
export function compose(...middlewares: ((handler: ApiHandler) => ApiHandler)[]): (handler: ApiHandler) => ApiHandler {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((h, middleware) => middleware(h), handler);
  };
}

/**
 * Common middleware combinations
 */
export const authAndValidate = <T extends z.ZodSchema>(schema: T) =>
  compose(withAuth, (h) => withValidation(schema, h));

export const optionalAuthAndValidate = <T extends z.ZodSchema>(schema: T) =>
  compose(withOptionalAuth, (h) => withValidation(schema, h));

// ============================================================================
// HELPER FOR GETTING AUTHENTICATED USER
// ============================================================================

/**
 * Get user from context, throwing if not authenticated
 * Use in handlers wrapped with withAuth
 */
export function requireUser(context: ApiContext): User {
  if (!context.user) {
    throw new Error('User required but not found in context. Did you use withAuth middleware?');
  }
  return context.user;
}

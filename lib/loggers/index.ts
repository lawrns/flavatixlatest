/**
 * Specialized loggers for different subsystems
 * Each logger tracks specific metrics and context for its domain
 */

import { logger } from '@/lib/logger';

interface BaseLogContext {
  userId?: string;
  requestId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Authentication Logger
 * Tracks: login, logout, token refresh, signup, password reset
 */
export const authLogger = {
  login: (userId: string, method: string, success: boolean, context?: BaseLogContext) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Auth', `Login ${success ? 'success' : 'failed'}`, {
      userId,
      action: 'login',
      method,
      success,
      ...context,
    });
  },

  logout: (userId: string, context?: BaseLogContext) => {
    logger.info('Auth', 'User logged out', {
      userId,
      action: 'logout',
      ...context,
    });
  },

  signup: (userId: string, success: boolean, context?: BaseLogContext) => {
    const level = success ? 'info' : 'error';
    logger[level]('Auth', `Signup ${success ? 'success' : 'failed'}`, {
      userId,
      action: 'signup',
      success,
      ...context,
    });
  },

  tokenRefresh: (userId: string, success: boolean, context?: BaseLogContext) => {
    const level = success ? 'debug' : 'warn';
    logger[level]('Auth', `Token refresh ${success ? 'success' : 'failed'}`, {
      userId,
      action: 'token_refresh',
      success,
      ...context,
    });
  },

  passwordReset: (userId: string, success: boolean, context?: BaseLogContext) => {
    const level = success ? 'info' : 'error';
    logger[level]('Auth', `Password reset ${success ? 'success' : 'failed'}`, {
      userId,
      action: 'password_reset',
      success,
      ...context,
    });
  },

  sessionExpired: (userId: string, context?: BaseLogContext) => {
    logger.info('Auth', 'Session expired', {
      userId,
      action: 'session_expired',
      ...context,
    });
  },
};

/**
 * API Logger
 * Tracks: HTTP requests, responses, errors, performance
 */
export const apiLogger = {
  request: (method: string, path: string, context?: BaseLogContext) => {
    logger.debug('API', `${method} ${path}`, {
      action: 'request',
      method,
      path,
      ...context,
    });
  },

  response: (method: string, path: string, status: number, duration: number, context?: BaseLogContext) => {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'debug';
    logger[level]('API', `${method} ${path} -> ${status}`, {
      action: 'response',
      method,
      path,
      status,
      duration,
      ...context,
    });
  },

  error: (method: string, path: string, error: Error, context?: BaseLogContext) => {
    logger.error('API', `${method} ${path} failed`, error, {
      action: 'error',
      method,
      path,
      ...context,
    });
  },

  slowRequest: (method: string, path: string, duration: number, threshold: number, context?: BaseLogContext) => {
    logger.warn('API', `Slow request detected: ${method} ${path}`, {
      action: 'slow_request',
      method,
      path,
      duration,
      threshold,
      ...context,
    });
  },
};

/**
 * Database Logger
 * Tracks: queries, mutations, slow queries, connection issues
 */
export const databaseLogger = {
  query: (operation: string, table: string, duration: number, context?: BaseLogContext) => {
    const isSlow = duration > 100;
    const level = isSlow ? 'warn' : 'debug';
    logger[level]('Database', `${operation} ${table}${isSlow ? ' (slow)' : ''}`, {
      action: 'query',
      operation,
      table,
      duration,
      slow: isSlow,
      ...context,
    });
  },

  mutation: (operation: 'create' | 'update' | 'delete', table: string, recordId: string, duration: number, context?: BaseLogContext) => {
    logger.info('Database', `${operation} ${table}`, {
      action: 'mutation',
      operation,
      table,
      recordId,
      duration,
      ...context,
    });
  },

  slowQuery: (query: string, duration: number, threshold: number, context?: BaseLogContext) => {
    logger.warn('Database', 'Slow query detected', {
      action: 'slow_query',
      query: query.substring(0, 200),
      duration,
      threshold,
      ...context,
    });
  },

  connectionError: (error: Error, context?: BaseLogContext) => {
    logger.error('Database', 'Connection error', error, {
      action: 'connection_error',
      ...context,
    });
  },

  transaction: (operation: string, duration: number, success: boolean, context?: BaseLogContext) => {
    const level = success ? 'info' : 'error';
    logger[level]('Database', `Transaction ${operation} ${success ? 'committed' : 'rolled back'}`, {
      action: 'transaction',
      operation,
      duration,
      success,
      ...context,
    });
  },
};

/**
 * AI Logger
 * Tracks: API calls, token usage, costs, errors, latency
 */
export const aiLogger = {
  apiCall: (provider: string, model: string, operation: string, context?: BaseLogContext & { tokens?: number; cost?: number }) => {
    logger.debug('AI', `${provider} ${model} ${operation}`, {
      action: 'api_call',
      provider,
      model,
      operation,
      ...context,
    });
  },

  completion: (provider: string, model: string, tokens: number, duration: number, cost?: number, context?: BaseLogContext) => {
    logger.info('AI', `Completion generated: ${tokens} tokens`, {
      action: 'completion',
      provider,
      model,
      tokens,
      duration,
      cost,
      ...context,
    });
  },

  error: (provider: string, model: string, error: Error, context?: BaseLogContext) => {
    logger.error('AI', `AI API error: ${provider} ${model}`, error, {
      action: 'error',
      provider,
      model,
      ...context,
    });
  },

  rateLimited: (provider: string, model: string, retryAfter?: number, context?: BaseLogContext) => {
    logger.warn('AI', `Rate limited: ${provider} ${model}`, {
      action: 'rate_limited',
      provider,
      model,
      retryAfter,
      ...context,
    });
  },

  tokenUsage: (provider: string, model: string, inputTokens: number, outputTokens: number, totalCost?: number, context?: BaseLogContext) => {
    logger.info('AI', `Token usage: ${inputTokens + outputTokens} total`, {
      action: 'token_usage',
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      totalCost,
      ...context,
    });
  },
};

/**
 * Realtime Logger
 * Tracks: WebSocket connections, subscriptions, broadcasts, errors
 */
export const realtimeLogger = {
  connected: (userId: string, sessionId: string, context?: BaseLogContext) => {
    logger.info('Realtime', 'Client connected', {
      action: 'connected',
      userId,
      sessionId,
      ...context,
    });
  },

  disconnected: (userId: string, sessionId: string, reason?: string, context?: BaseLogContext) => {
    logger.info('Realtime', 'Client disconnected', {
      action: 'disconnected',
      userId,
      sessionId,
      reason,
      ...context,
    });
  },

  subscribed: (userId: string, channel: string, context?: BaseLogContext) => {
    logger.debug('Realtime', `Subscribed to ${channel}`, {
      action: 'subscribed',
      userId,
      channel,
      ...context,
    });
  },

  unsubscribed: (userId: string, channel: string, context?: BaseLogContext) => {
    logger.debug('Realtime', `Unsubscribed from ${channel}`, {
      action: 'unsubscribed',
      userId,
      channel,
      ...context,
    });
  },

  broadcast: (channel: string, event: string, recipientCount: number, context?: BaseLogContext) => {
    logger.debug('Realtime', `Broadcast ${event} to ${recipientCount} clients`, {
      action: 'broadcast',
      channel,
      event,
      recipientCount,
      ...context,
    });
  },

  error: (userId: string, error: Error, context?: BaseLogContext) => {
    logger.error('Realtime', 'Realtime error', error, {
      action: 'error',
      userId,
      ...context,
    });
  },

  reconnecting: (userId: string, attempt: number, context?: BaseLogContext) => {
    logger.warn('Realtime', `Reconnection attempt ${attempt}`, {
      action: 'reconnecting',
      userId,
      attempt,
      ...context,
    });
  },
};

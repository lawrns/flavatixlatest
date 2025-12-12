/**
 * Logger utility for Flavatix
 *
 * SINGLE SOURCE OF TRUTH for all logging in the application.
 * - In production: Only errors are logged (no debug/info noise)
 * - In development: All logs are shown with context
 * - Structured logging with consistent format for parsing
 * - Sensitive data filtering (passwords, tokens, keys)
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.debug('Auth', 'User signed in', { userId: '123' });
 *   logger.error('API', 'Failed to fetch', error);
 */

import * as Sentry from '@sentry/nextjs';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogContext {
  [key: string]: unknown;
  userId?: string;
  requestId?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  error?: Error;
  stack?: string;
}

// Configurable via environment variable
const getLogLevel = (): LogLevel => {
  if (typeof process !== 'undefined' && process.env) {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
    if (envLevel && envLevel in LOG_LEVELS) {
      return envLevel;
    }
    // Production: only errors, Development: all logs
    return process.env.NODE_ENV === 'production' ? 'error' : 'debug';
  }
  return 'debug';
};

const currentLevel = getLogLevel();

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

// Sensitive keys that should be filtered from logs
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'session',
  'privateKey',
  'private_key',
];

/**
 * Filter sensitive data from log context
 */
const filterSensitiveData = (context: LogContext): LogContext => {
  const filtered: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey =>
      lowerKey.includes(sensitiveKey.toLowerCase())
    );

    if (isSensitive) {
      filtered[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      filtered[key] = filterSensitiveData(value as LogContext);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
};

/**
 * Create structured log entry in JSON format
 */
interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  message: string;
  context?: LogContext;
  environment: string;
}

const createStructuredLog = (
  level: LogLevel,
  module: string,
  message: string,
  context?: LogContext
): StructuredLog => {
  const log: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    service: 'flavatix',
    module,
    message,
    environment: process.env.NODE_ENV || 'development',
  };

  if (context) {
    log.context = filterSensitiveData(context);
  }

  return log;
};

const formatMessage = (module: string, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const enrichedContext = {
    ...context,
    requestId: context?.requestId || currentRequestId || undefined,
  };
  const contextStr = enrichedContext && Object.keys(enrichedContext).length > 0
    ? ` ${JSON.stringify(filterSensitiveData(enrichedContext))}`
    : '';
  return `[${timestamp}] [${module}] ${message}${contextStr}`;
};

const formatError = (error: unknown, includeStack = true): string => {
  if (error instanceof Error) {
    const stack = includeStack && error.stack ? `\n${error.stack}` : '';
    return `${error.name}: ${error.message}${stack}`;
  }
  return String(error);
};

/**
 * Generate a unique request ID for tracing
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get current request ID from context (if available)
 */
let currentRequestId: string | null = null;

export const setRequestId = (requestId: string): void => {
  currentRequestId = requestId;
};

export const getRequestId = (): string | null => {
  return currentRequestId;
};

export const clearRequestId = (): void => {
  currentRequestId = null;
};

export const logger = {
  /**
   * Debug-level logging - only in development
   * Supports both: logger.debug('message') and logger.debug('Module', 'message', context)
   */
  debug: (moduleOrMessage: string, message?: string | LogContext, context?: LogContext): void => {
    if (shouldLog('debug')) {
      // Support legacy single-argument calls
      if (message === undefined || typeof message === 'object') {
        console.log(formatMessage('App', moduleOrMessage, message as LogContext | undefined));
      } else {
        console.log(formatMessage(moduleOrMessage, message, context));
      }
    }
  },
  
  /**
   * Info-level logging - only in development
   * Supports both: logger.info('message') and logger.info('Module', 'message', context)
   */
  info: (moduleOrMessage: string, message?: string | LogContext, context?: LogContext): void => {
    if (shouldLog('info')) {
      if (message === undefined || typeof message === 'object') {
        console.info(formatMessage('App', moduleOrMessage, message as LogContext | undefined));
      } else {
        console.info(formatMessage(moduleOrMessage, message, context));
      }
    }
  },
  
  /**
   * Warning-level logging - always in development, optionally in production
   * Supports both: logger.warn('message') and logger.warn('Module', 'message', context)
   */
  warn: (moduleOrMessage: string, message?: string | LogContext, context?: LogContext): void => {
    if (shouldLog('warn')) {
      if (message === undefined || typeof message === 'object') {
        console.warn(formatMessage('App', moduleOrMessage, message as LogContext | undefined));
      } else {
        console.warn(formatMessage(moduleOrMessage, message, context));
      }
    }
  },
  
  /**
   * Error-level logging - always logged
   * Supports both: logger.error('message', error) and logger.error('Module', 'message', error, context)
   * Also sends errors to Sentry in production
   */
  error: (moduleOrMessage: string, messageOrError?: string | unknown, errorOrContext?: unknown, context?: LogContext): void => {
    if (shouldLog('error')) {
      // Detect if using legacy signature: logger.error('message', error)
      if (typeof messageOrError !== 'string') {
        const errorStr = messageOrError ? `\n${formatError(messageOrError)}` : '';
        console.error(formatMessage('App', moduleOrMessage) + errorStr);

        // Send to Sentry if it's an error object
        if (messageOrError instanceof Error) {
          Sentry.captureException(messageOrError, {
            tags: { module: 'App' },
            level: 'error',
            extra: { message: moduleOrMessage },
          });
        }
      } else {
        const errorStr = errorOrContext ? `\n${formatError(errorOrContext)}` : '';
        console.error(formatMessage(moduleOrMessage, messageOrError, context) + errorStr);

        // Send to Sentry if it's an error object
        if (errorOrContext instanceof Error) {
          Sentry.captureException(errorOrContext, {
            tags: { module: moduleOrMessage },
            level: 'error',
            extra: { message: messageOrError, ...context },
          });
        }
      }
    }
  },

  /**
   * Fatal-level logging - critical errors that require immediate attention
   * ALWAYS sends to Sentry regardless of environment
   * Use for: system crashes, data corruption, security breaches
   */
  fatal: (moduleOrMessage: string, messageOrError?: string | unknown, errorOrContext?: unknown, context?: LogContext): void => {
    // Fatal errors are ALWAYS logged
    if (typeof messageOrError !== 'string') {
      const errorStr = messageOrError ? `\n${formatError(messageOrError)}` : '';
      console.error(`[FATAL] ${formatMessage('App', moduleOrMessage)}${errorStr}`);

      // Always send fatal errors to Sentry
      if (messageOrError instanceof Error) {
        Sentry.captureException(messageOrError, {
          tags: { module: 'App', severity: 'fatal' },
          level: 'fatal',
          extra: { message: moduleOrMessage },
        });
      } else {
        Sentry.captureMessage(`FATAL: ${moduleOrMessage}`, {
          level: 'fatal',
          tags: { module: 'App', severity: 'fatal' },
        });
      }
    } else {
      const errorStr = errorOrContext ? `\n${formatError(errorOrContext)}` : '';
      console.error(`[FATAL] ${formatMessage(moduleOrMessage, messageOrError, context)}${errorStr}`);

      // Always send fatal errors to Sentry
      if (errorOrContext instanceof Error) {
        Sentry.captureException(errorOrContext, {
          tags: { module: moduleOrMessage, severity: 'fatal' },
          level: 'fatal',
          extra: { message: messageOrError, ...context },
        });
      } else {
        Sentry.captureMessage(`FATAL: ${moduleOrMessage} - ${messageOrError}`, {
          level: 'fatal',
          tags: { module: moduleOrMessage, severity: 'fatal' },
          extra: context,
        });
      }
    }
  },

  /**
   * Log API request/response (debug level)
   */
  api: (method: string, path: string, status?: number, durationMs?: number): void => {
    if (shouldLog('debug')) {
      const statusStr = status ? ` -> ${status}` : '';
      const durationStr = durationMs ? ` (${durationMs}ms)` : '';
      console.log(`[API] ${method} ${path}${statusStr}${durationStr}`);
    }
  },

  /**
   * Performance measurement helper
   */
  time: (label: string): () => void => {
    if (!shouldLog('debug')) {
      return () => {};
    }
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
    };
  },

  /**
   * Structured logging - outputs JSON format for parsing
   */
  structured: (level: LogLevel, module: string, message: string, context?: LogContext): void => {
    if (shouldLog(level)) {
      const log = createStructuredLog(level, module, message, context);
      console.log(JSON.stringify(log));
    }
  },

  /**
   * Log authentication events
   */
  auth: (action: string, userId?: string, context?: LogContext): void => {
    logger.info('Auth', action, { userId, action, ...context });
  },

  /**
   * Log data mutations (create, update, delete)
   */
  mutation: (entity: string, action: 'create' | 'update' | 'delete', id?: string, userId?: string, context?: LogContext): void => {
    logger.info('Mutation', `${action} ${entity}`, { entity, action, id, userId, ...context });
  },

  /**
   * Log external API calls
   */
  externalApi: (service: string, endpoint: string, status?: number, duration?: number, context?: LogContext): void => {
    const statusStr = status ? `${status}` : 'pending';
    const durationStr = duration ? `${duration}ms` : '';
    logger.debug('ExternalAPI', `${service} ${endpoint} -> ${statusStr} ${durationStr}`, {
      service,
      endpoint,
      status,
      duration,
      ...context
    });
  },
};

// Export environment check helpers
export const isDevelopment = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
};

export const isProduction = (): boolean => {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
};

export const isServer = (): boolean => {
  return typeof window === 'undefined';
};

export const isClient = (): boolean => {
  return typeof window !== 'undefined';
};

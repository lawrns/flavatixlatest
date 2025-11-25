/**
 * Logger utility for Flavatix
 * 
 * SINGLE SOURCE OF TRUTH for all logging in the application.
 * - In production: Only errors are logged (no debug/info noise)
 * - In development: All logs are shown with context
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.debug('Auth', 'User signed in', { userId: '123' });
 *   logger.error('API', 'Failed to fetch', error);
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

interface LogContext {
  [key: string]: unknown;
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

const formatMessage = (module: string, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${module}] ${message}${contextStr}`;
};

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  }
  return String(error);
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
   */
  error: (moduleOrMessage: string, messageOrError?: string | unknown, errorOrContext?: unknown, context?: LogContext): void => {
    if (shouldLog('error')) {
      // Detect if using legacy signature: logger.error('message', error)
      if (typeof messageOrError !== 'string') {
        const errorStr = messageOrError ? `\n${formatError(messageOrError)}` : '';
        console.error(formatMessage('App', moduleOrMessage) + errorStr);
      } else {
        const errorStr = errorOrContext ? `\n${formatError(errorOrContext)}` : '';
        console.error(formatMessage(moduleOrMessage, messageOrError, context) + errorStr);
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

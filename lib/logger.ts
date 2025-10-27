/**
 * Logger utility for Flavatix
 * Only logs in development mode to avoid distracting console messages in production
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Only show debug/info logs in development
const currentLevel = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.warn 
  : LOG_LEVELS.debug;

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= currentLevel;
};

export const logger = {
  debug: (...args: any[]): void => {
    if (shouldLog('debug')) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]): void => {
    if (shouldLog('info')) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]): void => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
};

// Export a function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV !== 'production';
};

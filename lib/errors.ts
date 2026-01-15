/**
 * Typed Error Classes for Flavatix
 *
 * Provides strongly-typed error handling across the application.
 * Eliminates generic Error usage and enables better error recovery.
 *
 * @module lib/errors
 */

/**
 * Base application error with context
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly recoverable: boolean;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    recoverable: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.recoverable = recoverable;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for logging or API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack,
    };
  }
}

/**
 * Database operation errors (Supabase)
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', context, true);
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', context, true);
  }
}

/**
 * Permission/Access control errors
 */
export class PermissionError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PERMISSION_ERROR', context, false);
  }
}

/**
 * Validation errors (form data, API inputs)
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context, true);
    this.fields = fields;
  }
}

/**
 * Network/API call errors
 */
export class NetworkError extends AppError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', context, true);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

/**
 * Business logic errors (e.g., can't complete session with no items)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BUSINESS_LOGIC_ERROR', context, false);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  public readonly resourceType: string;
  public readonly resourceId?: string;

  constructor(resourceType: string, resourceId?: string, context?: Record<string, unknown>) {
    super(
      `${resourceType}${resourceId ? ` with ID ${resourceId}` : ''} not found`,
      'NOT_FOUND',
      context,
      false
    );
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extract user-friendly message from any error
 */
export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Error handler utility for consistent error processing
 */
export class ErrorHandler {
  /**
   * Handle error with logging and optional recovery
   */
  static handle(error: unknown, module: string, context?: Record<string, unknown>): AppError {
    // If already AppError, just return it
    if (isAppError(error)) {
      return error;
    }

    // Convert generic errors to AppError
    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        { ...context, originalError: error.name },
        true
      );
    }

    // Handle unknown error types
    return new AppError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { ...context, error: String(error) },
      true
    );
  }

  /**
   * Wrap async function with error handling
   */
  static async wrap<T>(
    fn: () => Promise<T>,
    module: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw ErrorHandler.handle(error, module, context);
    }
  }
}

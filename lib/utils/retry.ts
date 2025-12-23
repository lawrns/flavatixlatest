/**
 * Retry Utility
 * 
 * Provides retry logic with exponential backoff for transient failures
 * 
 * Usage:
 *   const result = await retry(
 *     () => fetch('/api/endpoint'),
 *     { maxAttempts: 3, baseDelay: 1000 }
 *   );
 */

export interface RetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Base delay in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  multiplier?: number;
  /** Function to determine if error is retryable (default: retries all errors) */
  isRetryable?: (error: unknown) => boolean;
  /** Custom delay function (overrides exponential backoff) */
  getDelay?: (attempt: number) => number;
  /** Callback on each retry attempt */
  onRetry?: (attempt: number, error: unknown) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: unknown
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Default retryable check - retries network errors and 5xx status codes
 */
function defaultIsRetryable(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // HTTP errors with 5xx status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }

  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry (should return a Promise)
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws RetryError if all attempts fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    multiplier = 2,
    isRetryable = defaultIsRetryable,
    getDelay,
    onRetry,
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;

    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt >= maxAttempts) {
        break;
      }

      // Calculate delay
      const delay = getDelay
        ? getDelay(attempt)
        : calculateDelay(attempt, baseDelay, maxDelay, multiplier);

      // Call retry callback
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new RetryError(
    `Failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError
  );
}

/**
 * Retry with jitter (randomized delay) to prevent thundering herd
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const baseDelay = options.baseDelay || 1000;
  const maxDelay = options.maxDelay || 30000;
  const multiplier = options.multiplier || 2;

  return retry(fn, {
    ...options,
    getDelay: (attempt: number) => {
      const base = calculateDelay(attempt, baseDelay, maxDelay, multiplier);
      // Add jitter: random value between 0 and 30% of base delay
      const jitter = Math.random() * base * 0.3;
      return base + jitter;
    },
  });
}


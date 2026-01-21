/**
 * API Client Utility
 *
 * Typed fetch wrapper for API endpoints with:
 * - Automatic authentication token injection
 * - Consistent error handling
 * - Type-safe request/response handling
 *
 * Usage:
 *   const client = createApiClient();
 *   const tasting = await client.get('/api/tastings/123');
 *   const newTasting = await client.post('/api/tastings/create', { category: 'wine', mode: 'quick' });
 */

import { API } from '@/lib/constants';
import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { retryWithJitter } from '@/lib/utils/retry';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseUrl: string = API.BASE_URL) {
    this.baseUrl = baseUrl;
    this.getAuthToken = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
      } catch (_error) {
        // Silently fail - auth token not available
        return null;
      }
    };
  }

  /**
   * Get authentication headers
   */
  private async getHeaders(options?: RequestOptions): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    // Add auth token unless skipAuth is true
    if (!options?.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers as HeadersInit;
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const data = await response.json();
      if (data.error) {
        return data.error;
      }
    } catch {
      // If response is not JSON, use status text
    }

    return {
      code: `HTTP_${response.status}`,
      message: response.statusText || 'Request failed',
    };
  }

  /**
   * Make a request with timeout, error handling, and retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || API.TIMEOUT_MS;

    return retryWithJitter(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const headers = await this.getHeaders(options);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json() as ApiResponse<T>;

        if (!response.ok || !data.success) {
          const error = !data.success ? data.error : await this.parseErrorResponse(response);

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw new ApiClientError(
              error.code,
              error.message,
              response.status,
              error.details
            );
          }

          // Retry server errors (5xx)
          throw new ApiClientError(
            error.code,
            error.message,
            response.status,
            error.details
          );
        }

        return (data as ApiSuccessResponse<T>).data;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiClientError) {
          throw error;
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiClientError('TIMEOUT', 'Request timeout', 408);
        }

        logger.error('API', 'Request failed', error, { endpoint, options });
        throw new ApiClientError(
          'NETWORK_ERROR',
          error instanceof Error ? error.message : 'Network request failed',
          0
        );
      }
    }, {
      maxAttempts: API.RETRY_ATTEMPTS,
      baseDelay: API.RETRY_DELAY_MS,
      isRetryable: (error) => {
        // Retry network errors and 5xx server errors
        if (error instanceof ApiClientError) {
          return error.status === 0 || (error.status >= 500 && error.status < 600) || error.code === 'TIMEOUT';
        }
        return true;
      },
    });
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
let apiClientInstance: ApiClient | null = null;

export function createApiClient(baseUrl?: string): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(baseUrl);
  }
  return apiClientInstance;
}

// Export default instance
export const apiClient = createApiClient();

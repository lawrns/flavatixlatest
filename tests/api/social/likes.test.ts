/**
 * Integration Tests: Social Likes API
 * Tests POST /api/social/likes endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import likesHandler from '@/pages/api/social/likes';
import {
  createMockRequest,
  createMockResponse,
  expectSuccess,
  expectError,
} from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('POST /api/social/likes', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const tastingId = '10000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
    const quickTastingsBuilder: any = {
      select: jest.fn(),
    };
    const tastingLikesBuilder: any = {
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'quick_tastings') {
          return quickTastingsBuilder;
        }

        if (table === 'tasting_likes') {
          return tastingLikesBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    (mockSupabase as any).quickTastingsBuilder = quickTastingsBuilder;
    (mockSupabase as any).tastingLikesBuilder = tastingLikesBuilder;

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);

    res = createMockResponse();
  });

  it('should return 401 when not authenticated', async () => {
    req = createMockRequest({
      method: 'POST',
      headers: {},
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse);

    expectError(res as NextApiResponse, 401);
  });

  it('should return 404 when tasting does not exist', async () => {
    const { quickTastingsBuilder } = mockSupabase as any;
    quickTastingsBuilder.select.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }),
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse);

    expectError(res as NextApiResponse, 404);
  });

  it('should create a like when not already liked', async () => {
    const { quickTastingsBuilder, tastingLikesBuilder } = mockSupabase as any;
    quickTastingsBuilder.select.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: tastingId },
          error: null,
        }),
      }),
    });

    tastingLikesBuilder.select.mockImplementation((_columns: string, options?: Record<string, unknown>) => {
      if (options?.count === 'exact') {
        return {
          eq: jest.fn().mockResolvedValue({
            count: 1,
            error: null,
          }),
        };
      }

      return {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      };
    });

    tastingLikesBuilder.insert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'like-id', user_id: testUser.id, tasting_id: tastingId },
          error: null,
        }),
      }),
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse);

    expectSuccess(
      res as NextApiResponse,
      expect.objectContaining({
        liked: true,
        like_count: expect.any(Number),
      })
    );
  });

  it('should delete a like when already liked', async () => {
    const existingLike = { id: 'like-id' };
    const { quickTastingsBuilder, tastingLikesBuilder } = mockSupabase as any;

    quickTastingsBuilder.select.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: tastingId },
          error: null,
        }),
      }),
    });

    tastingLikesBuilder.select.mockImplementation((_columns: string, options?: Record<string, unknown>) => {
      if (options?.count === 'exact') {
        return {
          eq: jest.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        };
      }

      return {
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: existingLike,
              error: null,
            }),
          }),
        }),
      };
    });

    tastingLikesBuilder.delete.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse);

    expectSuccess(
      res as NextApiResponse,
      expect.objectContaining({
        liked: false,
        like_count: expect.any(Number),
      })
    );
  });
});

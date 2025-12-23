/**
 * Integration Tests: Social Likes API
 * Tests POST /api/social/likes endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import likesHandler from '@/pages/api/social/likes';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('POST /api/social/likes', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const tastingId = 'test-tasting-id';

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

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

    await likesHandler(req as NextApiRequest, res as NextApiResponse, {
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectError(res as NextApiResponse, 401);
  });

  it('should return 404 when tasting does not exist', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectError(res as NextApiResponse, 404);
  });

  it('should create a like when not already liked', async () => {
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: tastingId },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found - like doesn't exist
      })
      .mockResolvedValueOnce({
        data: { id: 'like-id', user_id: testUser.id, tasting_id: tastingId },
        error: null,
      });

    mockSupabase.select.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          count: 1,
        }),
      }),
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectSuccess(res as NextApiResponse, expect.objectContaining({
      liked: true,
      like_count: expect.any(Number),
    }));
  });

  it('should delete a like when already liked', async () => {
    const existingLike = { id: 'like-id' };

    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: tastingId },
        error: null,
      })
      .mockResolvedValueOnce({
        data: existingLike,
        error: null,
      });

    mockSupabase.delete.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    mockSupabase.select.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          count: 0,
        }),
      }),
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { tasting_id: tastingId },
    });

    await likesHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectSuccess(res as NextApiResponse, expect.objectContaining({
      liked: false,
      like_count: expect.any(Number),
    }));
  });
});


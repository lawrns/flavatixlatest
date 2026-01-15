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
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

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

    // Create a shared chainable mock for Supabase query builder
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn(() => queryBuilder),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    // Store reference to query builder for test setup
    (mockSupabase as any).queryBuilder = queryBuilder;

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
    // Mock auth success
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: testUser },
      error: null,
    });

    // Mock tasting not found
    const queryBuilder = (mockSupabase as any).queryBuilder;
    queryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
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
    // Mock auth success
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: testUser },
      error: null,
    });

    const queryBuilder = (mockSupabase as any).queryBuilder;

    // Mock tasting exists, like doesn't exist, then create succeeds
    queryBuilder.single
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

    // Mock count query for like count
    queryBuilder.eq.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        count: 1,
        error: null,
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

    // Mock auth success
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: testUser },
      error: null,
    });

    const queryBuilder = (mockSupabase as any).queryBuilder;

    // Mock tasting exists, like exists
    queryBuilder.single
      .mockResolvedValueOnce({
        data: { id: tastingId },
        error: null,
      })
      .mockResolvedValueOnce({
        data: existingLike,
        error: null,
      });

    // Mock delete and count
    queryBuilder.delete.mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }),
    });

    queryBuilder.eq.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        count: 0,
        error: null,
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

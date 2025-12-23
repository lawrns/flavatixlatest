/**
 * Integration Tests: Social Follows API
 * Tests POST /api/social/follows endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import followsHandler from '@/pages/api/social/follows';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('POST /api/social/follows', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const followingId = testUser2.id;

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
      body: { following_id: followingId },
    });

    await followsHandler(req as NextApiRequest, res as NextApiResponse, {
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectError(res as NextApiResponse, 401);
  });

  it('should return 403 when trying to follow self', async () => {
    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { following_id: testUser.id },
    });

    await followsHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectError(res as NextApiResponse, 403);
  });

  it('should return 404 when target user does not exist', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    req = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { following_id: 'non-existent-user-id' },
    });

    await followsHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectError(res as NextApiResponse, 404);
  });

  it('should create a follow when not already following', async () => {
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { user_id: followingId, full_name: 'Test User 2' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found - follow doesn't exist
      })
      .mockResolvedValueOnce({
        data: { id: 'follow-id', follower_id: testUser.id, following_id: followingId },
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
      body: { following_id: followingId },
    });

    await followsHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectSuccess(res as NextApiResponse, expect.objectContaining({
      following: true,
      follower_count: expect.any(Number),
    }));
  });

  it('should delete a follow when already following', async () => {
    const existingFollow = { id: 'follow-id' };

    mockSupabase.single
      .mockResolvedValueOnce({
        data: { user_id: followingId, full_name: 'Test User 2' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: existingFollow,
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
      body: { following_id: followingId },
    });

    await followsHandler(req as NextApiRequest, res as NextApiResponse, {
      user: testUser,
      startTime: Date.now(),
      requestId: 'test-req',
    });

    expectSuccess(res as NextApiResponse, expect.objectContaining({
      following: false,
      follower_count: expect.any(Number),
    }));
  });
});


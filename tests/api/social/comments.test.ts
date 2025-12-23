/**
 * Integration Tests: Social Comments API
 * Tests GET, POST, DELETE /api/social/comments endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next';
import commentsHandler from '@/pages/api/social/comments';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('Social Comments API', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const tastingId = 'test-tasting-id';
  const commentId = 'test-comment-id';

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
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

  describe('GET /api/social/comments', () => {
    it('should return comments for a tasting', async () => {
      const mockComments = [
        {
          id: commentId,
          user_id: testUser.id,
          content: 'Test comment',
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.single.mockResolvedValue({
        data: { id: tastingId },
        error: null,
      });

      mockSupabase.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockComments,
              error: null,
            }),
          }),
        }),
      });

      req = createMockRequest({
        method: 'GET',
        query: { tasting_id: tastingId },
        headers: {},
      });

      await commentsHandler(req as NextApiRequest, res as NextApiResponse, {
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, expect.arrayContaining([]));
    });
  });

  describe('POST /api/social/comments', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: { tasting_id: tastingId, content: 'Test comment' },
      });

      await commentsHandler(req as NextApiRequest, res as NextApiResponse, {
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 401);
    });

    it('should create a comment successfully', async () => {
      const newComment = {
        id: commentId,
        user_id: testUser.id,
        tasting_id: tastingId,
        content: 'Test comment',
      };

      mockSupabase.single
        .mockResolvedValueOnce({
          data: { id: tastingId },
          error: null,
        })
        .mockResolvedValueOnce({
          data: newComment,
          error: null,
        });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { tasting_id: tastingId, content: 'Test comment' },
      });

      await commentsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, newComment);
    });
  });

  describe('DELETE /api/social/comments', () => {
    it('should return 403 when deleting another user\'s comment', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: commentId, user_id: testUser2.id },
        error: null,
      });

      req = createMockRequest({
        method: 'DELETE',
        headers: createMockAuthHeaders(),
        body: { comment_id: commentId },
      });

      await commentsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 403);
    });

    it('should delete own comment successfully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: commentId, user_id: testUser.id },
        error: null,
      });

      mockSupabase.delete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      req = createMockRequest({
        method: 'DELETE',
        headers: createMockAuthHeaders(),
        body: { comment_id: commentId },
      });

      await commentsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, { id: commentId });
    });
  });
});


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
  const tastingId = '11111111-1111-4111-8111-111111111111';
  const commentId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    jest.clearAllMocks();

    const quickTastingsBuilder: any = {
      select: jest.fn(),
    };
    const tastingCommentsBuilder: any = {
      select: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'quick_tastings') {
          return quickTastingsBuilder;
        }

        if (table === 'tasting_comments') {
          return tastingCommentsBuilder;
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
    (mockSupabase as any).tastingCommentsBuilder = tastingCommentsBuilder;

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

      const { quickTastingsBuilder, tastingCommentsBuilder } = mockSupabase as any;

      quickTastingsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: tastingId },
            error: null,
          }),
        }),
      });

      tastingCommentsBuilder.select
        .mockImplementationOnce(() => ({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockComments,
                error: null,
              }),
            }),
          }),
        }))
        .mockImplementationOnce(() => ({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }));

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

      const { quickTastingsBuilder, tastingCommentsBuilder } = mockSupabase as any;

      quickTastingsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: tastingId },
            error: null,
          }),
        }),
      });

      tastingCommentsBuilder.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: newComment,
            error: null,
          }),
        }),
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

      expect(res.status).toHaveBeenCalledWith(201);
      expectSuccess(res as NextApiResponse, newComment);
    });
  });

  describe('DELETE /api/social/comments', () => {
    it('should return 403 when deleting another user\'s comment', async () => {
      const { tastingCommentsBuilder } = mockSupabase as any;
      tastingCommentsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: commentId, user_id: testUser2.id },
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

      expectError(res as NextApiResponse, 403);
    });

    it('should delete own comment successfully', async () => {
      const { tastingCommentsBuilder } = mockSupabase as any;
      tastingCommentsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: commentId, user_id: testUser.id },
            error: null,
          }),
        }),
      });

      tastingCommentsBuilder.delete.mockReturnValue({
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

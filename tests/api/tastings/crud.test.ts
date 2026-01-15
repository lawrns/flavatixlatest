/**
 * Integration Tests: Tasting CRUD Operations
 * Tests GET, PUT, DELETE endpoints for tastings
 */

import { NextApiRequest, NextApiResponse } from 'next';
import tastingHandler from '@/pages/api/tastings/[id]/index';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser, testUser2 } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('Tasting CRUD Operations', () => {
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
      update: jest.fn().mockReturnThis(),
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

  describe('GET /api/tastings/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: {},
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
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
        method: 'GET',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should return 404 when tasting belongs to different user', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser2,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should return tasting with items when found', async () => {
      const mockTasting = {
        id: tastingId,
        user_id: testUser.id,
        category: 'wine',
        mode: 'quick',
        session_name: 'Test Tasting',
        quick_tasting_items: [
          {
            id: 'item-1',
            item_name: 'Test Item',
            overall_score: 85,
          },
        ],
      };

      mockSupabase.single.mockResolvedValue({
        data: mockTasting,
        error: null,
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, mockTasting);
    });
  });

  describe('PATCH /api/tastings/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'PATCH',
        query: { id: tastingId },
        headers: {},
        body: { session_name: 'Updated Name' },
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
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
        method: 'PATCH',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: { session_name: 'Updated Name' },
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should update tasting successfully', async () => {
      const existingTasting = {
        id: tastingId,
        user_id: testUser.id,
      };

      const updatedTasting = {
        ...existingTasting,
        session_name: 'Updated Name',
        notes: 'Updated notes',
      };

      // First call for ownership check
      mockSupabase.single
        .mockResolvedValueOnce({
          data: existingTasting,
          error: null,
        })
        // Second call for update
        .mockResolvedValueOnce({
          data: updatedTasting,
          error: null,
        });

      req = createMockRequest({
        method: 'PATCH',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: {
          session_name: 'Updated Name',
          notes: 'Updated notes',
        },
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, updatedTasting);
    });

    it('should validate input schema', async () => {
      req = createMockRequest({
        method: 'PATCH',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: {
          session_name: 'a'.repeat(300), // Too long
        },
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 400, 'VALIDATION_FAILED');
    });
  });

  describe('DELETE /api/tastings/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'DELETE',
        query: { id: tastingId },
        headers: {},
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
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
        method: 'DELETE',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should delete tasting successfully', async () => {
      const existingTasting = {
        id: tastingId,
        user_id: testUser.id,
      };

      mockSupabase.single.mockResolvedValue({
        data: existingTasting,
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
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await tastingHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, { id: tastingId });
    });
  });
});


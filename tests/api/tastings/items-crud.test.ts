/**
 * Integration Tests: Tasting Items CRUD Operations
 * Tests GET, POST, PUT, DELETE endpoints for tasting items
 */

import { NextApiRequest, NextApiResponse } from 'next';
import itemsHandler from '@/pages/api/tastings/[id]/items/index';
import itemHandler from '@/pages/api/tastings/[id]/items/[itemId]';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('Tasting Items CRUD Operations', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const tastingId = 'test-tasting-id';
  const itemId = 'test-item-id';

  beforeEach(() => {
    jest.clearAllMocks();

    const quickTastingsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const quickTastingItemsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'quick_tastings') {
          return quickTastingsBuilder;
        }

        if (table === 'quick_tasting_items') {
          return quickTastingItemsBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: jest.fn().mockResolvedValue({ error: null }),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    (mockSupabase as any).quickTastingsBuilder = quickTastingsBuilder;
    (mockSupabase as any).quickTastingItemsBuilder = quickTastingItemsBuilder;

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);

    res = createMockResponse();
  });

  describe('GET /api/tastings/[id]/items', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: {},
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 401);
    });

    it('should return 404 when tasting does not exist', async () => {
      const { quickTastingsBuilder } = mockSupabase as any;
      quickTastingsBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should return items list successfully', async () => {
      const mockItems = [
        { id: 'item-1', item_name: 'Item 1', item_order: 0 },
        { id: 'item-2', item_name: 'Item 2', item_order: 1 },
      ];
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;

      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id },
        error: null,
      });

      quickTastingItemsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              data: mockItems,
              error: null,
            }),
          }),
        }),
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, mockItems);
    });
  });

  describe('POST /api/tastings/[id]/items', () => {
    it('should return 401 when not authenticated', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: tastingId },
        headers: {},
        body: { item_name: 'New Item' },
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 401);
    });

    it('should return 403 when trying to add item to competition mode', async () => {
      const { quickTastingsBuilder } = mockSupabase as any;
      quickTastingsBuilder.single.mockResolvedValue({
        data: {
          id: tastingId,
          user_id: testUser.id,
          mode: 'competition',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: { item_name: 'New Item' },
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 403);
    });

    it('should create item successfully', async () => {
      const newItem = {
        id: itemId,
        tasting_id: tastingId,
        item_name: 'New Item',
        item_order: 0,
      };
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;

      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id, mode: 'quick' },
        error: null,
      });

      quickTastingItemsBuilder.select.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      quickTastingItemsBuilder.insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: newItem,
            error: null,
          }),
        }),
      });

      req = createMockRequest({
        method: 'POST',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: { item_name: 'New Item' },
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, newItem);
    });

    it('should validate input schema', async () => {
      req = createMockRequest({
        method: 'POST',
        query: { id: tastingId },
        headers: createMockAuthHeaders(),
        body: {
          item_name: '', // Empty name should fail
        },
      });

      await itemsHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 400, 'VALIDATION_FAILED');
    });
  });

  describe('GET /api/tastings/[id]/items/[itemId]', () => {
    it('should return 404 when item does not exist', async () => {
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;
      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id },
        error: null,
      });
      quickTastingItemsBuilder.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId, itemId },
        headers: createMockAuthHeaders(),
      });

      await itemHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectError(res as NextApiResponse, 404);
    });

    it('should return item successfully', async () => {
      const mockItem = {
        id: itemId,
        tasting_id: tastingId,
        item_name: 'Test Item',
        overall_score: 85,
      };
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;

      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id },
        error: null,
      });
      quickTastingItemsBuilder.single.mockResolvedValueOnce({
        data: mockItem,
        error: null,
      });

      req = createMockRequest({
        method: 'GET',
        query: { id: tastingId, itemId },
        headers: createMockAuthHeaders(),
      });

      await itemHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, mockItem);
    });
  });

  describe('PATCH /api/tastings/[id]/items/[itemId]', () => {
    it('should update item successfully', async () => {
      const existingItem = {
        id: itemId,
        tasting_id: tastingId,
        item_name: 'Original Name',
      };

      const updatedItem = {
        ...existingItem,
        item_name: 'Updated Name',
        overall_score: 90,
      };
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;

      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id },
        error: null,
      });
      quickTastingItemsBuilder.single.mockResolvedValueOnce({
        data: existingItem,
        error: null,
      });
      quickTastingItemsBuilder.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: updatedItem,
                error: null,
              }),
            }),
          }),
        }),
      });

      req = createMockRequest({
        method: 'PATCH',
        query: { id: tastingId, itemId },
        headers: createMockAuthHeaders(),
        body: {
          item_name: 'Updated Name',
          overall_score: 90,
        },
      });

      await itemHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, updatedItem);
    });
  });

  describe('DELETE /api/tastings/[id]/items/[itemId]', () => {
    it('should delete item successfully', async () => {
      const existingItem = {
        id: itemId,
        tasting_id: tastingId,
      };
      const { quickTastingsBuilder, quickTastingItemsBuilder } = mockSupabase as any;

      quickTastingsBuilder.single.mockResolvedValueOnce({
        data: { id: tastingId, user_id: testUser.id },
        error: null,
      });
      quickTastingItemsBuilder.single.mockResolvedValueOnce({
        data: existingItem,
        error: null,
      });

      quickTastingItemsBuilder.delete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      req = createMockRequest({
        method: 'DELETE',
        query: { id: tastingId, itemId },
        headers: createMockAuthHeaders(),
      });

      await itemHandler(req as NextApiRequest, res as NextApiResponse, {
        user: testUser,
        startTime: Date.now(),
        requestId: 'test-req',
      });

      expectSuccess(res as NextApiResponse, { id: itemId });
    });
  });
});

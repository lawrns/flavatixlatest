/**
 * API Route Tests: POST /api/tastings/create
 * Tests for creating tasting sessions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import createTastingHandler from '@/pages/api/tastings/create';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');

describe('POST /api/tastings/create', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    // Mock getSupabaseClient to return our mock
    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);

    // Create fresh request and response objects
    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: {
          category: 'wine',
          mode: 'quick',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401, 'AUTH_REQUIRED');
    });

    it('should return 401 when invalid Bearer token is provided', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders('invalid-user'),
        body: {
          category: 'wine',
          mode: 'quick',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when required fields are missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          // Missing category and mode
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400, 'VALIDATION_FAILED');
    });

    it('should return 400 when category is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'InvalidCategory',
          mode: 'quick',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400, 'VALIDATION_FAILED');
    });

    it('should return 400 when mode is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'invalid_mode',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400, 'VALIDATION_FAILED');
    });
  });

  describe('Successful Creation', () => {
    it('should create a quick tasting with valid data', async () => {
      const mockTasting = {
        id: 'tasting-123',
        user_id: testUser.id,
        category: 'wine',
        session_name: 'Wine Quick Tasting',
        mode: 'quick',
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({
        data: mockTasting,
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'quick',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectSuccess(res as NextApiResponse, {
        tasting: expect.objectContaining({
          id: 'tasting-123',
          category: 'wine',
          mode: 'quick',
        }),
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should use custom session name when provided', async () => {
      const customName = 'My Custom Wine Tasting';
      const mockTasting = {
        id: 'tasting-456',
        user_id: testUser.id,
        category: 'wine',
        session_name: customName,
        mode: 'quick',
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValue({
        data: mockTasting,
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'quick',
          session_name: customName,
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          session_name: customName,
        })
      );
    });

    it('should create competition tasting with items', async () => {
      const mockTasting = {
        id: 'tasting-789',
        user_id: testUser.id,
        category: 'wine',
        mode: 'competition',
        created_at: new Date().toISOString(),
      };

      const mockItems = [
        { id: 'item-1', tasting_id: 'tasting-789', item_name: 'Wine A' },
        { id: 'item-2', tasting_id: 'tasting-789', item_name: 'Wine B' },
      ];

      // Mock tasting creation
      mockSupabase.single.mockResolvedValueOnce({
        data: mockTasting,
        error: null,
      });

      // Mock items creation
      // select() is used twice:
      // - first for tasting creation (followed by .single())
      // - second for items creation (awaited directly)
      mockSupabase.select
        .mockImplementationOnce(() => mockSupabase)
        .mockResolvedValueOnce({
        data: mockItems,
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'competition',
          items: [
            { item_name: 'Wine A' },
            { item_name: 'Wine B' },
          ],
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectSuccess(res as NextApiResponse, {
        tasting: expect.objectContaining({ id: 'tasting-789' }),
        items: expect.arrayContaining([
          expect.objectContaining({ item_name: 'Wine A' }),
          expect.objectContaining({ item_name: 'Wine B' }),
        ]),
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when database insert fails', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'quick',
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });

    it('should rollback tasting when items creation fails', async () => {
      const mockTasting = {
        id: 'tasting-rollback',
        user_id: testUser.id,
        category: 'wine',
        mode: 'competition',
      };

      // Tasting creation succeeds
      mockSupabase.single.mockResolvedValueOnce({
        data: mockTasting,
        error: null,
      });

      // Items creation fails
      // select() is used twice; fail on the second call (items creation)
      mockSupabase.select
        .mockImplementationOnce(() => mockSupabase)
        .mockResolvedValueOnce({
        data: null,
        error: new Error('Items insert failed'),
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          category: 'wine',
          mode: 'competition',
          items: [{ item_name: 'Wine A' }],
        },
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      // Should have called delete to rollback
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'tasting-rollback');

      expectError(res as NextApiResponse, 500);
    });
  });

  describe('Method Routing', () => {
    it('should return 405 for GET requests', async () => {
      req = createMockRequest({
        method: 'GET',
        headers: createMockAuthHeaders(),
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });

    it('should return 405 for PUT requests', async () => {
      req = createMockRequest({
        method: 'PUT',
        headers: createMockAuthHeaders(),
      });

      await createTastingHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });
  });
});

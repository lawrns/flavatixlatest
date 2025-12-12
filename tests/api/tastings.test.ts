/**
 * API Route Tests: Tastings
 * Tests for POST/GET/PUT/DELETE tasting endpoints
 */

import { createMocks } from 'node-mocks-http';
import createTastingHandler from '@/pages/api/tastings/create';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-tasting-id',
              user_id: 'test-user-id',
              category: 'whiskey',
              mode: 'quick',
              session_name: 'Whiskey Quick Tasting',
            },
            error: null,
          }),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-tasting-id',
              user_id: 'test-user-id',
              category: 'whiskey',
            },
            error: null,
          }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-tasting-id', updated: true },
              error: null,
            }),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  })),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  generateRequestId: jest.fn(() => 'req_test'),
  setRequestId: jest.fn(),
  clearRequestId: jest.fn(),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    mutation: jest.fn(),
  },
}));

describe('/api/tastings/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - Create Tasting', () => {
    it('should create a quick tasting successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // user_id is NO LONGER accepted from client - removed from schema
          mode: 'quick',
          category: 'spirits',
          session_name: 'Test Whiskey Session',
          items: [],
        },
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await createTastingHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.tasting).toBeDefined();
      expect(data.data.tasting.id).toBe('test-tasting-id');
    });

    it('should return 400 for invalid request body', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing required fields (category)
          mode: 'quick',
        },
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await createTastingHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          mode: 'quick',
          category: 'spirits',
          items: [],
        },
        // No authorization header
      });

      await createTastingHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(401);
    });

    it('should handle database errors gracefully', async () => {
      const { getSupabaseClient } = require('@/lib/supabase');
      // NOTE: The handler calls getSupabaseClient twice:
      // - once in withAuth
      // - once inside createTastingHandler
      getSupabaseClient
        .mockReturnValueOnce({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'test-user-id' } },
              error: null,
            }),
          },
          from: jest.fn(),
        })
        .mockReturnValueOnce({
          from: jest.fn(() => ({
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              })),
            })),
          })),
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'test-user-id' } },
              error: null,
            }),
          },
        });

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          mode: 'quick',
          category: 'spirits',
          items: [],
        },
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await createTastingHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(500);
    });

    it('should create study mode tasting with predefined items', async () => {
      const { getSupabaseClient } = require('@/lib/supabase');
      const mockClient = {
        from: jest.fn((table) => {
          if (table === 'quick_tastings') {
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: 'test-tasting-id',
                      user_id: 'test-user-id',
                      category: 'whiskey',
                      mode: 'study',
                    },
                    error: null,
                  }),
                })),
              })),
              delete: jest.fn(),
            };
          }
          if (table === 'quick_tasting_items') {
            return {
              insert: jest.fn(() => ({
                select: jest.fn().mockResolvedValue({
                  data: [
                    { id: 'item-1', item_name: 'Sample 1' },
                    { id: 'item-2', item_name: 'Sample 2' },
                  ],
                  error: null,
                }),
              })),
            };
          }
        }),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
      };
      getSupabaseClient.mockReturnValue(mockClient);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          mode: 'study',
          study_approach: 'predefined',
          category: 'spirits',
          items: [
            { item_name: 'Sample 1', correct_answers: { category: 'bourbon' } },
            { item_name: 'Sample 2', correct_answers: { category: 'scotch' } },
          ],
        },
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await createTastingHandler(req as any, res as any);

      expect(res._getStatusCode()).toBe(201);
    });
  });
});

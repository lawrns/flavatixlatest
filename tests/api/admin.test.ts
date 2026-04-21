/**
 * Admin API Tests
 */

import { createMocks } from 'node-mocks-http';
import extractionStatsHandler from '@/pages/api/admin/extraction-stats';
import aiUsageStatsHandler from '@/pages/api/admin/ai-usage-stats';
import { mockUser } from '../fixtures';

jest.mock('@/lib/logger', () => ({
  generateRequestId: jest.fn(() => 'req_test'),
  setRequestId: jest.fn(),
  clearRequestId: jest.fn(),
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    mutation: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

const buildSupabaseMock = (options?: { aiUsageError?: boolean }) => ({
  auth: {
    getUser: jest.fn(async () => ({
      data: { user: mockUser },
      error: null,
    })),
  },
  from: jest.fn((table: string) => {
    if (table === 'quick_tasting_items') {
      return {
        select: jest.fn(() => ({
          gte: jest.fn(async () => ({
            data: [
              {
                id: '1',
                tasting_id: 't1',
                notes: 'vanilla',
                aroma: null,
                flavor: null,
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          })),
        })),
      };
    }

    if (table === 'flavor_descriptors') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(async () => ({
              data: [{ source_id: '1', created_at: new Date().toISOString() }],
              error: null,
            })),
          })),
        })),
      };
    }

    if (table === 'quick_tastings') {
      return {
        select: jest.fn(() => ({
          in: jest.fn(async () => ({
            data: [{ id: 't1', category: 'whiskey' }],
            error: null,
          })),
        })),
      };
    }

    if (table === 'user_roles') {
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(async () => ({ data: { role: 'admin' }, error: null })),
          })),
        })),
      };
    }

    if (table === 'ai_extraction_logs') {
      return {
        select: jest.fn(() => ({
          gte: jest.fn(async () => {
            if (options?.aiUsageError) {
              return {
                data: null,
                error: { message: 'Database connection error' },
              };
            }

            return {
              data: [
                {
                  tokens_used: 100,
                  processing_time_ms: 250,
                  extraction_successful: true,
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            };
          }),
        })),
      };
    }

    if (table === 'audit_logs') {
      return {
        insert: jest.fn(async () => ({ error: null })),
      };
    }

    return {
      select: jest.fn(() => ({
        gte: jest.fn(async () => ({ data: [], error: null })),
      })),
    };
  }),
});

beforeEach(() => {
  jest.clearAllMocks();
  const { getSupabaseClient } = require('@/lib/supabase');
  getSupabaseClient.mockImplementation(() => buildSupabaseMock());
});

describe('/api/admin/extraction-stats', () => {
  it('should return extraction statistics', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await extractionStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.period).toBeDefined();
    expect(data.data.totalItems).toBeDefined();
    expect(data.data.itemsWithContent).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await extractionStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await extractionStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
  });
});

describe('/api/admin/ai-usage-stats', () => {
  it('should return AI usage statistics', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await aiUsageStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await aiUsageStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
  });

  it('should handle database errors gracefully', async () => {
    const mockSupabase = require('@/lib/supabase');
    mockSupabase.getSupabaseClient.mockImplementation(() =>
      buildSupabaseMock({ aiUsageError: true })
    );

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await aiUsageStatsHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(500);
  });
});

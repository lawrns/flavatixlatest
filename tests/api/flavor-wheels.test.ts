/**
 * API Route Tests: Flavor Wheels
 * Tests for flavor wheel generation endpoint
 */

import { createMocks } from 'node-mocks-http';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));
jest.mock('@/lib/flavorWheelGenerator');
jest.mock('@/lib/logger', () => ({
  generateRequestId: jest.fn(() => 'req_test'),
  setRequestId: jest.fn(),
  clearRequestId: jest.fn(),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    mutation: jest.fn(),
  },
}));

describe('/api/flavor-wheels/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate flavor wheel successfully', async () => {
    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    });

    const { getOrGenerateFlavorWheel } = require('@/lib/flavorWheelGenerator');
    getOrGenerateFlavorWheel.mockResolvedValue({
      wheelData: {
        categories: [
          { name: 'Fruity', value: 8, descriptors: ['apple', 'berry'] },
          { name: 'Spicy', value: 6, descriptors: ['pepper', 'cinnamon'] },
        ],
      },
      wheelId: 'test-wheel-id',
      cached: false,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        wheelType: 'flavor',
        scopeType: 'personal',
      },
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const handler = (await import('@/pages/api/flavor-wheels/generate')).default;
    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        tasting_id: 'test-tasting-id',
        descriptors: [],
      },
    });

    const handler = (await import('@/pages/api/flavor-wheels/generate')).default;
    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 400 for invalid request body', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        // Missing required fields
      },
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    const handler = (await import('@/pages/api/flavor-wheels/generate')).default;
    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
  });
});

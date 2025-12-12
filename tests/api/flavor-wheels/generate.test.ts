/**
 * API Route Tests: POST /api/flavor-wheels/generate
 * Tests for generating flavor wheel visualizations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import generateWheelHandler from '@/pages/api/flavor-wheels/generate';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/flavorWheelGenerator');

describe('POST /api/flavor-wheels/generate', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let mockGetOrGenerateFlavorWheel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
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

    // Mock flavor wheel generator
    const { getOrGenerateFlavorWheel } = require('@/lib/flavorWheelGenerator');
    mockGetOrGenerateFlavorWheel = getOrGenerateFlavorWheel as jest.Mock;
    mockGetOrGenerateFlavorWheel.mockResolvedValue({
      wheelData: {
        categories: [
          { name: 'Fruity', value: 8, descriptors: ['apple', 'berry', 'citrus'] },
          { name: 'Floral', value: 6, descriptors: ['rose', 'jasmine'] },
          { name: 'Spicy', value: 7, descriptors: ['pepper', 'cinnamon'] },
        ],
      },
      wheelId: 'wheel-123',
      cached: false,
    });

    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
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
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when wheelType is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when scopeType is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when wheelType is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'invalid_type',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when scopeType is invalid', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'invalid_scope',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('Wheel Generation', () => {
    it('should generate personal aroma wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          wheelType: 'aroma',
          scopeType: 'personal',
          userId: testUser.id,
          scopeFilter: expect.objectContaining({
            userId: testUser.id,
          }),
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          wheelData: expect.objectContaining({
            categories: expect.arrayContaining([
              expect.objectContaining({ name: 'Fruity' }),
            ]),
          }),
          wheelId: 'wheel-123',
          cached: false,
        })
      );
    });

    it('should generate universal flavor wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'flavor',
          scopeType: 'universal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          wheelType: 'flavor',
          scopeType: 'universal',
          userId: undefined,
        })
      );
    });

    it('should generate category-specific wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'combined',
          scopeType: 'category',
          scopeFilter: {
            itemCategory: 'Wine',
          },
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          wheelType: 'combined',
          scopeType: 'category',
          scopeFilter: expect.objectContaining({
            itemCategory: 'Wine',
          }),
        })
      );
    });

    it('should generate item-specific wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'item',
          scopeFilter: {
            itemName: 'Cabernet Sauvignon',
            itemCategory: 'Wine',
          },
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          scopeType: 'item',
          scopeFilter: expect.objectContaining({
            itemName: 'Cabernet Sauvignon',
            itemCategory: 'Wine',
          }),
        })
      );
    });

    it('should generate tasting-specific wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'flavor',
          scopeType: 'tasting',
          scopeFilter: {
            tastingId: 'tasting-456',
          },
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          scopeType: 'tasting',
          scopeFilter: expect.objectContaining({
            tastingId: 'tasting-456',
          }),
        })
      );
    });

    it('should generate metaphor wheel', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'metaphor',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          wheelType: 'metaphor',
        })
      );
    });
  });

  describe('Caching and Force Regeneration', () => {
    it('should return cached wheel when available', async () => {
      mockGetOrGenerateFlavorWheel.mockResolvedValue({
        wheelData: {
          categories: [{ name: 'Fruity', value: 8, descriptors: ['apple'] }],
        },
        wheelId: 'cached-wheel-123',
        cached: true,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          cached: true,
        })
      );
    });

    it('should delete existing wheel when forceRegenerate is true', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
          forceRegenerate: true,
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('flavor_wheels');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('wheel_type', 'aroma');
      expect(mockSupabase.eq).toHaveBeenCalledWith('scope_type', 'personal');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', testUser.id);
    });
  });

  describe('Empty Descriptor Handling', () => {
    it('should return 200 with error message when no descriptors found', async () => {
      mockGetOrGenerateFlavorWheel.mockResolvedValue({
        wheelData: {
          categories: [],
        },
        wheelId: 'empty-wheel-123',
        cached: false,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          error: expect.stringContaining('No flavor descriptors found'),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when wheel generation fails', async () => {
      mockGetOrGenerateFlavorWheel.mockRejectedValue(
        new Error('Database connection failed')
      );

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          wheelType: 'aroma',
          scopeType: 'personal',
        },
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });
  });

  describe('Method Routing', () => {
    it('should return 405 for GET requests', async () => {
      req = createMockRequest({
        method: 'GET',
        headers: createMockAuthHeaders(),
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });

    it('should return 405 for PUT requests', async () => {
      req = createMockRequest({
        method: 'PUT',
        headers: createMockAuthHeaders(),
      });

      await generateWheelHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });
  });
});

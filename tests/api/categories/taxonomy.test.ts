/**
 * API Route Tests: POST /api/categories/get-or-create-taxonomy
 * Tests for getting or creating category taxonomies
 */

import { NextApiRequest, NextApiResponse } from 'next';
import taxonomyHandler from '@/pages/api/categories/get-or-create-taxonomy';
import { createMockRequest, createMockResponse, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/ai/taxonomyGenerationService');
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

describe('POST /api/categories/get-or-create-taxonomy', () => {
  let mockSupabase: any;
  let mockGenerateCategoryTaxonomy: jest.Mock;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
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

    // Mock taxonomy generation service
    const { generateCategoryTaxonomy } = require('@/lib/ai/taxonomyGenerationService');
    mockGenerateCategoryTaxonomy = generateCategoryTaxonomy as jest.Mock;
    mockGenerateCategoryTaxonomy.mockResolvedValue({
      categoryName: 'Wine',
      normalizedName: 'wine',
      taxonomyData: {
        categories: ['Fruity', 'Floral', 'Earthy'],
        descriptors: ['apple', 'rose', 'mushroom'],
      },
    });

    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

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
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when categoryName is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {},
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('Cached Taxonomy', () => {
    it('should return existing taxonomy when found', async () => {
      const existingTaxonomy = {
        id: 'taxonomy-123',
        category_name: 'Wine',
        normalized_name: 'wine',
        taxonomy_data: {
          categories: ['Fruity', 'Floral'],
        },
        usage_count: 5,
      };

      mockSupabase.single.mockResolvedValue({
        data: existingTaxonomy,
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('category_taxonomies');
      expect(mockSupabase.eq).toHaveBeenCalledWith('normalized_name', 'wine');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          taxonomy: existingTaxonomy,
          cached: true,
        })
      );
    });

    it('should increment usage count when returning cached taxonomy', async () => {
      const existingTaxonomy = {
        id: 'taxonomy-123',
        category_name: 'Wine',
        normalized_name: 'wine',
        usage_count: 5,
      };

      mockSupabase.single.mockResolvedValue({
        data: existingTaxonomy,
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          usage_count: 6,
        })
      );
    });

    it('should normalize category name for lookup', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'taxonomy-123',
          normalized_name: 'wine',
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: '  WINE  ' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.eq).toHaveBeenCalledWith('normalized_name', 'wine');
    });
  });

  describe('New Taxonomy Generation', () => {
    beforeEach(() => {
      // No existing taxonomy
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      // Set API key
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      // Mock successful insert
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'taxonomy-new',
            category_name: 'Wine',
            normalized_name: 'wine',
            taxonomy_data: {
              categories: ['Fruity', 'Floral', 'Earthy'],
            },
          },
          error: null,
        }),
      });
    });

    afterEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should generate new taxonomy when not cached', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGenerateCategoryTaxonomy).toHaveBeenCalledWith('Wine');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          cached: false,
        })
      );
    });

    it('should save generated taxonomy to database', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('category_taxonomies');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          category_name: 'Wine',
          normalized_name: 'wine',
          first_used_by: testUser.id,
          usage_count: 1,
          taxonomy_data: expect.objectContaining({
            categories: expect.any(Array),
          }),
        })
      );
    });

    it('should return 500 when save fails', async () => {
      mockSupabase.insert.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });
  });

  describe('AI Key Not Available', () => {
    it('should return 200 with null taxonomy when AI key missing', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      delete process.env.ANTHROPIC_API_KEY;

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockGenerateCategoryTaxonomy).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          taxonomy: null,
          cached: false,
          error: expect.stringContaining('AI taxonomy generation not available'),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when taxonomy generation fails', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      mockGenerateCategoryTaxonomy.mockRejectedValue(
        new Error('AI service error')
      );

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: { categoryName: 'Wine' },
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);

      delete process.env.ANTHROPIC_API_KEY;
    });
  });

  describe('Method Routing', () => {
    it('should return 405 for GET requests', async () => {
      req = createMockRequest({
        method: 'GET',
        headers: createMockAuthHeaders(),
      });

      await taxonomyHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });
  });
});

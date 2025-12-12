/**
 * API Route Tests: POST /api/flavor-wheels/extract-descriptors
 * Tests for extracting flavor descriptors from tasting notes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import extractDescriptorsHandler from '@/pages/api/flavor-wheels/extract-descriptors';
import { createMockRequest, createMockResponse, expectSuccess, expectError } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/ai/descriptorExtractionService');
jest.mock('@/lib/flavorDescriptorExtractor');
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

describe('POST /api/flavor-wheels/extract-descriptors', () => {
  let mockSupabase: any;
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let mockExtractDescriptorsWithAI: jest.Mock;
  let mockExtractDescriptorsWithIntensity: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      eq: jest.fn().mockReturnThis(),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: testUser },
          error: null,
        }),
      },
    };

    const { getSupabaseClient } = require('@/lib/supabase');
    getSupabaseClient.mockReturnValue(mockSupabase);

    // Mock AI extraction service
    const { extractDescriptorsWithAI } = require('@/lib/ai/descriptorExtractionService');
    mockExtractDescriptorsWithAI = extractDescriptorsWithAI as jest.Mock;
    mockExtractDescriptorsWithAI.mockResolvedValue({
      descriptors: [
        { text: 'chocolate', type: 'aroma', category: 'sweet', subcategory: 'cocoa', confidence: 0.95 },
        { text: 'fruity', type: 'flavor', category: 'fruity', subcategory: 'berry', confidence: 0.88 },
      ],
      tokensUsed: 250,
      processingTimeMs: 1200,
    });

    // Mock keyword extraction
    const { extractDescriptorsWithIntensity } = require('@/lib/flavorDescriptorExtractor');
    mockExtractDescriptorsWithIntensity = extractDescriptorsWithIntensity as jest.Mock;
    mockExtractDescriptorsWithIntensity.mockReturnValue([
      { text: 'sweet', type: 'flavor', intensity: 0.7 },
      { text: 'smooth', type: 'texture', intensity: 0.6 },
    ]);

    res = createMockResponse();
  });

  describe('Authentication', () => {
    it('should return 401 when no Bearer token is provided', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: {},
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

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
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 401);
    });
  });

  describe('Validation', () => {
    it('should return 400 when sourceType is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when sourceId is missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          text: 'Chocolate and fruity notes',
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });

    it('should return 400 when both text and structuredData are missing', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 400);
    });
  });

  describe('AI Extraction', () => {
    beforeEach(() => {
      // Set environment variable for AI
      process.env.ANTHROPIC_API_KEY = 'test-api-key';

      // Mock successful descriptor save
      mockSupabase.select.mockImplementation((columns?: string) => {
        // Descriptor save path uses `.select('id')` and expects a resolved result
        if (columns === 'id') {
          return Promise.resolve({
            data: [{ id: 'desc-1' }, { id: 'desc-2' }],
            error: null,
          });
        }
        // Taxonomy lookup uses `.select('taxonomy_data')` and must remain chainable
        return mockSupabase;
      });

      // Default taxonomy query response: no taxonomy found
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock AI extraction log save
      mockSupabase.insert.mockResolvedValue({
        data: { id: 'log-1' },
        error: null,
      });
    });

    afterEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should extract descriptors using AI when enabled', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Rich chocolate and fruity berry notes with smooth texture',
          category: 'Wine',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockExtractDescriptorsWithAI).toHaveBeenCalledWith(
        'Rich chocolate and fruity berry notes with smooth texture',
        'Wine',
        null
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          descriptors: expect.arrayContaining([
            expect.objectContaining({ text: 'chocolate' }),
            expect.objectContaining({ text: 'fruity' }),
          ]),
          extractionMethod: 'ai',
          tokensUsed: 250,
          processingTimeMs: 1200,
        })
      );
    });

    it('should extract descriptors with category taxonomy context', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          taxonomy_data: {
            categories: ['fruity', 'floral', 'nutty'],
          },
        },
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
          category: 'Wine',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockExtractDescriptorsWithAI).toHaveBeenCalledWith(
        'Chocolate and fruity notes',
        'Wine',
        expect.objectContaining({
          categories: expect.arrayContaining(['fruity', 'floral', 'nutty']),
        })
      );
    });

    it('should log AI extraction to database', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('ai_extraction_logs');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: testUser.id,
          tasting_id: 'tasting-123',
          source_type: 'quick_tasting',
          model_used: 'claude-3-haiku-20240307',
          tokens_used: 250,
          processing_time_ms: 1200,
          descriptors_extracted: 2,
          extraction_successful: true,
        })
      );
    });

    it('should fallback to keyword extraction when AI fails', async () => {
      mockExtractDescriptorsWithAI.mockRejectedValue(new Error('AI service unavailable'));

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockExtractDescriptorsWithIntensity).toHaveBeenCalledWith('Chocolate and fruity notes');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          extractionMethod: 'keyword',
          tokensUsed: undefined,
        })
      );
    });
  });

  describe('Keyword Extraction', () => {
    beforeEach(() => {
      mockSupabase.select.mockResolvedValue({
        data: [{ id: 'desc-1' }, { id: 'desc-2' }],
        error: null,
      });
    });

    it('should extract descriptors using keyword method when AI is disabled', async () => {
      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Sweet and smooth with chocolate notes',
          useAI: false,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockExtractDescriptorsWithIntensity).toHaveBeenCalledWith(
        'Sweet and smooth with chocolate notes'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          extractionMethod: 'keyword',
        })
      );
    });

    it('should extract from structured review data', async () => {
      const { extractFromStructuredReview } = require('@/lib/flavorDescriptorExtractor');
      const mockExtractFromStructured = extractFromStructuredReview as jest.Mock;
      mockExtractFromStructured.mockReturnValue([
        { text: 'fruity', type: 'aroma', intensity: 0.8 },
        { text: 'smooth', type: 'texture', intensity: 0.7 },
      ]);

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_review',
          sourceId: 'review-123',
          structuredData: {
            aroma_notes: 'fruity, floral',
            flavor_notes: 'sweet, chocolate',
            texture_notes: 'smooth, creamy',
            aroma_intensity: 8,
            flavor_intensity: 7,
          },
          useAI: false,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockExtractFromStructured).toHaveBeenCalledWith(
        expect.objectContaining({
          aroma_notes: 'fruity, floral',
          flavor_notes: 'sweet, chocolate',
        })
      );
    });
  });

  describe('Descriptor Storage', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      mockSupabase.insert.mockResolvedValue({ data: { id: 'log-1' }, error: null });
    });

    afterEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should save extracted descriptors to database', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [{ id: 'desc-1' }, { id: 'desc-2' }],
        error: null,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate and fruity notes',
          itemContext: {
            itemName: 'Cabernet Sauvignon',
            itemCategory: 'Wine',
          },
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(mockSupabase.from).toHaveBeenCalledWith('flavor_descriptors');
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: testUser.id,
            source_type: 'quick_tasting',
            source_id: 'tasting-123',
            descriptor_text: 'chocolate',
            descriptor_type: 'aroma',
            item_name: 'Cabernet Sauvignon',
            item_category: 'Wine',
            ai_extracted: true,
          }),
        ]),
        expect.objectContaining({
          onConflict: 'source_type,source_id,descriptor_text,descriptor_type',
        })
      );
    });

    it('should return 500 when descriptor save fails', async () => {
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'Chocolate notes',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 500);
    });

    it('should return empty result when no descriptors extracted', async () => {
      mockExtractDescriptorsWithAI.mockResolvedValue({
        descriptors: [],
        tokensUsed: 100,
        processingTimeMs: 500,
      });

      req = createMockRequest({
        method: 'POST',
        headers: createMockAuthHeaders(),
        body: {
          sourceType: 'quick_tasting',
          sourceId: 'tasting-123',
          text: 'No descriptors here',
          useAI: true,
        },
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          descriptors: [],
          savedCount: 0,
        })
      );
    });
  });

  describe('Method Routing', () => {
    it('should return 405 for GET requests', async () => {
      req = createMockRequest({
        method: 'GET',
        headers: createMockAuthHeaders(),
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });

    it('should return 405 for PUT requests', async () => {
      req = createMockRequest({
        method: 'PUT',
        headers: createMockAuthHeaders(),
      });

      await extractDescriptorsHandler(req as NextApiRequest, res as NextApiResponse);

      expectError(res as NextApiResponse, 405);
    });
  });
});

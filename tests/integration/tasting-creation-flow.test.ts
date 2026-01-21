/**
 * Integration Test: Tasting Creation Flow
 * Tests the complete flow from creating a tasting to managing items and generating flavor wheels
 */

import { NextApiRequest, NextApiResponse } from 'next';
import createTastingHandler from '@/pages/api/tastings/create';
import extractDescriptorsHandler from '@/pages/api/flavor-wheels/extract-descriptors';
import generateWheelHandler from '@/pages/api/flavor-wheels/generate';
import { createMockRequest, createMockResponse } from '@/lib/test-utils/utils';
import { createMockAuthHeaders } from '@/lib/test-utils/mocks';
import { testUser } from '@/lib/test-utils/fixtures';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/logger');
jest.mock('@/lib/flavorWheelGenerator');
jest.mock('@/lib/ai/descriptorExtractionService');
jest.mock('@/lib/flavorDescriptorExtractor', () => ({
  extractDescriptorsWithIntensity: jest.fn(),
}));
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

describe('Integration: Tasting Creation Flow', () => {
  let mockSupabase: any;
  let mockExtractDescriptorsWithAI: jest.Mock;
  let mockGetOrGenerateFlavorWheel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup comprehensive mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
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

    // Mock AI extraction
    const { extractDescriptorsWithAI } = require('@/lib/ai/descriptorExtractionService');
    mockExtractDescriptorsWithAI = extractDescriptorsWithAI as jest.Mock;

    // Mock flavor wheel generator
    const { getOrGenerateFlavorWheel } = require('@/lib/flavorWheelGenerator');
    mockGetOrGenerateFlavorWheel = getOrGenerateFlavorWheel as jest.Mock;
  });

  it('should complete full tasting creation workflow', async () => {
    const tastingId = 'tasting-integration-123';
    const itemName = 'Cabernet Sauvignon 2020';

    // Step 1: Create a quick tasting
    const mockTasting = {
      id: tastingId,
      user_id: testUser.id,
      category: 'wine',
      session_name: 'Wine Quick Tasting',
      mode: 'quick',
      created_at: new Date().toISOString(),
    };

    // First .single(): tasting insert
    mockSupabase.single.mockResolvedValueOnce({
      data: mockTasting,
      error: null,
    });
    // Second .single(): taxonomy lookup (no taxonomy found)
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const createReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        category: 'wine',
        mode: 'quick',
        session_name: 'Wine Quick Tasting',
      },
    });

    const createRes = createMockResponse();
    await createTastingHandler(createReq as NextApiRequest, createRes as NextApiResponse);

    // Verify tasting was created
    expect(createRes.status).toHaveBeenCalledWith(201);
    expect(createRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          tasting: expect.objectContaining({
            id: tastingId,
            category: 'wine',
            mode: 'quick',
          }),
        }),
      })
    );

    // Step 2: Extract descriptors from tasting notes
    process.env.ANTHROPIC_API_KEY = 'test-api-key';

    mockExtractDescriptorsWithAI.mockResolvedValue({
      descriptors: [
        { text: 'blackberry', type: 'aroma', category: 'fruity', subcategory: 'dark fruit', confidence: 0.95 },
        { text: 'oak', type: 'flavor', category: 'woody', subcategory: 'barrel', confidence: 0.88 },
        { text: 'tannic', type: 'texture', category: 'structure', subcategory: 'tannins', confidence: 0.92 },
      ],
      tokensUsed: 350,
      processingTimeMs: 1500,
    });

    // Mock descriptor upsert+select without breaking taxonomy lookup chaining
    mockSupabase.upsert.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 'desc-1' }, { id: 'desc-2' }, { id: 'desc-3' }],
        error: null,
      }),
    });

    mockSupabase.insert.mockResolvedValueOnce({
      data: { id: 'log-1' },
      error: null,
    });

    const extractReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        sourceType: 'quick_tasting',
        sourceId: tastingId,
        text: 'Rich blackberry aromas with oak notes and tannic structure',
        itemContext: {
          itemName,
          itemCategory: 'wine',
        },
        category: 'wine',
        useAI: true,
      },
    });

    const extractRes = createMockResponse();
    await extractDescriptorsHandler(extractReq as NextApiRequest, extractRes as NextApiResponse);

    // Verify descriptors were extracted and saved
    expect(mockExtractDescriptorsWithAI).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('flavor_descriptors');
    expect(extractRes.status).toHaveBeenCalledWith(200);
    expect(extractRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        descriptors: expect.arrayContaining([
          expect.objectContaining({ text: 'blackberry' }),
          expect.objectContaining({ text: 'oak' }),
          expect.objectContaining({ text: 'tannic' }),
        ]),
        extractionMethod: 'ai',
      })
    );

    // Step 3: Generate flavor wheel from descriptors
    mockGetOrGenerateFlavorWheel.mockResolvedValue({
      wheelData: {
        categories: [
          { name: 'Fruity', value: 10, descriptors: ['blackberry', 'cherry'] },
          { name: 'Woody', value: 8, descriptors: ['oak', 'cedar'] },
          { name: 'Structure', value: 9, descriptors: ['tannic', 'acidic'] },
        ],
      },
      wheelId: 'wheel-integration-123',
      cached: false,
    });

    const generateReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        wheelType: 'combined',
        scopeType: 'tasting',
        scopeFilter: {
          tastingId,
        },
      },
    });

    const generateRes = createMockResponse();
    await generateWheelHandler(generateReq as NextApiRequest, generateRes as NextApiResponse);

    // Verify flavor wheel was generated
    expect(mockGetOrGenerateFlavorWheel).toHaveBeenCalledWith(
      mockSupabase,
      expect.objectContaining({
        wheelType: 'combined',
        scopeType: 'tasting',
        scopeFilter: expect.objectContaining({
          tastingId,
        }),
      })
    );

    expect(generateRes.status).toHaveBeenCalledWith(200);
    expect(generateRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        wheelData: expect.objectContaining({
          categories: expect.arrayContaining([
            expect.objectContaining({ name: 'Fruity' }),
            expect.objectContaining({ name: 'Woody' }),
          ]),
        }),
      })
    );

    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should handle multi-item competition tasting workflow', async () => {
    const tastingId = 'competition-tasting-123';

    // Create competition tasting with multiple items
    const mockTasting = {
      id: tastingId,
      user_id: testUser.id,
      category: 'wine',
      mode: 'competition',
      created_at: new Date().toISOString(),
    };

    const mockItems = [
      { id: 'item-1', tasting_id: tastingId, item_name: 'Wine A' },
      { id: 'item-2', tasting_id: tastingId, item_name: 'Wine B' },
      { id: 'item-3', tasting_id: tastingId, item_name: 'Wine C' },
    ];

    mockSupabase.single.mockResolvedValueOnce({
      data: mockTasting,
      error: null,
    });

    // createTastingHandler calls `.select()` twice:
    // - tasting insert: `.select().single()` (chainable)
    // - items insert: `.select()` (awaited result)
    mockSupabase.select
      .mockImplementationOnce(() => mockSupabase)
      .mockResolvedValueOnce({
        data: mockItems,
        error: null,
      });

    const createReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        category: 'wine',
        mode: 'competition',
        items: [
          { item_name: 'Wine A' },
          { item_name: 'Wine B' },
          { item_name: 'Wine C' },
        ],
      },
    });

    const createRes = createMockResponse();
    await createTastingHandler(createReq as NextApiRequest, createRes as NextApiResponse);

    // Verify tasting and items were created
    expect(createRes.status).toHaveBeenCalledWith(201);
    expect(createRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          tasting: expect.objectContaining({ id: tastingId }),
          items: expect.arrayContaining([
            expect.objectContaining({ item_name: 'Wine A' }),
            expect.objectContaining({ item_name: 'Wine B' }),
            expect.objectContaining({ item_name: 'Wine C' }),
          ]),
        }),
      })
    );
  });

  it('should handle error in descriptor extraction gracefully', async () => {
    const tastingId = 'error-tasting-123';

    // Create tasting successfully
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: tastingId,
        user_id: testUser.id,
        category: 'wine',
        mode: 'quick',
      },
      error: null,
    });

    const createReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: { category: 'wine', mode: 'quick' },
    });

    const createRes = createMockResponse();
    await createTastingHandler(createReq as NextApiRequest, createRes as NextApiResponse);

    expect(createRes.status).toHaveBeenCalledWith(201);

    // Attempt descriptor extraction with AI failure
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    mockExtractDescriptorsWithAI.mockRejectedValue(new Error('AI service unavailable'));

    // Mock fallback keyword extraction
    const { extractDescriptorsWithIntensity } = require('@/lib/flavorDescriptorExtractor');
    extractDescriptorsWithIntensity.mockReturnValue([
      { text: 'fruity', type: 'flavor', intensity: 0.7 },
    ]);

    // Mock descriptor upsert+select for fallback save
    mockSupabase.upsert.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 'desc-fallback' }],
        error: null,
      }),
    });

    const extractReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        sourceType: 'quick_tasting',
        sourceId: tastingId,
        text: 'Fruity notes',
        useAI: true,
      },
    });

    const extractRes = createMockResponse();
    await extractDescriptorsHandler(extractReq as NextApiRequest, extractRes as NextApiResponse);

    // Verify it fell back to keyword extraction
    expect(extractRes.status).toHaveBeenCalledWith(200);
    expect(extractRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        extractionMethod: 'keyword',
      })
    );

    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should handle flavor wheel generation with no descriptors', async () => {
    mockGetOrGenerateFlavorWheel.mockResolvedValue({
      wheelData: {
        categories: [],
      },
      wheelId: 'empty-wheel-123',
      cached: false,
    });

    const generateReq = createMockRequest({
      method: 'POST',
      headers: createMockAuthHeaders(),
      body: {
        wheelType: 'aroma',
        scopeType: 'personal',
      },
    });

    const generateRes = createMockResponse();
    await generateWheelHandler(generateReq as NextApiRequest, generateRes as NextApiResponse);

    expect(generateRes.status).toHaveBeenCalledWith(200);
    expect(generateRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          warning: expect.stringContaining('No flavor descriptors found'),
        }),
      })
    );
  });
});

/**
 * AI Service Tests
 * Tests for flavor descriptor extraction using Anthropic API
 */

import { extractDescriptorsWithAI } from '@/lib/ai/descriptorExtractionService';

// Mock create function
const mockCreate = jest.fn();

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  }));
});

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: table === 'active_flavor_categories'
            ? [
                { id: '1', name: 'Fruity', display_order: 1, color_hex: '#ff0000' },
                { id: '2', name: 'Spicy', display_order: 2, color_hex: '#ff6600' },
              ]
            : [
                { id: '1', name: 'Nostalgic', display_order: 1, color_hex: '#0000ff' },
              ],
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
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    externalApi: jest.fn(),
  },
}));

describe('AI Descriptor Extraction', () => {
  const mockAnthropicResponse = {
    content: [
      {
        type: 'text',
        text: JSON.stringify([
          {
            text: 'apple',
            type: 'flavor',
            category: 'Fruity',
            subcategory: 'Orchard',
            confidence: 0.9,
          },
          {
            text: 'cinnamon',
            type: 'flavor',
            category: 'Spicy',
            subcategory: 'Sweet Spice',
            confidence: 0.85,
          },
        ]),
      },
    ],
    usage: {
      input_tokens: 100,
      output_tokens: 50,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockClear();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should extract flavor descriptors successfully', async () => {
    mockCreate.mockResolvedValue(mockAnthropicResponse);

    const result = await extractDescriptorsWithAI(
      'This whiskey has notes of apple and cinnamon',
      'whiskey'
    );

    expect(result.descriptors).toHaveLength(2);
    expect(result.descriptors[0]).toMatchObject({
      text: 'apple',
      type: 'flavor',
      category: 'Fruity',
      confidence: 0.9,
    });
    expect(result.tokensUsed).toBe(150);
    expect(result.processingTimeMs).toBeGreaterThan(0);
  });

  it('should map AI categories to predefined category IDs', async () => {
    mockCreate.mockResolvedValue(mockAnthropicResponse);

    const result = await extractDescriptorsWithAI('Apple and cinnamon notes');

    expect(result.descriptors[0].predefined_category_id).toBeDefined();
    expect(result.descriptors[1].predefined_category_id).toBeDefined();
  });

  it('should throw error when API key is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    await expect(
      extractDescriptorsWithAI('Test text')
    ).rejects.toThrow('ANTHROPIC_API_KEY environment variable is not set');
  });

  it('should handle API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

    await expect(
      extractDescriptorsWithAI('Test text')
    ).rejects.toThrow('API rate limit exceeded');
  });

  it('should handle malformed JSON responses', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'This is not valid JSON',
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    await expect(
      extractDescriptorsWithAI('Test text')
    ).rejects.toThrow();
  });

  it('should extract texture descriptors', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify([
            {
              text: 'creamy',
              type: 'texture',
              category: 'Mouthfeel',
              confidence: 0.95,
            },
          ]),
        },
      ],
      usage: { input_tokens: 50, output_tokens: 30 },
    });

    const result = await extractDescriptorsWithAI('Smooth and creamy texture');

    expect(result.descriptors[0].type).toBe('texture');
    expect(result.descriptors[0].text).toBe('creamy');
  });

  it('should extract metaphor descriptors', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify([
            {
              text: 'reminds me of Christmas',
              type: 'metaphor',
              category: 'Nostalgic',
              confidence: 0.8,
            },
          ]),
        },
      ],
      usage: { input_tokens: 60, output_tokens: 40 },
    });

    const result = await extractDescriptorsWithAI('This reminds me of Christmas morning');

    expect(result.descriptors[0].type).toBe('metaphor');
    expect(result.descriptors[0].predefined_category_id).toBe('1');
  });

  it('should use taxonomy context when provided', async () => {
    mockCreate.mockResolvedValue(mockAnthropicResponse);

    const taxonomyContext = {
      aromaCategories: ['Fruity', 'Floral'],
    };

    await extractDescriptorsWithAI('Apple notes', 'whiskey', taxonomyContext);

    expect(mockCreate).toHaveBeenCalled();
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('Fruity');
  });

  it('should handle concurrent requests', async () => {
    mockCreate.mockResolvedValue(mockAnthropicResponse);

    const requests = [
      extractDescriptorsWithAI('Apple'),
      extractDescriptorsWithAI('Cinnamon'),
      extractDescriptorsWithAI('Vanilla'),
    ];

    const results = await Promise.all(requests);

    expect(results).toHaveLength(3);
    expect(mockCreate).toHaveBeenCalledTimes(3);
  });

  it('should preserve exact user wording', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify([
            {
              text: 'chocolatey',
              type: 'flavor',
              category: 'Sweet',
              confidence: 0.9,
            },
          ]),
        },
      ],
      usage: { input_tokens: 50, output_tokens: 30 },
    });

    const result = await extractDescriptorsWithAI('Chocolatey notes throughout');

    expect(result.descriptors[0].text).toBe('chocolatey');
  });
});

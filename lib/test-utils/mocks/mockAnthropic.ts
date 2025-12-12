/**
 * Mock Anthropic AI Client for Testing
 * Provides test doubles for AI API calls
 */

export const createMockAnthropicClient = () => {
  const mockCreate = jest.fn().mockResolvedValue({
    id: 'msg_mock123',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: JSON.stringify([
          {
            text: 'fruity',
            type: 'flavor',
            category: 'Fruity',
            subcategory: 'Berry',
            confidence: 0.9,
          },
          {
            text: 'oaky',
            type: 'flavor',
            category: 'Wood / Resin',
            subcategory: 'Oak',
            confidence: 0.85,
          },
        ]),
      },
    ],
    model: 'claude-3-haiku-20240307',
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 150,
      output_tokens: 75,
    },
  });

  return {
    messages: {
      create: mockCreate,
    },
  };
};

export type MockAnthropicClient = ReturnType<typeof createMockAnthropicClient>;

export const mockAIExtractionResponse = {
  descriptors: [
    {
      text: 'fruity',
      type: 'flavor' as const,
      category: 'Fruity',
      subcategory: 'Berry',
      predefined_category_id: 'cat-fruity-123',
      confidence: 0.9,
    },
    {
      text: 'oaky',
      type: 'flavor' as const,
      category: 'Wood / Resin',
      subcategory: 'Oak',
      predefined_category_id: 'cat-wood-123',
      confidence: 0.85,
    },
  ],
  tokensUsed: 225,
  processingTimeMs: 450,
};





import { http, HttpResponse } from 'msw';

/**
 * Mock handlers for Anthropic Claude API
 */
export const anthropicHandlers = [
  // Mock Claude message completion endpoint
  http.post('https://api.anthropic.com/v1/messages', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    // Simulate flavor extraction response
    const messages = body.messages as Array<Record<string, unknown>>;
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content as string;

    if (content.toLowerCase().includes('flavor')) {
      return HttpResponse.json({
        id: 'msg-123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              primary_flavors: ['fruity', 'floral'],
              secondary_flavors: ['spicy', 'woody'],
              intensity: 7,
              description: 'Complex profile with fruit and spice notes',
            }),
          },
        ],
        model: 'claude-3-sonnet-20240229',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      });
    }

    // Default response
    return HttpResponse.json({
      id: 'msg-default',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'This is a mock response from Claude API.',
        },
      ],
      model: 'claude-3-sonnet-20240229',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 10,
        output_tokens: 10,
      },
    });
  }),
];

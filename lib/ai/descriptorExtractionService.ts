import Anthropic from '@anthropic-ai/sdk';

interface AIExtractionResult {
  descriptors: Array<{
    text: string;
    type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
    category: string;
    subcategory?: string;
    confidence: number;
  }>;
  tokensUsed: number;
  processingTimeMs: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function extractDescriptorsWithAI(
  text: string,
  category?: string,
  taxonomyContext?: any
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const systemPrompt = `You are an expert sensory analyst specializing in flavor and aroma profiling. Your task is to extract and classify descriptors from tasting notes.

CLASSIFICATION RULES:
- AROMA: Smell-related descriptors (nose, fragrance, scent). Look for: "smells like", "nose of", "aroma of", "fragrant"
- FLAVOR: Taste-related descriptors (palate, taste). Look for: "tastes like", "flavor of", "on the palate", "taste of"
- TEXTURE: Physical sensations (mouthfeel, body). Look for: "creamy", "smooth", "astringent", "silky", "fizzy", "oily"
- METAPHOR: Emotional, place, or cultural associations. Look for: "reminds me of", "like a", "evokes", place names, emotions

IMPORTANT:
- Preserve exact user wording (keep "chocolatey" not "chocolate", "lemony" not "lemon")
- Classify based on context, not just keywords
- Use the provided taxonomy categories when possible, but create new ones if needed
- Confidence should reflect how clear the classification is (0.7-1.0 range)`;

  const userPrompt = `Extract all sensory descriptors from this tasting note:

"${text}"

${category ? `Context: This is a tasting of ${category}` : ''}
${taxonomyContext ? `\nExpected categories for this item: ${JSON.stringify(taxonomyContext.aromaCategories)}` : ''}

Return a JSON array with this exact structure:
[
  {
    "text": "exact descriptor from user text",
    "type": "aroma|flavor|texture|metaphor",
    "category": "main category (e.g., Fruity, Floral, Sweet, Mouthfeel)",
    "subcategory": "optional subcategory (e.g., Berry, Citrus)",
    "confidence": 0.XX
  }
]

Extract ALL descriptors, even if confidence is medium. Be thorough.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-3-20240307', // Fast and cheap
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response (Claude sometimes wraps in markdown)
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in AI response');
    }

    const descriptors = JSON.parse(jsonMatch[0]);
    const processingTimeMs = Date.now() - startTime;

    return {
      descriptors,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      processingTimeMs,
    };
  } catch (error) {
    console.error('AI extraction failed:', error);
    throw error;
  }
}

import Anthropic from '@anthropic-ai/sdk';

interface CategoryTaxonomy {
  categoryName: string;
  normalizedName: string;
  taxonomyData: {
    baseTemplate: string;
    aromaCategories: string[];
    flavorCategories: string[];
    typicalDescriptors: string[];
    textureNotes: string[];
    aiModel: string;
    generatedAt: string;
  };
}

function getAnthropicClient(): Anthropic {
  // Lazily create the client to avoid import-time side effects in tests (jsdom).
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
  });
}

export async function generateCategoryTaxonomy(
  categoryName: string
): Promise<CategoryTaxonomy> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const systemPrompt = `You are a culinary and beverage expert who creates flavor taxonomy structures for any food or drink category.`;

  const userPrompt = `A user is creating a tasting session for: "${categoryName}"

Generate a comprehensive flavor taxonomy for this category. Analyze what type of item this is and provide:

1. Base template: Which existing category is this most similar to? (coffee, tea, wine, spirits, beer, chocolate, cheese, other)
2. Aroma categories: 4-8 major aroma categories for this item (e.g., Fruity, Floral, Earthy)
3. Flavor categories: 4-8 major flavor categories (e.g., Sweet, Sour, Bitter, Umami)
4. Typical descriptors: 8-15 specific descriptors commonly associated with this category
5. Texture notes: 3-6 common textural descriptors

Return JSON with this structure:
{
  "baseTemplate": "spirits|coffee|tea|wine|beer|chocolate|other",
  "aromaCategories": ["Category1", "Category2", ...],
  "flavorCategories": ["Category1", "Category2", ...],
  "typicalDescriptors": ["descriptor1", "descriptor2", ...],
  "textureNotes": ["texture1", "texture2", ...]
}

Be creative and accurate. Consider the item's cultural context, production method, and sensory characteristics.`;

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
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

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }

    const taxonomyData = JSON.parse(jsonMatch[0]);

    return {
      categoryName,
      normalizedName: categoryName.toLowerCase().trim(),
      taxonomyData: {
        ...taxonomyData,
        aiModel: 'claude-haiku-3-20240307',
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Taxonomy generation failed:', error);
    throw error;
  }
}

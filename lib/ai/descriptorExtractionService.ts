import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseClient } from '../supabase';

interface PredefinedCategory {
  id: string;
  name: string;
  display_order: number;
  color_hex: string;
}

interface AIExtractionResult {
  descriptors: Array<{
    text: string;
    type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
    category: string;
    subcategory?: string;
    predefined_category_id?: string;
    confidence: number;
  }>;
  tokensUsed: number;
  processingTimeMs: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function getPredefinedCategories(): Promise<{
  flavorCategories: PredefinedCategory[];
  metaphorCategories: PredefinedCategory[];
}> {
  const supabase = getSupabaseClient();
  
  try {
    const [flavorResult, metaphorResult] = await Promise.all([
      supabase
        .from('active_flavor_categories')
        .select('*')
        .order('display_order'),
      supabase
        .from('active_metaphor_categories')
        .select('*')
        .order('display_order')
    ]);

    if (flavorResult.error) throw flavorResult.error;
    if (metaphorResult.error) throw metaphorResult.error;

    return {
      flavorCategories: flavorResult.data || [],
      metaphorCategories: metaphorResult.data || []
    };
  } catch (error) {
    console.error('Error fetching predefined categories:', error);
    // Return empty arrays as fallback
    return {
      flavorCategories: [],
      metaphorCategories: []
    };
  }
}

function findClosestCategory(
  aiCategory: string,
  predefinedCategories: PredefinedCategory[]
): PredefinedCategory | null {
  // Simple fuzzy matching - can be enhanced with more sophisticated algorithms
  const aiLower = aiCategory.toLowerCase();
  
  // Direct match
  let match = predefinedCategories.find(cat => 
    cat.name.toLowerCase() === aiLower
  );
  if (match) return match;
  
  // Partial match
  match = predefinedCategories.find(cat => 
    cat.name.toLowerCase().includes(aiLower) || 
    aiLower.includes(cat.name.toLowerCase())
  );
  if (match) return match;
  
  // Keyword matching
  const keywords: { [key: string]: string[] } = {
    'Fruit': ['fruit', 'berry', 'citrus', 'apple', 'lemon', 'orange'],
    'Floral': ['floral', 'flower', 'blossom', 'rose', 'lavender'],
    'Herbal': ['herbal', 'herb', 'mint', 'basil', 'oregano'],
    'Spice': ['spice', 'spicy', 'pepper', 'cinnamon', 'clove'],
    'Sweetness / Sugary / Confection': ['sweet', 'sugar', 'honey', 'candy', 'confection'],
    'Earthy / Mineral': ['earthy', 'mineral', 'soil', 'stone', 'dirt'],
    'Vegetal / Green': ['vegetal', 'green', 'grass', 'vegetable', 'leaf'],
    'Nutty / Grain / Cereal': ['nut', 'nutty', 'grain', 'cereal', 'oat'],
    'Ferment / Funky': ['ferment', 'funky', 'yeast', 'barnyard'],
    'Roasted / Toasted / Smoke': ['roast', 'toasted', 'smoke', 'burnt', 'char'],
    'Chemical': ['chemical', 'medicinal', 'petroleum', 'plastic'],
    'Animal / Must': ['animal', 'must', 'leather', 'musky'],
    'Dairy / Fatty': ['dairy', 'fat', 'fatty', 'cream', 'butter'],
    'Wood / Resin': ['wood', 'oak', 'pine', 'resin', 'cedar']
  };
  
  for (const [categoryName, keywordList] of Object.entries(keywords)) {
    if (keywordList.some(keyword => aiLower.includes(keyword))) {
      const category = predefinedCategories.find(cat => cat.name === categoryName);
      if (category) return category;
    }
  }
  
  return null;
}

export async function extractDescriptorsWithAI(
  text: string,
  category?: string,
  taxonomyContext?: any
): Promise<AIExtractionResult> {
  const startTime = Date.now();

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  // Get predefined categories from database
  const { flavorCategories, metaphorCategories } = await getPredefinedCategories();

  const systemPrompt = `You are an expert sensory analyst specializing in flavor and aroma profiling. Your task is to extract and classify descriptors from tasting notes.

CLASSIFICATION RULES:
- AROMA: Smell-related descriptors (nose, fragrance, scent). Look for: "smells like", "nose of", "aroma of", "fragrant"
- FLAVOR: Taste-related descriptors (palate, taste). Look for: "tastes like", "flavor of", "on the palate", "taste of"
- TEXTURE: Physical sensations (mouthfeel, body). Look for: "creamy", "smooth", "astringent", "silky", "fizzy", "oily"
- METAPHOR: Emotional, place, or cultural associations. Look for: "reminds me of", "like a", "evokes", place names, emotions

CATEGORIZATION GUIDELINES:
For AROMA, FLAVOR, and TEXTURE types, you MUST use one of these predefined categories:
${flavorCategories.map(cat => `- ${cat.name}`).join('\n')}

For METAPHOR type, you MUST use one of these predefined categories:
${metaphorCategories.map(cat => `- ${cat.name}`).join('\n')}

IMPORTANT:
- Preserve exact user wording (keep "chocolatey" not "chocolate", "lemony" not "lemon")
- Classify based on context, not just keywords
- ALWAYS use one of the predefined categories listed above
- Confidence should reflect how clear the classification is (0.7-1.0 range)
- If unsure, choose the closest matching predefined category`;

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
      model: 'claude-3-haiku-20240307', // Fast and cheap
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

    const rawDescriptors = JSON.parse(jsonMatch[0]) as Array<{
      text: string;
      type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
      category: string;
      subcategory?: string;
      confidence: number;
    }>;
    
    // Post-process to map AI categories to predefined category IDs
    const processedDescriptors = rawDescriptors.map((descriptor) => {
      const predefinedCategories = descriptor.type === 'metaphor' 
        ? metaphorCategories 
        : flavorCategories;
      
      const closestCategory = findClosestCategory(descriptor.category, predefinedCategories);
      
      return {
        text: descriptor.text,
        type: descriptor.type,
        category: descriptor.category,
        subcategory: descriptor.subcategory,
        predefined_category_id: closestCategory?.id || undefined,
        confidence: descriptor.confidence
      };
    });
    
    const processingTimeMs = Date.now() - startTime;

    return {
      descriptors: processedDescriptors,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      processingTimeMs,
    };
  } catch (error) {
    console.error('AI extraction failed:', error);
    throw error;
  }
}

/**
 * AI Embedding Service
 * Generates embeddings for flavor profiles and provides recommendations
 */

import { getSupabaseClient } from '../supabase';

// OpenAI configuration
// IMPORTANT: Set OPENAI_API_KEY in your environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const OPENAI_COMPLETION_MODEL = 'gpt-3.5-turbo';

// Warn if API key is missing
if (!OPENAI_API_KEY && typeof window === 'undefined') {
  console.warn('⚠️ OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
}

export interface FlavorProfile {
  id: string;
  userId: string;
  category: string;
  descriptors: string[];
  notes?: string;
  scores?: Record<string, number>;
}

export interface Recommendation {
  id: string;
  name: string;
  similarity: number;
  reason: string;
  category: string;
  descriptors: string[];
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export class EmbeddingService {
  private supabase;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor() {
    this.supabase = getSupabaseClient();
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    // Check cache first
    const cacheKey = `embed:${text}`;
    if (this.embeddingCache.has(cacheKey)) {
      return {
        embedding: this.embeddingCache.get(cacheKey)!,
        model: OPENAI_EMBEDDING_MODEL,
        usage: { promptTokens: 0, totalTokens: 0 }
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: text,
          model: OPENAI_EMBEDDING_MODEL
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      // Cache the result
      this.embeddingCache.set(cacheKey, embedding);

      return {
        embedding,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Error generating embedding:', error);

      // Fallback to simple vector representation
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * Generate a simple fallback embedding without AI
   */
  private generateFallbackEmbedding(text: string): EmbeddingResult {
    // Create a deterministic embedding based on text features
    const embedding = new Array(384).fill(0);

    // Simple feature extraction
    const words = text.toLowerCase().split(/\s+/);
    const features = {
      length: text.length,
      wordCount: words.length,
      uniqueWords: new Set(words).size
    };

    // Hash each word to a position
    words.forEach((word, i) => {
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const position = hash % embedding.length;
      embedding[position] = Math.min(1, embedding[position] + (1 / words.length));
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }

    return {
      embedding,
      model: 'fallback',
      usage: { promptTokens: 0, totalTokens: 0 }
    };
  }

  /**
   * Generate embedding for a flavor profile
   */
  async generateProfileEmbedding(profile: FlavorProfile): Promise<number[]> {
    // Combine all relevant text
    const text = [
      profile.category,
      ...profile.descriptors,
      profile.notes || ''
    ].filter(Boolean).join(' ');

    const result = await this.generateEmbedding(text);
    return result.embedding;
  }

  /**
   * Find similar tastings using vector similarity
   */
  async findSimilarTastings(
    embedding: number[],
    category: string,
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Format embedding for PostgreSQL
      const embeddingStr = `[${embedding.join(',')}]`;

      const { data, error } = await this.supabase.rpc('find_similar_tastings', {
        query_embedding: embeddingStr,
        match_category: category,
        exclude_user: userId,
        match_count: limit
      });

      if (error) {
        console.error('Error finding similar tastings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in similarity search:', error);
      return [];
    }
  }

  /**
   * Generate recommendations based on user's tasting history
   */
  async generateRecommendations(
    userId: string,
    category: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      // Get user's recent tastings
      const { data: userTastings, error: tastingsError } = await this.supabase
        .from('quick_tastings')
        .select('id, category, session_name, notes')
        .eq('user_id', userId)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tastingsError || !userTastings?.length) {
        return [];
      }

      // Get flavor descriptors for these tastings
      const tastingIds = userTastings.map(t => t.id);
      const { data: descriptors, error: descriptorsError } = await this.supabase
        .from('flavor_descriptors')
        .select('descriptor_text, descriptor_type')
        .in('source_id', tastingIds)
        .eq('source_type', 'quick_tasting');

      if (descriptorsError || !descriptors?.length) {
        return [];
      }

      // Create user profile
      const profile: FlavorProfile = {
        id: userId,
        userId,
        category,
        descriptors: descriptors.map(d => d.descriptor_text),
        notes: userTastings[0]?.notes
      };

      // Generate embedding for user profile
      const profileEmbedding = await this.generateProfileEmbedding(profile);

      // Find similar tastings from other users
      const similarTastings = await this.findSimilarTastings(
        profileEmbedding,
        category,
        userId,
        limit * 2 // Get extra to filter
      );

      // Generate recommendations with explanations
      const recommendations: Recommendation[] = [];

      for (const tasting of similarTastings.slice(0, limit)) {
        const reason = await this.generateRecommendationReason(
          profile.descriptors,
          tasting.descriptors || []
        );

        recommendations.push({
          id: tasting.id,
          name: tasting.session_name || `${category} Tasting`,
          similarity: tasting.similarity || 0,
          reason,
          category: tasting.category,
          descriptors: tasting.descriptors || []
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Generate explanation for why something is recommended
   */
  private async generateRecommendationReason(
    userDescriptors: string[],
    itemDescriptors: string[]
  ): Promise<string> {
    // Find common descriptors
    const common = userDescriptors.filter(d =>
      itemDescriptors.some(id =>
        id.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(id.toLowerCase())
      )
    );

    if (common.length > 0) {
      return `Similar profile with ${common.slice(0, 3).join(', ')}`;
    }

    // Find complementary descriptors
    const complementary = this.findComplementaryDescriptors(userDescriptors, itemDescriptors);
    if (complementary.length > 0) {
      return `Complementary notes of ${complementary.slice(0, 2).join(' and ')}`;
    }

    return 'Recommended based on your tasting history';
  }

  /**
   * Find complementary flavor descriptors
   */
  private findComplementaryDescriptors(
    descriptors1: string[],
    descriptors2: string[]
  ): string[] {
    const complementaryPairs = [
      ['citrus', 'floral'],
      ['chocolate', 'berry'],
      ['oak', 'vanilla'],
      ['apple', 'cinnamon'],
      ['coffee', 'caramel']
    ];

    const found: string[] = [];

    for (const [d1, d2] of complementaryPairs) {
      const has1 = descriptors1.some(d => d.toLowerCase().includes(d1));
      const has2 = descriptors2.some(d => d.toLowerCase().includes(d2));

      if (has1 && has2) {
        found.push(d2);
      } else if (has2 && has1) {
        found.push(d1);
      }
    }

    return found;
  }

  /**
   * Update embedding for a tasting
   */
  async updateTastingEmbedding(tastingId: string): Promise<boolean> {
    try {
      // Get tasting data
      const { data: tasting, error: tastingError } = await this.supabase
        .from('quick_tastings')
        .select('*')
        .eq('id', tastingId)
        .single();

      if (tastingError || !tasting) {
        return false;
      }

      // Get flavor descriptors
      const { data: descriptors, error: descriptorsError } = await this.supabase
        .from('flavor_descriptors')
        .select('descriptor_text')
        .eq('source_id', tastingId)
        .eq('source_type', 'quick_tasting');

      if (descriptorsError) {
        return false;
      }

      // Create profile
      const profile: FlavorProfile = {
        id: tastingId,
        userId: tasting.user_id,
        category: tasting.category,
        descriptors: descriptors?.map(d => d.descriptor_text) || [],
        notes: tasting.notes
      };

      // Generate embedding
      const embedding = await this.generateProfileEmbedding(profile);

      // Update in database
      const { error: updateError } = await this.supabase
        .from('quick_tastings')
        .update({
          embedding: `[${embedding.join(',')}]`,
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', tastingId);

      return !updateError;
    } catch (error) {
      console.error('Error updating tasting embedding:', error);
      return false;
    }
  }
}

// Singleton instance
let embeddingService: EmbeddingService | null = null;

export function getEmbeddingService(): EmbeddingService {
  if (!embeddingService) {
    embeddingService = new EmbeddingService();
  }
  return embeddingService;
}
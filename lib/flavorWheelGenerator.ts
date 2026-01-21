/**
 * Flavor Wheel Generator
 *
 * Aggregates descriptor data and generates wheel visualizations
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface WheelDescriptor {
  text: string;
  count: number;
  avgIntensity: number;
  percentage: number;
}

export interface WheelSubcategory {
  name: string;
  count: number;
  percentage: number;
  descriptors: WheelDescriptor[];
}

export interface WheelCategory {
  name: string;
  count: number;
  percentage: number;
  subcategories: WheelSubcategory[];
}

export interface FlavorWheelData {
  categories: WheelCategory[];
  totalDescriptors: number;
  uniqueDescriptors: number;
  generatedFrom: {
    tastings?: number;
    reviews?: number;
    descriptorRecords?: number;
  };
  generatedAt: Date;
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor';
  scopeType: 'personal' | 'universal' | 'item' | 'category' | 'tasting';
  aiMetadata?: {
    aiExtractedCount: number;
    keywordExtractedCount: number;
    percentageAI: number;
    hasAIDescriptors: boolean;
  };
}

export interface WheelGenerationOptions {
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor';
  scopeType: 'personal' | 'universal' | 'item' | 'category' | 'tasting';
  scopeFilter?: {
    userId?: string;
    itemName?: string;
    itemCategory?: string;
    tastingId?: string;
  };
  minDescriptorCount?: number; // Minimum occurrences to include descriptor
  maxDescriptorsPerSubcategory?: number;
}

/**
 * Generate a flavor wheel from descriptor data
 */
export async function generateFlavorWheel(
  supabase: SupabaseClient,
  options: WheelGenerationOptions
): Promise<FlavorWheelData> {
  const {
    wheelType,
    scopeType,
    scopeFilter = {},
    minDescriptorCount = 1,
    maxDescriptorsPerSubcategory = 10
  } = options;

  // Build query
  let query = supabase
    .from('flavor_descriptors')
    .select('*');

  // Apply scope filters
  if (scopeType === 'personal' && scopeFilter.userId) {
    query = query.eq('user_id', scopeFilter.userId);
  }

  if (scopeType === 'item' && scopeFilter.itemName) {
    query = query.eq('item_name', scopeFilter.itemName);
  }

  if (scopeType === 'category' && scopeFilter.itemCategory) {
    query = query.eq('item_category', scopeFilter.itemCategory);
  }

  // Filter by descriptor type
  if (wheelType === 'combined') {
    query = query.in('descriptor_type', ['aroma', 'flavor']);
  } else {
    query = query.eq('descriptor_type', wheelType);
  }

  // Execute query
  const { data: descriptors, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch descriptors: ${error.message}`);
  }

  if (!descriptors || descriptors.length === 0) {
    return {
      categories: [],
      totalDescriptors: 0,
      uniqueDescriptors: 0,
      generatedFrom: { descriptorRecords: 0 },
      generatedAt: new Date(),
      wheelType,
      scopeType
    };
  }

  // Aggregate data
  const categoryMap = new Map<string, Map<string, Map<string, {
    count: number;
    intensities: number[];
  }>>>();

  descriptors.forEach(descriptor => {
    const category = descriptor.category || 'Uncategorized';
    const subcategory = descriptor.subcategory || 'General';
    const text = descriptor.descriptor_text.toLowerCase();

    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map());
    }

    const categoryData = categoryMap.get(category)!;
    if (!categoryData.has(subcategory)) {
      categoryData.set(subcategory, new Map());
    }

    const subcategoryData = categoryData.get(subcategory)!;
    if (!subcategoryData.has(text)) {
      subcategoryData.set(text, { count: 0, intensities: [] });
    }

    const descriptorData = subcategoryData.get(text)!;
    descriptorData.count++;
    if (descriptor.intensity) {
      descriptorData.intensities.push(descriptor.intensity);
    }
  });

  // Convert to wheel structure
  const totalDescriptors = descriptors.length;
  const uniqueDescriptors = new Set(descriptors.map(d => d.descriptor_text.toLowerCase())).size;

  const categories: WheelCategory[] = [];

  categoryMap.forEach((subcategories, categoryName) => {
    let categoryCount = 0;
    const wheelSubcategories: WheelSubcategory[] = [];

    subcategories.forEach((descriptorMap, subcategoryName) => {
      let subcategoryCount = 0;
      const wheelDescriptors: WheelDescriptor[] = [];

      // Sort descriptors by count
      const sortedDescriptors = Array.from(descriptorMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, maxDescriptorsPerSubcategory);

      sortedDescriptors.forEach(([text, data]) => {
        if (data.count >= minDescriptorCount) {
          const avgIntensity = data.intensities.length > 0
            ? data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length
            : 3;

          wheelDescriptors.push({
            text,
            count: data.count,
            avgIntensity: Math.round(avgIntensity * 10) / 10,
            percentage: (data.count / totalDescriptors) * 100
          });

          subcategoryCount += data.count;
        }
      });

      if (wheelDescriptors.length > 0) {
        wheelSubcategories.push({
          name: subcategoryName,
          count: subcategoryCount,
          percentage: (subcategoryCount / totalDescriptors) * 100,
          descriptors: wheelDescriptors
        });

        categoryCount += subcategoryCount;
      }
    });

    if (wheelSubcategories.length > 0) {
      categories.push({
        name: categoryName,
        count: categoryCount,
        percentage: (categoryCount / totalDescriptors) * 100,
        subcategories: wheelSubcategories
      });
    }
  });

  // Sort categories by count
  categories.sort((a, b) => b.count - a.count);

  // Get source stats
  const _uniqueSources = new Set(
    descriptors.map(d => `${d.source_type}:${d.source_id}`)
  );

  // Calculate AI metadata
  const aiExtractedCount = descriptors.filter(d => (d as any).ai_extracted === true).length;
  const keywordExtractedCount = totalDescriptors - aiExtractedCount;
  const percentageAI = totalDescriptors > 0 ? (aiExtractedCount / totalDescriptors) * 100 : 0;

  return {
    categories,
    totalDescriptors,
    uniqueDescriptors,
    generatedFrom: {
      descriptorRecords: descriptors.length
    },
    generatedAt: new Date(),
    wheelType,
    scopeType,
    aiMetadata: {
      aiExtractedCount,
      keywordExtractedCount,
      percentageAI,
      hasAIDescriptors: aiExtractedCount > 0
    }
  };
}

/**
 * Save generated wheel to database
 */
export async function saveFlavorWheel(
  supabase: SupabaseClient,
  wheelData: FlavorWheelData,
  options: {
    userId?: string;
    scopeFilter: Record<string, unknown>;
    expiresInDays?: number;
  }
): Promise<string> {
  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

  const { data, error } = await supabase
    .from('flavor_wheels')
    .insert({
      user_id: options.userId || null,
      wheel_type: wheelData.wheelType,
      scope_type: wheelData.scopeType,
      scope_filter: options.scopeFilter,
      wheel_data: wheelData,
      total_descriptors: wheelData.totalDescriptors,
      unique_descriptors: wheelData.uniqueDescriptors,
      data_sources_count: wheelData.generatedFrom.descriptorRecords || 0,
      expires_at: expiresAt.toISOString()
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save flavor wheel: ${error.message}`);
  }

  return data.id;
}

/**
 * Get cached wheel or generate new one
 */
export async function getOrGenerateFlavorWheel(
  supabase: SupabaseClient,
  options: WheelGenerationOptions & { userId?: string }
): Promise<{ wheelData: FlavorWheelData; wheelId: string; cached: boolean }> {
  const scopeFilter = options.scopeFilter || {};

  // Check for existing valid wheel
  let query = supabase
    .from('flavor_wheels')
    .select('*')
    .eq('wheel_type', options.wheelType)
    .eq('scope_type', options.scopeType)
    .gt('expires_at', new Date().toISOString())
    .order('generated_at', { ascending: false })
    .limit(1);

  if (options.scopeType === 'personal' && options.userId) {
    query = query.eq('user_id', options.userId);
  }

  const { data: existingWheels } = await query;

  // Check if cached wheel matches scope filter
  if (existingWheels && existingWheels.length > 0) {
    const existingWheel = existingWheels[0];
    const filterMatches = JSON.stringify(existingWheel.scope_filter) === JSON.stringify(scopeFilter);

    if (filterMatches) {
      return {
        wheelData: existingWheel.wheel_data as FlavorWheelData,
        wheelId: existingWheel.id,
        cached: true
      };
    }
  }

  // Generate new wheel
  const wheelData = await generateFlavorWheel(supabase, options);

  // Save to database
  const wheelId = await saveFlavorWheel(supabase, wheelData, {
    userId: options.userId,
    scopeFilter,
    expiresInDays: 7
  });

  return {
    wheelData,
    wheelId,
    cached: false
  };
}

/**
 * Check if a wheel needs regeneration
 */
export async function shouldRegenerateWheel(
  supabase: SupabaseClient,
  wheelId: string
): Promise<boolean> {
  const { data: wheel, error } = await supabase
    .from('flavor_wheels')
    .select('generated_at, expires_at, scope_type, scope_filter, user_id')
    .eq('id', wheelId)
    .single();

  if (error || !wheel) {
    return true;
  }

  // Check expiration
  if (new Date(wheel.expires_at) < new Date()) {
    return true;
  }

  // Check if new descriptors added since generation
  let query = supabase
    .from('flavor_descriptors')
    .select('created_at', { count: 'exact', head: true })
    .gt('created_at', wheel.generated_at);

  if (wheel.scope_type === 'personal' && wheel.user_id) {
    query = query.eq('user_id', wheel.user_id);
  }

  const { count } = await query;

  return (count || 0) > 0;
}

/**
 * Delete expired wheels (cleanup function)
 */
export async function cleanupExpiredWheels(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from('flavor_wheels')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    throw new Error(`Failed to cleanup expired wheels: ${error.message}`);
  }

  return data?.length || 0;
}

/**
 * Get user's wheel statistics
 */
export async function getUserWheelStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  totalWheels: number;
  wheelsByType: Record<string, number>;
  totalDescriptors: number;
  uniqueDescriptors: number;
}> {
  // Get wheels
  const { data: wheels } = await supabase
    .from('flavor_wheels')
    .select('wheel_type, total_descriptors, unique_descriptors')
    .eq('user_id', userId);

  if (!wheels || wheels.length === 0) {
    return {
      totalWheels: 0,
      wheelsByType: {},
      totalDescriptors: 0,
      uniqueDescriptors: 0
    };
  }

  const wheelsByType: Record<string, number> = {};
  let maxTotalDescriptors = 0;
  let maxUniqueDescriptors = 0;

  wheels.forEach(wheel => {
    wheelsByType[wheel.wheel_type] = (wheelsByType[wheel.wheel_type] || 0) + 1;
    maxTotalDescriptors = Math.max(maxTotalDescriptors, wheel.total_descriptors || 0);
    maxUniqueDescriptors = Math.max(maxUniqueDescriptors, wheel.unique_descriptors || 0);
  });

  return {
    totalWheels: wheels.length,
    wheelsByType,
    totalDescriptors: maxTotalDescriptors,
    uniqueDescriptors: maxUniqueDescriptors
  };
}

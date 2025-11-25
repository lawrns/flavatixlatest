/**
 * Flavor Wheel Query Hooks
 * 
 * React Query hooks for flavor wheel data fetching and generation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '../../supabase';
import { queryKeys, STALE_TIME } from '../queryClient';
import { logger } from '../../logger';
import { API_ENDPOINTS } from '../../constants';
import type { FlavorWheel, WheelType, ScopeType } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface GenerateWheelParams {
  wheelType: WheelType;
  scopeType: ScopeType;
  scopeFilter?: {
    userId?: string;
    itemName?: string;
    itemCategory?: string;
    tastingId?: string;
  };
  forceRegenerate?: boolean;
}

export interface ExtractDescriptorsParams {
  text: string;
  category?: string;
  extractMetaphors?: boolean;
}

export interface ExtractedDescriptor {
  text: string;
  category: string;
  subcategory?: string;
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
  confidence: number;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchUserFlavorWheel(
  userId: string,
  wheelType: WheelType = 'combined'
): Promise<FlavorWheel | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('flavor_wheels')
    .select('*')
    .eq('user_id', userId)
    .eq('wheel_type', wheelType)
    .eq('scope_type', 'personal')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    logger.error('FlavorWheels', 'Failed to fetch wheel', error, { userId, wheelType });
    throw error;
  }
  
  return data as FlavorWheel;
}

async function fetchUserDescriptors(userId: string): Promise<any[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('flavor_descriptors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    logger.error('FlavorWheels', 'Failed to fetch descriptors', error, { userId });
    throw error;
  }
  
  return data || [];
}

async function generateFlavorWheel(
  params: GenerateWheelParams,
  authToken: string
): Promise<FlavorWheel> {
  const response = await fetch(API_ENDPOINTS.FLAVOR_WHEELS_GENERATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    logger.error('FlavorWheels', 'Failed to generate wheel', error);
    throw new Error(error.message || 'Failed to generate flavor wheel');
  }
  
  const result = await response.json();
  return result.data;
}

async function extractDescriptors(
  params: ExtractDescriptorsParams,
  authToken: string
): Promise<ExtractedDescriptor[]> {
  const response = await fetch(API_ENDPOINTS.FLAVOR_WHEELS_EXTRACT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    logger.error('FlavorWheels', 'Failed to extract descriptors', error);
    throw new Error(error.message || 'Failed to extract descriptors');
  }
  
  const result = await response.json();
  return result.data.descriptors;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch user's flavor wheel
 */
export function useFlavorWheel(
  userId: string | undefined,
  wheelType: WheelType = 'combined'
) {
  return useQuery({
    queryKey: queryKeys.flavorWheels.byType(wheelType, userId || ''),
    queryFn: () => fetchUserFlavorWheel(userId!, wheelType),
    enabled: !!userId,
    staleTime: STALE_TIME.LONG,
  });
}

/**
 * Hook to fetch user's flavor descriptors
 */
export function useFlavorDescriptors(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.flavorWheels.descriptors(userId || ''),
    queryFn: () => fetchUserDescriptors(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM,
  });
}

/**
 * Hook to generate a flavor wheel
 */
export function useGenerateFlavorWheel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ params, authToken }: { params: GenerateWheelParams; authToken: string }) =>
      generateFlavorWheel(params, authToken),
    
    onSuccess: (data, { params }) => {
      // Update cache with new wheel
      queryClient.setQueryData(
        queryKeys.flavorWheels.byType(params.wheelType, params.scopeFilter?.userId || ''),
        data
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.flavorWheels.all });
      
      logger.debug('FlavorWheels', 'Wheel generated and cached');
    },
    
    onError: (error) => {
      logger.error('FlavorWheels', 'Generate wheel mutation failed', error);
    },
  });
}

/**
 * Hook to extract descriptors from text
 */
export function useExtractDescriptors() {
  return useMutation({
    mutationFn: async ({ params, authToken }: { params: ExtractDescriptorsParams; authToken: string }) =>
      extractDescriptors(params, authToken),
    
    onError: (error) => {
      logger.error('FlavorWheels', 'Extract descriptors mutation failed', error);
    },
  });
}

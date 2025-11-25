/**
 * Query Hooks Index
 * 
 * Re-exports all query hooks for convenient importing.
 * 
 * Usage:
 *   import { useCurrentProfile, useTastings, useFlavorWheel } from '@/lib/query/hooks';
 */

// Profile hooks
export {
  useCurrentProfile,
  useProfile,
  useUpdateProfile,
  usePrefetchProfile,
} from './useProfile';

// Tasting hooks
export {
  useTastings,
  useInfiniteTastings,
  useTasting,
  useRecentTastings,
  useTastingStats,
  useDeleteTasting,
  usePrefetchTasting,
  type TastingFilters,
  type TastingListResult,
  type TastingStats,
} from './useTastings';

// Flavor wheel hooks
export {
  useFlavorWheel,
  useFlavorDescriptors,
  useGenerateFlavorWheel,
  useExtractDescriptors,
  type GenerateWheelParams,
  type ExtractDescriptorsParams,
  type ExtractedDescriptor,
} from './useFlavorWheels';

/**
 * Review Form Type Definitions
 *
 * Single source of truth for all review-related types.
 * Imported by ReviewFormRefactored and all sub-components.
 */

export interface ReviewFormData {
  // ITEM ID Fields (10 fields)
  item_name: string;
  picture_url?: string;
  brand?: string;
  country?: string;
  state?: string;
  region?: string;
  vintage?: string;
  batch_id?: string;
  upc_barcode?: string;
  category: string;

  // Characteristics (12 fields)
  aroma_notes?: string;
  aroma_intensity: number;
  salt_notes?: string;
  salt_score: number;
  sweetness_notes?: string;
  sweetness_score: number;
  acidity_notes?: string;
  acidity_score: number;
  umami_notes?: string;
  umami_score: number;
  spiciness_notes?: string;
  spiciness_score: number;
  flavor_notes?: string;
  flavor_intensity: number;
  texture_notes?: string;
  typicity_score: number;
  complexity_score: number;
  other_notes?: string;
  overall_score: number;
}

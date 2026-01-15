/**
 * SINGLE SOURCE OF TRUTH - Type Definitions
 * 
 * All application types should be imported from this file.
 * Do NOT define types inline in components or services.
 * 
 * Usage:
 *   import type { Profile, Tasting, TastingItem } from '@/lib/types';
 */

// Re-export comment types
export * from './comments';

// Re-export review types
export * from './review';

// ============================================================================
// ENUMS & CONSTANTS (as const for type safety)
// ============================================================================

export const TASTING_CATEGORIES = [
  'coffee',
  'tea',
  'wine',
  'spirits',
  'beer',
  'chocolate',
  'cheese',
  'olive_oil',
  'honey',
  'other',
] as const;

export type TastingCategory = (typeof TASTING_CATEGORIES)[number];

export const TASTING_MODES = ['quick', 'study', 'competition'] as const;
export type TastingMode = (typeof TASTING_MODES)[number];

export const STUDY_APPROACHES = ['collaborative', 'predefined', 'guided'] as const;
export type StudyApproach = (typeof STUDY_APPROACHES)[number];

export const PARTICIPANT_ROLES = ['host', 'participant', 'moderator', 'viewer'] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const WHEEL_TYPES = ['aroma', 'flavor', 'combined', 'metaphor'] as const;
export type WheelType = (typeof WHEEL_TYPES)[number];

export const SCOPE_TYPES = ['personal', 'universal', 'item', 'category', 'tasting'] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

// ============================================================================
// DATABASE TYPES (mirrors Supabase schema)
// ============================================================================

export interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  username: string | null;
  bio: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  preferred_category: TastingCategory | null;
  last_tasted_at: string | null;
  email_confirmed: boolean;
  tastings_count: number;
  reviews_count: number;
  total_tastings: number;
}

export interface ProfileInsert {
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_category?: TastingCategory | null;
}

export interface ProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  bio?: string | null;
  preferred_category?: TastingCategory | null;
}

export interface Tasting {
  id: string;
  user_id: string;
  category: TastingCategory;
  session_name: string | null;
  notes: string | null;
  total_items: number;
  completed_items: number;
  average_score: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  mode: TastingMode;
  rank_participants: boolean;
  ranking_type: string | null;
  is_blind_participants: boolean;
  is_blind_items: boolean;
  is_blind_attributes: boolean;
  study_approach: StudyApproach | null;
}

export interface TastingInsert {
  user_id: string;
  category: TastingCategory;
  mode: TastingMode;
  session_name?: string | null;
  notes?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
  study_approach?: StudyApproach | null;
}

export interface TastingUpdate {
  session_name?: string | null;
  notes?: string | null;
  completed_items?: number;
  average_score?: number | null;
  completed_at?: string | null;
}

export interface TastingItem {
  id: string;
  tasting_id: string;
  item_name: string;
  notes: string | null;
  aroma: string | null;
  flavor: string | null;
  flavor_scores: FlavorScores | null;
  overall_score: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  correct_answers: Record<string, unknown> | null;
  include_in_ranking: boolean;
}

export interface TastingItemInsert {
  tasting_id: string;
  item_name: string;
  notes?: string | null;
  aroma?: string | null;
  flavor?: string | null;
  flavor_scores?: FlavorScores | null;
  overall_score?: number | null;
  photo_url?: string | null;
  correct_answers?: Record<string, unknown> | null;
  include_in_ranking?: boolean;
}

export interface TastingItemUpdate {
  item_name?: string;
  notes?: string | null;
  aroma?: string | null;
  flavor?: string | null;
  flavor_scores?: FlavorScores | null;
  overall_score?: number | null;
  photo_url?: string | null;
}

export interface TastingParticipant {
  id: string;
  tasting_id: string;
  user_id: string;
  role: ParticipantRole;
  score: number | null;
  rank: number | null;
  can_moderate: boolean;
  can_add_items: boolean;
  created_at: string;
}

export interface FlavorWheel {
  id: string;
  user_id: string | null;
  wheel_type: WheelType;
  scope_type: ScopeType;
  scope_filter: Record<string, unknown> | null;
  wheel_data: FlavorWheelData;
  created_at: string;
  updated_at: string;
  is_stale: boolean;
}

export interface FlavorDescriptor {
  id: string;
  user_id: string;
  tasting_id: string | null;
  item_id: string | null;
  descriptor_text: string;
  category: string | null;
  subcategory: string | null;
  descriptor_type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
  confidence: number;
  created_at: string;
}

// ============================================================================
// COMPOSITE/DERIVED TYPES
// ============================================================================

export interface TastingWithItems extends Tasting {
  items: TastingItem[];
}

export interface TastingWithParticipants extends Tasting {
  participants: (TastingParticipant & { profile?: Profile })[];
}

export interface ProfileWithStats extends Profile {
  recent_tastings?: Tasting[];
  flavor_wheel?: FlavorWheel;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// FLAVOR SCORES & WHEEL DATA
// ============================================================================

export interface FlavorScores {
  sweetness?: number;
  acidity?: number;
  bitterness?: number;
  body?: number;
  balance?: number;
  aftertaste?: number;
  aroma_intensity?: number;
  complexity?: number;
  [key: string]: number | undefined;
}

export interface FlavorWheelData {
  categories: FlavorWheelCategory[];
  totalDescriptors: number;
  generatedAt: string;
  version: string;
}

export interface FlavorWheelCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
  subcategories: FlavorWheelSubcategory[];
}

export interface FlavorWheelSubcategory {
  name: string;
  count: number;
  descriptors: string[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateTastingFormData {
  category: TastingCategory;
  mode: TastingMode;
  session_name?: string;
  notes?: string;
  study_approach?: StudyApproach;
  rank_participants?: boolean;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
  items?: { item_name: string; correct_answers?: Record<string, unknown> }[];
}

export interface TastingItemFormData {
  item_name: string;
  notes?: string;
  aroma?: string;
  flavor?: string;
  overall_score?: number;
  flavor_scores?: FlavorScores;
}

// ============================================================================
// HISTORY & STATS TYPES
// ============================================================================

export interface TastingStats {
  totalTastings: number;
  averageScore: number;
  mostTastedCategory: TastingCategory | null;
  currentStreak: number;
  categoriesCount: Record<TastingCategory, number>;
}

export interface HistoryFilters {
  category?: TastingCategory | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  sortBy?: 'date' | 'rating' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Make all properties optional except for specified keys */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/** Make specified properties required */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Extract the Row type from a Supabase table definition */
export type TableRow<T extends { Row: unknown }> = T['Row'];

/** Make all properties nullable */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

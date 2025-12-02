/**
 * Type definitions for Quick Tasting components
 * Extracted from QuickTastingSession.tsx for reuse across components
 */

export interface QuickTasting {
  id: string;
  user_id: string;
  category: string;
  custom_category_name?: string | null;
  session_name?: string;
  notes?: string;
  total_items: number;
  completed_items: number;
  average_score?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  mode: string;
  study_approach?: string | null;
  rank_participants?: boolean;
  ranking_type?: string | null;
  is_blind_participants?: boolean;
  is_blind_items?: boolean;
  is_blind_attributes?: boolean;
}

export interface TastingItemData {
  id: string;
  tasting_id: string;
  item_name: string;
  notes?: string;
  flavor_scores?: Record<string, number>;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  correct_answers?: Record<string, unknown>;
  include_in_ranking?: boolean;
  aroma?: string;
  flavor?: string;
  study_category_data?: Record<string, unknown>;
}

export interface QuickTastingSessionProps {
  session: QuickTasting | null;
  userId: string;
  onSessionComplete: (session: QuickTasting) => void;
  onSessionUpdate?: (session: QuickTasting) => void;
  onSessionCreate?: (session: QuickTasting) => void;
}

export interface NavigationItem {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  score: number | undefined;
  isCurrent: boolean;
}

export interface UserPermissions {
  role: 'host' | 'participant' | 'both';
  canModerate: boolean;
  canAddItems: boolean;
  canManageSession: boolean;
  canViewAllSuggestions: boolean;
  canParticipateInTasting: boolean;
}

/**
 * Helper to get display category name
 */
export const getDisplayCategoryName = (category: string, customName?: string | null): string => {
  if (category === 'other' && customName) {
    return customName;
  }
  return category.charAt(0).toUpperCase() + category.slice(1);
};

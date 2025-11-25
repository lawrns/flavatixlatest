/**
 * Custom Hooks Index
 * 
 * Centralized exports for all custom hooks.
 */

// Tasting session hooks
export { useTastingSession } from './useTastingSession';
export type { 
  QuickTasting, 
  TastingItemData, 
  UserPermissions, 
  TastingPhase 
} from './useTastingSession';

export { useSessionEditor } from './useSessionEditor';
export { useItemNavigation } from './useItemNavigation';

// Social feed hooks
export { useSocialFeed } from './useSocialFeed';
export type { TastingPost, TastingItem as SocialTastingItem, FeedTab } from './useSocialFeed';

// Realtime collaboration (existing)
export { useRealtimeCollaboration, CollaboratorPresence } from './useRealtimeCollaboration';

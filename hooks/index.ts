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

export { useFocusTrap } from './useFocusTrap';
export { default as useFocusTrapDefault } from './useFocusTrap';

// Accessibility hooks
export { 
  useReducedMotion, 
  useAnimationDuration, 
  useMotionConfig, 
  useTransition 
} from './useReducedMotion';

// Realtime collaboration (existing)
export { useRealtimeCollaboration, CollaboratorPresence } from './useRealtimeCollaboration';

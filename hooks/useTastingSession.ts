/**
 * useTastingSession Hook
 * 
 * Manages tasting session state and operations for QuickTastingSession component.
 * Extracts complex state management and data operations from the component.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { roleService } from '../lib/roleService';
import { toast } from '../lib/toast';
import { logger } from '../lib/logger';

// ============================================================================
// TYPES
// ============================================================================

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
  flavor_scores?: any;
  overall_score?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  correct_answers?: any;
  include_in_ranking?: boolean;
  aroma?: string;
  flavor?: string;
}

export interface UserPermissions {
  role: 'host' | 'participant' | 'both';
  canModerate: boolean;
  canAddItems: boolean;
  canManageSession: boolean;
  canViewAllSuggestions: boolean;
  canParticipateInTasting: boolean;
}

export type TastingPhase = 'setup' | 'tasting';

interface UseTastingSessionOptions {
  session: QuickTasting | null;
  userId: string;
  onSessionUpdate?: (session: QuickTasting) => void;
  onSessionComplete: (session: QuickTasting) => void;
}

interface UseTastingSessionReturn {
  // State
  items: TastingItemData[];
  currentItemIndex: number;
  isLoading: boolean;
  sessionNotes: string;
  userRole: 'host' | 'participant' | 'both' | null;
  userPermissions: UserPermissions;
  phase: TastingPhase;
  currentItem: TastingItemData | undefined;
  hasItems: boolean;
  completedItems: number;
  
  // State setters
  setCurrentItemIndex: (index: number) => void;
  setSessionNotes: (notes: string) => void;
  setPhase: (phase: TastingPhase) => void;
  setItems: React.Dispatch<React.SetStateAction<TastingItemData[]>>;
  
  // Actions
  addNewItem: () => Promise<void>;
  updateItem: (itemId: string, updates: Partial<TastingItemData>) => Promise<void>;
  completeSession: () => Promise<void>;
  loadTastingItems: () => Promise<void>;
  
  // Helpers
  getDisplayCategoryName: (category: string, customName?: string | null) => string;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useTastingSession({
  session,
  userId,
  onSessionUpdate,
  onSessionComplete,
}: UseTastingSessionOptions): UseTastingSessionReturn {
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(session?.notes || '');
  const [userRole, setUserRole] = useState<'host' | 'participant' | 'both' | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    role: 'participant',
    canModerate: false,
    canAddItems: true,
    canManageSession: false,
    canViewAllSuggestions: false,
    canParticipateInTasting: true,
  });
  const [phase, setPhase] = useState<TastingPhase>(
    session?.mode === 'quick' ? 'tasting' : 'setup'
  );

  const supabase = getSupabaseClient() as any;
  const aiExtractionTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Helper function to get the display category name
  const getDisplayCategoryName = useCallback((category: string, customName?: string | null): string => {
    if (category === 'other' && customName) {
      return customName;
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, []);

  // Load user role and permissions
  const loadUserRole = useCallback(async () => {
    if (!session) return;

    // Quick tasting doesn't use roles - set default permissions
    if (session.mode === 'quick') {
      setUserPermissions({
        role: 'host',
        canModerate: true,
        canAddItems: true,
        canManageSession: true,
        canViewAllSuggestions: true,
        canParticipateInTasting: true,
      });
      setUserRole('host');
      return;
    }

    // Study mode: load participant roles
    try {
      const permissions = await roleService.getUserPermissions(session.id, userId);
      setUserPermissions(permissions);
      setUserRole(permissions.role);
    } catch (error) {
      logger.error('TastingSession', 'Error loading user role', error);
      // User might not be a participant yet, try to add them
      try {
        await roleService.addParticipant(session.id, userId);
        setTimeout(async () => {
          try {
            const permissions = await roleService.getUserPermissions(session.id, userId);
            setUserPermissions(permissions);
            setUserRole(permissions.role);
          } catch (retryError) {
            logger.error('TastingSession', 'Error loading permissions after adding participant', retryError);
          }
        }, 500);
      } catch (addError) {
        logger.error('TastingSession', 'Error adding user as participant', addError);
        setUserPermissions({
          role: 'participant',
          canModerate: false,
          canAddItems: true,
          canManageSession: false,
          canViewAllSuggestions: false,
          canParticipateInTasting: true,
        });
        setUserRole('participant');
      }
    }
  }, [session, userId]);

  // Load tasting items
  const loadTastingItems = useCallback(async () => {
    if (!session) return;

    try {
      logger.debug('TastingSession', 'Loading items for session', { 
        sessionId: session.id, 
        mode: session.mode, 
        phase 
      });
      
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .select('*')
        .eq('tasting_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      logger.debug('TastingSession', `Loaded ${(data || []).length} items`);
      setItems(data || []);
    } catch (error) {
      logger.error('TastingSession', 'Error loading tasting items', error);
      toast.error('Failed to load tasting items');
    }
  }, [session, phase, supabase]);

  // Extract descriptors from item content
  const extractDescriptors = useCallback(async (itemId: string, itemData: TastingItemData) => {
    if (!session) return;

    try {
      const hasContent = itemData.notes?.trim() || itemData.aroma?.trim() || itemData.flavor?.trim();
      if (!hasContent) {
        logger.debug('TastingSession', 'Skipping extraction - no content');
        return;
      }

      logger.debug('TastingSession', 'Extracting flavor descriptors', { itemId });

      const extractionPayload = {
        sourceType: 'quick_tasting',
        sourceId: itemId,
        structuredData: {
          aroma_notes: itemData.aroma || itemData.notes || '',
          flavor_notes: itemData.flavor || '',
          other_notes: itemData.notes || ''
        },
        itemContext: {
          itemName: itemData.item_name,
          itemCategory: session.category
        }
      };

      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        if (!refreshedSession) {
          logger.error('TastingSession', 'Failed to refresh auth session');
          return;
        }
      }

      const token = authSession?.access_token || (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        logger.error('TastingSession', 'No auth token available for extraction');
        return;
      }

      const response = await fetch('/api/flavor-wheels/extract-descriptors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(extractionPayload),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        logger.error('TastingSession', 'Failed to parse extraction response');
        return;
      }

      if (!response.ok) {
        logger.error('TastingSession', 'Descriptor extraction failed', { status: response.status });
        return;
      }

      if (result.success && result.savedCount > 0) {
        logger.debug('TastingSession', `Extracted ${result.savedCount} descriptors from item ${itemId}`);
      }
    } catch (error) {
      logger.error('TastingSession', 'Error extracting descriptors', error);
    }
  }, [session, supabase]);

  // Add new item
  const addNewItem = useCallback(async () => {
    if (!session) return;

    logger.debug('TastingSession', 'Adding new item', { sessionId: session.id });

    // Wait for permissions to load for study mode
    if (session.mode === 'study' && (!userPermissions || !userRole)) {
      logger.debug('TastingSession', 'Waiting for permissions to load');
      return;
    }

    // Check permissions based on mode
    if (session.mode === 'competition') {
      toast.error('Cannot add items in competition mode');
      return;
    }

    if (session.mode === 'study' && session.study_approach === 'collaborative') {
      toast.error('In collaborative mode, suggest items instead of adding them directly');
      return;
    }

    if (session.mode === 'study' && !userPermissions.canAddItems) {
      toast.error('You do not have permission to add items');
      return;
    }

    const newIndex = items.length;
    const itemName = `${getDisplayCategoryName(session.category, session.custom_category_name)} ${newIndex + 1}`;

    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .insert({
          tasting_id: session.id,
          item_name: itemName,
        })
        .select()
        .single();

      if (error) throw error;

      logger.debug('TastingSession', 'Item created successfully', { itemId: data.id });
      setItems(prev => [...prev, data]);
      setCurrentItemIndex(newIndex);
      toast.success('New item added!');

      // Scroll to the new item
      setTimeout(() => {
        const itemElement = document.querySelector(`[data-item-id="${data.id}"]`);
        if (itemElement) {
          itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      logger.error('TastingSession', 'Error adding new item', error);
      toast.error('Failed to add new item');
    }
  }, [session, items, userPermissions, userRole, getDisplayCategoryName, supabase]);

  // Update item
  const updateItem = useCallback(async (itemId: string, updates: Partial<TastingItemData>) => {
    if (!session) return;

    logger.debug('TastingSession', `Updating item: ${itemId}`, { updates });

    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      );
      setItems(updatedItems);

      const newCompleted = updatedItems.filter(item => item.overall_score !== null).length;
      if (onSessionUpdate && session) {
        onSessionUpdate({ ...session, completed_items: newCompleted });
      }

      // Debounce AI extraction
      const shouldExtract = updates.notes || updates.aroma || updates.flavor;
      if (shouldExtract) {
        const existingTimeout = aiExtractionTimeoutRef.current.get(itemId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeoutId = setTimeout(() => {
          extractDescriptors(itemId, data);
          aiExtractionTimeoutRef.current.delete(itemId);
        }, 2000);

        aiExtractionTimeoutRef.current.set(itemId, timeoutId);
      }
    } catch (error) {
      logger.error('TastingSession', 'Error updating item', error);
    }
  }, [session, items, onSessionUpdate, extractDescriptors, supabase]);

  // Complete session
  const completeSession = useCallback(async () => {
    if (!session) return;

    logger.debug('TastingSession', 'Completing session', { sessionId: session.id });

    setIsLoading(true);
    try {
      // Extract descriptors for all items with content
      const extractionPromises = items
        .filter(item => item.notes?.trim() || item.aroma?.trim() || item.flavor?.trim())
        .map(item => extractDescriptors(item.id, item));

      await Promise.allSettled(extractionPromises);

      const { data, error } = await supabase
        .from('quick_tastings')
        .update({
          notes: sessionNotes,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      logger.debug('TastingSession', 'Session completed successfully');
      toast.success('Tasting session completed!');
      onSessionComplete(data);
    } catch (error) {
      logger.error('TastingSession', 'Error completing session', error);
      toast.error('Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  }, [session, items, sessionNotes, extractDescriptors, onSessionComplete, supabase]);

  // Load session data on mount
  useEffect(() => {
    if (!session) return;

    logger.debug('TastingSession', 'Loading session', { 
      sessionId: session.id, 
      mode: session.mode 
    });
    
    loadTastingItems();
    
    if (session.mode === 'study') {
      loadUserRole();
    }
  }, [session?.id, session?.mode, loadTastingItems, loadUserRole]);

  // Auto-add first item for quick tasting
  useEffect(() => {
    if (
      session?.mode === 'quick' && 
      phase === 'tasting' && 
      items.length === 0 && 
      !isLoading
    ) {
      const timer = setTimeout(() => addNewItem(), 100);
      return () => clearTimeout(timer);
    }
  }, [session?.mode, phase, items.length, isLoading, addNewItem]);

  // Cleanup extraction timeouts on unmount
  useEffect(() => {
    return () => {
      aiExtractionTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      aiExtractionTimeoutRef.current.clear();
    };
  }, []);

  const currentItem = items[currentItemIndex];
  const hasItems = items.length > 0;
  const completedItemsCount = items.filter(item => item.overall_score !== null).length;

  return {
    // State
    items,
    currentItemIndex,
    isLoading,
    sessionNotes,
    userRole,
    userPermissions,
    phase,
    currentItem,
    hasItems,
    completedItems: completedItemsCount,
    
    // State setters
    setCurrentItemIndex,
    setSessionNotes,
    setPhase,
    setItems,
    
    // Actions
    addNewItem,
    updateItem,
    completeSession,
    loadTastingItems,
    
    // Helpers
    getDisplayCategoryName,
  };
}

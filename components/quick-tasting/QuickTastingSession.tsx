import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { roleService } from '../../lib/roleService';
import { studyModeService } from '../../lib/studyModeService';
import FlavorWheel from './FlavorWheel';
import TastingItem from './TastingItem';
import CompetitionRanking from './CompetitionRanking';
import { RoleIndicator } from './RoleIndicator';
import { EditTastingDashboard } from './EditTastingDashboard';
import { ItemSuggestions } from './ItemSuggestions';
import { CategoryDropdown, CATEGORIES } from './CategoryDropdown';
import { ItemNavigationDropdown } from './ItemNavigationDropdown';
import { useRealtimeCollaboration, CollaboratorPresence } from '../../hooks/useRealtimeCollaboration';
import { toast } from '../../lib/toast';
import { Utensils, Settings, Play, Edit, Users } from 'lucide-react';
import { logger } from '../../lib/logger';

interface QuickTasting {
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

interface TastingItemData {
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

interface QuickTastingSessionProps {
  session: QuickTasting | null;
  userId: string;
  onSessionComplete: (session: QuickTasting) => void;
  onSessionUpdate?: (session: QuickTasting) => void;
  onSessionCreate?: (session: QuickTasting) => void;
}

const QuickTastingSession: React.FC<QuickTastingSessionProps> = ({
  session,
  userId,
  onSessionComplete,
  onSessionUpdate,
  onSessionCreate,
}) => {
  // All hooks must be declared before any conditional returns
  const [items, setItems] = useState<TastingItemData[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(session?.notes || '');
  const [userRole, setUserRole] = useState<'host' | 'participant' | 'both' | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [showEditTastingDashboard, setShowEditTastingDashboard] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [showItemNavigation, setShowItemNavigation] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'tasting'>(session?.mode === 'quick' ? 'tasting' : 'setup');
  const [isEditingSessionName, setIsEditingSessionName] = useState(false);
  const [editingSessionName, setEditingSessionName] = useState(session?.session_name || '');
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const supabase = getSupabaseClient() as any;

  // Ref for debouncing AI extraction
  const aiExtractionTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Realtime collaboration hook (only for study mode)
  const handleRemoteUpdate = useCallback((update: any) => {
    // Handle remote updates from collaborators
    if (update.type === 'item_update' && update.itemId) {
      setItems(prevItems => prevItems.map(item =>
        item.id === update.itemId
          ? { ...item, [update.field]: update.value, updated_at: new Date().toISOString() }
          : item
      ));
    }
  }, []);

  const handleUserJoined = useCallback((user: any) => {
    logger.debug('Realtime', `User joined the tasting`, { userName: user.userName });
  }, []);

  const handleUserLeft = useCallback((user: any) => {
    logger.debug('Realtime', `User left the tasting`, { userName: user.userName });
  }, []);

  const {
    isConnected,
    activeUsers,
    collaborators,
    sendCursor,
    sendTypingIndicator,
    broadcastItemUpdate,
    broadcastScoreUpdate,
    updatePresence
  } = useRealtimeCollaboration({
    sessionId: session?.id || '',
    onRemoteUpdate: handleRemoteUpdate,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft
  });

  // Helper function to get the display category name
  const getDisplayCategoryName = (category: string, customName?: string | null): string => {
    if (category === 'other' && customName) {
      return customName;
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const loadUserRole = async () => {
    if (!session) return;

    // Quick tasting doesn't use roles - set default permissions
    if (session.mode === 'quick') {
      setUserPermissions({
        role: 'host', // Creator has full access to quick tasting
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
      console.error('Error loading user role:', error);
      // User might not be a participant yet, try to add them
      try {
        await roleService.addParticipant(session.id, userId);
        // Wait a moment for the participant record to be created
        setTimeout(async () => {
          try {
            const permissions = await roleService.getUserPermissions(session.id, userId);
            setUserPermissions(permissions);
            setUserRole(permissions.role);
          } catch (retryError) {
            console.error('Error loading permissions after adding participant:', retryError);
          }
        }, 500);
      } catch (addError) {
        console.error('Error adding user as participant:', addError);
        // Set default participant permissions if we can't determine role
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
  };

  const loadTastingItems = async () => {
    if (!session) return;

    try {
      logger.debug('Tasting', `Loading items for session`, { sessionId: session.id, mode: session.mode, phase, isLoading });
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .select('*')
        .eq('tasting_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      logger.debug('Tasting', `Loaded ${(data || []).length} items`);
      setItems(data || []);

      // After loading items, check if we need to create the first item for quick tasting
      if ((data || []).length === 0 && session.mode === 'quick' && phase === 'tasting' && !isLoading) {
        logger.debug('🔄 QuickTastingSession: No items found, auto-adding first item...');
        setTimeout(() => addNewItem(), 100); // Small delay to ensure state is updated
      }
    } catch (error) {
      console.error('Error loading tasting items:', error);
      toast.error('Failed to load tasting items');
    }
  };

  const addNewItem = async () => {
    if (!session) return;

    logger.debug('➕ QuickTastingSession: addNewItem called for session:', session.id);

    // Wait for permissions to load for study mode
    if (session.mode === 'study' && (!userPermissions || !userRole)) {
      logger.debug('⏳ QuickTastingSession: Waiting for permissions to load...');
      return;
    }

    // Check permissions based on mode
    if (session.mode === 'competition') {
      logger.debug('❌ QuickTastingSession: Cannot add items in competition mode');
      toast.error('Cannot add items in competition mode');
      return;
    }

    if (session.mode === 'study' && session.study_approach === 'collaborative') {
      logger.debug('❌ QuickTastingSession: Collaborative mode - showing suggestions');
      toast.error('In collaborative mode, suggest items instead of adding them directly');
      setShowItemSuggestions(true);
      return;
    }

    if (session.mode === 'study' && !userPermissions.canAddItems) {
      logger.debug('❌ QuickTastingSession: No permission to add items');
      toast.error('You do not have permission to add items');
      return;
    }

    const newIndex = items.length;
    const itemName = `${getDisplayCategoryName(session.category, session.custom_category_name)} ${newIndex + 1}`;
    logger.debug('Tasting', `Creating item: ${itemName}`, { index: newIndex, sessionId: session.id });

    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .insert({
          tasting_id: session.id,
          item_name: itemName,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ QuickTastingSession: Error inserting item:', error);
        throw error;
      }

      logger.debug('✅ QuickTastingSession: Item created successfully:', data.id);
      setItems(prev => [...prev, data]);
      setCurrentItemIndex(newIndex);
      toast.success('New item added!');
      
      // Scroll to the new item form instead of top
      setTimeout(() => {
        const itemElement = document.querySelector(`[data-item-id="${data.id}"]`);
        if (itemElement) {
          itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to the tasting form area
          const formElement = document.querySelector('.tasting-form');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    } catch (error) {
      console.error('❌ QuickTastingSession: Error adding new item:', error);
      toast.error('Failed to add new item');
    }
  };

  const updateItem = async (itemId: string, updates: Partial<TastingItemData>) => {
    if (!session) return;

    logger.debug('Tasting', `Updating item: ${itemId}`, { updates });

    // Broadcast updates to collaborators in study mode
    if (session.mode === 'study' && isConnected) {
      Object.entries(updates).forEach(([field, value]) => {
        if (field === 'overall_score' || field === 'flavor_scores') {
          broadcastScoreUpdate(itemId, field, value as number);
        } else {
          broadcastItemUpdate(itemId, field, value);
        }
      });
    }

    try {
      const { data, error } = await supabase
        .from('quick_tasting_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('❌ QuickTastingSession: Error updating item:', error);
        throw error;
      }

      logger.debug('✅ QuickTastingSession: Item updated successfully:', data.id);

      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, ...data } : item
      );
      setItems(updatedItems);

      const newCompleted = updatedItems.filter(item => item.overall_score !== null).length;
      if (onSessionUpdate && session) {
        onSessionUpdate({ ...session, completed_items: newCompleted });
      }

      // Debounce AI extraction - only run after user stops typing for 2 seconds
      const shouldExtract = updates.notes || updates.aroma || updates.flavor;
      if (shouldExtract) {
        // Clear any existing timeout for this item
        const existingTimeout = aiExtractionTimeoutRef.current.get(itemId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set new timeout - wait 2 seconds after last keystroke
        const timeoutId = setTimeout(() => {
          extractDescriptors(itemId, data);
          aiExtractionTimeoutRef.current.delete(itemId);
        }, 2000);

        aiExtractionTimeoutRef.current.set(itemId, timeoutId);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      // Removed toast.error to prevent annoying notifications during typing
    }
  };

  const extractDescriptors = async (itemId: string, itemData: TastingItemData) => {
    if (!session) return;

    let aiToastId: number | undefined;

    try {
      // Only extract if there's meaningful content
      const hasContent = itemData.notes?.trim() || itemData.aroma?.trim() || itemData.flavor?.trim();
      if (!hasContent) {
        logger.debug('⏭️ Skipping extraction - no content to extract from');
        return;
      }

      logger.debug('🔍 Extracting flavor descriptors from item:', itemId, {
        hasNotes: !!itemData.notes,
        hasAroma: !!itemData.aroma,
        hasFlavor: !!itemData.flavor
      });

      // AI processing indicator removed for better UX

      // Prepare extraction data - use aroma field for aroma_notes
      const extractionPayload = {
        sourceType: 'quick_tasting',
        sourceId: itemId,
        structuredData: {
          aroma_notes: itemData.aroma || itemData.notes || '', // Use aroma field first, fallback to notes
          flavor_notes: itemData.flavor || '',
          other_notes: itemData.notes || ''
        },
        itemContext: {
          itemName: itemData.item_name,
          itemCategory: session.category
        }
      };

      // Get current session for auth token
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        console.error('❌ No active auth session for descriptor extraction');
        // Try to refresh the session
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        if (!refreshedSession) {
          console.error('❌ Failed to refresh auth session');
          return;
        }
        logger.debug('✅ Auth session refreshed successfully');
      }

      const token = authSession?.access_token || (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        console.error('❌ No auth token available for extraction');
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
        console.error('❌ Failed to parse extraction response:', responseText);
        return;
      }

      if (!response.ok) {
        console.error('❌ Descriptor extraction failed:', {
          status: response.status,
          error: result,
          payload: extractionPayload
        });
        return;
      }

      if (result.success && result.savedCount > 0) {
        logger.debug(`✅ Successfully extracted ${result.savedCount} flavor descriptors from item ${itemId}`);
        // Success notifications removed for better UX
      } else if (result.success && result.savedCount === 0) {
        logger.debug('ℹ️ No descriptors found in the content');
      }
    } catch (error) {
      console.error('❌ Error extracting descriptors:', error);

      // Error handling without toast notifications

      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  };


  const handleCategoryChange = async (newCategory: string) => {
    if (!session || newCategory === session.category) return; // No change needed

    setIsChangingCategory(true);
    try {
      const { data, error } = await supabase
        .from('quick_tastings')
        .update({ category: newCategory })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = { ...session, category: newCategory };
      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
      toast.success('Category updated!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsChangingCategory(false);
    }
  };

  const startTasting = () => {
    setPhase('tasting');
    setCurrentItemIndex(0);
    setShowEditTastingDashboard(false);
  };

  const startEditingSessionName = () => {
    if (!session) return;
    setIsEditingSessionName(true);
    setEditingSessionName(session.session_name || '');
  };

  const saveSessionName = async () => {
    if (!session) return;

    if (editingSessionName.trim() && editingSessionName.trim() !== session.session_name) {
      try {
        const { data, error } = await supabase
          .from('quick_tastings')
          .update({ session_name: editingSessionName.trim() })
          .eq('id', session.id)
          .select()
          .single();

        if (error) throw error;

        const updatedSession = { ...session, session_name: editingSessionName.trim() };
        if (onSessionUpdate) {
          onSessionUpdate(updatedSession);
        }
        toast.success('Session name updated!');
      } catch (error) {
        console.error('Error updating session name:', error);
        toast.error('Failed to update session name');
      }
    }
    setIsEditingSessionName(false);
  };

  const cancelEditingSessionName = () => {
    if (!session) return;
    setEditingSessionName(session.session_name || '');
    setIsEditingSessionName(false);
  };

  const handleNextItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowEditTastingDashboard(false); // Close edit dashboard when moving to next item
      setShowItemSuggestions(false); // Also close item suggestions
    } else {
      completeSession();
    }
  };

  const handleNextOrAdd = async () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowEditTastingDashboard(false);
      setShowItemSuggestions(false);
    } else {
      await addNewItem();
      setPhase('tasting'); // Ensure phase is tasting
    }
  };

  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      setShowEditTastingDashboard(false);
      setShowItemSuggestions(false);
    }
  };

  const handleItemNavigation = (index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentItemIndex(index);
      setShowEditTastingDashboard(false);
      setShowItemSuggestions(false);
    }
  };

  const getNavigationItems = (): any[] => {
    return items.map((item, index) => ({
      id: item.id,
      index,
      name: item.item_name,
      isCompleted: item.overall_score !== null && item.overall_score !== undefined,
      hasPhoto: !!item.photo_url,
      score: item.overall_score,
      isCurrent: index === currentItemIndex
    }));
  };

  const handleAddNextItem = async () => {
    // Add new item and switch to tasting phase
    await addNewItem();
    setPhase('tasting');
  };

  const handleEndTasting = () => {
    completeSession();
  };

  const handleBack = () => {
    if (currentItemIndex > 0) {
      handlePreviousItem();
    } else {
      handleBackToSetup();
    }
  };

  const completeSession = async () => {
    if (!session) return;

    logger.debug('🏁 QuickTastingSession: Completing session:', session.id);
    logger.debug('Tasting', `Current items state: ${items.length} items`);

    items.forEach((item, index) => {
      logger.debug(`  ${index + 1}. ${item.item_name} (ID: ${item.id}, Score: ${item.overall_score})`);
    });

    setIsLoading(true);
    try {
      // First, ensure all items with content have their descriptors extracted
      logger.debug('🔄 Extracting descriptors for all items before completing session...');
      const extractionPromises = items
        .filter(item => item.notes?.trim() || item.aroma?.trim() || item.flavor?.trim())
        .map(item => extractDescriptors(item.id, item));

      // Wait for all extractions to complete (but don't fail the session if extraction fails)
      await Promise.allSettled(extractionPromises);
      logger.debug('✅ Descriptor extraction batch completed');

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

      logger.debug('✅ QuickTastingSession: Session completed successfully');
      toast.success('Tasting session completed!');
      onSessionComplete(data);
    } catch (error) {
      console.error('❌ QuickTastingSession: Error completing session:', error);
      toast.error('Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  };

  // Load session data and user permissions
  useEffect(() => {
    if (!session) return;

    logger.debug('Tasting', `Loading session`, { sessionId: session.id, mode: session.mode });
    loadTastingItems();
    // Only load user roles for study mode sessions
    if (session.mode === 'study') {
      loadUserRole();
    }
  }, [session?.id, session?.mode]);

  // Update local state when session name changes externally
  useEffect(() => {
    setEditingSessionName(session?.session_name || '');
  }, [session?.session_name]);

  const currentItem = items[currentItemIndex];
  const hasItems = items.length > 0;
  const completedItems = items.filter(item => item.overall_score !== null).length;

  // Generate dynamic display name for current item based on category and index
  const getCurrentItemDisplayName = () => {
    if (!currentItem || !session) return '';
    if (session.is_blind_items) {
      return `Item ${currentItem.id.slice(-4)}`;
    }
    return `${getDisplayCategoryName(session.category, session.custom_category_name).charAt(0).toUpperCase() + getDisplayCategoryName(session.category, session.custom_category_name).slice(1)} ${currentItemIndex + 1}`;
  };

  // Early return if no session
  if (!session) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto" data-testid="quick-tasting-session">
      {/* Collaborator Presence for Study Mode */}
      {session?.mode === 'study' && collaborators.length > 0 && (
        <div className="mb-4">
          <CollaboratorPresence users={collaborators} />
        </div>
      )}

      {/* Session Header */}
      <div className="card p-md mb-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {isEditingSessionName ? (
              <div className="mb-2">
                <div className="p-2 rounded-lg bg-background-app border-2 border-primary-300">
                  <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                    Editing Session Name
                  </div>
                  <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingSessionName}
                  onChange={(e) => setEditingSessionName(e.target.value)}
                  onBlur={saveSessionName}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveSessionName();
                    if (e.key === 'Escape') cancelEditingSessionName();
                  }}
                      className="text-h2 font-heading font-bold text-text-primary bg-transparent border-none outline-none focus:ring-0 flex-1 placeholder-text-secondary/50"
                      placeholder="Enter session name..."
                  autoFocus
                />
                    <div className="flex items-center space-x-1 text-text-secondary text-xs">
                      <span>Press Enter to save</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg bg-background-app border border-border-subtle ${items.length > 1 ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer'} transition-all duration-200 group`}
                  onClick={items.length > 1 ? undefined : startEditingSessionName}
                  title={items.length > 1 ? 'Cannot edit session name after adding items' : 'Click to edit session name'}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                      Session Name
                    </div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-h2 font-heading font-bold text-text-primary truncate">
                        {session.session_name || 'Quick Tasting'}
                </h2>
                      {items.length <= 1 && (
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <Edit size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                          <span className="text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                            Edit
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {phase === 'setup' && (
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <label className="text-text-secondary font-medium">Category:</label>
                  <select
                    value={session.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="form-input text-sm"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 text-text-secondary">
              <span className="text-sm font-medium">Category:</span>
              <CategoryDropdown
                category={session.category}
                onCategoryChange={handleCategoryChange}
                className="text-sm w-full sm:w-auto"
                isLoading={isChangingCategory}
                disabled={items.length > 1}
              />
              <div className="flex flex-wrap items-center space-x-2 text-xs">
                {session.mode === 'study' && session.study_approach && <span>• {session.study_approach.charAt(0).toUpperCase() + session.study_approach.slice(1)}</span>}
                {session.rank_participants && <span>• Ranked Competition</span>}
                {(session.is_blind_participants || session.is_blind_items || session.is_blind_attributes) && <span>• Blind Tasting</span>}
              </div>
            </div>
            {userRole && session.mode !== 'quick' && (
              <div className="mt-2">
                <RoleIndicator
                  role={userRole}
                  userId={userId}
                  currentUserId={userId}
                  size="sm"
                />
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Edit Tasting Controls - Only show in setup phase */}
            {phase === 'setup' && (
              <button
                onClick={() => setShowEditTastingDashboard(!showEditTastingDashboard)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings size={16} />
                Edit Tasting
              </button>
            )}

            {/* Item Suggestions for Collaborative Study Mode */}
            {session.mode === 'study' && session.study_approach === 'collaborative' && phase === 'setup' && (
              <button
                onClick={() => setShowItemSuggestions(!showItemSuggestions)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  showItemSuggestions
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-white dark:bg-zinc-800 text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                💡 Suggestions
              </button>
            )}
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-primary-600">{completedItems}</div>
              <div className="text-small font-body text-text-secondary">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-text-primary">{items.length}</div>
              <div className="text-small font-body text-text-secondary">Total Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tasting Dashboard - Only show in setup phase */}
      {showEditTastingDashboard && phase === 'setup' && (
        <div className="mb-lg">
          <EditTastingDashboard
            session={session}
            onSessionUpdate={onSessionUpdate}
          />
        </div>
      )}

      {/* Item Suggestions */}
      {showItemSuggestions && session.mode === 'study' && session.study_approach === 'collaborative' && (
        <div className="mb-lg">
          <ItemSuggestions
            tastingId={session.id}
            userId={userId}
            canAddItems={userPermissions.canAddItems}
            canModerate={userPermissions.canModerate}
          />
        </div>
      )}

      {phase === 'setup' && (
        <div className="max-w-4xl mx-auto">
          {/* Item Management */}
          <div className="space-y-6">
          {/* Item Navigation */}
          {hasItems && (
            <div className="card p-md">
              <div className="flex items-center justify-between mb-sm">
                <h3 className="text-h4 font-heading font-semibold text-text-primary">Items</h3>
              </div>
              
              <div className="flex flex-wrap gap-xs mb-sm">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentItemIndex(index)}
                    className={`
                      px-sm py-xs rounded-lg text-small font-body font-medium transition-colors min-h-touch
                      ${currentItemIndex === index
                        ? 'bg-primary text-white'
                        : item.overall_score !== null
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-background-surface text-text-secondary hover:bg-border-default'
                      }
                    `}
                  >
                    {item.item_name}
                    {item.overall_score !== null && (
                      <span className="ml-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Item */}
          {currentItem ? (
            <TastingItem
              item={currentItem}
              category={getDisplayCategoryName(session.category, session.custom_category_name)}
              userId={session.user_id}
              onUpdate={(updates: Partial<TastingItemData>) => updateItem(currentItem.id, updates)}
              isBlindItems={session.is_blind_items}
              isBlindAttributes={session.is_blind_attributes}
              showOverallScore={true}
              showNotesFields={true}
              showFlavorWheel={false}
              itemIndex={currentItemIndex + 1}
            />
          ) : (
            <div className="card p-lg text-center">
              <div className="flex items-center justify-center mb-sm">
                <Utensils size={64} className="text-text-secondary" />
              </div>
              <h3 className="text-h3 font-heading font-semibold text-text-primary mb-2">
                {hasItems
                  ? 'Add Next Item'
                  : session.mode === 'competition'
                    ? 'Waiting for Items'
                    : 'No Items Yet'
                }
              </h3>
              <p className="text-text-secondary mb-md">
                {hasItems
                  ? 'Add another item to continue your tasting session.'
                  : session.mode === 'competition'
                    ? 'Items should be preloaded for competition mode.'
                    : 'Add your first item to start tasting!'
                }
              </p>
              {(session.mode === 'study' || session.mode === 'quick') && (
                <button
                  onClick={addNewItem}
                  className="btn-primary"
                >
                  {hasItems ? 'Add Next Item' : 'Add First Item'}
                </button>
              )}
            </div>
          )}


          {/* Competition Ranking */}
          {session.rank_participants && (
            <CompetitionRanking
              tastingId={session.id}
              isRankingEnabled={true}
              currentUserId={session.user_id}
            />
          )}
        </div>

        {/* Item Action Buttons */}
        {currentItem && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleAddNextItem}
              className="btn-secondary flex items-center gap-2"
            >
              Next Item
            </button>
            <button
              onClick={handleEndTasting}
              className="btn-primary flex items-center gap-2"
            >
              End Tasting
            </button>
          </div>
        )}
      </div>
    )}

    {/* Tasting Phase */}
    {phase === 'tasting' && currentItem && (
      <div className="max-w-4xl mx-auto">

        {/* Unified Tasting Item */}
        <TastingItem
          item={currentItem}
          category={getDisplayCategoryName(session.category, session.custom_category_name)}
          userId={session.user_id}
          onUpdate={(updates: Partial<TastingItemData>) => updateItem(currentItem.id, updates)}
          isBlindItems={session.is_blind_items}
          isBlindAttributes={session.is_blind_attributes}
          showOverallScore={true}
          showFlavorWheel={false}
          showEditControls={true}
          showPhotoControls={false}
          itemIndex={currentItemIndex + 1}
        />

        {/* Item Navigation */}
        {items.length > 1 && (
          <div className="flex justify-center mt-md">
            <ItemNavigationDropdown
              items={getNavigationItems()}
              currentIndex={currentItemIndex}
              onItemSelect={handleItemNavigation}
              className="w-full max-w-sm"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col items-center mt-lg px-4 gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousItem}
              disabled={currentItemIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500 px-2 min-w-20 text-center">
              {currentItemIndex + 1} of {items.length}
            </span>

          <button
            onClick={handleNextOrAdd}
            className="btn-secondary"
          >
              {currentItemIndex < items.length - 1 ? 'Next Item' : 'Add Item'}
            </button>
          </div>

          {/* Show/Hide Navigation Toggle */}
          {items.length > 1 && (
            <button
              onClick={() => setShowItemNavigation(!showItemNavigation)}
              className="text-sm text-primary-600 hover:text-primary-700 underline"
            >
              {showItemNavigation ? 'Hide' : 'Show'} All Items
          </button>
          )}

          {/* Complete Tasting Button */}
          <button
            onClick={completeSession}
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Completing...' : 'Complete Tasting'}
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default QuickTastingSession;
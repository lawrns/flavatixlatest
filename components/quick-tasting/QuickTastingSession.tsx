import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../../lib/supabase';
import { roleService } from '../../lib/roleService';
import { studyModeService } from '../../lib/studyModeService';
import TastingItem from './TastingItem';
import CompetitionRanking from './CompetitionRanking';
import { EditTastingDashboard } from './EditTastingDashboard';
import { ItemSuggestions } from './ItemSuggestions';
import { CATEGORIES } from './CategoryDropdown';
import { SessionHeader } from './SessionHeader';
import { SessionNavigation } from './SessionNavigation';
import { useRealtimeCollaboration, CollaboratorPresence } from '../../hooks/useRealtimeCollaboration';
import { toast } from '../../lib/toast';
import { Utensils } from 'lucide-react';
import { logger } from '../../lib/logger';
import { 
  QuickTasting, 
  TastingItemData, 
  QuickTastingSessionProps,
  UserPermissions,
  NavigationItem,
  getDisplayCategoryName 
} from './types';

// Types imported from ./types.ts

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
  const [isChangingCategory, setIsChangingCategory] = useState(false);
  const [studyCategories, setStudyCategories] = useState<any[]>([]);
  const supabase = getSupabaseClient() as any;

  // Ref for debouncing AI extraction
  const aiExtractionTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const autoAddTriggeredRef = useRef(false);

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

    // Quick tasting and predefined study mode don't use participant roles
    // Creator has full permissions
    if (session.mode === 'quick' || (session.mode === 'study' && session.study_approach === 'predefined')) {
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

    // Collaborative study mode: load participant roles
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
    } catch (error) {
      console.error('Error loading tasting items:', error);
      toast.error('Failed to load tasting items');
    }
  };

  const addNewItem = async () => {
    if (!session) return;

    logger.debug('[ADD] QuickTastingSession: addNewItem called for session:', session.id);

    // Wait for permissions to load for study mode
    if (session.mode === 'study' && (!userPermissions || !userRole)) {
      logger.debug('[WAIT] QuickTastingSession: Waiting for permissions to load...');
      return;
    }

    // Check permissions based on mode
    if (session.mode === 'competition') {
      logger.debug('[BLOCKED] QuickTastingSession: Cannot add items in competition mode');
      toast.error('Cannot add items in competition mode');
      return;
    }

    if (session.mode === 'study' && session.study_approach === 'collaborative') {
      logger.debug('[BLOCKED] QuickTastingSession: Collaborative mode - showing suggestions');
      toast.error('In collaborative mode, suggest items instead of adding them directly');
      setShowItemSuggestions(true);
      return;
    }

    if (session.mode === 'study' && !userPermissions.canAddItems) {
      logger.debug('[BLOCKED] QuickTastingSession: No permission to add items');
      toast.error('You do not have permission to add items');
      return;
    }

    const newIndex = items.length;
    const itemName = `Item ${newIndex + 1}`;
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
        console.error('[ERROR] QuickTastingSession: Error inserting item:', error);
        throw error;
      }

      logger.debug('[SUCCESS] QuickTastingSession: Item created successfully:', data.id);
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
      console.error('[ERROR] QuickTastingSession: Error adding new item:', error);
      toast.error('Failed to add new item');
    }
  };

  const deleteLastItem = async () => {
    if (!session || items.length === 0) return;

    const lastItem = items[items.length - 1];

    // Don't allow deleting if it's the only item
    if (items.length === 1) {
      toast.error('Cannot delete the only item');
      return;
    }

    try {
      const { error } = await supabase
        .from('quick_tasting_items')
        .delete()
        .eq('id', lastItem.id);

      if (error) throw error;

      // Update local state
      const newItems = items.slice(0, -1);
      setItems(newItems);

      // Move to the new last item
      setCurrentItemIndex(Math.max(0, newItems.length - 1));

      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
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
      // Convert undefined values to null for Supabase (Supabase ignores undefined)
      const dbUpdates = Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [key, value === undefined ? null : value])
      );

      const { data, error } = await supabase
        .from('quick_tasting_items')
        .update(dbUpdates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('[ERROR] QuickTastingSession: Error updating item:', error);
        throw error;
      }

      logger.debug('[SUCCESS] QuickTastingSession: Item updated successfully:', data.id);

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
        logger.debug('[SKIP] Skipping extraction - no content to extract from');
        return;
      }

      logger.debug('[EXTRACT] Extracting flavor descriptors from item:', itemId, {
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
        console.error('[ERROR] No active auth session for descriptor extraction');
        // Try to refresh the session
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        if (!refreshedSession) {
          console.error('[ERROR] Failed to refresh auth session');
          return;
        }
        logger.debug('[SUCCESS] Auth session refreshed successfully');
      }

      const token = authSession?.access_token || (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        console.error('[ERROR] No auth token available for extraction');
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
        console.error('[ERROR] Failed to parse extraction response:', responseText);
        return;
      }

      if (!response.ok) {
        console.error('[ERROR] Descriptor extraction failed:', {
          status: response.status,
          error: result,
          payload: extractionPayload
        });
        return;
      }

      if (result.success && result.savedCount > 0) {
        logger.debug(`[SUCCESS] Successfully extracted ${result.savedCount} flavor descriptors from item ${itemId}`);
        // Success notifications removed for better UX
      } else if (result.success && result.savedCount === 0) {
        logger.debug('[INFO] No descriptors found in the content');
      }
    } catch (error) {
      console.error('[ERROR] Error extracting descriptors:', error);

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

  // Session name update handler for SessionHeader component
  const handleSessionNameUpdate = async (newName: string) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('quick_tastings')
        .update({ session_name: newName })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      const updatedSession = { ...session, session_name: newName };
      if (onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
      toast.success('Session name updated!');
    } catch (error) {
      console.error('Error updating session name:', error);
      toast.error('Failed to update session name');
    }
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
      logger.debug('[SUCCESS] Descriptor extraction batch completed');

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

      logger.debug('[SUCCESS] QuickTastingSession: Session completed successfully');
      toast.success('Tasting session completed!');
      onSessionComplete(data);
    } catch (error) {
      console.error('[ERROR] QuickTastingSession: Error completing session:', error);
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
    
    // Parse study metadata from notes field for study mode sessions
    if (session.mode === 'study' && session.notes) {
      try {
        const studyMetadata = JSON.parse(session.notes);
        if (studyMetadata.categories && Array.isArray(studyMetadata.categories)) {
          logger.debug('Study Mode', `Loaded ${studyMetadata.categories.length} categories from metadata`);
          setStudyCategories(studyMetadata.categories);
        }
      } catch (error) {
        console.error('Failed to parse study metadata from notes:', error);
        logger.error('Study Mode', 'Failed to parse study metadata', { notes: session.notes });
      }
    }
    
    // Only load user roles for study mode sessions
    if (session.mode === 'study') {
      loadUserRole();
    }
  }, [session?.id, session?.mode, session?.notes]);

  // Auto-add first item for Quick Tasting and predefined Study Mode
  useEffect(() => {
    if (!session) return;

    // Prevent multiple triggers
    if (autoAddTriggeredRef.current) return;

    // Quick Tasting: auto-add when in tasting phase with no items
    const isQuickTasting = session.mode === 'quick' && phase === 'tasting';

    // Study Mode: predefined approach with permissions ready
    const isPredefinedStudy = session.mode === 'study' && session.study_approach === 'predefined';

    // For predefined study, wait for permissions
    if (isPredefinedStudy && (!userPermissions || !userRole)) {
      logger.debug('🔄 Auto-add: Waiting for permissions...');
      return;
    }

    // Check if we need to add the first item
    if ((isQuickTasting || isPredefinedStudy) && items.length === 0 && !isLoading) {
      logger.debug('🔄 Auto-add: No items found, auto-adding first item');
      autoAddTriggeredRef.current = true;
      setTimeout(() => {
        addNewItem();
        if (session.mode === 'study') {
          setPhase('tasting');
        }
      }, 100);
    }
  }, [session?.id, session?.mode, session?.study_approach, phase, items.length, isLoading, userPermissions, userRole]);

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
      <SessionHeader
        session={session}
        userRole={userRole}
        userPermissions={userPermissions as UserPermissions}
        userId={userId}
        itemsCount={items.length}
        completedItems={completedItems}
        phase={phase}
        isChangingCategory={isChangingCategory}
        showEditDashboard={showEditTastingDashboard}
        showSuggestions={showItemSuggestions}
        onSessionNameChange={handleSessionNameUpdate}
        onCategoryChange={handleCategoryChange}
        onToggleEditDashboard={() => setShowEditTastingDashboard(!showEditTastingDashboard)}
        onToggleSuggestions={() => setShowItemSuggestions(!showItemSuggestions)}
      />

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
                      <span className="material-symbols-outlined text-sm ml-xs align-middle">check</span>
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
              studyCategories={studyCategories}
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
            {/* Only show "Next Item" button if user has permission and not in competition mode */}
            {userPermissions.canAddItems && session.mode !== 'competition' && (
              <button
                onClick={handleAddNextItem}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Next Item'
                )}
              </button>
            )}
            <button
              onClick={handleEndTasting}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Completing...
                </>
              ) : (
                'End Tasting'
              )}
            </button>
          </div>
        )}
      </div>
    )}

    {/* Tasting Phase */}
    {phase === 'tasting' && currentItem && (
      <div className="max-w-4xl mx-auto">

        {/* All Items Grid View - shown when showItemNavigation is true */}
        {showItemNavigation && items.length > 1 && (
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              All Items ({items.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentItemIndex(index);
                    setShowItemNavigation(false);
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    index === currentItemIndex
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                      : 'bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600'
                  }`}
                >
                  <div className="font-medium text-sm truncate">
                    {session.is_blind_items ? `Item ${index + 1}` : item.item_name || `Item ${index + 1}`}
                  </div>
                  {item.overall_score && (
                    <div className={`text-xs mt-1 ${index === currentItemIndex ? 'text-white/80' : 'text-zinc-500'}`}>
                      Score: {item.overall_score}/100
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Delete Last Item Button - only show when on last item and more than 1 item exists */}
        {items.length > 1 && currentItemIndex === items.length - 1 && (
          <div className="flex justify-end mb-3">
            <button
              onClick={deleteLastItem}
              className="flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              Delete this item
            </button>
          </div>
        )}

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
          showPhotoControls={true}
          itemIndex={currentItemIndex + 1}
          studyCategories={studyCategories}
        />

        {/* Navigation */}
        <SessionNavigation
          items={getNavigationItems()}
          currentIndex={currentItemIndex}
          isLoading={isLoading}
          showAllItems={showItemNavigation}
          onPrevious={handlePreviousItem}
          onNext={handleNextOrAdd}
          onItemSelect={handleItemNavigation}
          onToggleShowAll={() => setShowItemNavigation(!showItemNavigation)}
          onComplete={completeSession}
        />
      </div>
    )}
    </div>
  );
};

export default QuickTastingSession;
/**
 * ItemManager Component
 *
 * Handles all CRUD operations for tasting items.
 * Encapsulates item creation, updating, deletion logic.
 *
 * @module components/quick-tasting/ItemManager
 */

import { useRef, useCallback } from 'react';
import { TastingItemData, QuickTasting, UserPermissions } from './types';
import { TastingRepositoryFactory } from '../../lib/repository/TastingRepository';
import { getSupabaseClient } from '../../lib/supabase';
import { toast } from '../../lib/toast';
import { logger } from '../../lib/logger';
import { DatabaseError } from '../../lib/errors';

export interface ItemManagerProps {
  session: QuickTasting;
  userPermissions: UserPermissions;
  onItemsChange: (items: TastingItemData[]) => void;
  onError: (error: Error) => void;
}

/**
 * Hook for managing tasting items
 */
export function useItemManager(session: QuickTasting | null, userPermissions: UserPermissions) {
  const supabase = getSupabaseClient();
  const itemRepository = TastingRepositoryFactory.createTastingItemRepository(supabase);
  const aiExtractionTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Load all items for a tasting
   */
  const loadItems = useCallback(async (): Promise<TastingItemData[]> => {
    if (!session) {
      return [];
    }

    try {
      logger.debug('ItemManager', 'Loading items for session', { sessionId: session.id });
      const items = await itemRepository.findByTastingId(session.id);
      logger.debug('ItemManager', `Loaded ${items.length} items`);
      return items as TastingItemData[];
    } catch (error) {
      logger.error('ItemManager', 'Error loading tasting items', error);
      toast.error('Failed to load tasting items');
      throw error;
    }
  }, [session, itemRepository]);

  /**
   * Add a new item
   */
  const addItem = useCallback(
    async (
      getDisplayCategoryName: (cat: string, custom?: string | null) => string
    ): Promise<TastingItemData | null> => {
      if (!session) {
        return null;
      }

      logger.debug('ItemManager', 'Adding new item', { sessionId: session.id });

      // Permission checks
      if (session.mode === 'competition') {
        toast.error('Cannot add items in competition mode');
        return null;
      }

      if (session.mode === 'study' && session.study_approach === 'collaborative') {
        toast.error('In collaborative mode, suggest items instead of adding them directly');
        return null;
      }

      if (session.mode === 'study' && !userPermissions.canAddItems) {
        toast.error('You do not have permission to add items');
        return null;
      }

      try {
        const items = await loadItems();
        const newIndex = items.length;
        const itemName = `${getDisplayCategoryName(session.category, session.custom_category_name)} ${newIndex + 1}`;

        const newItem = await itemRepository.create({
          tasting_id: session.id,
          item_name: itemName,
        });

        logger.debug('ItemManager', 'Item created successfully', { itemId: newItem.id });
        toast.success('New item added!');

        // Scroll to new item
        setTimeout(() => {
          const itemElement = document.querySelector(`[data-item-id="${newItem.id}"]`);
          if (itemElement) {
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);

        return newItem as TastingItemData;
      } catch (error) {
        logger.error('ItemManager', 'Error adding new item', error);
        toast.error('Failed to add new item');
        throw error;
      }
    },
    [session, userPermissions, itemRepository, loadItems]
  );

  /**
   * Update an item
   */
  const updateItem = useCallback(
    async (itemId: string, updates: Partial<TastingItemData>): Promise<TastingItemData | null> => {
      if (!session) {
        return null;
      }

      logger.debug('ItemManager', `Updating item: ${itemId}`, { updates });

      try {
        // Convert undefined to null for database
        const dbUpdates = Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [key, value === undefined ? null : value])
        );

        const updatedItem = await itemRepository.update(itemId, dbUpdates);

        logger.debug('ItemManager', 'Item updated successfully', { itemId });
        return updatedItem as TastingItemData;
      } catch (error) {
        logger.error('ItemManager', 'Error updating item', error, { itemId });
        throw error;
      }
    },
    [session, itemRepository]
  );

  /**
   * Delete an item (only last item)
   */
  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      if (!session) {
        return;
      }

      try {
        await itemRepository.delete(itemId);
        logger.debug('ItemManager', 'Item deleted successfully', { itemId });
        toast.success('Item deleted');
      } catch (error) {
        logger.error('ItemManager', 'Error deleting item', error, { itemId });
        toast.error('Failed to delete item');
        throw error;
      }
    },
    [session, itemRepository]
  );

  /**
   * Extract AI descriptors from item content
   */
  const extractDescriptors = useCallback(
    async (itemId: string, itemData: TastingItemData): Promise<void> => {
      if (!session) {
        return;
      }

      try {
        const hasContent =
          itemData.notes?.trim() || itemData.aroma?.trim() || itemData.flavor?.trim();
        if (!hasContent) {
          logger.debug('ItemManager', 'Skipping extraction - no content');
          return;
        }

        logger.debug('ItemManager', 'Extracting flavor descriptors', { itemId });

        const extractionPayload = {
          sourceType: 'quick_tasting',
          sourceId: itemId,
          structuredData: {
            aroma_notes: itemData.aroma || itemData.notes || '',
            flavor_notes: itemData.flavor || '',
            other_notes: itemData.notes || '',
          },
          itemContext: {
            itemName: itemData.item_name,
            itemCategory: session.category,
          },
        };

        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const token = authSession?.access_token;

        if (!token) {
          logger.error('ItemManager', 'No auth token available for extraction');
          return;
        }

        const response = await fetch('/api/flavor-wheels/extract-descriptors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(extractionPayload),
        });

        const result = await response.json();

        if (!response.ok) {
          logger.error('ItemManager', 'Descriptor extraction failed', { status: response.status });
          return;
        }

        if (result.success && result.savedCount > 0) {
          logger.debug('ItemManager', `Extracted ${result.savedCount} descriptors`, { itemId });
        }
      } catch (error) {
        logger.error('ItemManager', 'Error extracting descriptors', error);
      }
    },
    [session, supabase]
  );

  /**
   * Debounced descriptor extraction
   */
  const scheduleExtraction = useCallback(
    (itemId: string, itemData: TastingItemData, delayMs: number = 2000): void => {
      // Clear existing timeout
      const existingTimeout = aiExtractionTimeoutRef.current.get(itemId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeoutId = setTimeout(() => {
        extractDescriptors(itemId, itemData);
        aiExtractionTimeoutRef.current.delete(itemId);
      }, delayMs);

      aiExtractionTimeoutRef.current.set(itemId, timeoutId);
    },
    [extractDescriptors]
  );

  return {
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    extractDescriptors,
    scheduleExtraction,
  };
}

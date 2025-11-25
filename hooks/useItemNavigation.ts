/**
 * useItemNavigation Hook
 * 
 * Manages navigation between tasting items.
 */

import { useCallback } from 'react';
import type { TastingItemData, TastingPhase } from './useTastingSession';

interface NavigationItem {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  score: number | undefined;
  isCurrent: boolean;
}

interface UseItemNavigationOptions {
  items: TastingItemData[];
  currentItemIndex: number;
  setCurrentItemIndex: (index: number) => void;
  setPhase: (phase: TastingPhase) => void;
  addNewItem: () => Promise<void>;
  completeSession: () => Promise<void>;
  setShowEditTastingDashboard?: (show: boolean) => void;
  setShowItemSuggestions?: (show: boolean) => void;
}

interface UseItemNavigationReturn {
  handleNextItem: () => void;
  handlePreviousItem: () => void;
  handleNextOrAdd: () => Promise<void>;
  handleBackToSetup: () => void;
  handleItemNavigation: (index: number) => void;
  handleAddNextItem: () => Promise<void>;
  handleEndTasting: () => void;
  handleBack: () => void;
  getNavigationItems: () => NavigationItem[];
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function useItemNavigation({
  items,
  currentItemIndex,
  setCurrentItemIndex,
  setPhase,
  addNewItem,
  completeSession,
  setShowEditTastingDashboard,
  setShowItemSuggestions,
}: UseItemNavigationOptions): UseItemNavigationReturn {
  
  const closeOverlays = useCallback(() => {
    setShowEditTastingDashboard?.(false);
    setShowItemSuggestions?.(false);
  }, [setShowEditTastingDashboard, setShowItemSuggestions]);

  const handleNextItem = useCallback(() => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      closeOverlays();
    } else {
      completeSession();
    }
  }, [currentItemIndex, items.length, setCurrentItemIndex, closeOverlays, completeSession]);

  const handlePreviousItem = useCallback(() => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
      closeOverlays();
    }
  }, [currentItemIndex, setCurrentItemIndex, closeOverlays]);

  const handleNextOrAdd = useCallback(async () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      closeOverlays();
    } else {
      await addNewItem();
      setPhase('tasting');
    }
  }, [currentItemIndex, items.length, setCurrentItemIndex, closeOverlays, addNewItem, setPhase]);

  const handleBackToSetup = useCallback(() => {
    setPhase('setup');
  }, [setPhase]);

  const handleItemNavigation = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setCurrentItemIndex(index);
      closeOverlays();
    }
  }, [items.length, setCurrentItemIndex, closeOverlays]);

  const handleAddNextItem = useCallback(async () => {
    await addNewItem();
    setPhase('tasting');
  }, [addNewItem, setPhase]);

  const handleEndTasting = useCallback(() => {
    completeSession();
  }, [completeSession]);

  const handleBack = useCallback(() => {
    if (currentItemIndex > 0) {
      handlePreviousItem();
    } else {
      handleBackToSetup();
    }
  }, [currentItemIndex, handlePreviousItem, handleBackToSetup]);

  const getNavigationItems = useCallback((): NavigationItem[] => {
    return items.map((item, index) => ({
      id: item.id,
      index,
      name: item.item_name,
      isCompleted: item.overall_score !== null && item.overall_score !== undefined,
      hasPhoto: !!item.photo_url,
      score: item.overall_score,
      isCurrent: index === currentItemIndex
    }));
  }, [items, currentItemIndex]);

  return {
    handleNextItem,
    handlePreviousItem,
    handleNextOrAdd,
    handleBackToSetup,
    handleItemNavigation,
    handleAddNextItem,
    handleEndTasting,
    handleBack,
    getNavigationItems,
    canGoNext: currentItemIndex < items.length - 1,
    canGoPrevious: currentItemIndex > 0,
  };
}

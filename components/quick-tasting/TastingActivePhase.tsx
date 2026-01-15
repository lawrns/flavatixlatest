/**
 * TastingActivePhase Component
 *
 * Handles the active tasting phase UI.
 * Displays current item, navigation, and controls.
 *
 * @module components/quick-tasting/TastingActivePhase
 */

import React from 'react';
import TastingItem from './TastingItem';
import { SessionNavigation } from './SessionNavigation';
import { TastingItemData, QuickTasting, NavigationItem } from './types';

export interface TastingActivePhaseProps {
  session: QuickTasting;
  items: TastingItemData[];
  currentItem: TastingItemData;
  currentItemIndex: number;
  studyCategories: unknown[];
  isLoading: boolean;
  showItemNavigation: boolean;
  onItemIndexChange: (index: number) => void;
  onItemUpdate: (itemId: string, updates: Partial<TastingItemData>) => void;
  onDeleteLastItem: () => Promise<void>;
  onPreviousItem: () => void;
  onNextOrAdd: () => Promise<void>;
  onComplete: () => Promise<void>;
  onToggleShowAll: () => void;
  getDisplayCategoryName: (category: string, customName?: string | null) => string;
}

/**
 * Active tasting phase - main tasting UI
 */
export const TastingActivePhase: React.FC<TastingActivePhaseProps> = ({
  session,
  items,
  currentItem,
  currentItemIndex,
  studyCategories,
  isLoading,
  showItemNavigation,
  onItemIndexChange,
  onItemUpdate,
  onDeleteLastItem,
  onPreviousItem,
  onNextOrAdd,
  onComplete,
  onToggleShowAll,
  getDisplayCategoryName,
}) => {
  const getNavigationItems = (): NavigationItem[] => {
    return items.map((item, index) => ({
      id: item.id,
      index,
      name: item.item_name,
      isCompleted: item.overall_score !== null && item.overall_score !== undefined,
      hasPhoto: !!item.photo_url,
      score: item.overall_score,
      isCurrent: index === currentItemIndex,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* All Items Grid View */}
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
                  onItemIndexChange(index);
                  onToggleShowAll();
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  index === currentItemIndex
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                    : 'bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600'
                }`}
              >
                <div className="font-medium text-sm truncate">
                  {session.is_blind_items
                    ? `Item ${index + 1}`
                    : item.item_name || `Item ${index + 1}`}
                </div>
                {item.overall_score && (
                  <div
                    className={`text-xs mt-1 ${
                      index === currentItemIndex ? 'text-white/80' : 'text-zinc-500'
                    }`}
                  >
                    Score: {item.overall_score}/100
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete Last Item Button */}
      {items.length > 1 && currentItemIndex === items.length - 1 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={onDeleteLastItem}
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
        onUpdate={(updates: Partial<TastingItemData>) => onItemUpdate(currentItem.id, updates)}
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
        incompleteCount={items.filter((item) => item.overall_score === null).length}
        onPrevious={onPreviousItem}
        onNext={onNextOrAdd}
        onItemSelect={onItemIndexChange}
        onToggleShowAll={onToggleShowAll}
        onComplete={onComplete}
      />
    </div>
  );
};

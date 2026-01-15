/**
 * TastingSetupPhase Component
 *
 * Handles the setup phase UI for tasting sessions.
 * Displays item management, navigation, and configuration.
 *
 * @module components/quick-tasting/TastingSetupPhase
 */

import React from 'react';
import { Utensils } from 'lucide-react';
import TastingItem from './TastingItem';
import CompetitionRanking from './CompetitionRanking';
import { TastingItemData, QuickTasting } from './types';

export interface TastingSetupPhaseProps {
  session: QuickTasting;
  items: TastingItemData[];
  currentItem: TastingItemData | undefined;
  currentItemIndex: number;
  studyCategories: unknown[];
  userPermissions: {
    canAddItems: boolean;
  };
  isLoading: boolean;
  onItemIndexChange: (index: number) => void;
  onItemUpdate: (itemId: string, updates: Partial<TastingItemData>) => void;
  onAddItem: () => Promise<void>;
  onEndTasting: () => void;
  getDisplayCategoryName: (category: string, customName?: string | null) => string;
}

/**
 * Setup phase - item management and configuration
 */
export const TastingSetupPhase: React.FC<TastingSetupPhaseProps> = ({
  session,
  items,
  currentItem,
  currentItemIndex,
  studyCategories,
  userPermissions,
  isLoading,
  onItemIndexChange,
  onItemUpdate,
  onAddItem,
  onEndTasting,
  getDisplayCategoryName,
}) => {
  const hasItems = items.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
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
                  onClick={() => onItemIndexChange(index)}
                  className={`
                    px-sm py-xs rounded-lg text-small font-body font-medium transition-colors min-h-touch
                    ${
                      currentItemIndex === index
                        ? 'bg-primary text-white'
                        : item.overall_score !== null
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-background-surface text-text-secondary hover:bg-border-default'
                    }
                  `}
                >
                  {item.item_name}
                  {item.overall_score !== null && (
                    <span className="material-symbols-outlined text-sm ml-xs align-middle">
                      check
                    </span>
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
            onUpdate={(updates: Partial<TastingItemData>) => onItemUpdate(currentItem.id, updates)}
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
                  : 'No Items Yet'}
            </h3>
            <p className="text-text-secondary mb-md">
              {hasItems
                ? 'Add another item to continue your tasting session.'
                : session.mode === 'competition'
                  ? 'Items should be preloaded for competition mode.'
                  : 'Add your first item to start tasting!'}
            </p>
            {(session.mode === 'study' || session.mode === 'quick') && (
              <button onClick={onAddItem} className="btn-primary">
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
          {userPermissions.canAddItems && session.mode !== 'competition' && (
            <button
              onClick={onAddItem}
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
            onClick={onEndTasting}
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
  );
};

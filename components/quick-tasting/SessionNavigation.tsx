/**
 * SessionNavigation Component
 * 
 * Handles navigation between tasting items and session completion.
 * Provides Previous/Next/Add Item buttons and completion action.
 */
import React from 'react';
import { ItemNavigationDropdown } from './ItemNavigationDropdown';
import { NavigationItem } from './types';

interface SessionNavigationProps {
  items: NavigationItem[];
  currentIndex: number;
  isLoading: boolean;
  showAllItems: boolean;
  incompleteCount?: number;
  onPrevious: () => void;
  onNext: () => void;
  onItemSelect: (index: number) => void;
  onToggleShowAll: () => void;
  onComplete: () => void;
}

export const SessionNavigation: React.FC<SessionNavigationProps> = ({
  items,
  currentIndex,
  isLoading,
  showAllItems,
  incompleteCount = 0,
  onPrevious,
  onNext,
  onItemSelect,
  onToggleShowAll,
  onComplete,
}) => {
  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex >= items.length - 1;

  return (
    <div className="flex flex-col items-center mt-6 px-4 gap-3">
      {/* Item Dropdown Navigation */}
      {items.length > 1 && (
        <div className="flex justify-center w-full">
          <ItemNavigationDropdown
            items={items}
            currentIndex={currentIndex}
            onItemSelect={onItemSelect}
            className="w-full max-w-sm"
          />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onPrevious}
          disabled={isFirstItem}
          className="px-4 py-2 rounded-[14px] text-sm font-medium text-gemini-text-gray bg-gemini-card border border-gemini-border hover:bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="text-xs text-gemini-text-muted px-2 min-w-[4rem] text-center tabular-nums">
          {currentIndex + 1} / {items.length}
        </span>

        <button
          onClick={onNext}
          className="px-4 py-2 rounded-[14px] text-sm font-medium text-gemini-text-gray bg-gemini-card border border-gemini-border hover:bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 transition-colors"
        >
          {isLastItem ? 'Add Item' : 'Next'}
        </button>
      </div>

      {/* Show/Hide All Items Toggle */}
      {items.length > 1 && (
        <button
          onClick={onToggleShowAll}
          className="text-xs text-gemini-text-muted hover:text-gemini-text-gray transition-colors"
        >
          {showAllItems ? 'Hide' : 'Show'} All Items
        </button>
      )}

      {/* Complete Tasting Button - Primary CTA */}
      <button
        onClick={onComplete}
        disabled={isLoading || incompleteCount > 0}
        className={`w-full max-w-xs px-6 py-3 rounded-[14px] text-base font-semibold transition-colors ${
          incompleteCount > 0
            ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-400'
            : 'text-white bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isLoading
          ? 'Completing...'
          : incompleteCount > 0
            ? `Complete Tasting (${incompleteCount} items incomplete)`
            : 'Complete Tasting'}
      </button>
    </div>
  );
};

export default SessionNavigation;

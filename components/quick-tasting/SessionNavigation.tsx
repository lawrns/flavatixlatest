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
  onPrevious,
  onNext,
  onItemSelect,
  onToggleShowAll,
  onComplete,
}) => {
  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex >= items.length - 1;

  return (
    <div className="flex flex-col items-center mt-lg px-4 gap-4">
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
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevious}
          disabled={isFirstItem}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm text-gray-500 px-2 min-w-20 text-center">
          {currentIndex + 1} of {items.length}
        </span>

        <button
          onClick={onNext}
          className="btn-secondary"
        >
          {isLastItem ? 'Add Item' : 'Next Item'}
        </button>
      </div>

      {/* Show/Hide All Items Toggle */}
      {items.length > 1 && (
        <button
          onClick={onToggleShowAll}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          {showAllItems ? 'Hide' : 'Show'} All Items
        </button>
      )}

      {/* Complete Tasting Button */}
      <button
        onClick={onComplete}
        disabled={isLoading}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Completing...' : 'Complete Tasting'}
      </button>
    </div>
  );
};

export default SessionNavigation;

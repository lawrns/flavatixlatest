/**
 * SocialFeedFilters Component
 *
 * Tab and category filters for the social feed.
 */
import React from 'react';

interface SocialFeedFiltersProps {
  activeTab: 'all' | 'following';
  categoryFilter: string;
  categories: string[];
  onTabChange: (tab: 'all' | 'following') => void;
  onCategoryChange: (category: string) => void;
}

export const SocialFeedFilters: React.FC<SocialFeedFiltersProps> = ({
  activeTab,
  categoryFilter,
  categories,
  onTabChange,
  onCategoryChange,
}) => {
  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-line dark:border-line">
        <button
          onClick={() => onTabChange('all')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-fg-subtle hover:text-fg-muted dark:text-fg-muted'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => onTabChange('following')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'following'
              ? 'text-primary border-b-2 border-primary'
              : 'text-fg-subtle hover:text-fg-muted dark:text-fg-muted'
          }`}
        >
          Following
        </button>
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto bg-white dark:bg-bg">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize min-h-[36px] ${
                categoryFilter === cat
                  ? 'bg-primary text-white'
                  : 'bg-bg-inset dark:bg-bg-surface text-fg-muted dark:text-fg-muted hover:bg-line dark:hover:bg-bg-inset'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default SocialFeedFilters;

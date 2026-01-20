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
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => onTabChange('all')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-200'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => onTabChange('following')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'following'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-200'
          }`}
        >
          Following
        </button>
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto bg-white dark:bg-zinc-900">
        <div className="flex gap-2 px-4 py-3 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize min-h-[36px] ${
                categoryFilter === cat
                  ? 'bg-primary text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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

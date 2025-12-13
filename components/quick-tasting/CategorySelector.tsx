import React from 'react';
import { Beer, Coffee, GlassWater, Sprout, Wine, Leaf, Martini, Candy } from 'lucide-react';

interface CategorySelectorProps {
  onCategorySelect: (category: string) => void;
  isLoading: boolean;
}

// Icon color classes derived from CATEGORY_COLORS (using -600 variants for solid backgrounds)
const CATEGORY_ICON_COLORS: Record<string, { bg: string; hover: string }> = {
  coffee: { bg: 'bg-amber-600', hover: 'hover:bg-amber-700' },
  whisky: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700' },
  mezcal: { bg: 'bg-lime-600', hover: 'hover:bg-lime-700' },
  tea: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700' },
  wine: { bg: 'bg-red-600', hover: 'hover:bg-red-700' },
  spirits: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  beer: { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700' },
  chocolate: { bg: 'bg-stone-600', hover: 'hover:bg-stone-700' },
};

// Helper to get icon colors with fallback
function getIconColors(categoryId: string) {
  return CATEGORY_ICON_COLORS[categoryId] || { bg: 'bg-zinc-600', hover: 'hover:bg-zinc-700' };
}

// Category configurations with semantically appropriate icons
const categories = [
  {
    id: 'coffee',
    name: 'Coffee',
    description: 'Beans, roasts, brewing',
    Icon: Coffee,
  },
  {
    id: 'whisky',
    name: 'Whisky',
    description: 'Nose, palate, finish',
    Icon: GlassWater,
  },
  {
    id: 'mezcal',
    name: 'Mezcal',
    description: 'Agave, smoke, minerality',
    Icon: Sprout,
  },
  {
    id: 'tea',
    name: 'Tea',
    description: 'Varieties & profiles',
    Icon: Leaf,
  },
  {
    id: 'wine',
    name: 'Wine',
    description: 'Taste and terroir',
    Icon: Wine,
  },
  {
    id: 'spirits',
    name: 'Spirits',
    description: 'Rum, gin, tequila',
    Icon: Martini,
  },
  {
    id: 'beer',
    name: 'Beer',
    description: 'Craft beers & styles',
    Icon: Beer,
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    description: 'Cacao & confectionery',
    Icon: Candy,
  },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  isLoading,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-lg">
        <h2 className="text-h2 font-heading font-bold text-text-primary mb-sm">
          Choose Your Tasting Category
        </h2>
        <p className="text-text-secondary">
          Select a category to start your quick tasting session
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            disabled={isLoading}
            className={`
              relative p-4 rounded-[22px] border border-zinc-200 dark:border-zinc-700
              bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              group text-center
            `}
          >
            {/* Category Icon */}
            <div className="mb-3">
              <div className={`
                inline-flex items-center justify-center w-14 h-14 rounded-full
                ${getIconColors(category.id).bg}
                transition-transform duration-200
                group-hover:scale-105
              `}>
                <category.Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Category Name Only - no description to prevent overflow */}
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {category.name}
            </h3>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-md flex items-center space-x-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-text-primary font-medium">Starting your tasting session...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
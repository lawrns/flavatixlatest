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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            disabled={isLoading}
            className={`
              relative p-3 sm:p-4 rounded-xl border-2 border-border-primary
              bg-background-surface hover:bg-background-app
              transition-all duration-200 transform hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              group
            `}
          >
            {/* Category Icon */}
            <div className="text-center mb-2 sm:mb-3">
              <div className={`
                inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full
                ${getIconColors(category.id).bg} ${getIconColors(category.id).hover}
                text-white
                transition-colors duration-200
                group-hover:scale-110 transform
              `}>
                <category.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            {/* Category Info */}
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-heading font-semibold text-text-primary mb-0.5">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm font-body text-text-secondary leading-snug hidden sm:block">
                {category.description}
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl bg-primary-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200"></div>
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
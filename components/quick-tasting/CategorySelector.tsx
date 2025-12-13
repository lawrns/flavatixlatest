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
    description: 'Beans, roasts, and brewing',
    icon: <Coffee size={24} className="text-white" />,
  },
  {
    id: 'whisky',
    name: 'Whisky',
    description: 'Nose, palate, and finish',
    icon: <GlassWater size={24} className="text-white" />,
  },
  {
    id: 'mezcal',
    name: 'Mezcal',
    description: 'Agave, smoke, minerality',
    icon: <Sprout size={24} className="text-white" />,
  },
  {
    id: 'tea',
    name: 'Tea',
    description: 'Varieties and flavor profiles',
    icon: <Leaf size={24} className="text-white" />,
  },
  {
    id: 'wine',
    name: 'Wine',
    description: 'Taste and terroir',
    icon: <Wine size={24} className="text-white" />,
  },
  {
    id: 'spirits',
    name: 'Spirits',
    description: 'Rum, gin, tequila, and more',
    icon: <Martini size={24} className="text-white" />,
  },
  {
    id: 'beer',
    name: 'Beer',
    description: 'Craft beers and styles',
    icon: <Beer size={24} className="text-white" />,
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    description: 'Cacao and confectionery',
    icon: <Candy size={24} className="text-white" />,
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm md:gap-md">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            disabled={isLoading}
            className={`
              relative p-md rounded-xl border-2 border-border-primary
              bg-background-surface hover:bg-background-app
              transition-all duration-200 transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              group
            `}
          >
            {/* Category Icon */}
            <div className="text-center mb-sm">
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full
                ${getIconColors(category.id).bg} ${getIconColors(category.id).hover}
                text-white text-h2 font-heading font-bold
                transition-colors duration-200
                group-hover:scale-110 transform
              `}>
                {category.icon}
              </div>
            </div>

            {/* Category Info */}
            <div className="text-center">
              <h3 className="text-h4 font-heading font-semibold text-text-primary mb-xs">
                {category.name}
              </h3>
              <p className="text-small font-body text-text-secondary leading-relaxed">
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
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download, Filter, Search, X } from 'lucide-react';
import { resolveDescriptorCanonicalText } from '@/lib/flavorDescriptorNormalization';

interface Descriptor {
  text: string;
  type?: 'aroma' | 'flavor' | 'texture' | 'metaphor';
  category?: string;
  subcategory?: string;
  predefined_category_id?: string;
  confidence?: number;
  intensity?: number;
  count?: number;
  avgIntensity?: number;
  percentage?: number;
}

interface PredefinedCategory {
  id: string;
  name: string;
  display_order: number;
  color_hex: string;
}

interface FlavorWheelListViewProps {
  wheelData: {
    categories: Array<{
      name: string;
      count: number;
      percentage: number;
      color?: string;
      descriptors?: Descriptor[];
      subcategories?: Array<{
        name: string;
        count: number;
        descriptors: Descriptor[];
      }>;
    }>;
    totalDescriptors: number;
    wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor';
  };
  predefinedCategories?: PredefinedCategory[];
  onExportPDF?: () => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const FlavorWheelListView: React.FC<FlavorWheelListViewProps> = ({
  wheelData,
  predefinedCategories = [],
  onExportPDF,
  onSearch,
  className = '',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'percentage'>('count');
  const descriptorCandidates = useMemo(
    () =>
      wheelData.categories.flatMap((category) => [
        ...(category.descriptors?.map((descriptor) => descriptor.text) || []),
        ...(category.subcategories?.flatMap((subcategory) =>
          subcategory.descriptors.map((descriptor) => descriptor.text)
        ) || []),
      ]),
    [wheelData.categories]
  );

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    const filtered = wheelData.categories.filter((category) => {
      // Type filter
      if (selectedType !== 'all') {
        const hasMatchingType =
          category.descriptors?.some((d) => d.type === selectedType) ||
          category.subcategories?.some((sub) =>
            sub.descriptors.some((d) => d.type === selectedType)
          );
        if (!hasMatchingType) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          category.name.toLowerCase().includes(query) ||
          category.descriptors?.some((d) => d.text.toLowerCase().includes(query)) ||
          category.subcategories?.some(
            (sub) =>
              sub.name.toLowerCase().includes(query) ||
              sub.descriptors.some((d) => d.text.toLowerCase().includes(query))
          );
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });

    // Sort categories
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'count':
          return b.count - a.count;
        case 'percentage':
          return b.percentage - a.percentage;
        default:
          return 0;
      }
    });
  }, [wheelData.categories, searchQuery, selectedType, sortBy]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (subcategoryKey: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryKey)) {
        newSet.delete(subcategoryKey);
      } else {
        newSet.add(subcategoryKey);
      }
      return newSet;
    });
  };

  const getCategoryColor = (categoryName: string): string => {
    const predefined = predefinedCategories.find((cat) => cat.name === categoryName);
    return predefined?.color_hex || '#6B7280';
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getDescriptorTypeColor = (type: string): string => {
    const colors = {
      aroma: '#10B981',
      flavor: '#F59E0B',
      texture: '#8B5CF6',
      metaphor: '#EC4899',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const _getDescriptorTypeLabel = (type: string): string => {
    const labels = {
      aroma: 'Aroma',
      flavor: 'Flavor',
      texture: 'Texture',
      metaphor: 'Metaphor',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className={`bg-white dark:bg-bg-surface rounded-soft shadow-md ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-line dark:border-line">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-fg dark:text-fg">
            {wheelData.wheelType === 'combined'
              ? 'Flavor & Aroma Wheel'
              : wheelData.wheelType === 'metaphor'
                ? 'Metaphor Wheel'
                : `${wheelData.wheelType.charAt(0).toUpperCase() + wheelData.wheelType.slice(1)} Wheel`}
          </h2>
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-soft hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-fg-muted dark:text-fg-subtle">
          <span>Total Descriptors: {wheelData.totalDescriptors}</span>
          <span>Categories: {filteredCategories.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-line dark:border-line space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg-subtle" />
          <input
            type="text"
            placeholder="Search descriptors..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-line-strong dark:border-line-strong rounded-soft bg-white dark:bg-bg-inset text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fg-subtle hover:text-fg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type and Sort Filters */}
        <div className="flex gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="flex-1 px-3 py-2 border border-line-strong dark:border-line-strong rounded-soft bg-white dark:bg-bg-inset text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="aroma">Aroma</option>
            <option value="flavor">Flavor</option>
            <option value="texture">Texture</option>
            <option value="metaphor">Metaphor</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'percentage')}
            className="flex-1 px-3 py-2 border border-line-strong dark:border-line-strong rounded-soft bg-white dark:bg-bg-inset text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="count">Sort by Count</option>
            <option value="percentage">Sort by Percentage</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Categories List */}
      <div>
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-fg-subtle dark:text-fg-subtle">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No categories found matching your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-line dark:divide-line">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              const categoryColor = getCategoryColor(category.name);

              return (
                <div key={category.name} className="p-4">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between text-left hover:bg-bg-hover dark:hover:bg-bg-inset rounded-soft p-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-fg-subtle" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-fg-subtle" />
                        )}
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-fg dark:text-fg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-fg-subtle dark:text-fg-subtle">
                          {category.count} {category.count === 1 ? 'descriptor' : 'descriptors'} (
                          {category.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pl-9 space-y-3">
                      {/* Direct Descriptors */}
                      {category.descriptors && category.descriptors.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-fg-muted dark:text-fg-muted">
                            Direct Descriptors
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {category.descriptors.map((descriptor, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-bg-inset dark:bg-bg-inset text-fg-muted dark:text-fg-muted"
                                style={{
                                  borderLeft: `3px solid ${getDescriptorTypeColor(descriptor.type || 'aroma')}`,
                                }}
                              >
                                <span className="font-medium">
                                  {resolveDescriptorCanonicalText(descriptor.text, descriptorCandidates)}
                                </span>
                                <span className="text-fg-subtle">
                                  ({descriptor.count || descriptor.intensity || 1})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="space-y-3">
                          {category.subcategories.map((subcategory) => {
                            const subKey = `${category.name}-${subcategory.name}`;
                            const isSubExpanded = expandedSubcategories.has(subKey);

                            return (
                              <div
                                key={subcategory.name}
                                className="border-l-2 border-line dark:border-line-strong pl-3"
                              >
                                <button
                                  onClick={() => toggleSubcategory(subKey)}
                                  className="flex items-center gap-2 text-left hover:bg-bg-hover dark:hover:bg-bg-inset rounded p-1 transition-colors"
                                >
                                  {isSubExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-fg-subtle" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-fg-subtle" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-fg dark:text-fg-muted">
                                      {subcategory.name}
                                    </p>
                                    <p className="text-xs text-fg-subtle dark:text-fg-subtle">
                                      {subcategory.count}{' '}
                                      {subcategory.count === 1 ? 'descriptor' : 'descriptors'}
                                    </p>
                                  </div>
                                </button>

                                {isSubExpanded && (
                                  <div className="mt-2 pl-5">
                                    <div className="flex flex-wrap gap-1">
                                      {subcategory.descriptors.map((descriptor, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-bg-hover dark:bg-bg-surface text-fg-muted dark:text-fg-subtle"
                                          style={{
                                            borderLeft: `2px solid ${getDescriptorTypeColor(descriptor.type || 'aroma')}`,
                                          }}
                                        >
                                          <span>
                                            {resolveDescriptorCanonicalText(
                                              descriptor.text,
                                              descriptorCandidates
                                            )}
                                          </span>
                                          <span className="text-fg-subtle">
                                            ({descriptor.count || descriptor.intensity || 1})
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlavorWheelListView;

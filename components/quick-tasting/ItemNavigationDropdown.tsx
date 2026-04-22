import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Circle, Camera } from 'lucide-react';

interface NavigationItem {
  id: string;
  index: number;
  name: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  score?: number;
  isCurrent: boolean;
}

interface ItemNavigationDropdownProps {
  items: NavigationItem[];
  currentIndex: number;
  onItemSelect: (index: number) => void;
  className?: string;
}

export const ItemNavigationDropdown: React.FC<ItemNavigationDropdownProps> = ({
  items,
  currentIndex,
  onItemSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentItem = items.find(item => item.isCurrent);

  const handleItemClick = (index: number) => {
    onItemSelect(index);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-fg-muted dark:text-fg-muted bg-white dark:bg-bg-surface border border-line-strong dark:border-line-strong rounded-md shadow-sm hover:bg-bg-hover dark:hover:bg-bg-inset focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="flex items-center">
          <span className="mr-2">Item {currentIndex + 1} of {items.length}</span>
          {currentItem && (
            <span className="text-fg-subtle dark:text-fg-subtle truncate max-w-32">
              {currentItem.name}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-bg-surface border border-line-strong dark:border-line-strong rounded-md shadow-md max-h-60 overflow-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.index)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-hover dark:hover:bg-bg-inset flex items-center justify-between ${
                item.isCurrent ? 'bg-primary-50 text-primary-700' : 'text-fg-muted dark:text-fg-muted'
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex items-center mr-2">
                  {item.isCompleted ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-fg-subtle dark:text-fg-subtle" />
                  )}
                </div>
                <span className="truncate">
                  {item.index + 1}. {item.name}
                </span>
              </div>
              <div className="flex items-center ml-2">
                {item.hasPhoto && (
                  <Camera size={14} className="text-fg-subtle dark:text-fg-subtle mr-1" />
                )}
                {item.score && (
                  <span className="text-xs text-fg-subtle dark:text-fg-subtle">
                    {item.score}/100
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-zinc-800 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="flex items-center">
          <span className="mr-2">Item {currentIndex + 1} of {items.length}</span>
          {currentItem && (
            <span className="text-gray-500 truncate max-w-32">
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
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.index)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                item.isCurrent ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div className="flex items-center mr-2">
                  {item.isCompleted ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Circle size={16} className="text-gray-400" />
                  )}
                </div>
                <span className="truncate">
                  {item.index + 1}. {item.name}
                </span>
              </div>
              <div className="flex items-center ml-2">
                {item.hasPhoto && (
                  <Camera size={14} className="text-gray-400 mr-1" />
                )}
                {item.score && (
                  <span className="text-xs text-gray-500">
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

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  /** Label for accessibility */
  label?: string;
  /** ID for the combobox (auto-generated if not provided) */
  id?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or type...',
  className = '',
  disabled = false,
  allowCustom = true,
  label,
  id: providedId
}) => {
  const generatedId = useId();
  const id = providedId || `combobox-${generatedId}`;
  const listboxId = `${id}-listbox`;
  
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  // Generate option IDs for aria-activedescendant
  const getOptionId = (index: number) => `${id}-option-${index}`;

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (allowCustom && value.trim()) {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on an option
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.querySelector(`#${getOptionId(highlightedIndex)}`);
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden label for screen readers if no visible label */}
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`
            w-full px-3 py-2 pr-16 border border-gray-300 dark:border-zinc-600 
            rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[44px]
          `}
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 min-w-[24px] min-h-[24px]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close options' : 'Open options'}
          tabIndex={-1}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 p-1 min-w-[24px] min-h-[24px]"
        >
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            aria-hidden="true"
          />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label || 'Options'}
          className="
            absolute z-50 w-full mt-1 max-h-60 overflow-y-auto overflow-x-hidden bg-white dark:bg-zinc-800
            border border-gray-300 dark:border-zinc-600 rounded-lg shadow-lg
            touch-pan-y overscroll-contain
          "
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              id={getOptionId(index)}
              role="option"
              aria-selected={option === value}
              onClick={() => handleOptionClick(option)}
              className={`
                px-3 py-2 cursor-pointer text-sm min-h-[40px] flex items-center
                ${index === highlightedIndex 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-gray-900 dark:text-zinc-50 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }
                ${option === value ? 'font-semibold' : ''}
              `}
            >
              {option}
              {option === value && (
                <svg 
                  className="ml-auto h-4 w-4 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && value && allowCustom && (
        <div 
          role="status"
          aria-live="polite"
          className="
            absolute z-50 w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-800 
            border border-gray-300 dark:border-zinc-600 rounded-lg shadow-lg
            text-sm text-gray-500 dark:text-zinc-400
          "
        >
          Press Enter to use &quot;{value}&quot;
        </div>
      )}
      
      {/* Live region for screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {isOpen && filteredOptions.length > 0 && (
          `${filteredOptions.length} option${filteredOptions.length === 1 ? '' : 's'} available`
        )}
      </div>
    </div>
  );
};

export default Combobox;

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or type...',
  className = '',
  disabled = false,
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  const displayValue = value || placeholder;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-8 border border-gray-300 dark:border-zinc-600 
            rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="
            absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-zinc-800 
            border border-gray-300 dark:border-zinc-600 rounded-lg shadow-lg
          "
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`
                px-3 py-2 cursor-pointer text-sm
                ${index === highlightedIndex 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                  : 'text-gray-900 dark:text-zinc-50 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }
                ${option === value ? 'font-semibold' : ''}
              `}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {isOpen && filteredOptions.length === 0 && value && allowCustom && (
        <div className="
          absolute z-50 w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-800 
          border border-gray-300 dark:border-zinc-600 rounded-lg shadow-lg
          text-sm text-gray-500 dark:text-zinc-400
        ">
          Press Enter to use "{value}"
        </div>
      )}
    </div>
  );
};

export default Combobox;

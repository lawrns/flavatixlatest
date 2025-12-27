import React from 'react';

interface CharacteristicSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onTouch?: () => void;
  touched?: boolean;
  description?: string;
  min?: number;
  max?: number;
}

const CharacteristicSlider: React.FC<CharacteristicSliderProps> = ({
  label,
  value,
  onChange,
  onTouch,
  touched,
  description,
  min = 0,
  max = 100
}) => {
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'High';
    if (score >= 40) return 'Medium';
    if (score > 0) return 'Low';
    return '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">
          {label}
          {description && (
            <span className="ml-2 text-xs text-text-secondary">({description})</span>
          )}
        </label>
        <span className="text-sm font-semibold text-primary">{value}/100</span>
      </div>
      
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => onTouch?.()}
          onTouchStart={() => onTouch?.()}
          className="w-full h-5 rounded-full appearance-none cursor-pointer slider-ultra-thin shadow-none border-0 touch-manipulation"
          style={{
            '--slider-value': `${value}%`,
            background: `linear-gradient(to right,
              ${touched ? '#ec7813' : '#9ca3af'} 0%,
              ${touched ? '#ec7813' : '#9ca3af'} ${value}%,
              #e5e5e5 ${value}%,
              #e5e5e5 100%)`
          } as React.CSSProperties}
        />
        <div className="absolute -top-1.5 left-0 w-full h-4 pointer-events-none flex items-center">
          <div
            className={`absolute w-3 h-3 bg-white dark:bg-zinc-800 rounded-full shadow-md border-2 transition-all duration-200 ease-out ${touched ? 'border-primary' : 'border-gray-400'}`}
            style={{
              left: `calc(${((value - min) / (max - min)) * 100}% - 6px)`
            }}
          />
        </div>
      </div>
      
      {value > 0 && (
        <div className="text-xs text-text-secondary text-center">
          {getScoreLabel(value)}
        </div>
      )}
    </div>
  );
};

export default CharacteristicSlider;


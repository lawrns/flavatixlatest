/**
 * HELP TOOLTIP COMPONENT
 *
 * Displays contextual help with icon and popover/tooltip.
 * Great for explaining complex features without cluttering the UI.
 *
 * Usage:
 *   <HelpTooltip
 *     short="In blind mode, item names are hidden until results are revealed"
 *     long="Blind tasting removes bias and makes evaluations more objective..."
 *   />
 *
 *   or with help text from constants:
 *   <HelpTooltip {...HELP_TEXTS.TASTING.BLIND_MODE} />
 */

import React, { ReactNode, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export interface HelpTooltipProps {
  short: string;
  long?: string;
  example?: string;
  learnMore?: string;
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: ReactNode;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  short,
  long,
  example,
  learnMore,
  trigger = 'hover',
  position = 'top',
  icon,
  label,
  className,
  iconClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionStyles = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowStyles = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full',
    left: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full',
    right: 'right-0 top-1/2 -translate-y-1/2 translate-x-full',
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center
          p-1 rounded-full hover:bg-bg-inset dark:hover:bg-bg-inset
          transition-colors duration-200
          ${iconClassName || ''}
        `}
        aria-label={label || 'Help'}
        title={short}
        type="button"
      >
        {icon || <HelpCircle className="w-4 h-4 text-fg-subtle dark:text-fg-subtle hover:text-fg-muted dark:hover:text-fg-muted" />}
      </button>

      {/* Tooltip content */}
      {isOpen && (
        <div
          className={`
            absolute z-50 ${positionStyles[position]}
            bg-bg text-white rounded-soft shadow-md
            p-3 max-w-xs text-sm
          `}
        >
          {/* Arrow/pointer */}
          <div
            className={`
              absolute w-0 h-0 border-4
              border-transparent border-line
              ${arrowStyles[position]}
            `}
          />

          {/* Short text */}
          <div className="font-medium mb-1">{short}</div>

          {/* Long explanation */}
          {long && <div className="text-fg-muted text-xs mb-2">{long}</div>}

          {/* Example */}
          {example && (
            <div className="bg-bg-surface rounded p-2 text-fg-muted text-xs mb-2 italic">
              <span className="text-fg-subtle">Example: </span>
              {example}
            </div>
          )}

          {/* Learn more link */}
          {learnMore && (
            <a
              href={learnMore}
              className="text-blue-300 hover:text-blue-200 text-xs underline block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more →
            </a>
          )}

          {/* Close button (for click trigger) */}
          {trigger === 'click' && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 hover:bg-bg-surface rounded"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;

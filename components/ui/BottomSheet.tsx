import React, { useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  ariaDescription?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  ariaDescription,
}) => {
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const descriptionId = `${sheetId}-description`;

  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    returnFocusOnDeactivate: true,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={ariaDescription ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'w-full max-w-md',
          'bg-white dark:bg-zinc-900',
          'rounded-t-[22px]',
          'border-t border-gemini-border dark:border-zinc-700/50',
          'shadow-[0_-20px_60px_rgba(0,0,0,0.25)]',
          'max-h-[85vh] overflow-hidden',
          'focus:outline-none',
          className
        )}
      >
        {ariaDescription ? <p id={descriptionId} className="sr-only">{ariaDescription}</p> : null}

        <div className="px-6 pt-3 pb-4">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />

          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold text-gemini-text-dark dark:text-white truncate">
                  {title}
                </h2>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-gemini-card dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <span className="text-lg leading-none text-gemini-text-gray dark:text-zinc-300">×</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-84px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;

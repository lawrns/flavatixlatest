import React, { useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  /** Description for screen readers */
  ariaDescription?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ariaDescription,
}) => {
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descriptionId = `${modalId}-description`;

  // Focus trap for accessibility
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    returnFocusOnDeactivate: true,
    onEscape: closeOnEscape ? onClose : undefined,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 "
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={ariaDescription ? descriptionId : undefined}
        className={cn(
          'bg-white dark:bg-bg-surface rounded-pane shadow-md w-full max-h-[90vh] overflow-hidden pb-safe',
          'focus:outline-none',
          sizeClasses[size],
          className
        )}
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        tabIndex={-1}
      >
        {/* Screen reader only description */}
        {ariaDescription && (
          <p id={descriptionId} className="sr-only">
            {ariaDescription}
          </p>
        )}

        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-line dark:border-line">
            {title && (
              <h2 id={titleId} className="text-xl font-semibold text-fg dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-fg-subtle hover:text-fg-muted dark:hover:text-fg-muted transition-colors rounded-soft hover:bg-bg-inset dark:hover:bg-bg-inset min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex justify-end gap-3 pt-4 border-t border-line dark:border-line',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter };

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 "
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onClick={onCancel}
    >
      <div
        className={cn(
          'w-full max-w-sm bg-bg-surface dark:bg-bg-surface',
          'rounded-pane shadow-md border border-line dark:border-line',
          'p-6 animate-fade-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-title"
          className="text-h3 font-semibold text-fg dark:text-white mb-2"
        >
          {title}
        </h3>
        <p id="confirm-desc" className="text-body text-fg-muted dark:text-fg-subtle mb-6">
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="lg" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="lg"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

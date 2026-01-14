import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface DeleteConfirmationOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface DeleteConfirmationState {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

export function useDeleteConfirmation(options: DeleteConfirmationOptions = {}) {
  const {
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
  } = options;

  const [state, setState] = useState<DeleteConfirmationState>({
    isOpen: false,
    resolve: null,
  });

  const confirm = useCallback((): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, resolve: null });
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, resolve: null });
  }, [state.resolve]);

  const Dialog = useCallback(
    () => (
      <AlertDialog open={state.isOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{confirmText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [state.isOpen, title, description, confirmText, cancelText, handleConfirm, handleCancel]
  );

  return { confirm, Dialog };
}

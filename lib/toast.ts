import { toast as sonnerToast, ExternalToast } from 'sonner'

/**
 * Unified Toast System with Sonner
 *
 * This module provides a unified API for toast notifications using Sonner.
 * It replaces the old toast.js implementation with a more powerful system.
 *
 * Features:
 * - Success, error, info, and warning variants
 * - Promise-based loading states
 * - Undo functionality with callbacks
 * - Theme-aware (light/dark mode)
 * - Gemini-inspired styling
 *
 * @example
 * // Basic usage
 * toast.success('Tasting saved successfully!')
 * toast.error('Failed to save tasting')
 *
 * // With promise
 * toast.promise(
 *   saveTasting(),
 *   {
 *     loading: 'Saving tasting...',
 *     success: 'Tasting saved!',
 *     error: 'Failed to save tasting'
 *   }
 * )
 *
 * // With undo functionality
 * toast.withUndo(
 *   'Tasting deleted',
 *   () => restoreTasting(id)
 * )
 */

type ToastOptions = ExternalToast & {
  duration?: number
  description?: string
}

interface PromiseToastMessages<T> {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: any) => string)
}

/**
 * Show a success toast
 */
function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    duration: options?.duration || 4000,
    ...options,
  })
}

/**
 * Show an error toast
 */
function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    duration: options?.duration || 5000,
    ...options,
  })
}

/**
 * Show an info toast
 */
function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    duration: options?.duration || 4000,
    ...options,
  })
}

/**
 * Show a warning toast
 */
function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    duration: options?.duration || 4000,
    ...options,
  })
}

/**
 * Show a toast with promise-based loading states
 *
 * @example
 * toast.promise(
 *   fetch('/api/tasting').then(r => r.json()),
 *   {
 *     loading: 'Loading tasting...',
 *     success: (data) => `Loaded ${data.name}`,
 *     error: 'Failed to load tasting'
 *   }
 * )
 */
function promise<T>(
  promiseFn: Promise<T> | (() => Promise<T>),
  messages: PromiseToastMessages<T>,
  options?: ToastOptions
) {
  const promiseToExecute = typeof promiseFn === 'function' ? promiseFn() : promiseFn

  return sonnerToast.promise(promiseToExecute, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  })
}

/**
 * Show a toast with undo functionality
 *
 * @example
 * toast.withUndo(
 *   'Tasting deleted',
 *   () => restoreTasting(id),
 *   { duration: 5000 }
 * )
 */
function withUndo(
  message: string,
  onUndo: () => void | Promise<void>,
  options?: ToastOptions
) {
  return sonnerToast(message, {
    duration: options?.duration || 5000,
    action: {
      label: 'Undo',
      onClick: async () => {
        try {
          await onUndo()
          sonnerToast.success('Action undone')
        } catch (err) {
          sonnerToast.error('Failed to undo action')
        }
      },
    },
    ...options,
  })
}

/**
 * Dismiss a specific toast by ID
 */
function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId)
}

/**
 * Main toast object with all methods
 */
export const toast = {
  success,
  error,
  info,
  warning,
  promise,
  withUndo,
  dismiss,
}

/**
 * Legacy function exports for backward compatibility
 * These maintain the old API while using the new toast system
 */
export const showSuccessToast = (message: string) => toast.success(message)
export const showErrorToast = (message: string) => toast.error(message)
export const showInfoToast = (message: string) => toast.info(message)
export const showWarningToast = (message: string) => toast.warning(message)

/**
 * Authentication-specific toast messages
 * These maintain the existing authToasts API for backward compatibility
 */
export const authToasts = {
  loginSuccess: () => toast.success('¡Bienvenido! Has iniciado sesión correctamente'),
  loginError: (errorMessage?: string) =>
    toast.error(errorMessage || 'Error al iniciar sesión'),
  registerSuccess: () =>
    toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta'),
  registerError: (errorMessage?: string) =>
    toast.error(errorMessage || 'Error al crear la cuenta'),
  logoutSuccess: () =>
    toast.info('Has cerrado sesión correctamente'),
  logoutError: (errorMessage?: string) =>
    toast.error(errorMessage || 'Error al cerrar sesión'),
  sessionExpired: () =>
    toast.warning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente'),
  emailConfirmation: () =>
    toast.info('Por favor, confirma tu email antes de continuar'),
}

export default toast

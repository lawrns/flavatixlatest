export interface Toast {
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  warn: (message: string, duration?: number) => number;
  dismiss: (toastId: number) => void;
}

export const toast: Toast;

export function showSuccessToast(message: string): void;
export function showErrorToast(message: string): void;
export function showInfoToast(message: string): void;
export function showWarningToast(message: string): void;

export const authToasts: {
  loginSuccess: () => void;
  loginError: (error?: string) => void;
  registerSuccess: () => void;
  registerError: (error?: string) => void;
  logoutSuccess: () => void;
  logoutError: (error?: string) => void;
  sessionExpired: () => void;
  emailConfirmation: () => void;
};

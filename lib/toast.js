// Simple toast notification system with deduplication
let toastContainer = null;

function createToastContainer() {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    max-height: calc(100vh - 40px);
    overflow: hidden;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

let toastIdCounter = 0;
const activeToasts = new Map();
const recentMessages = new Map(); // Track recent messages for deduplication
const DEDUP_WINDOW_MS = 2000; // Prevent same message within 2 seconds
const MAX_TOASTS = 3; // Maximum visible toasts

function showToast(message, type = 'info', duration = 3000) {
  // Deduplication: check if same message was shown recently
  const messageKey = `${type}:${message}`;
  const now = Date.now();
  const lastShown = recentMessages.get(messageKey);
  
  if (lastShown && (now - lastShown) < DEDUP_WINDOW_MS) {
    return null; // Skip duplicate message
  }
  recentMessages.set(messageKey, now);
  
  // Clean up old entries from dedup map
  for (const [key, time] of recentMessages.entries()) {
    if (now - time > DEDUP_WINDOW_MS * 2) {
      recentMessages.delete(key);
    }
  }
  
  // Limit number of visible toasts
  if (activeToasts.size >= MAX_TOASTS) {
    const oldestId = activeToasts.keys().next().value;
    dismissToast(oldestId);
  }

  const container = createToastContainer();
  const toastId = ++toastIdCounter;

  const toastElement = document.createElement('div');
  toastElement.style.cssText = `
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toastElement.textContent = message;

  container.appendChild(toastElement);
  activeToasts.set(toastId, toastElement);

  // Trigger animation
  requestAnimationFrame(() => {
    toastElement.style.transform = 'translateX(0)';
  });

  // Auto remove
  const timeoutId = setTimeout(() => {
    dismissToast(toastId);
  }, duration);

  // Store timeout so we can clear it on manual dismiss
  toastElement._timeoutId = timeoutId;

  return toastId;
}

function dismissToast(toastId) {
  const toastElement = activeToasts.get(toastId);
  if (!toastElement) return;

  // Clear auto-dismiss timeout
  if (toastElement._timeoutId) {
    clearTimeout(toastElement._timeoutId);
  }

  toastElement.style.transform = 'translateX(100%)';
  setTimeout(() => {
    if (toastElement.parentNode) {
      toastElement.parentNode.removeChild(toastElement);
    }
    activeToasts.delete(toastId);
  }, 300);
}

// Create toast object
const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  warn: (message, duration) => showToast(message, 'warning', duration),
  dismiss: (toastId) => dismissToast(toastId),
};

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toast };
}

// Also set on window for browser usage
if (typeof window !== 'undefined') {
  window.toast = toast;
}

export { toast };

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message)
}

// Error toast
export const showErrorToast = (message) => {
  toast.error(message)
}

// Info toast
export const showInfoToast = (message) => {
  toast.info(message)
}

// Warning toast
export const showWarningToast = (message) => {
  toast.warn(message)
}

// Authentication specific toasts
export const authToasts = {
  loginSuccess: () => showSuccessToast('¡Bienvenido! Has iniciado sesión correctamente'),
  loginError: (error) => showErrorToast(error || 'Error al iniciar sesión'),
  registerSuccess: () => showSuccessToast('¡Cuenta creada! Revisa tu email para confirmar tu cuenta'),
  registerError: (error) => showErrorToast(error || 'Error al crear la cuenta'),
  logoutSuccess: () => showInfoToast('Has cerrado sesión correctamente'),
  logoutError: (error) => showErrorToast(error || 'Error al cerrar sesión'),
  sessionExpired: () => showWarningToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente'),
  emailConfirmation: () => showInfoToast('Por favor, confirma tu email antes de continuar'),
}
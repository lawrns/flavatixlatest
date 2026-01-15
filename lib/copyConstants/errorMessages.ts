/**
 * ERROR MESSAGE LIBRARY - Single source of truth for all error messages
 *
 * Every error message includes:
 * - title: What went wrong (concise, user-friendly)
 * - message: Why it happened (optional context)
 * - suggestion: What to do next (actionable recovery steps)
 * - helpLink: Link to relevant documentation (optional)
 * - code: Internal error code for logging (for developers)
 *
 * Usage:
 *   import { ERROR_MESSAGES } from '@/lib/copyConstants/errorMessages';
 *   toast.error(ERROR_MESSAGES.AUTH.INVALID_EMAIL.title, {
 *     description: ERROR_MESSAGES.AUTH.INVALID_EMAIL.suggestion
 *   });
 */

export interface ErrorMessageTemplate {
  title: string;
  message?: string;
  suggestion: string;
  helpLink?: string;
  code: string;
}

export const ERROR_MESSAGES = {
  // ========================================================================
  // AUTHENTICATION & ACCOUNT ERRORS
  // ========================================================================
  AUTH: {
    INVALID_EMAIL: {
      title: 'Invalid email address',
      message: 'Please enter a valid email format.',
      suggestion: 'Check spelling and try again (e.g., your.name@example.com)',
      code: 'AUTH_INVALID_EMAIL',
    },
    PASSWORD_TOO_SHORT: {
      title: 'Password too short',
      message: 'Your password must be at least 8 characters.',
      suggestion: 'Use a mix of uppercase, lowercase, numbers, and symbols.',
      code: 'AUTH_PASSWORD_TOO_SHORT',
    },
    PASSWORD_WEAK: {
      title: 'Password too weak',
      message: 'Your password needs more complexity.',
      suggestion: 'Include uppercase letters, numbers, and special characters (!@#$)',
      code: 'AUTH_PASSWORD_WEAK',
    },
    ACCOUNT_EXISTS: {
      title: 'Account already exists',
      message: 'This email is already registered.',
      suggestion: 'Try logging in instead, or use a different email address.',
      helpLink: '/help/account-exists',
      code: 'AUTH_ACCOUNT_EXISTS',
    },
    INVALID_CREDENTIALS: {
      title: 'Incorrect email or password',
      message: "The email or password you entered doesn't match our records.",
      suggestion: "Check spelling, or reset your password if you've forgotten it.",
      helpLink: '/help/reset-password',
      code: 'AUTH_INVALID_CREDENTIALS',
    },
    ACCOUNT_DISABLED: {
      title: 'Account disabled',
      message: 'This account has been temporarily disabled.',
      suggestion: 'Contact support@flavatix.com for assistance.',
      helpLink: '/help/account-support',
      code: 'AUTH_ACCOUNT_DISABLED',
    },
    EMAIL_VERIFICATION_REQUIRED: {
      title: 'Email verification required',
      message: 'Please verify your email address to continue.',
      suggestion: "Check your inbox for a verification link. Didn't receive it? Request a new one.",
      code: 'AUTH_EMAIL_VERIFICATION_REQUIRED',
    },
    SESSION_EXPIRED: {
      title: 'Session expired',
      message: 'Your login session has ended for security.',
      suggestion: 'Log in again to continue where you left off.',
      code: 'AUTH_SESSION_EXPIRED',
    },
    UNAUTHORIZED: {
      title: "You don't have permission",
      message: "Your account doesn't have access to this feature.",
      suggestion: 'Contact support if you believe this is a mistake.',
      code: 'AUTH_UNAUTHORIZED',
    },
  },

  // ========================================================================
  // TASTING SESSION ERRORS
  // ========================================================================
  TASTING: {
    INVALID_CODE: {
      title: 'Tasting code not found',
      message: "This code doesn't match any active tastings.",
      suggestion:
        'Double-check the code (format: 8 characters like ABC12XYZ). Ask the host if unsure.',
      helpLink: '/help/tasting-codes',
      code: 'TASTING_INVALID_CODE',
    },
    ALREADY_JOINED: {
      title: 'Already participating',
      message: "You're already part of this tasting.",
      suggestion: 'Check your dashboard to continue this tasting.',
      code: 'TASTING_ALREADY_JOINED',
    },
    NOT_FOUND: {
      title: 'Tasting not found',
      message: "This tasting doesn't exist or has been deleted.",
      suggestion: 'Check your dashboard for active tastings, or create a new one.',
      code: 'TASTING_NOT_FOUND',
    },
    TASTING_ENDED: {
      title: 'Tasting has ended',
      message: 'This tasting is no longer accepting new participants.',
      suggestion: 'Ask the host to start a new session, or create your own tasting.',
      code: 'TASTING_ENDED',
    },
    NOT_HOST: {
      title: 'Only the host can do this',
      message: 'This action is restricted to the tasting host.',
      suggestion: 'Ask the host, or create your own tasting to be in control.',
      code: 'TASTING_NOT_HOST',
    },
    ALREADY_RESPONDED: {
      title: 'Already submitted',
      message: "You've already submitted a response for this item.",
      suggestion: 'Wait for the next item or session to continue.',
      code: 'TASTING_ALREADY_RESPONDED',
    },
  },

  // ========================================================================
  // FORM & VALIDATION ERRORS
  // ========================================================================
  FORM: {
    CATEGORY_REQUIRED: {
      title: 'Flavor category required',
      message: 'You must select a flavor category to continue.',
      suggestion: 'Choose from Coffee, Wine, Tea, Beer, Spirits, Chocolate, or Olive Oil.',
      code: 'FORM_CATEGORY_REQUIRED',
    },
    NAME_REQUIRED: {
      title: 'Name is required',
      message: 'Please enter a name for this tasting.',
      suggestion:
        'Use something descriptive (e.g., "Cold Brew Comparison" or "Vintage Port Night")',
      code: 'FORM_NAME_REQUIRED',
    },
    NAME_TOO_LONG: {
      title: 'Name is too long',
      message: `Maximum length is 100 characters.`,
      suggestion: 'Shorten your tasting name to 100 characters or less.',
      code: 'FORM_NAME_TOO_LONG',
    },
    ITEMS_REQUIRED: {
      title: 'Items required',
      message: 'Add at least one item to your tasting.',
      suggestion: 'Enter item names in the "Items to taste" section above.',
      code: 'FORM_ITEMS_REQUIRED',
    },
    MIN_ITEMS_FOR_MODE: {
      title: 'Not enough items',
      message: 'This tasting mode requires at least 2 items.',
      suggestion: 'Add more items to taste before starting.',
      code: 'FORM_MIN_ITEMS_FOR_MODE',
    },
    DUPLICATE_ITEM: {
      title: 'Duplicate item',
      message: "You've already added an item with this name.",
      suggestion: 'Use a different name or edit the existing item.',
      code: 'FORM_DUPLICATE_ITEM',
    },
    ITEM_TOO_LONG: {
      title: 'Item name is too long',
      message: 'Item names must be 200 characters or less.',
      suggestion: 'Use a shorter, clearer item name.',
      code: 'FORM_ITEM_TOO_LONG',
    },
    INVALID_FORMAT: {
      title: 'Invalid format',
      message: 'Please check the format of your input.',
      suggestion: "Ensure you're entering valid text without special characters where not allowed.",
      code: 'FORM_INVALID_FORMAT',
    },
  },

  // ========================================================================
  // FILE & UPLOAD ERRORS
  // ========================================================================
  FILE: {
    INVALID_TYPE: {
      title: 'Invalid file type',
      message: 'Only image files are accepted.',
      suggestion: 'Upload a JPG, PNG, or GIF (5MB or smaller).',
      code: 'FILE_INVALID_TYPE',
    },
    TOO_LARGE: {
      title: 'File too large',
      message: 'Image must be smaller than 5MB.',
      suggestion: 'Compress your image and try again. Most phones do this automatically.',
      helpLink: '/help/photo-size',
      code: 'FILE_TOO_LARGE',
    },
    UPLOAD_FAILED: {
      title: 'Upload failed',
      message: "We couldn't save your image.",
      suggestion:
        'Check your connection and try again. If the problem persists, try a different image.',
      code: 'FILE_UPLOAD_FAILED',
    },
    NO_FILE_SELECTED: {
      title: 'No file selected',
      message: 'Please choose a file before uploading.',
      suggestion: 'Click "Choose File" and select an image from your device.',
      code: 'FILE_NO_FILE_SELECTED',
    },
  },

  // ========================================================================
  // NETWORK & CONNECTIVITY ERRORS
  // ========================================================================
  NETWORK: {
    OFFLINE: {
      title: 'No internet connection',
      message: 'Your device is offline.',
      suggestion: 'Check your WiFi or mobile data connection and try again.',
      code: 'NETWORK_OFFLINE',
    },
    TIMEOUT: {
      title: 'Request timed out',
      message: 'The request took too long.',
      suggestion: 'Check your connection and try again.',
      code: 'NETWORK_TIMEOUT',
    },
    SERVER_ERROR: {
      title: 'Server error',
      message: 'Something went wrong on our end.',
      suggestion: 'Refresh the page and try again. If the problem continues, contact support.',
      helpLink: '/help/server-issues',
      code: 'NETWORK_SERVER_ERROR',
    },
    BAD_GATEWAY: {
      title: 'Service temporarily unavailable',
      message: "We're experiencing technical issues.",
      suggestion: 'Please try again in a few moments.',
      code: 'NETWORK_BAD_GATEWAY',
    },
    CONNECTION_REFUSED: {
      title: 'Connection failed',
      message: "We couldn't connect to our servers.",
      suggestion: 'Check your internet connection and try again.',
      code: 'NETWORK_CONNECTION_REFUSED',
    },
  },

  // ========================================================================
  // DATA & CONTENT ERRORS
  // ========================================================================
  DATA: {
    NOT_FOUND: {
      title: 'Data not found',
      message: "We couldn't find what you were looking for.",
      suggestion: 'Go back to your dashboard or try a different search.',
      code: 'DATA_NOT_FOUND',
    },
    INVALID_INPUT: {
      title: 'Invalid input',
      message: "We couldn't process your request.",
      suggestion: 'Check your input and make sure everything is correct.',
      code: 'DATA_INVALID_INPUT',
    },
    DUPLICATE_ENTRY: {
      title: 'Already exists',
      message: 'This entry already exists in your account.',
      suggestion: 'Use a different name or edit the existing entry.',
      code: 'DATA_DUPLICATE_ENTRY',
    },
    MISSING_REQUIRED_FIELD: {
      title: 'Required field missing',
      message: 'Please fill in all required fields.',
      suggestion: 'Check the form above for any empty fields marked with an asterisk (*).',
      code: 'DATA_MISSING_REQUIRED_FIELD',
    },
    OPERATION_FAILED: {
      title: 'Operation failed',
      message: "We couldn't complete your request.",
      suggestion: 'Try again. If it keeps failing, refresh the page and contact support if needed.',
      code: 'DATA_OPERATION_FAILED',
    },
  },

  // ========================================================================
  // PERMISSION & ACCESS ERRORS
  // ========================================================================
  PERMISSION: {
    INSUFFICIENT_PERMISSIONS: {
      title: "You don't have permission",
      message: "Your account doesn't have access to this feature.",
      suggestion: 'Contact the tasting host or your administrator.',
      code: 'PERMISSION_INSUFFICIENT',
    },
    RESOURCE_NOT_ACCESSIBLE: {
      title: 'Resource not accessible',
      message: "You don't have permission to access this.",
      suggestion: 'Ask the host to grant you access, or create your own.',
      code: 'PERMISSION_RESOURCE_NOT_ACCESSIBLE',
    },
    DELETED_BY_OWNER: {
      title: 'This tasting was deleted',
      message: 'The host has removed this tasting session.',
      suggestion: 'Create a new tasting or ask the host to start another.',
      code: 'PERMISSION_DELETED_BY_OWNER',
    },
  },

  // ========================================================================
  // GENERIC/CATCH-ALL ERRORS
  // ========================================================================
  GENERIC: {
    UNKNOWN_ERROR: {
      title: 'Something went wrong',
      message: 'We encountered an unexpected error.',
      suggestion: 'Refresh the page and try again. If the problem persists, contact support.',
      helpLink: '/help/contact-support',
      code: 'GENERIC_UNKNOWN_ERROR',
    },
    TRY_AGAIN: {
      title: 'Please try again',
      message: "Something didn't work as expected.",
      suggestion: 'Refresh and try again, or come back in a few moments.',
      code: 'GENERIC_TRY_AGAIN',
    },
  },
} as const;

/**
 * Helper function to get error message with fallback
 * @param errorKey - Nested key path (e.g., 'AUTH.INVALID_EMAIL')
 * @returns Error message template or generic error
 */
export function getErrorMessage(
  category: keyof typeof ERROR_MESSAGES,
  key: string
): ErrorMessageTemplate {
  const categoryMessages = ERROR_MESSAGES[category];
  if (categoryMessages && key in categoryMessages) {
    return categoryMessages[key as keyof typeof categoryMessages];
  }
  return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
}

/**
 * Helper to format error message for toast display
 * @param template - Error message template
 * @returns Formatted error object for toast
 */
export function formatErrorForToast(template: ErrorMessageTemplate) {
  return {
    title: template.title,
    description: template.suggestion,
    details: template.message || undefined,
  };
}

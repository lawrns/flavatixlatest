/**
 * CTA (CALL-TO-ACTION) & VALIDATION COPY LIBRARY
 *
 * Optimized action-oriented button text and form validation messages.
 *
 * Usage:
 *   import { BUTTON_TEXT, VALIDATION_MESSAGES, CTA_MICROCOPY } from '@/lib/copyConstants/ctaAndValidation';
 *   <button>{BUTTON_TEXT.CREATE_TASTING}</button>
 */

// ============================================================================
// PRIMARY ACTION BUTTONS - Specific, action-oriented
// ============================================================================

export const BUTTON_TEXT = {
  // Primary actions (most important)
  CREATE_TASTING: 'Create New Tasting',
  START_TASTING: 'Start Tasting',
  SUBMIT_RESPONSE: 'Submit My Response',
  SAVE_CHANGES: 'Save Changes',
  CONFIRM: 'Confirm',
  NEXT: 'Next',
  CONTINUE: 'Continue to Items',

  // Secondary actions
  CANCEL: 'Cancel',
  BACK: 'Back',
  SKIP: 'Skip for Now',
  CLEAR: 'Clear All',
  RESET: 'Reset Form',

  // Destructive actions
  DELETE: 'Delete This Tasting',
  LEAVE_TASTING: 'Leave Tasting',
  REMOVE_ITEM: 'Remove Item',

  // Join & participation
  JOIN_TASTING: 'Join This Tasting',
  ENTER_CODE: 'Enter Tasting Code',
  ACCEPT_INVITE: 'Accept Invitation',
  DECLINE_INVITE: 'Decline Invitation',

  // Authentication
  SIGN_UP: 'Create My Account',
  LOG_IN: 'Log In to Flavatix',
  LOG_OUT: 'Log Out',
  RESET_PASSWORD: 'Reset My Password',
  VERIFY_EMAIL: 'Verify Email Address',

  // Social & sharing
  SHARE_RESULTS: 'Share Results',
  SHARE_MY_WHEEL: 'Share My Flavor Wheel',
  INVITE_FRIENDS: 'Invite Friends',
  POST_REVIEW: 'Post My Review',
  FOLLOW_USER: 'Follow This Taster',

  // Profile & account
  EDIT_PROFILE: 'Edit My Profile',
  UPLOAD_PHOTO: 'Upload Profile Photo',
  VIEW_PROFILE: 'View My Profile',

  // Navigation
  VIEW_RESULTS: 'View Results',
  VIEW_TASTING: 'View This Tasting',
  BROWSE_TASTINGS: 'Browse Public Tastings',
  EXPLORE_WHEELS: 'Explore Flavor Wheels',

  // Help & support
  GET_HELP: 'Get Help',
  CONTACT_SUPPORT: 'Contact Support',
  VIEW_GUIDE: 'View Full Guide',
  LEARN_MORE: 'Learn More',

  // File operations
  UPLOAD_IMAGE: 'Upload Image',
  CHOOSE_FILE: 'Choose File',
  REMOVE_IMAGE: 'Remove Image',

  // Generic fallbacks (avoid these if possible)
  OK: 'OK',
  SUBMIT: 'Submit',
  DONE: 'Done',
} as const;

// ============================================================================
// FORM VALIDATION MESSAGES - Real-time feedback
// ============================================================================

export const VALIDATION_MESSAGES = {
  // Field-level validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Enter a valid email (example@domain.com)',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Include uppercase, lowercase, numbers, and symbols',
  PASSWORD_MISMATCH: "Passwords don't match",
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_INVALID: 'Use letters, numbers, and underscores only',
  NAME_TOO_LONG: 'Keep it under 100 characters',
  BIO_TOO_LONG: 'Keep bio under 500 characters',
  URL_INVALID: 'Enter a valid URL (starting with http:// or https://)',

  // Form-level validation
  FORM_INCOMPLETE: 'Please fill in all required fields',
  FORM_HAS_ERRORS: 'Please fix the errors below before continuing',

  // Specific field feedback
  CODE_FORMAT: 'Code must be 8 characters (example: ABC12XYZ)',
  CODE_NOT_FOUND: 'No tasting matches this code',
  CATEGORY_REQUIRED: 'Select a flavor category (Coffee, Wine, Tea, etc.)',
  ITEMS_REQUIRED: 'Add at least one item to taste',
  MIN_ITEMS: 'Add at least 2 items for this tasting type',
  DUPLICATE_ITEM: "You've already added an item with this name",

  // Success messages (shown after validation passes)
  EMAIL_VALID: 'Email looks good',
  PASSWORD_STRONG: 'Strong password',
  ITEM_ADDED: 'Item added to tasting',
  READY_TO_CONTINUE: 'All set! Ready to continue',
} as const;

// ============================================================================
// MICROCOPY - Small but mighty text that guides users
// ============================================================================

export const CTA_MICROCOPY = {
  // Input hints and placeholders
  PLACEHOLDER: {
    SESSION_NAME: 'e.g., Ethiopian Yirgacheffe Tasting',
    ITEM_NAME: 'e.g., Ethiopian Yirgacheffe, Batch #4',
    TASTING_CODE: 'e.g., ABC12XYZ',
    USERNAME: 'Choose a username',
    BIO: 'Tell others about you (optional)',
    SEARCH: 'Search public tastings...',
    REVIEW: 'What did you think? Share your impressions...',
  },

  // Helper text (below inputs)
  HELPER: {
    PASSWORD:
      'Must be at least 8 characters. Mix of uppercase, lowercase, numbers, and symbols recommended.',
    TASTING_CODE: '8-character code shared by the host. Check your email or text.',
    ITEMS_COUNT: 'You can add up to 50 items. Start with 3-5 for the best experience.',
    DESCRIPTION: 'Max 5000 characters. Describe flavors, aromas, texture, finish, etc.',
    VISIBILITY: 'Private = only you see it. Public = anyone on Flavatix can see it.',
  },

  // Confirmations & reassurance
  REASSURANCE: {
    BLIND_TASTING: "Don't worry, item names are hidden during tasting. Revealed after voting.",
    PROGRESS_SAVED: 'Your progress is automatically saved.',
    NO_PRESSURE: "There are no wrong answers. We're just curious about your palate.",
    CHANGES_SAVED: 'Changes saved automatically.',
    MORE_TASTINGS: 'Your flavor wheel will improve with more tastings. Keep tasting!',
  },

  // Action hints
  HINT: {
    HOVER_FOR_HELP: 'Hover for more info',
    TIP: 'Tip: ',
    EXAMPLE: 'Example: ',
    FORMAT: 'Format: ',
    OPTIONAL: '(optional)',
    REQUIRED: '(required)',
  },

  // Empty state encouragement
  EMPTY_STATE: {
    NO_TASTINGS: 'No tastings yet. Create your first one to get started!',
    NO_REVIEWS: 'No reviews yet. Be the first to share your thoughts.',
    NO_PARTICIPANTS: 'Invite friends to join your tasting. Share the code below.',
    NO_RESULTS: 'Start a tasting to see your results here.',
    NO_WHEEL: 'Complete 3 tastings to unlock your personalized flavor wheel.',
  },

  // Progress indicators
  PROGRESS: {
    STEP_OF: 'Step {current} of {total}',
    ALMOST_THERE: 'Almost there...',
    ALMOST_DONE: "You're almost done!",
    HALFWAY: "You're halfway there!",
  },

  // Error recovery
  RECOVERY: {
    TRY_AGAIN: 'Try again',
    GO_BACK: 'Go back and try again',
    REFRESH_PAGE: 'Refresh page and try again',
    CONTACT_SUPPORT: 'Contact support if this keeps happening',
  },
} as const;

// ============================================================================
// CTA VARIATIONS FOR A/B TESTING
// ============================================================================

export const CTA_VARIANTS = {
  // Join/Sign-up variations
  GET_STARTED: {
    VARIANT_A: 'Get Started',
    VARIANT_B: 'Create My Account',
    VARIANT_C: 'Join Flavatix',
    WINNING: 'Create My Account', // Data-driven winner
  },

  // View More/Browse variations
  VIEW_MORE: {
    VARIANT_A: 'View All',
    VARIANT_B: 'See All 12 Tastings',
    VARIANT_C: 'Browse More',
    WINNING: 'See All 12 Tastings',
  },

  // Continue variation
  CONTINUE_ACTION: {
    VARIANT_A: 'Continue',
    VARIANT_B: 'Continue to Items',
    VARIANT_C: 'Next: Add Items',
    WINNING: 'Continue to Items',
  },

  // Submit variations
  SUBMIT: {
    VARIANT_A: 'Submit',
    VARIANT_B: 'Submit My Ratings',
    VARIANT_C: 'Save My Tasting',
    WINNING: 'Submit My Ratings',
  },

  // Explore variations
  EXPLORE: {
    VARIANT_A: 'Explore',
    VARIANT_B: 'Explore Community',
    VARIANT_C: 'Discover Tastings',
    WINNING: 'Explore Community',
  },
} as const;

// ============================================================================
// CONFIRMATION & SUCCESS COPY
// ============================================================================

export const SUCCESS_COPY = {
  ACCOUNT_CREATED: 'Welcome to Flavatix! Verify your email to get started.',
  LOGGED_IN: 'Welcome back!',
  TASTING_CREATED: 'Tasting created! Add items to get started.',
  TASTING_STARTED: 'Tasting started. Invite participants with the code below.',
  JOINED_TASTING: "You've joined the tasting. Ready to taste?",
  RESPONSE_SUBMITTED: 'Thanks for your response!',
  REVIEW_POSTED: 'Your review has been shared.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  WHEEL_GENERATED: 'Your flavor wheel is ready! See your taste profile.',
  WHEEL_SHARED: 'Flavor wheel shared. Check the link in your notifications.',
  RESULT_REVEALED: 'Results revealed! See how everyone rated the items.',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get CTA text with count for specificity
 * @param baseText - Base CTA text
 * @param count - Number of items
 * @returns Specific CTA (e.g., "View 5 Tastings")
 */
export function getCountSpecificCTA(baseText: string, count: number): string {
  const variants: Record<string, string> = {
    'View All': `View ${count} ${count === 1 ? 'Tasting' : 'Tastings'}`,
    Browse: `Browse ${count} ${count === 1 ? 'Item' : 'Items'}`,
    'See More': `See ${count} More`,
  };

  return variants[baseText] || `${baseText} (${count})`;
}

/**
 * Get password strength indicator text
 * @param score - 0-4 strength score
 * @returns Strength feedback text
 */
export function getPasswordStrengthText(score: number): string {
  const levels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return levels[Math.min(score, 4)];
}

/**
 * Format required field indicator
 * @param required - Whether field is required
 * @returns Text to display (e.g., "(required)")
 */
export function getFieldIndicator(required: boolean): string {
  return required ? CTA_MICROCOPY.HINT.REQUIRED : CTA_MICROCOPY.HINT.OPTIONAL;
}

/**
 * COPY CONSTANTS - Central Export
 *
 * This is the single source of truth for all copy across Flavatix.
 * All error messages, help text, CTAs, empty states, and onboarding
 * copy is centralized here for consistency and maintainability.
 *
 * Usage:
 *   import {
 *     ERROR_MESSAGES,
 *     HELP_TEXTS,
 *     BUTTON_TEXT,
 *     EMPTY_STATES,
 *     ONBOARDING,
 *     TERMINOLOGY,
 *     GLOSSARY
 *   } from '@/lib/copyConstants';
 */

// Error messages
export {
  ERROR_MESSAGES,
  getErrorMessage,
  formatErrorForToast,
  type ErrorMessageTemplate,
} from './errorMessages';

// Help text and tooltips
export { HELP_TEXTS, getHelpText, getCategoryHelpTexts, type HelpTextTemplate } from './helpTexts';

// CTAs and validation
export {
  BUTTON_TEXT,
  VALIDATION_MESSAGES,
  CTA_MICROCOPY,
  CTA_VARIANTS,
  SUCCESS_COPY,
  getCountSpecificCTA,
  getPasswordStrengthText,
  getFieldIndicator,
} from './ctaAndValidation';

// Empty states and onboarding
export {
  EMPTY_STATES,
  ONBOARDING,
  PROGRESSIVE_DISCLOSURE,
  formatEmptyState,
  getProgressText,
  getNextStep,
  type EmptyStateTemplate,
  type OnboardingStep,
} from './emptyStatesAndOnboarding';

// Terminology and style guide
export {
  TERMINOLOGY,
  GLOSSARY,
  TONE_GUIDELINES,
  FORMATTING_RULES,
  COMMON_PHRASES,
  getGlossaryEntry,
  formatGlossaryTerm,
  checkToneCompliance,
  type GlossaryEntry,
} from './styleGuideAndGlossary';

/**
 * QUICK REFERENCE
 *
 * Need error messages?
 *   import { ERROR_MESSAGES } from '@/lib/copyConstants';
 *   ERROR_MESSAGES.AUTH.INVALID_EMAIL
 *
 * Need help text?
 *   import { HELP_TEXTS } from '@/lib/copyConstants';
 *   HELP_TEXTS.TASTING.BLIND_MODE.short
 *
 * Need button text?
 *   import { BUTTON_TEXT } from '@/lib/copyConstants';
 *   <button>{BUTTON_TEXT.CREATE_TASTING}</button>
 *
 * Need empty state?
 *   import { EMPTY_STATES } from '@/lib/copyConstants';
 *   <EmptyState {...EMPTY_STATES.NO_TASTINGS} />
 *
 * Need to check terminology?
 *   import { TERMINOLOGY } from '@/lib/copyConstants';
 *   TERMINOLOGY.FLAVOR_WHEEL_CAP // "Flavor Wheel"
 *
 * Need glossary definition?
 *   import { getGlossaryEntry } from '@/lib/copyConstants';
 *   getGlossaryEntry('BLIND_TASTING')
 */

export const COPY_CONSTANTS_VERSION = '1.0.0';
export const LAST_UPDATED = '2026-01-15';

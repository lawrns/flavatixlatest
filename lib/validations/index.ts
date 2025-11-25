/**
 * SINGLE SOURCE OF TRUTH - Validation Schemas
 * 
 * All input validation should use these Zod schemas.
 * Provides runtime type safety and consistent error messages.
 * 
 * Usage:
 *   import { createTastingSchema, validateInput } from '@/lib/validations';
 *   const result = createTastingSchema.safeParse(input);
 *   if (!result.success) { handle errors }
 */

import { z } from 'zod';
import {
  TASTING_CATEGORIES,
  TASTING_MODES,
  STUDY_APPROACHES,
  PARTICIPANT_ROLES,
  WHEEL_TYPES,
  SCOPE_TYPES,
} from '../types';
import { LIMITS, VALIDATION_MESSAGES } from '../constants';

// ============================================================================
// PRIMITIVE SCHEMAS
// ============================================================================

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email(VALIDATION_MESSAGES.INVALID_EMAIL)
  .min(1, VALIDATION_MESSAGES.REQUIRED('Email'));

export const urlSchema = z
  .string()
  .url(VALIDATION_MESSAGES.INVALID_URL)
  .optional()
  .nullable();

export const scoreSchema = z
  .number()
  .min(LIMITS.MIN_SCORE, VALIDATION_MESSAGES.INVALID_SCORE(LIMITS.MIN_SCORE, LIMITS.MAX_SCORE))
  .max(LIMITS.MAX_SCORE, VALIDATION_MESSAGES.INVALID_SCORE(LIMITS.MIN_SCORE, LIMITS.MAX_SCORE))
  .optional()
  .nullable();

export const categorySchema = z.enum(TASTING_CATEGORIES, {
  errorMap: () => ({ message: VALIDATION_MESSAGES.INVALID_CATEGORY }),
});

export const modeSchema = z.enum(TASTING_MODES, {
  errorMap: () => ({ message: 'Invalid tasting mode' }),
});

export const studyApproachSchema = z.enum(STUDY_APPROACHES, {
  errorMap: () => ({ message: 'Invalid study approach' }),
});

export const roleSchema = z.enum(PARTICIPANT_ROLES, {
  errorMap: () => ({ message: 'Invalid participant role' }),
});

export const wheelTypeSchema = z.enum(WHEEL_TYPES, {
  errorMap: () => ({ message: 'Invalid wheel type' }),
});

export const scopeTypeSchema = z.enum(SCOPE_TYPES, {
  errorMap: () => ({ message: 'Invalid scope type' }),
});

// ============================================================================
// TASTING SCHEMAS
// ============================================================================

export const createTastingSchema = z.object({
  user_id: uuidSchema,
  category: categorySchema,
  mode: modeSchema,
  session_name: z
    .string()
    .max(LIMITS.MAX_SESSION_NAME_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Session name', LIMITS.MAX_SESSION_NAME_LENGTH))
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(LIMITS.MAX_NOTES_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Notes', LIMITS.MAX_NOTES_LENGTH))
    .optional()
    .nullable(),
  study_approach: studyApproachSchema.optional().nullable(),
  rank_participants: z.boolean().default(false),
  ranking_type: z.string().optional().nullable(),
  is_blind_participants: z.boolean().default(false),
  is_blind_items: z.boolean().default(false),
  is_blind_attributes: z.boolean().default(false),
  items: z
    .array(
      z.object({
        item_name: z
          .string()
          .min(LIMITS.MIN_ITEM_NAME_LENGTH, VALIDATION_MESSAGES.REQUIRED('Item name'))
          .max(LIMITS.MAX_ITEM_NAME_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Item name', LIMITS.MAX_ITEM_NAME_LENGTH)),
        correct_answers: z.record(z.unknown()).optional().nullable(),
        include_in_ranking: z.boolean().default(true),
      })
    )
    .max(LIMITS.MAX_ITEMS_PER_TASTING, `Maximum ${LIMITS.MAX_ITEMS_PER_TASTING} items allowed`)
    .optional()
    .default([]),
}).refine(
  (data) => {
    // Competition mode requires items
    if (data.mode === 'competition' && data.items.length === 0) {
      return false;
    }
    return true;
  },
  { message: 'Competition mode requires at least one item', path: ['items'] }
).refine(
  (data) => {
    // Study mode with predefined approach requires items
    if (data.mode === 'study' && data.study_approach === 'predefined' && data.items.length === 0) {
      return false;
    }
    return true;
  },
  { message: 'Pre-defined study mode requires at least one item', path: ['items'] }
).refine(
  (data) => {
    // Collaborative study mode should not have preloaded items
    if (data.mode === 'study' && data.study_approach === 'collaborative' && data.items.length > 0) {
      return false;
    }
    return true;
  },
  { message: 'Collaborative study mode should not have preloaded items', path: ['items'] }
);

export const updateTastingSchema = z.object({
  session_name: z
    .string()
    .max(LIMITS.MAX_SESSION_NAME_LENGTH)
    .optional()
    .nullable(),
  notes: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

export const tastingItemSchema = z.object({
  tasting_id: uuidSchema,
  item_name: z
    .string()
    .min(LIMITS.MIN_ITEM_NAME_LENGTH, VALIDATION_MESSAGES.REQUIRED('Item name'))
    .max(LIMITS.MAX_ITEM_NAME_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Item name', LIMITS.MAX_ITEM_NAME_LENGTH)),
  notes: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional().nullable(),
  aroma: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional().nullable(),
  flavor: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional().nullable(),
  flavor_scores: z.record(z.number().min(0).max(100)).optional().nullable(),
  overall_score: scoreSchema,
  photo_url: urlSchema,
  correct_answers: z.record(z.unknown()).optional().nullable(),
  include_in_ranking: z.boolean().default(true),
});

export const updateTastingItemSchema = tastingItemSchema.partial().omit({ tasting_id: true });

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .max(LIMITS.MAX_FULL_NAME_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Full name', LIMITS.MAX_FULL_NAME_LENGTH))
    .optional()
    .nullable(),
  username: z
    .string()
    .min(LIMITS.MIN_USERNAME_LENGTH, VALIDATION_MESSAGES.MIN_LENGTH('Username', LIMITS.MIN_USERNAME_LENGTH))
    .max(LIMITS.MAX_USERNAME_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Username', LIMITS.MAX_USERNAME_LENGTH))
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(LIMITS.MAX_BIO_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH('Bio', LIMITS.MAX_BIO_LENGTH))
    .optional()
    .nullable(),
  avatar_url: urlSchema,
  preferred_category: categorySchema.optional().nullable(),
});

// ============================================================================
// FLAVOR WHEEL SCHEMAS
// ============================================================================

export const generateFlavorWheelSchema = z.object({
  wheelType: wheelTypeSchema,
  scopeType: scopeTypeSchema,
  scopeFilter: z.object({
    userId: uuidSchema.optional(),
    itemName: z.string().max(200).optional(),
    itemCategory: categorySchema.optional(),
    tastingId: uuidSchema.optional(),
  }).optional().default({}),
  forceRegenerate: z.boolean().default(false),
});

export const extractDescriptorsSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  category: categorySchema.optional(),
  extractMetaphors: z.boolean().default(true),
});

// ============================================================================
// STUDY MODE SCHEMAS
// ============================================================================

export const createStudySessionSchema = z.object({
  category: categorySchema,
  session_name: z.string().max(LIMITS.MAX_SESSION_NAME_LENGTH).optional(),
  study_approach: studyApproachSchema,
  notes: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional(),
  is_blind_items: z.boolean().default(false),
  items: z.array(
    z.object({
      item_name: z.string().min(1).max(LIMITS.MAX_ITEM_NAME_LENGTH),
      correct_answers: z.record(z.unknown()).optional(),
    })
  ).optional().default([]),
});

export const joinStudySessionSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters').max(10, 'Code too long'),
});

export const studyResponseSchema = z.object({
  item_id: uuidSchema,
  response_data: z.record(z.unknown()),
  notes: z.string().max(LIMITS.MAX_NOTES_LENGTH).optional(),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(LIMITS.MAX_PAGE_SIZE).default(LIMITS.DEFAULT_PAGE_SIZE),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const historyFiltersSchema = paginationSchema.extend({
  category: categorySchema.optional().nullable(),
  dateFrom: z.coerce.date().optional().nullable(),
  dateTo: z.coerce.date().optional().nullable(),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const imageUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'Must be a file'),
}).refine(
  (data) => data.file.size <= LIMITS.MAX_IMAGE_SIZE_BYTES,
  VALIDATION_MESSAGES.FILE_TOO_LARGE(LIMITS.MAX_IMAGE_SIZE_MB)
).refine(
  (data) => LIMITS.ALLOWED_IMAGE_TYPES.includes(data.file.type as any),
  VALIDATION_MESSAGES.INVALID_FILE_TYPE
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate input against a schema and return typed result
 */
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  input: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors into a user-friendly object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  return errors;
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Validation failed';
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateTastingInput = z.infer<typeof createTastingSchema>;
export type UpdateTastingInput = z.infer<typeof updateTastingSchema>;
export type TastingItemInput = z.infer<typeof tastingItemSchema>;
export type UpdateTastingItemInput = z.infer<typeof updateTastingItemSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GenerateFlavorWheelInput = z.infer<typeof generateFlavorWheelSchema>;
export type ExtractDescriptorsInput = z.infer<typeof extractDescriptorsSchema>;
export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type JoinStudySessionInput = z.infer<typeof joinStudySessionSchema>;
export type StudyResponseInput = z.infer<typeof studyResponseSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type HistoryFiltersInput = z.infer<typeof historyFiltersSchema>;

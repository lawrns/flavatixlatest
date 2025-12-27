/**
 * SINGLE SOURCE OF TRUTH - Application Constants
 * 
 * All hardcoded values should be defined here.
 * Do NOT hardcode values in components, services, or API routes.
 * 
 * Usage:
 *   import { CATEGORIES, API_ENDPOINTS, LIMITS } from '@/lib/constants';
 */

import { TASTING_CATEGORIES, TASTING_MODES, PARTICIPANT_ROLES } from './types';

// ============================================================================
// APPLICATION INFO
// ============================================================================

export const APP = {
  NAME: 'Flavatix',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  DESCRIPTION: 'The world\'s most comprehensive tasting app for anything with flavor or aroma',
  URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

export const API_ENDPOINTS = {
  // Tastings
  TASTINGS: '/api/tastings',
  TASTING_CREATE: '/api/tastings/create',
  TASTING_BY_ID: (id: string) => `/api/tastings/${id}`,
  
  // Study mode
  STUDY_CREATE: '/api/tastings/study/create',
  STUDY_JOIN: '/api/tastings/study/join',
  STUDY_RESOLVE_CODE: '/api/tastings/study/resolve-code',
  STUDY_ITEMS: (id: string) => `/api/tastings/study/${id}/items`,
  STUDY_START: (id: string) => `/api/tastings/study/${id}/start`,
  STUDY_RESPONSES: (id: string) => `/api/tastings/study/${id}/responses`,
  STUDY_SUMMARY: (id: string) => `/api/tastings/study/${id}/summary`,
  
  // Flavor wheels
  FLAVOR_WHEELS_GENERATE: '/api/flavor-wheels/generate',
  FLAVOR_WHEELS_EXTRACT: '/api/flavor-wheels/extract-descriptors',
  
  // Categories
  CATEGORIES_TAXONOMY: '/api/categories/get-or-create-taxonomy',
  
  // Admin
  ADMIN_AI_USAGE: '/api/admin/ai-usage-stats',
  ADMIN_EXTRACTION_STATS: '/api/admin/extraction-stats',
  
  // Social
  SOCIAL_LIKES: '/api/social/likes',
  SOCIAL_COMMENTS: '/api/social/comments',
  SOCIAL_FOLLOWS: '/api/social/follows',
  
  // Tasting Items
  TASTING_ITEMS: (tastingId: string) => `/api/tastings/${tastingId}/items`,
  TASTING_ITEM: (tastingId: string, itemId: string) => `/api/tastings/${tastingId}/items/${itemId}`,
  
  // Participants
  TASTING_PARTICIPANTS: (tastingId: string) => `/api/tastings/${tastingId}/participants`,
} as const;

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================

export const SUPABASE = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  STORAGE_BUCKET: 'images',
  AVATAR_BUCKET: 'avatars',
} as const;

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const LIMITS = {
  // Tasting limits
  MAX_ITEMS_PER_TASTING: 50,
  MAX_PARTICIPANTS_PER_TASTING: 100,
  MIN_ITEM_NAME_LENGTH: 1,
  MAX_ITEM_NAME_LENGTH: 200,
  MAX_NOTES_LENGTH: 5000,
  MAX_SESSION_NAME_LENGTH: 100,
  
  // Profile limits
  MAX_BIO_LENGTH: 500,
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 3,
  MAX_FULL_NAME_LENGTH: 100,
  
  // Score limits
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  DEFAULT_SCORE_SCALE: 10,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // API
  MAX_REQUEST_BODY_SIZE: '10mb',
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI = {
  // Breakpoints (matches TailwindCSS)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Toast durations
  TOAST: {
    SUCCESS_DURATION: 3000,
    ERROR_DURATION: 5000,
    INFO_DURATION: 4000,
  },
  
  // Bottom navigation height for padding
  BOTTOM_NAV_HEIGHT: 64,
  BOTTOM_NAV_PADDING: 'pb-20', // Tailwind class
} as const;

// ============================================================================
// FLAVOR WHEEL CATEGORIES (Predefined for AI consistency)
// ============================================================================

export const FLAVOR_CATEGORIES = {
  AROMA: [
    'Fruit',
    'Floral',
    'Herbal',
    'Spice',
    'Sweetness / Sugary / Confection',
    'Earthy / Mineral',
    'Vegetal / Green',
    'Nutty / Grain / Cereal',
    'Ferment / Funky',
    'Roasted / Toasted / Smoke',
    'Chemical',
    'Animal / Must',
    'Dairy / Fatty',
    'Wood / Resin',
  ],
  METAPHOR: [
    'Emotion',
    'Texture',
    'Color/Light',
    'Place',
    'Temporal',
    'Personality / Archetype',
    'Shape',
    'Weight',
    'Sound',
    'Movement',
  ],
} as const;

export const FLAVOR_WHEEL_COLORS = {
  Fruit: '#FF6B6B',
  Floral: '#F8B4D9',
  Herbal: '#7BC96F',
  Spice: '#FFB347',
  'Sweetness / Sugary / Confection': '#FFD93D',
  'Earthy / Mineral': '#8B7355',
  'Vegetal / Green': '#90EE90',
  'Nutty / Grain / Cereal': '#DEB887',
  'Ferment / Funky': '#9B59B6',
  'Roasted / Toasted / Smoke': '#5D4E37',
  Chemical: '#95A5A6',
  'Animal / Must': '#E74C3C',
  'Dairy / Fatty': '#F5F5DC',
  'Wood / Resin': '#8B4513',
  // Metaphor colors
  Emotion: '#E91E63',
  Texture: '#9C27B0',
  'Color/Light': '#FFEB3B',
  Place: '#4CAF50',
  Temporal: '#2196F3',
  'Personality / Archetype': '#FF5722',
  Shape: '#607D8B',
  Weight: '#795548',
  Sound: '#00BCD4',
  Movement: '#FF9800',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Auth errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // LocalStorage
  THEME: 'theme',
  AUTH_TOKEN: 'sb-access-token',
  USER_PREFERENCES: 'user-preferences',
  DRAFT_TASTING: 'draft-tasting',
  
  // SessionStorage
  CURRENT_TASTING: 'current-tasting',
  REDIRECT_URL: 'redirect-url',
} as const;

// ============================================================================
// FEATURE FLAGS (can be moved to remote config later)
// ============================================================================

export const FEATURES = {
  ENABLE_AI_DESCRIPTORS: true,
  ENABLE_SOCIAL_FEATURES: true,
  ENABLE_COMPETITION_MODE: true,
  ENABLE_STUDY_MODE: true,
  ENABLE_PDF_EXPORT: true,
  ENABLE_BARCODE_SCANNER: false,
  ENABLE_OFFLINE_MODE: false,
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  
  // Tastings
  MY_TASTINGS: '/my-tastings',
  QUICK_TASTING: '/quick-tasting',
  CREATE_TASTING: '/create-tasting',
  JOIN_TASTING: '/join-tasting',
  TASTING: (id: string) => `/tasting/${id}`,
  
  // Taste/Study mode
  TASTE: '/taste',
  TASTE_CREATE_STUDY: '/taste/create/study/new',
  
  // Review
  REVIEW: '/review',
  REVIEW_CREATE: '/review/create',
  
  // Social
  SOCIAL: '/social',
  
  // Features
  FLAVOR_WHEELS: '/flavor-wheels',
  COMPETITION: '/competition',
  
  // Admin
  ADMIN: '/admin',
} as const;

// ============================================================================
// CATEGORY DISPLAY NAMES & ICONS
// ============================================================================

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  coffee: { label: 'Coffee', icon: '☕', color: '#6F4E37' },
  tea: { label: 'Tea', icon: '🍵', color: '#7B8B6F' },
  wine: { label: 'Wine', icon: '🍷', color: '#722F37' },
  spirits: { label: 'Spirits', icon: '🥃', color: '#C68E17' },
  beer: { label: 'Beer', icon: '🍺', color: '#F5A623' },
  chocolate: { label: 'Chocolate', icon: '🍫', color: '#7B3F00' },
  cheese: { label: 'Cheese', icon: '🧀', color: '#FFD700' },
  olive_oil: { label: 'Olive Oil', icon: '🫒', color: '#808000' },
  honey: { label: 'Honey', icon: '🍯', color: '#EB9605' },
  other: { label: 'Other', icon: '🍽️', color: '#808080' },
};

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
  MAX_LENGTH: (field: string, max: number) => `${field} must be at most ${max} characters`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_CATEGORY: 'Please select a valid category',
  INVALID_SCORE: (min: number, max: number) => `Score must be between ${min} and ${max}`,
  FILE_TOO_LARGE: (maxMb: number) => `File size must be less than ${maxMb}MB`,
  INVALID_FILE_TYPE: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)',
} as const;

// Re-export category arrays for backward compatibility
export const VALID_CATEGORIES = TASTING_CATEGORIES;
export const VALID_MODES = TASTING_MODES;
export const VALID_ROLES = PARTICIPANT_ROLES;

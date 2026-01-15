/**
 * Centralized Color System for Flavatix
 *
 * This file provides consistent color mappings across the application.
 * All colors should reference these constants instead of hardcoding values.
 */

// ============================================================================
// CATEGORY COLORS
// Used for tasting categories (wine, coffee, whisky, etc.)
// ============================================================================

export const CATEGORY_COLORS = {
  wine: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    hex: '#dc2626',
  },
  coffee: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
    hex: '#d97706',
  },
  whisky: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-700',
    hex: '#ea580c',
  },
  beer: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-700',
    hex: '#ca8a04',
  },
  tea: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
    hex: '#059669',
  },
  chocolate: {
    bg: 'bg-stone-200 dark:bg-stone-800/50',
    text: 'text-stone-700 dark:text-stone-400',
    border: 'border-stone-400 dark:border-stone-600',
    hex: '#78716c',
  },
  cheese: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700',
    hex: '#d97706',
  },
  spirits: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-700',
    hex: '#7c3aed',
  },
  mezcal: {
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    text: 'text-lime-700 dark:text-lime-400',
    border: 'border-lime-300 dark:border-lime-700',
    hex: '#65a30d',
  },
  olive_oil: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
    hex: '#16a34a',
  },
  other: {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-400',
    border: 'border-zinc-300 dark:border-zinc-600',
    hex: '#71717a',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;

export function getCategoryColors(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '_') as CategoryKey;
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.other;
}

// ============================================================================
// STATUS COLORS
// Used for status badges (verified, pending, completed, etc.)
// ============================================================================

export const STATUS_COLORS = {
  verified: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
  },
  completed: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  in_progress: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

export function getStatusColors(status: string) {
  const key = status.toLowerCase().replace(/\s+/g, '_') as StatusKey;
  return STATUS_COLORS[key] || STATUS_COLORS.info;
}

// ============================================================================
// SCORE COLORS
// Used for score displays (0-10 scale)
// ============================================================================

export const SCORE_COLORS = {
  excellent: {
    // 9-10
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    hex: '#10b981', // emerald-500
  },
  great: {
    // 8-8.9
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    text: 'text-lime-700 dark:text-lime-400',
    hex: '#84cc16', // lime-500
  },
  good: {
    // 7-7.9
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    hex: '#eab308', // yellow-500
  },
  average: {
    // 5-6.9
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    hex: '#f59e0b', // amber-500
  },
  below_average: {
    // 3-4.9
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    hex: '#f97316', // orange-500
  },
  poor: {
    // 0-2.9
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    hex: '#ef4444', // red-500
  },
} as const;

export function getScoreColors(score: number) {
  if (score >= 9) {
    return SCORE_COLORS.excellent;
  }
  if (score >= 8) {
    return SCORE_COLORS.great;
  }
  if (score >= 7) {
    return SCORE_COLORS.good;
  }
  if (score >= 5) {
    return SCORE_COLORS.average;
  }
  if (score >= 3) {
    return SCORE_COLORS.below_average;
  }
  return SCORE_COLORS.poor;
}

export function getScoreHex(score: number): string {
  return getScoreColors(score).hex;
}

// ============================================================================
// FLAVOR WHEEL COLORS
// Used for flavor descriptors in wheels
// ============================================================================

export const FLAVOR_COLORS = {
  fruity: { hex: '#E4572E', text: 'text-[#E4572E]', bg: 'bg-[#E4572E]' },
  floral: { hex: '#E9A2AD', text: 'text-[#E9A2AD]', bg: 'bg-[#E9A2AD]' },
  vegetal: { hex: '#57A773', text: 'text-[#57A773]', bg: 'bg-[#57A773]' },
  smoky: { hex: '#6B5B95', text: 'text-[#6B5B95]', bg: 'bg-[#6B5B95]' },
  sweet: { hex: '#DFAF2B', text: 'text-[#DFAF2B]', bg: 'bg-[#DFAF2B]' },
  spicy: { hex: '#B53F3F', text: 'text-[#B53F3F]', bg: 'bg-[#B53F3F]' },
  bitter: { hex: '#2F4858', text: 'text-[#2F4858]', bg: 'bg-[#2F4858]' },
  sour: { hex: '#3B9ED8', text: 'text-[#3B9ED8]', bg: 'bg-[#3B9ED8]' },
  roasted: { hex: '#8C5A3A', text: 'text-[#8C5A3A]', bg: 'bg-[#8C5A3A]' },
  nutty: { hex: '#C29F6D', text: 'text-[#C29F6D]', bg: 'bg-[#C29F6D]' },
  mineral: { hex: '#7A8A8C', text: 'text-[#7A8A8C]', bg: 'bg-[#7A8A8C]' },
  earthy: { hex: '#6D7F4B', text: 'text-[#6D7F4B]', bg: 'bg-[#6D7F4B]' },
  citrus: { hex: '#eab308', text: 'text-[#eab308]', bg: 'bg-[#eab308]' },
  other: { hex: '#ec4899', text: 'text-[#ec4899]', bg: 'bg-[#ec4899]' },
} as const;

// ============================================================================
// BRAND COLORS
// Primary brand colors - use CSS variables when possible
// ============================================================================

export const BRAND_COLORS = {
  primary: {
    hex: '#C63C22', // Gemini Rust Red
    css: 'var(--color-primary)',
    tailwind: 'primary',
  },
  secondary: {
    hex: '#10b981', // Mexican Green
    css: 'var(--color-secondary)',
    tailwind: 'secondary',
  },
  accent: {
    hex: '#ef4444', // Mexican Red
    css: 'var(--color-accent)',
    tailwind: 'accent',
  },
  agave: {
    hex: '#1F5D4C',
    css: 'var(--color-brand-agave)',
    tailwind: 'brand-agave',
  },
  earth: {
    hex: '#C65A2E',
    css: 'var(--color-brand-earth)',
    tailwind: 'brand-earth',
  },
  gold: {
    hex: '#D4AF37',
    css: 'var(--color-brand-gold)',
    tailwind: 'brand-gold',
  },
} as const;

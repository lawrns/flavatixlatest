/**
 * Preset Service
 *
 * Manages user-customizable quick tasting presets.
 * Uses localStorage for persistence since the profiles table
 * doesn't have a quick_presets column.
 */

import { CategoryPackId } from './categoryPacks';

export const DEFAULT_PRESETS: CategoryPackId[] = ['whiskey', 'coffee', 'mezcal'];
export const ALL_CATEGORIES: CategoryPackId[] = ['whiskey', 'coffee', 'mezcal'];

const STORAGE_KEY = 'flavatix_quick_presets';

/**
 * Get user's quick tasting presets from localStorage
 */
export function getUserPresets(): CategoryPackId[] {
  if (typeof window === 'undefined') {
    return DEFAULT_PRESETS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PRESETS;
    }

    const parsed = JSON.parse(stored) as string[];
    // Validate that all items are valid categories
    const validPresets = parsed.filter((p): p is CategoryPackId =>
      ALL_CATEGORIES.includes(p as CategoryPackId)
    );

    return validPresets.length > 0 ? validPresets : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

/**
 * Save user's quick tasting presets to localStorage
 */
export function saveUserPresets(presets: CategoryPackId[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Validate presets before saving
  const validPresets = presets.filter(p => ALL_CATEGORIES.includes(p));

  if (validPresets.length === 0) {
    // Don't save empty presets, reset to defaults
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(validPresets));
}

/**
 * Reset presets to defaults
 */
export function resetUserPresets(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

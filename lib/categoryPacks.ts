import type { LucideIcon } from 'lucide-react';
import { Coffee, GlassWater, Sprout } from 'lucide-react';
import { CATEGORY_COLORS } from './colors';

export type CategoryPackId = 'coffee' | 'whiskey' | 'mezcal';

export interface CategoryPack {
  id: CategoryPackId;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  tint: {
    bg: string;
    text: string;
    border: string;
  };
}

// Uses centralized CATEGORY_COLORS from lib/colors.ts
// Dark mode classes are included - Tailwind handles mode switching automatically
export const CATEGORY_PACKS: Record<CategoryPackId, CategoryPack> = {
  whiskey: {
    id: 'whiskey',
    label: 'Whisky',
    shortLabel: 'Whisky',
    Icon: GlassWater,
    tint: {
      bg: CATEGORY_COLORS.whisky.bg,
      text: CATEGORY_COLORS.whisky.text,
      border: CATEGORY_COLORS.whisky.border,
    },
  },
  coffee: {
    id: 'coffee',
    label: 'Coffee',
    shortLabel: 'Coffee',
    Icon: Coffee,
    tint: {
      bg: CATEGORY_COLORS.coffee.bg,
      text: CATEGORY_COLORS.coffee.text,
      border: CATEGORY_COLORS.coffee.border,
    },
  },
  mezcal: {
    id: 'mezcal',
    label: 'Mezcal',
    shortLabel: 'Mezcal',
    Icon: Sprout,
    tint: {
      bg: CATEGORY_COLORS.mezcal.bg,
      text: CATEGORY_COLORS.mezcal.text,
      border: CATEGORY_COLORS.mezcal.border,
    },
  },
};

export function normalizeCategoryId(input: string | string[] | undefined): CategoryPackId | null {
  if (!input) {
    return null;
  }

  const raw = Array.isArray(input) ? input[0] : input;
  const value = raw.trim().toLowerCase();

  if (value === 'whisky') {
    return 'whiskey';
  }
  if (value === 'whiskey') {
    return 'whiskey';
  }
  if (value === 'coffee') {
    return 'coffee';
  }
  if (value === 'mezcal') {
    return 'mezcal';
  }

  return null;
}

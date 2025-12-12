/**
 * Test Tasting Fixtures
 * Sample tasting data for testing
 */

import { QuickTasting, TastingItem } from '@/lib/repositories/tastings';

export const testTasting: Partial<QuickTasting> = {
  id: 'test-tasting-id-123',
  user_id: 'test-user-id-123',
  category: 'Wine',
  session_name: 'Test Wine Tasting',
  notes: 'Test tasting notes',
  total_items: 3,
  completed_items: 0,
  average_score: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  completed_at: null,
  mode: 'quick',
  rank_participants: false,
  ranking_type: null,
  is_blind_participants: false,
  is_blind_items: false,
  is_blind_attributes: false,
  study_approach: null,
};

export const testTastingItem: Partial<TastingItem> = {
  id: 'test-item-id-123',
  tasting_id: 'test-tasting-id-123',
  item_name: 'Test Wine 1',
  notes: 'Rich and fruity',
  aroma: 'Berries, oak',
  flavor: 'Dark cherry, vanilla',
  flavor_scores: {
    fruity: 8,
    oaky: 6,
    spicy: 4,
  },
  overall_score: 8.5,
  photo_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  include_in_ranking: true,
};

export const testTastingItems: Partial<TastingItem>[] = [
  testTastingItem,
  {
    ...testTastingItem,
    id: 'test-item-id-456',
    item_name: 'Test Wine 2',
    notes: 'Light and crisp',
    aroma: 'Citrus, floral',
    flavor: 'Lemon, minerality',
    flavor_scores: {
      fruity: 6,
      floral: 7,
      crisp: 9,
    },
    overall_score: 7.5,
  },
  {
    ...testTastingItem,
    id: 'test-item-id-789',
    item_name: 'Test Wine 3',
    notes: 'Bold and tannic',
    aroma: 'Blackberry, pepper',
    flavor: 'Dark fruit, spice',
    flavor_scores: {
      fruity: 9,
      spicy: 8,
      tannic: 7,
    },
    overall_score: 8.0,
  },
];

export const createTestTasting = (overrides?: Partial<QuickTasting>): Partial<QuickTasting> => ({
  ...testTasting,
  ...overrides,
});

export const createTestTastingItem = (overrides?: Partial<TastingItem>): Partial<TastingItem> => ({
  ...testTastingItem,
  ...overrides,
});





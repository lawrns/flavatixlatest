/**
 * Tasting test fixtures
 */

export const mockQuickTasting = {
  id: 'tasting-123',
  user_id: 'test-user-id-123',
  title: 'Test Quick Tasting',
  category: 'whiskey',
  mode: 'quick',
  visibility: 'private',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockStudyTasting = {
  id: 'study-tasting-456',
  user_id: 'test-user-id-123',
  title: 'Test Study Session',
  category: 'whiskey',
  mode: 'study',
  visibility: 'private',
  study_mode: {
    is_blind: true,
    max_participants: 10,
    join_code: 'ABC123',
    status: 'active',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockTastingItem = {
  id: 'item-123',
  tasting_id: 'tasting-123',
  name: 'Sample Whiskey',
  item_order: 1,
  category: 'whiskey',
  notes: 'Test notes',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockFlavorDescriptor = {
  id: 'descriptor-123',
  item_id: 'item-123',
  text: 'vanilla',
  type: 'flavor',
  category: 'Sweet',
  predefined_category_id: 'cat-123',
  confidence: 0.9,
  created_at: new Date().toISOString(),
};

export const createMockTasting = (overrides?: any) => ({
  ...mockQuickTasting,
  ...overrides,
});

export const createMockTastingItem = (overrides?: any) => ({
  ...mockTastingItem,
  ...overrides,
});

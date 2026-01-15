/**
 * Tasting session fixtures for testing
 */
export const mockTastingSession = {
  id: '1',
  user_id: 'user-123',
  title: 'Wine Tasting Session',
  description: 'A test tasting session',
  status: 'active' as const,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockTastingSessions = [
  mockTastingSession,
  {
    id: '2',
    user_id: 'user-123',
    title: 'Beer Tasting',
    description: 'Craft beer evaluation',
    status: 'completed' as const,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T15:00:00Z',
  },
];

export const mockFlavorWheel = {
  id: '1',
  name: 'Wine Flavor Wheel',
  description: 'Classic wine tasting flavor wheel',
  categories: [
    {
      name: 'Fruit',
      subcategories: ['berry', 'stone fruit', 'citrus', 'tropical'],
    },
    {
      name: 'Wood',
      subcategories: ['oak', 'cedar', 'vanilla', 'spice'],
    },
    {
      name: 'Earth',
      subcategories: ['mineral', 'tobacco', 'leather'],
    },
  ],
};

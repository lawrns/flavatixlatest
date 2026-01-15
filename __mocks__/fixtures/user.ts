/**
 * User fixture for testing
 */
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockUsers = [
  mockUser,
  {
    id: 'user-456',
    email: 'another@example.com',
    name: 'Another User',
    avatar_url: 'https://example.com/avatar2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

/**
 * Test User Fixtures
 * Sample user data for testing
 */

import { User } from '@supabase/supabase-js';

export const testUser: Partial<User> = {
  id: 'test-user-id-123',
  email: 'test@flavatix.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
};

export const testUser2: Partial<User> = {
  id: 'test-user-id-456',
  email: 'test2@flavatix.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
};

export const testUserPassword = 'TestPassword123!';

export const createTestUser = (overrides?: Partial<User>): Partial<User> => ({
  ...testUser,
  ...overrides,
});







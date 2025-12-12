/**
 * Mock Authentication for Testing
 * Provides test doubles for auth tokens and sessions
 */

import { User, Session } from '@supabase/supabase-js';
import { testUser } from '../fixtures/testUser';

export const createMockAuthToken = (userId: string = 'test-user-id-123'): string => {
  return `mock-jwt-token-${userId}`;
};

export const createMockSession = (user?: Partial<User>): Session => {
  const mockUser = user || testUser;
  return {
    access_token: createMockAuthToken(mockUser.id),
    refresh_token: `mock-refresh-token-${mockUser.id}`,
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser as User,
  };
};

export const createMockAuthHeaders = (userId: string = 'test-user-id-123'): Record<string, string> => {
  return {
    authorization: `Bearer ${createMockAuthToken(userId)}`,
  };
};





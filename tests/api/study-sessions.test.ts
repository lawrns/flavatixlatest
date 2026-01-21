/**
 * Study Session API Tests
 */

import { createMocks } from 'node-mocks-http';
import joinHandler from '@/pages/api/tastings/study/join';
import { mockUser } from '../fixtures';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: mockUser },
        error: null,
      })),
    },
    from: jest.fn((table: string) => {
      if (table === 'study_sessions') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { id: '00000000-0000-0000-0000-000000000001', status: 'active' },
                error: null,
              })),
            })),
          })),
        };
      }

      if (table === 'study_participants') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: null,
                  error: { message: 'No rows found' },
                })),
              })),
            })),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: { id: 'participant-123' },
                error: null,
              })),
            })),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      };
    }),
  })),
}));

describe('/api/tastings/study/join', () => {
  it('should join study session with valid sessionId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {
        sessionId: '00000000-0000-0000-0000-000000000001',
        displayName: 'Test User',
      },
    });

    await joinHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });

  it('should return 400 for missing sessionId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {},
    });

    await joinHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
  });

  it('should allow anonymous participation without authentication', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        sessionId: '00000000-0000-0000-0000-000000000001',
      },
    });

    await joinHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
  });
});

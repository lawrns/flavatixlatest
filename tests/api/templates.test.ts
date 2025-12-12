/**
 * Templates API Tests
 */

import { createMocks } from 'node-mocks-http';
import saveTemplateHandler from '@/pages/api/templates/save';
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
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'template-123',
              user_id: mockUser.id,
              name: 'My Template',
              base_category: 'spirits',
              categories: JSON.stringify([
                {
                  name: 'Aroma',
                  hasText: true,
                  hasScale: true,
                  hasBoolean: false,
                  scaleMax: 10,
                  rankInSummary: true,
                  sortOrder: 0,
                },
              ]),
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('/api/templates/save', () => {
  it('should save a new template', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {
        name: 'My Template',
        baseCategory: 'spirits',
        categories: [
          {
            name: 'Aroma',
            hasText: true,
            hasScale: true,
            hasBoolean: false,
            scaleMax: 10,
            rankInSummary: true,
          },
        ],
      },
    });

    await saveTemplateHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.template).toBeDefined();
    expect(data.data.template.name).toBe('My Template');
  });

  it('should return 400 for invalid template data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {
        // Missing required fields
        name: '',
      },
    });

    await saveTemplateHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'My Template',
        baseCategory: 'spirits',
        categories: [
          {
            name: 'Aroma',
            hasText: true,
            hasScale: false,
            hasBoolean: false,
            rankInSummary: true,
          },
        ],
      },
    });

    await saveTemplateHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {
        name: 'Updated Template',
        baseCategory: 'spirits',
        categories: [
          {
            name: 'Aroma',
            hasText: true,
            hasScale: false,
            hasBoolean: false,
            rankInSummary: true,
          },
        ],
      },
    });

    await saveTemplateHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });

  it('should handle database errors gracefully', async () => {
    // Mock Supabase to return error
    const mockSupabase = require('@/lib/supabase');
    // NOTE: middleware calls getSupabaseClient for auth, then handler calls it again
    mockSupabase.getSupabaseClient
      .mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: mockUser },
            error: null,
          })),
        },
        from: jest.fn(),
      })
      .mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => ({
            data: { user: mockUser },
            error: null,
          })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: { message: 'Database error' },
              })),
            })),
          })),
        })),
      });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      body: {
        name: 'My Template',
        baseCategory: 'spirits',
        categories: [
          {
            name: 'Aroma',
            hasText: true,
            hasScale: false,
            hasBoolean: false,
            rankInSummary: true,
          },
        ],
      },
    });

    await saveTemplateHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(500);
  });
});

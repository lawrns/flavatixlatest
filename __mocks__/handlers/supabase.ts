import { http, HttpResponse } from 'msw';

/**
 * Mock handlers for Supabase API endpoints
 */
export const supabaseHandlers = [
  // Mock user data endpoint
  http.get('/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: '1',
        user_id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Mock tasting sessions endpoint
  http.get('/rest/v1/tasting_sessions', () => {
    return HttpResponse.json([
      {
        id: '1',
        user_id: 'user-123',
        title: 'Wine Tasting Session',
        created_at: '2024-01-15T10:00:00Z',
      },
    ]);
  }),

  // Mock flavor wheel endpoint
  http.get('/rest/v1/flavor_wheels', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Wine Flavor Wheel',
        categories: ['fruit', 'wood', 'spice'],
      },
    ]);
  }),

  // Mock POST for creating records
  http.post('/rest/v1/tasting_sessions', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        id: 'new-id',
        ...body,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Mock PATCH for updating records
  http.patch(/\/rest\/v1\/.*/, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json({
      id: 'updated-id',
      ...body,
      updated_at: new Date().toISOString(),
    });
  }),
];

import { http, HttpResponse } from 'msw';

/**
 * Mock handlers for authentication endpoints
 */
export const authHandlers = [
  // Mock NextAuth session endpoint
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // Mock NextAuth callback endpoint
  http.post('/api/auth/callback/credentials', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const email = body.email as string;

    if (email === 'test@example.com') {
      return HttpResponse.json({
        ok: true,
        status: 200,
        error: null,
      });
    }

    return HttpResponse.json(
      {
        ok: false,
        error: 'Invalid credentials',
      },
      { status: 401 }
    );
  }),

  // Mock sign out
  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ ok: true });
  }),
];

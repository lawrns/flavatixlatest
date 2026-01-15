import '@testing-library/jest-dom';

// Note: Skipping MSW server setup for now as it requires proper fetch polyfills
// and is causing test environment issues. Individual tests mock Supabase directly.
// TODO: Re-enable MSW after configuring proper test environment

// import { server } from './__mocks__/server';

/**
 * Establish API mocking before all tests.
 */
// beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

/**
 * Reset any request handlers that we may add during the tests,
 * so they don't affect other tests.
 */
// afterEach(() => server.resetHandlers());

/**
 * Clean up after the tests are finished.
 */
// afterAll(() => server.close());

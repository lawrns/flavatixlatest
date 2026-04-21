/**
 * Shared test harness utilities.
 *
 * This file centralizes router/auth mocks and the minimal app providers used by
 * maintained tests under /tests.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveRegionProvider } from '@/components/ui/LiveRegion';
import { createMockSupabaseClient } from '@/lib/test-utils/mocks/mockSupabase';
import { createTestUser, testUser } from '@/lib/test-utils/fixtures/testUser';

export const createMockUser = (overrides = {}) =>
  createTestUser({
    email: 'test@example.com',
    ...overrides,
  });

export const createMockSession = (overrides = {}) => ({
  id: '11111111-1111-4111-8111-111111111111',
  user_id: (testUser.id as string),
  category: 'coffee',
  session_name: 'Test Session',
  notes: '',
  total_items: 1,
  completed_items: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  mode: 'quick',
  ...overrides,
});

export const createMockTastingItem = (overrides = {}) => ({
  id: '22222222-2222-4222-8222-222222222222',
  tasting_id: '11111111-1111-4111-8111-111111111111',
  item_name: 'Test Item',
  notes: '',
  overall_score: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  user_id: testUser.id,
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: null,
  ...overrides,
});

export interface MockAuthState {
  user: any;
  session: any;
  loading: boolean;
  signOut: jest.Mock;
  refreshSession: jest.Mock;
}

export const createMockRouter = (overrides: Record<string, any> = {}) => ({
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isPreview: false,
  isReady: true,
  ...overrides,
  query: {
    ...(overrides.query ?? {}),
  },
});

const createDefaultAuthState = (): MockAuthState => ({
  user: createMockUser(),
  session: null,
  loading: false,
  signOut: jest.fn().mockResolvedValue(undefined),
  refreshSession: jest.fn().mockResolvedValue(undefined),
});

let currentRouter = createMockRouter();
let currentAuthState = createDefaultAuthState();

export const mockUseRouter = jest.fn(() => currentRouter);
export const mockUseAuth = jest.fn(() => currentAuthState);

export const resetMockRouter = () => {
  currentRouter = createMockRouter();
  mockUseRouter.mockImplementation(() => currentRouter);
  mockUseRouter.mockClear();
  return currentRouter;
};

export const setMockRouter = (overrides: Record<string, any> = {}) => {
  currentRouter = createMockRouter({
    ...currentRouter,
    ...overrides,
    query: {
      ...currentRouter.query,
      ...(overrides.query ?? {}),
    },
  });
  mockUseRouter.mockImplementation(() => currentRouter);
  return currentRouter;
};

export const getMockRouter = () => currentRouter;

export const resetMockAuthState = () => {
  currentAuthState = createDefaultAuthState();
  mockUseAuth.mockImplementation(() => currentAuthState);
  mockUseAuth.mockClear();
  return currentAuthState;
};

export const setMockAuthState = (overrides: Partial<MockAuthState> = {}) => {
  currentAuthState = {
    ...currentAuthState,
    ...overrides,
  };
  mockUseAuth.mockImplementation(() => currentAuthState);
  return currentAuthState;
};

export const getMockAuthState = () => currentAuthState;

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: ReactNode;
  queryClient: QueryClient;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children, queryClient }) => (
  <QueryClientProvider client={queryClient}>
    <LiveRegionProvider>{children}</LiveRegionProvider>
  </QueryClientProvider>
);

interface RenderAppOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  router?: Record<string, any>;
  auth?: Partial<MockAuthState>;
  queryClient?: QueryClient;
}

export const renderApp = (ui: ReactElement, options: RenderAppOptions = {}) => {
  const { route, router, auth, queryClient = createTestQueryClient(), ...renderOptions } = options;

  if (route) {
    setMockRouter({
      pathname: route,
      route,
      asPath: route,
    });
  }

  if (router) {
    setMockRouter(router);
  }

  if (auth) {
    setMockAuthState(auth);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
};

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
};

export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

export * from '@testing-library/react';
export { renderApp as render, createMockSupabaseClient };

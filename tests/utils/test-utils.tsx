/**
 * Test Utilities
 * 
 * Provides common test utilities, wrappers, and mocks for testing React components.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: 'test-session-id',
  user_id: 'test-user-id',
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
  id: 'test-item-id',
  tasting_id: 'test-session-id',
  item_name: 'Test Item',
  notes: '',
  overall_score: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  user_id: 'test-user-id',
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: null,
  ...overrides,
});

// ============================================================================
// MOCK SUPABASE CLIENT
// ============================================================================

export const createMockSupabaseClient = (customMocks = {}) => {
  const defaultMocks = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => ({ status: 'SUBSCRIBED' })),
      unsubscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  };

  return { ...defaultMocks, ...customMocks };
};

// ============================================================================
// TEST PROVIDERS
// ============================================================================

// Create a new QueryClient for each test
const createTestQueryClient = () =>
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

// Mock Auth Context
const MockAuthContext = React.createContext<{
  user: any;
  loading: boolean;
  signOut: () => void;
}>({
  user: null,
  loading: false,
  signOut: jest.fn(),
});

export const MockAuthProvider: React.FC<{
  children: ReactNode;
  user?: any;
  loading?: boolean;
}> = ({ children, user = null, loading = false }) => (
  <MockAuthContext.Provider value={{ user, loading, signOut: jest.fn() }}>
    {children}
  </MockAuthContext.Provider>
);

// All providers wrapper
interface AllProvidersProps {
  children: ReactNode;
  user?: any;
  loading?: boolean;
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  user = createMockUser(),
  loading = false,
}) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider user={user} loading={loading}>
        {children}
      </MockAuthProvider>
    </QueryClientProvider>
  );
};

// ============================================================================
// CUSTOM RENDER
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: any;
  loading?: boolean;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, loading, ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders user={user} loading={loading}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
};

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Wait for a condition to be true
 */
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

/**
 * Flush all pending promises
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

import '@testing-library/jest-dom';
import { Blob, File } from 'node:buffer';
import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';
import {
  mockUseAuth,
  mockUseRouter,
  resetMockAuthState,
  resetMockRouter,
} from '@/tests/utils/test-utils';

const globalScope = globalThis as any;

globalScope.TextEncoder = TextEncoder;
globalScope.TextDecoder = TextDecoder;
globalScope.ReadableStream = ReadableStream;
globalScope.TransformStream = TransformStream;
globalScope.WritableStream = WritableStream;
globalScope.Blob = Blob;
globalScope.File = File;

const {
  fetch: undiciFetch,
  Headers,
  Request,
  Response,
} = require('undici');

if (typeof globalScope.BroadcastChannel === 'undefined') {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  }

  globalScope.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
}

Object.assign(globalScope, {
  fetch: undiciFetch,
  Headers,
  Request,
  Response,
});

const { server } = require('./__mocks__/server');

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  BrowserTracing: jest.fn(),
  Replay: jest.fn(),
  Integrations: {
    Http: jest.fn(),
  },
  init: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: mockUseRouter,
}));

jest.mock('@/contexts/SimpleAuthContext', () => ({
  __esModule: true,
  useAuth: mockUseAuth,
  AuthProvider: ({ children }: any) => children,
}));

const originalError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }

    originalError.call(console, ...args);
  };

  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  resetMockRouter();
  resetMockAuthState();
});

afterAll(() => {
  server.close();
  console.error = originalError;
});

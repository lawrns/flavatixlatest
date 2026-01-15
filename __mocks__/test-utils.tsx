import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes common providers
 * Extend this with: QueryClientProvider, SessionProvider, etc.
 */
const CustomRender = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: CustomRender, ...options });

export * from '@testing-library/react';
export { customRender as render };

/**
 * Wait for async operations
 */
export const waitFor = async (callback: () => void, options = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback();
      resolve(null);
    }, 100);
  });
};

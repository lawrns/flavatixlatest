/* eslint-disable no-console -- this module filters one known framework compatibility warning. */

declare global {
  // eslint-disable-next-line no-var
  var __flavatixConsoleFiltersInstalled: boolean | undefined;
}

const isNextImageFetchPriorityWarning = (args: unknown[]): boolean => {
  const message = args.map(String).join(' ');
  return (
    message.includes('React does not recognize') &&
    message.includes('fetchPriority')
  );
};

export const installKnownConsoleFilters = (): void => {
  if (globalThis.__flavatixConsoleFiltersInstalled) {
    return;
  }

  globalThis.__flavatixConsoleFiltersInstalled = true;
  const originalError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    if (isNextImageFetchPriorityWarning(args)) {
      return;
    }

    originalError(...args);
  };
};


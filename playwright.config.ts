import { defineConfig, devices } from '@playwright/test';

/**
 * Blocking smoke suite for deterministic public routes.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e/smoke',
  testIgnore: ['**/manual/**'],
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  timeout: 90_000,
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: isCI
          ? 'npm run build && node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000'
          : 'node node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3000',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !isCI,
        timeout: 180 * 1000,
      },
});

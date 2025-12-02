import { test, expect } from '@playwright/test';

/**
 * Production tests for competition mode features
 * Tests against the deployed production site
 */

test.describe('Production - Competition Mode Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to competition creation page on production
    await page.goto('https://flavatix.netlify.app/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should show authentication when accessing competition creation', async ({ page }) => {
    // Should redirect to auth page
    await expect(page.getByText('Sign in with Email')).toBeVisible();
    await expect(page.getByText('Google')).toBeVisible();
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('Create new account')).toBeVisible();
  });

  test('should have proper page title and branding', async ({ page }) => {
    // Check for Flavatix branding
    await expect(page.getByText('Flavatix')).toBeVisible();
    await expect(page.getByText('The one place for all your tasting needs')).toBeVisible();
  });
});

test.describe('Production - Study Mode Features', () => {
  test('should show authentication when accessing study creation', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/taste/create/study/new');
    await page.waitForLoadState('networkidle');

    // Should redirect to auth page
    await expect(page.getByText('Sign in with Email')).toBeVisible();
  });
});

test.describe('Production - Public Pages', () => {
  test('should load dashboard without authentication', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard should be accessible (may show empty state)
    // Just check it loads without auth redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('dashboard');
  });

  test('should load create tasting page without authentication', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/create-tasting');
    await page.waitForLoadState('networkidle');

    // Create tasting should be accessible
    const currentUrl = page.url();
    expect(currentUrl).toContain('create-tasting');
  });
});

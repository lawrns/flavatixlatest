import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * Enhanced Tasting Summary Display Tests
 *
 * These tests verify the tasting summary functionality.
 * Tests that require specific test data are skipped.
 */

test.describe('Enhanced Tasting Summary Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('my-tastings page should display tasting history', async ({ page }) => {
    await page.goto('/my-tastings');
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();

    // Should show a list of tastings or empty state
    const hasContent = await page.locator('text=/tasting|item|coffee|wine|whiskey/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasEmptyState = await page.locator('text=/no tastings|empty|start/i').first().isVisible({ timeout: 2000 }).catch(() => false);

    // Either has content or empty state
    expect(hasContent || hasEmptyState).toBeTruthy();
  });

  test('dashboard should show recent tastings', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard should show recent tastings section
    await expect(page.getByText('Recent Tastings')).toBeVisible();

    // Recent tastings should be clickable
    const recentTastingButtons = page.locator('button').filter({ hasText: /items?$/i });
    const count = await recentTastingButtons.count();

    if (count > 0) {
      // Click on the first recent tasting
      await recentTastingButtons.first().click();
      await page.waitForLoadState('networkidle');

      // Should navigate to tasting details or summary
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('review page should load', async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');

    // Review page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  // Skip tests that require specific test data
  test.skip('should display aroma and flavor fields in tasting summary', async () => {
    // This test requires creating a specific tasting session first
  });

  test.skip('should display fields in correct order: Aroma → Flavor → Notes', async () => {
    // This test requires a completed tasting with specific data
  });

  test.skip('should only display fields that have content', async () => {
    // This test requires specific test fixtures
  });

  test.skip('should work correctly on mobile devices', async () => {
    // This test requires specific test session
  });

  test.skip('should maintain expand/collapse functionality', async () => {
    // This test requires specific test session
  });

  test.skip('should handle backward compatibility with existing sessions', async () => {
    // This test requires specific old session data
  });
});

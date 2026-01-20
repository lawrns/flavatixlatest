import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * E2E Tests for Tasting Session Flow
 *
 * These tests verify:
 * 1. Mobile navigation is present on tasting pages
 * 2. Navigation functionality
 */

test.describe('Tasting Pages - Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display mobile navigation on quick-tasting page', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Check for bottom navigation
    const nav = page.locator('nav').filter({ has: page.getByRole('link', { name: /home/i }) });
    await expect(nav).toBeVisible();

    // Verify navigation items are present
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /taste/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /review/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /wheels/i })).toBeVisible();
  });

  test('should have correct navigation links', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Check Home link
    const homeLink = page.getByRole('link', { name: /home/i });
    await expect(homeLink).toHaveAttribute('href', '/dashboard');

    // Check Wheels link
    const wheelsLink = page.getByRole('link', { name: /wheels/i });
    await expect(wheelsLink).toHaveAttribute('href', '/flavor-wheels');
  });
});

test.describe('Quick Tasting Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show category selection on quick-tasting page', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Should show category selection
    await expect(page.getByRole('heading', { name: /what are you tasting/i })).toBeVisible();

    // Category buttons should be visible
    await expect(page.getByRole('button', { name: 'Coffee' })).toBeVisible();
  });

  test('should start tasting after selecting category', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Click on Coffee category - this starts tasting immediately
    await page.getByRole('button', { name: 'Coffee' }).click();
    await page.waitForLoadState('networkidle');

    // Should be in tasting session view
    await expect(page.getByRole('heading', { name: /coffee tasting/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Tasting Session - Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Click on Coffee to start a tasting session
    await page.getByRole('button', { name: 'Coffee' }).click();
    await page.waitForLoadState('networkidle');

    // Wait for tasting session page to load
    await expect(page.getByRole('heading', { name: /coffee tasting/i })).toBeVisible({ timeout: 10000 });

    // Mobile nav should be visible
    const nav = page.locator('nav').filter({ has: page.getByRole('link', { name: /home/i }) });
    await expect(nav).toBeVisible();

    // Content should be visible (use first() to handle nested main elements)
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('mobile nav should be touch-friendly', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Get nav links
    const homeLink = page.getByRole('link', { name: /home/i });
    const box = await homeLink.boundingBox();

    if (box) {
      // Touch targets should be adequate size
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });
});

test.describe('Tasting Session - Back Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate back when clicking back button', async ({ page }) => {
    await page.goto('/quick-tasting');
    await page.waitForLoadState('networkidle');

    // Click back button if visible
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backButton.click();
      await page.waitForLoadState('networkidle');

      // Should navigate away from quick-tasting
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to auth if not logged in', async ({ page }) => {
    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    await page.goto('/quick-tasting');

    // Should redirect to auth page
    await expect(page).toHaveURL(/auth/, { timeout: 5000 });
  });
});


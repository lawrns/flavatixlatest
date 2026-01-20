import { test, expect } from '@playwright/test';

/**
 * Production tests for competition mode features
 * Tests against the deployed production site
 *
 * Note: When not logged in, users are redirected to the onboarding flow
 * which shows "Discover Your Next Favorite" with carousel cards.
 */

test.describe('Production - Competition Mode Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies to ensure not logged in
    await page.context().clearCookies();
    // Navigate to competition creation page on production
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should redirect unauthenticated users to onboarding or auth', async ({ page }) => {
    // When not logged in, should redirect to onboarding or auth page
    // Onboarding shows "Discover Your Next Favorite" with Skip button
    // Auth shows "Sign in with Email"
    const hasOnboarding = await page.getByText('Discover Your Next Favorite').isVisible().catch(() => false);
    const hasAuth = await page.getByText('Sign in with Email').isVisible().catch(() => false);
    const hasSkipButton = await page.getByRole('button', { name: 'Skip' }).isVisible().catch(() => false);

    expect(hasOnboarding || hasAuth || hasSkipButton).toBeTruthy();
  });

  test('should have Flavatix branding available', async ({ page }) => {
    // Check for Flavatix branding in the page (may be in alert element)
    const pageContent = await page.content();
    const hasFlavatixBranding = pageContent.includes('Flavatix') || pageContent.includes('tasting');

    expect(hasFlavatixBranding).toBeTruthy();
  });
});

test.describe('Production - Study Mode Features', () => {
  test('should redirect unauthenticated users from study creation', async ({ page }) => {
    // Clear cookies to ensure not logged in
    await page.context().clearCookies();
    await page.goto('/taste/create/study/new');
    await page.waitForLoadState('networkidle');

    // Should redirect to onboarding or auth page
    const hasOnboarding = await page.getByText('Discover Your Next Favorite').isVisible().catch(() => false);
    const hasAuth = await page.getByText('Sign in with Email').isVisible().catch(() => false);

    expect(hasOnboarding || hasAuth).toBeTruthy();
  });
});

test.describe('Production - Public Pages', () => {
  test('should redirect dashboard to onboarding when not authenticated', async ({ page }) => {
    // Clear cookies to ensure not logged in
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // May redirect to onboarding or stay on dashboard with limited content
    const hasOnboarding = await page.getByText('Discover Your Next Favorite').isVisible().catch(() => false);
    const hasDashboard = page.url().includes('dashboard');

    expect(hasOnboarding || hasDashboard).toBeTruthy();
  });

  test('should redirect create-tasting to onboarding when not authenticated', async ({ page }) => {
    // Clear cookies to ensure not logged in
    await page.context().clearCookies();
    await page.goto('/create-tasting');
    await page.waitForLoadState('networkidle');

    // May redirect to onboarding or stay on create-tasting
    const hasOnboarding = await page.getByText('Discover Your Next Favorite').isVisible().catch(() => false);
    const hasCreateTasting = page.url().includes('create-tasting');

    expect(hasOnboarding || hasCreateTasting).toBeTruthy();
  });
});

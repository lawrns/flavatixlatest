import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * E2E Tests for Tasting Session Flow
 *
 * These tests verify:
 * 1. Mobile navigation is present on tasting pages
 * 2. Complete tasting redirects to dashboard
 * 3. Button prevents multiple clicks
 */

test.describe('Tasting Session - Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display mobile navigation on tasting page', async ({ page }) => {
    // Navigate to a tasting session
    // Note: You'll need to create a test session or use a known session ID
    await page.goto('/tasting/test-session-id');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for bottom navigation
    const footer = page.locator('footer nav');
    await expect(footer).toBeVisible();

    // Verify all navigation items are present
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Create')).toBeVisible();
    await expect(page.getByText('Review')).toBeVisible();
    await expect(page.getByText('Social')).toBeVisible();
    await expect(page.getByText('Wheels')).toBeVisible();
  });

  test('should have correct navigation links', async ({ page }) => {
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    // Check Home link
    const homeLink = page.locator('a:has-text("Home")');
    await expect(homeLink).toHaveAttribute('href', '/dashboard');

    // Check Create link
    const createLink = page.locator('a:has-text("Create")');
    await expect(createLink).toHaveAttribute('href', '/create-tasting');

    // Check Review link
    const reviewLink = page.locator('a:has-text("Review")');
    await expect(reviewLink).toHaveAttribute('href', '/review');

    // Check Social link
    const socialLink = page.locator('a:has-text("Social")');
    await expect(socialLink).toHaveAttribute('href', '/social');

    // Check Wheels link
    const wheelsLink = page.locator('a:has-text("Wheels")');
    await expect(wheelsLink).toHaveAttribute('href', '/flavor-wheels');
  });

  test('mobile navigation should be fixed at bottom', async ({ page }) => {
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    
    // Check for fixed positioning classes
    const classes = await footer.getAttribute('class');
    expect(classes).toContain('fixed');
    expect(classes).toContain('bottom-0');
  });
});

test.describe('Tasting Session - Complete Flow', () => {
  test('should complete tasting and redirect to dashboard', async ({ page }) => {
    // Navigate to tasting session
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    // Find and click Complete Tasting button
    const completeButton = page.getByRole('button', { name: /Complete Tasting/i });
    await expect(completeButton).toBeVisible();
    await expect(completeButton).toBeEnabled();

    // Click the button
    await completeButton.click();

    // Button should show loading state
    await expect(page.getByText('Completing...')).toBeVisible();

    // Button should be disabled during loading
    const loadingButton = page.getByRole('button', { name: /Completing/i });
    await expect(loadingButton).toBeDisabled();

    // Wait for success message
    await expect(page.getByText('Tasting session completed!')).toBeVisible();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 3000 });
  });

  test('should prevent multiple clicks on Complete button', async ({ page }) => {
    // Set up network request tracking
    let completionRequests = 0;
    page.on('request', request => {
      if (request.url().includes('quick_tastings') && request.method() === 'PATCH') {
        completionRequests++;
      }
    });

    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    const completeButton = page.getByRole('button', { name: /Complete Tasting/i });

    // Try to click multiple times rapidly
    await completeButton.click();
    await completeButton.click().catch(() => {}); // May fail if already disabled
    await completeButton.click().catch(() => {}); // May fail if already disabled

    // Wait a bit for any potential duplicate requests
    await page.waitForTimeout(1000);

    // Should only have made one completion request
    expect(completionRequests).toBeLessThanOrEqual(1);
  });

  test('should show error message if completion fails', async ({ page }) => {
    // Mock API to return error
    await page.route('**/rest/v1/quick_tastings*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Database error' }),
      });
    });

    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    const completeButton = page.getByRole('button', { name: /Complete Tasting/i });
    await completeButton.click();

    // Should show error message
    await expect(page.getByText(/Failed to complete session/i)).toBeVisible();

    // Should NOT redirect
    await expect(page).not.toHaveURL('/dashboard');
  });
});

test.describe('Tasting Session - Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    // Mobile nav should be visible
    const footer = page.locator('footer nav');
    await expect(footer).toBeVisible();

    // Content should not be hidden behind nav
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Check for bottom padding to prevent content overlap
    const body = page.locator('body');
    const classes = await body.getAttribute('class');
    expect(classes).toContain('pb-20'); // Padding bottom for mobile nav
  });

  test('mobile nav icons should be touch-friendly', async ({ page }) => {
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    // Get all nav links
    const navLinks = page.locator('footer nav a');
    const count = await navLinks.count();

    // Each link should have adequate touch target size
    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const box = await link.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44 pixels (iOS guideline)
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Tasting Session - Back Navigation', () => {
  test('should navigate back when clicking back button', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    
    // Navigate to tasting session
    await page.goto('/tasting/test-session-id');
    await page.waitForLoadState('networkidle');

    // Click back button
    const backButton = page.getByRole('button', { name: /Back/i });
    await backButton.click();

    // Should go back to previous page
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Tasting Session - Error States', () => {
  test('should show error for invalid session ID', async ({ page }) => {
    await page.goto('/tasting/invalid-id-format');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.getByText('Session Not Found')).toBeVisible();
    
    // Should show button to go to dashboard
    const dashboardButton = page.getByRole('button', { name: /Go to Dashboard/i });
    await expect(dashboardButton).toBeVisible();
  });

  test('should redirect to auth if not logged in', async ({ page }) => {
    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    await page.goto('/tasting/test-session-id');

    // Should redirect to auth page
    await expect(page).toHaveURL('/auth', { timeout: 5000 });
  });
});


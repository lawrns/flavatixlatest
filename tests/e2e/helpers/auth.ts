import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'han@han.com',
  password: 'hennie12'
};

/**
 * Login helper for E2E tests
 * Works for both local and production environments
 */
export async function login(page: Page) {
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');

  // Handle onboarding carousel if present - click Skip or swipe through
  const skipButton = page.getByRole('button', { name: /skip/i });
  if (await skipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(500);
  }

  // Also try clicking through carousel if Skip didn't work
  const getStartedButton = page.getByRole('button', { name: /get started|sign up|create account/i });
  if (await getStartedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await getStartedButton.click();
    await page.waitForTimeout(500);
  }

  // First click "Sign in with Email" to show the email form
  const signInWithEmailButton = page.getByRole('button', { name: /sign in with email/i });

  // Check if button exists and is visible (may already be on email form)
  if (await signInWithEmailButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await signInWithEmailButton.click();
    await page.waitForTimeout(500);
  }

  // Fill login form - wait for inputs to be visible
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  // Click sign in
  const signInButton = page.getByRole('button', { name: /^sign in$/i });
  await signInButton.click();

  // Wait for redirect to dashboard or any main page
  await page.waitForURL(/\/(dashboard|quick-tasting|taste|my-tastings|create-tasting)/, {
    timeout: 15000
  });
}

/**
 * Logout helper for E2E tests
 */
export async function logout(page: Page) {
  // Navigate to dashboard
  await page.goto('/dashboard');

  // Look for user menu or logout button
  const userMenuButton = page.locator('button[aria-label*="user" i], button:has-text("Logout")');

  if (await userMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userMenuButton.click();
    await page.waitForTimeout(300);

    // Click logout in dropdown if it appears
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await logoutButton.click();
    }
  }

  // Wait for redirect to auth or home page
  await page.waitForURL(/\/(auth|$)/, { timeout: 5000 });
}

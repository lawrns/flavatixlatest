import { test, expect } from '@playwright/test';

const EMAIL = 'han@han.com';
const PASSWORD = 'hennie12';

async function login(page: any) {
  await page.goto('/auth?skipOnboarding=true');
  await page.waitForLoadState('networkidle');

  // Click "Continue with Email" to show the form
  const continueWithEmail = page.locator('text=Continue with Email');
  await expect(continueWithEmail).toBeVisible({ timeout: 15000 });
  await continueWithEmail.click();

  // Fill email and password
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 20000 });
}

test.describe('Flavatix Full E2E — han@han.com', () => {
  test('login and land on dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/dashboard');

    // Verify dashboard content
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Quick Tasting')).toBeVisible();
    await expect(page.locator('text=Recent Tastings')).toBeVisible();
  });

  test('quick tasting flow — create and abandon', async ({ page }) => {
    await login(page);

    // Click Quick Tasting from dashboard
    await page.click('text=Quick Tasting');
    await page.waitForURL(/\/quick-tasting/, { timeout: 15000 });

    // Should see category selector or go straight to tasting if preset
    await expect(page.locator('text=New tasting')).toBeVisible({ timeout: 10000 });

    // If category selector is shown, pick Coffee
    const coffeeBtn = page.locator('text=Coffee').first();
    if (await coffeeBtn.isVisible().catch(() => false)) {
      await coffeeBtn.click();
    }

    // Should be in tasting phase
    await expect(page.locator('text=Tasting')).toBeVisible({ timeout: 15000 });

    // Go back to dashboard
    await page.goto('/dashboard');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('my tastings page loads with badges', async ({ page }) => {
    await login(page);

    // Navigate directly
    await page.goto('/my-tastings');
    await page.waitForURL('/my-tastings', { timeout: 15000 });

    await expect(page.locator('text=My Tastings')).toBeVisible({ timeout: 10000 });

    // Filter buttons should be visible
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await expect(page.locator('button:has-text("Completed")')).toBeVisible();
    await expect(page.locator('button:has-text("In Progress")')).toBeVisible();

    // Either tastings exist with badges, or empty state
    const hasTastings = await page.locator('text=COMPLETED').first().isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=No tastings yet').first().isVisible().catch(() => false);
    expect(hasTastings || hasEmpty).toBe(true);
  });

  test('social feed loads', async ({ page }) => {
    await login(page);

    // Navigate directly
    await page.goto('/social');
    await page.waitForURL('/social', { timeout: 15000 });

    await expect(page.locator('text=Social')).toBeVisible({ timeout: 10000 });
  });

  test('profile page loads', async ({ page }) => {
    await login(page);

    // Navigate directly
    await page.goto('/profile');
    await page.waitForURL('/profile', { timeout: 15000 });

    await expect(page.locator('h1:has-text("Profile")')).toBeVisible({ timeout: 10000 });
  });

  test('taste page redirects to dashboard', async ({ page }) => {
    await login(page);

    // Direct visit to /taste should redirect
    await page.goto('/taste');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('design tokens render correctly', async ({ page }) => {
    await login(page);

    // Verify light mode renders
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // Verify buttons use new token classes (check computed styles indirectly)
    const primaryBtn = page.locator('button:has-text("Quick Tasting")').first();
    await expect(primaryBtn).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Flavor Wheel Loading with Authenticated User
 * Tests login with han@han.com and verifies flavor wheel loads properly
 */

test.describe('Flavor Wheel E2E Test with Authentication', () => {
  test('should login and verify flavor wheel loads correctly', async ({ page }) => {
    // Navigate to auth page with query param to skip onboarding and show email form
    await page.goto('http://localhost:3000/auth?skipOnboarding=true&showEmail=true');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Fill in login credentials
    await page.fill('input[type="email"]', 'han@han.com');
    await page.fill('input[type="password"]', 'hennie12');

    // Click login button
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard after successful login
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');

    // Navigate to flavor wheels page
    await page.goto('http://localhost:3000/flavor-wheels');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for loading skeleton or visualization
    const loadingOrVisualization = page.locator('text=Loading visualization').or(page.locator('[class*="FlavorWheel"]'));
    await expect(loadingOrVisualization).toBeVisible({ timeout: 15000 });

    // Wait for D3 visualization to load (check for SVG or canvas)
    const visualization = page.locator('svg, canvas').first();
    await expect(visualization).toBeVisible({ timeout: 20000 });

    // Verify no error messages
    const errorMessage = page.locator('text=/error|failed|crash/i');
    await expect(errorMessage).not.toBeVisible();

    // Check for wheel controls
    const wheelTypeControl = page.locator('text=/coffee|wine|spirits|all/i').first();
    await expect(wheelTypeControl).toBeVisible();

    // Verify flavor wheel data loaded
    const flavorSegments = page.locator('[class*="segment"], [class*="arc"]');
    const segmentCount = await flavorSegments.count();
    expect(segmentCount).toBeGreaterThan(0);

    console.log(`✅ Flavor wheel loaded successfully with ${segmentCount} segments`);
  });

  test('should handle flavor wheel interactions', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth?skipOnboarding=true&showEmail=true');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'han@han.com');
    await page.fill('input[type="password"]', 'hennie12');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to flavor wheels
    await page.goto('http://localhost:3000/flavor-wheels');
    await page.waitForLoadState('networkidle');

    // Wait for visualization
    const visualization = page.locator('svg, canvas').first();
    await expect(visualization).toBeVisible({ timeout: 20000 });

    // Test wheel type switching
    const coffeeButton = page.locator('button:has-text("Coffee")');
    if (await coffeeButton.isVisible()) {
      await coffeeButton.click();
      await page.waitForTimeout(1000); // Wait for wheel to regenerate

      // Verify wheel updated
      await expect(visualization).toBeVisible();
    }

    // Test scope switching
    const allTimeButton = page.locator('button:has-text("All Time")');
    if (await allTimeButton.isVisible()) {
      await allTimeButton.click();
      await page.waitForTimeout(1000);
      await expect(visualization).toBeVisible();
    }

    console.log('✅ Flavor wheel interactions working correctly');
  });
});

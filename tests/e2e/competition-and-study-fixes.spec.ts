import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * E2E Tests for Competition Mode and Study Fixes
 *
 * Competition Creation has two steps:
 * Step 1: Setup & Parameters - Name, category, blind tasting, ranking settings
 * Step 2: Items & Answers - Add competition items
 */

test.describe('Competition Mode - Blind Tasting Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should display session-level blind tasting toggle', async ({ page }) => {
    // The Blind Tasting checkbox should be visible on step 1
    await expect(page.getByText('Blind Tasting')).toBeVisible();
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).toBeVisible();
  });

  test('should have blind toggle unchecked by default', async ({ page }) => {
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).not.toBeChecked();
  });

  test('should toggle session-level blind setting', async ({ page }) => {
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });

    // Click to enable
    await blindCheckbox.click();
    await expect(blindCheckbox).toBeChecked();

    // Click to disable
    await blindCheckbox.click();
    await expect(blindCheckbox).not.toBeChecked();
  });
});

test.describe('Competition Mode - Category Selection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should have category combobox', async ({ page }) => {
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await expect(categoryCombobox).toBeVisible();
  });

  test('should show category options when clicked', async ({ page }) => {
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();

    // Wait for dropdown to open
    await page.waitForTimeout(500);

    // At least one category option should be visible (Coffee is common)
    const coffeeOption = page.getByText('Coffee').first();
    await expect(coffeeOption).toBeVisible();
  });
});

test.describe('Competition Creation - Step Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should require competition name to proceed', async ({ page }) => {
    // Try to click Next without filling name
    const nextButton = page.getByRole('button', { name: /next.*add items/i });

    // Check if button is disabled or shows validation on click
    const isDisabled = await nextButton.isDisabled();
    if (!isDisabled) {
      await nextButton.click();
      // If we can click, should still be on step 1 (validation failed)
      await expect(page.getByText('Setup & Parameters')).toBeVisible();
    }
  });

  test('should navigate to step 2 with valid data', async ({ page }) => {
    // Fill competition name - find by placeholder text
    await page.getByRole('textbox', { name: /coffee cupping competition/i }).fill('Test Competition');

    // Select category via combobox - type and press Enter
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();
    await categoryCombobox.fill('Coffee');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Next button
    await page.getByRole('button', { name: /next.*add items/i }).click();
    await page.waitForLoadState('networkidle');

    // Should see Add Item button on step 2 (multiple may exist)
    await expect(page.getByRole('button', { name: /add item/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Study Mode - Category Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/study/new');
    await page.waitForLoadState('networkidle');
  });

  test('should have category combobox in study mode', async ({ page }) => {
    // Study mode has "What's being tasted?" label, not "Base Category"
    const categoryCombobox = page.getByRole('combobox');
    await expect(categoryCombobox).toBeVisible();
  });

  test('should show What\'s being tasted label', async ({ page }) => {
    await expect(page.getByText("What's being tasted?")).toBeVisible();
  });
});

test.describe('Dashboard - Avatar Display', () => {
  test('should display avatar or fallback on dashboard', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for user menu button which contains the avatar
    const userMenuButton = page.getByRole('button', { name: /user menu/i });

    // The user menu or avatar should be visible
    const hasUserMenu = await userMenuButton.isVisible().catch(() => false);

    // Also check for any img with user info
    const hasAvatarImg = await page.locator('img[alt*="han"]').first().isVisible().catch(() => false);

    expect(hasUserMenu || hasAvatarImg).toBeTruthy();
  });
});

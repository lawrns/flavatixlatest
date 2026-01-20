import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * Authenticated tests for competition mode features
 * Uses provided credentials to test the blind toggle and other features
 */

test.describe('Competition Mode - Authenticated Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should access competition creation after login', async ({ page }) => {
    // Navigate to competition creation
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Should NOT redirect to auth now
    const currentUrl = page.url();
    expect(currentUrl).toContain('competition');

    // Check for the session-level blind toggle checkbox
    await expect(page.getByText('Blind Tasting')).toBeVisible();
    // Check that blind checkbox is present (it's a simple checkbox, no description text)
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).toBeVisible();
  });

  test('should toggle blind setting and show item controls', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Find and verify blind toggle is unchecked by default using role-based selector
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).toBeVisible();
    await expect(blindCheckbox).not.toBeChecked();

    // First fill required fields and navigate to step 2
    const nameTextbox = page.getByRole('textbox', { name: /coffee cupping competition/i });
    await nameTextbox.fill('Test Competition');

    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();
    await categoryCombobox.fill('Coffee');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Next to go to step 2 (Items & Answers)
    const nextButton = page.getByRole('button', { name: /next.*add items/i });
    await nextButton.click();
    await page.waitForLoadState('networkidle');

    // Wait for step 2 to load - Add Item button should be visible
    await expect(page.getByRole('button', { name: /add item/i }).first()).toBeVisible({ timeout: 10000 });

    // At this point items can be added. We verify the blind checkbox toggle works
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    const blindCheckbox2 = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox2).not.toBeChecked();

    // Toggle blind tasting on
    await blindCheckbox2.click();
    await expect(blindCheckbox2).toBeChecked();

    // Toggle blind tasting off
    await blindCheckbox2.click();
    await expect(blindCheckbox2).not.toBeChecked();
  });

  test('should have category dropdown in competition form', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Look for category-related elements
    await expect(page.getByText('Base Category')).toBeVisible();
    
    // Try to find the category input/combobox
    const categoryInput = page.locator('input[placeholder*="category"], input[placeholder*="Select or type"], [role="combobox"]');
    await expect(categoryInput).toBeVisible();
  });

  test('should validate competition creation form', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Try to create without filling form
    const createButton = page.getByRole('button', { name: /Create Competition|Create & Start/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Should show validation error
      await expect(page.getByText(/name.*required|please.*name/i)).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Study Mode - Authenticated Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should access study creation after login', async ({ page }) => {
    await page.goto('/taste/create/study/new');
    await page.waitForLoadState('networkidle');

    // Should NOT redirect to auth
    const currentUrl = page.url();
    expect(currentUrl).toContain('study');

    // Should have category combobox with "What's being tasted?" label
    await expect(page.getByText("What's being tasted?")).toBeVisible();
    const categoryCombobox = page.getByRole('combobox');
    await expect(categoryCombobox).toBeVisible();
  });
});

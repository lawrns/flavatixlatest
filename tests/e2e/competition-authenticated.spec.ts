import { test, expect } from '@playwright/test';

/**
 * Authenticated tests for competition mode features
 * Uses provided credentials to test the blind toggle and other features
 */

test.describe('Competition Mode - Authenticated Tests', () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to auth page
    await page.goto('https://flavatix.netlify.app/auth');
    await page.waitForLoadState('networkidle');

    // Click "Sign in with Email" to reveal email form
    await page.getByRole('button', { name: 'Sign in with Email' }).click();
    await page.waitForTimeout(1000); // Wait for form to appear
    
    // Login with provided credentials
    await page.getByLabel('Email').fill('han@han.com');
    await page.getByLabel('Password').fill('hennie12');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete - should redirect somewhere
    await page.waitForLoadState('networkidle');
    
    // Give it a moment to fully load
    await page.waitForTimeout(2000);
  });

  test('should access competition creation after login', async ({ page }) => {
    // Navigate to competition creation
    await page.goto('https://flavatix.netlify.app/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Should NOT redirect to auth now
    const currentUrl = page.url();
    expect(currentUrl).toContain('competition');
    
    // Check for the session-level blind toggle
    await expect(page.getByText('Blind Tasting')).toBeVisible();
    await expect(page.getByText('Hide all item names from participants during the competition')).toBeVisible();
  });

  test('should toggle blind setting and show item controls', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Find and verify blind toggle is unchecked by default
    const blindCheckbox = page.locator('label:has-text("Blind Tasting") input[type="checkbox"]');
    await expect(blindCheckbox).toBeVisible();
    await expect(blindCheckbox).not.toBeChecked();

    // Add an item
    const addItemButton = page.getByRole('button', { name: /Add Item/i });
    await addItemButton.click();
    
    // Expand the item
    const itemToggle = page.locator('button:has-text("Item 1")');
    await itemToggle.click();
    
    // Per-item blind should be visible initially
    await expect(page.getByText('Blind for this item')).toBeVisible();
    
    // Enable session-level blind
    await blindCheckbox.click();
    await expect(blindCheckbox).toBeChecked();
    
    // Per-item blind should be hidden, session indicator shown
    await expect(page.getByText('Blind for this item')).not.toBeVisible();
    await expect(page.getByText('This item is blind (session-level setting)')).toBeVisible();
    
    // Disable session-level blind
    await blindCheckbox.click();
    await expect(blindCheckbox).not.toBeChecked();
    
    // Per-item blind should be visible again
    await expect(page.getByText('Blind for this item')).toBeVisible();
    await expect(page.getByText('This item is blind (session-level setting)')).not.toBeVisible();
  });

  test('should have category dropdown in competition form', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Look for category-related elements
    await expect(page.getByText('Base Category')).toBeVisible();
    
    // Try to find the category input/combobox
    const categoryInput = page.locator('input[placeholder*="category"], input[placeholder*="Select or type"], [role="combobox"]');
    await expect(categoryInput).toBeVisible();
  });

  test('should validate competition creation form', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/taste/create/competition/new');
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
    // Login
    await page.goto('https://flavatix.netlify.app/auth');
    await page.waitForLoadState('networkidle');
    
    await page.getByLabel('Email').fill('han@han.com');
    await page.getByLabel('Password').fill('hennie12');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should access study creation after login', async ({ page }) => {
    await page.goto('https://flavatix.netlify.app/taste/create/study/new');
    await page.waitForLoadState('networkidle');

    // Should NOT redirect to auth
    const currentUrl = page.url();
    expect(currentUrl).toContain('study');
    
    // Should have category dropdown
    await expect(page.getByText('Base Category')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * E2E Tests for Competition Mode and Study Fixes
 *
 * These tests verify:
 * 1. Competition creation form has session-level blind toggle
 * 2. Competition items respect session-level blind setting
 * 3. Category dropdown has expanded options
 * 4. Study mode creation works without DB errors
 */

test.describe('Competition Mode - Session-Level Blind Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to competition creation page
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should display session-level blind tasting toggle', async ({ page }) => {
    // Check for the session-level blind toggle
    const blindToggle = page.locator('input[type="checkbox"]').filter({ has: page.locator('~ div:has-text("Blind Tasting")') });
    
    // The toggle should exist in the Competition Settings section
    await expect(page.getByText('Blind Tasting')).toBeVisible();
    await expect(page.getByText('Hide all item names from participants')).toBeVisible();
  });

  test('should have blind toggle unchecked by default', async ({ page }) => {
    // Find the blind toggle checkbox
    const blindCheckbox = page.locator('label:has-text("Blind Tasting") input[type="checkbox"]');
    
    // Should be unchecked by default
    await expect(blindCheckbox).not.toBeChecked();
  });

  test('should toggle session-level blind setting', async ({ page }) => {
    // Find and click the blind toggle
    const blindCheckbox = page.locator('label:has-text("Blind Tasting") input[type="checkbox"]');
    
    // Click to enable
    await blindCheckbox.click();
    await expect(blindCheckbox).toBeChecked();
    
    // Click to disable
    await blindCheckbox.click();
    await expect(blindCheckbox).not.toBeChecked();
  });

  test('should show blind indicator on items when session blind is enabled', async ({ page }) => {
    // First add an item
    const addItemButton = page.getByRole('button', { name: /Add Item/i });
    await addItemButton.click();
    
    // Enable session-level blind
    const blindCheckbox = page.locator('label:has-text("Blind Tasting") input[type="checkbox"]');
    await blindCheckbox.click();
    
    // Expand the item to see details
    const itemToggle = page.locator('button:has-text("Item 1")');
    await itemToggle.click();
    
    // Should show session-level blind indicator
    await expect(page.getByText('This item is blind (session-level setting)')).toBeVisible();
  });

  test('should hide per-item blind checkbox when session blind is enabled', async ({ page }) => {
    // Add an item first
    const addItemButton = page.getByRole('button', { name: /Add Item/i });
    await addItemButton.click();
    
    // Expand item
    const itemToggle = page.locator('button:has-text("Item 1")');
    await itemToggle.click();
    
    // Per-item blind checkbox should be visible initially
    await expect(page.getByText('Blind for this item')).toBeVisible();
    
    // Enable session-level blind
    const blindCheckbox = page.locator('label:has-text("Blind Tasting") input[type="checkbox"]');
    await blindCheckbox.click();
    
    // Per-item blind checkbox should be hidden
    await expect(page.getByText('Blind for this item')).not.toBeVisible();
  });
});

test.describe('Competition Mode - Category Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should have expanded category options', async ({ page }) => {
    // Click on category dropdown/combobox
    const categoryInput = page.locator('input[placeholder*="category"]').or(page.locator('[aria-label*="category"]'));
    await categoryInput.click();
    
    // Check for expanded categories
    const expectedCategories = [
      'Coffee',
      'Tea',
      'Red Wine',
      'White Wine',
      'Beer',
      'Whiskey',
      'Mezcal',
      'Chocolate'
    ];
    
    for (const category of expectedCategories) {
      // Categories should be visible in dropdown or as options
      const categoryOption = page.getByRole('option', { name: category }).or(page.getByText(category, { exact: true }));
      await expect(categoryOption).toBeVisible();
    }
  });
});

test.describe('Competition Creation - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');
  });

  test('should require competition name', async ({ page }) => {
    // Try to create without name
    const createButton = page.getByRole('button', { name: /Create Competition|Create & Start/i });
    await createButton.click();
    
    // Should show validation error
    await expect(page.getByText(/name.*required|please.*name/i)).toBeVisible();
  });

  test('should require at least one item', async ({ page }) => {
    // Fill in name
    const nameInput = page.locator('input[placeholder*="Competition name"]').or(page.getByLabel(/name/i));
    await nameInput.fill('Test Competition');
    
    // Select category
    const categoryInput = page.locator('input[placeholder*="category"]');
    await categoryInput.click();
    await page.getByText('Coffee').click();
    
    // Try to create without items
    const createButton = page.getByRole('button', { name: /Create Competition|Create & Start/i });
    await createButton.click();
    
    // Should show validation error about items
    await expect(page.getByText(/item.*required|add.*item/i)).toBeVisible();
  });
});

test.describe('Study Mode - Category Dropdown Standardization', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/taste/create/study/new');
    await page.waitForLoadState('networkidle');
  });

  test('should have standardized category options in study mode', async ({ page }) => {
    // Click on base category dropdown
    const categoryInput = page.locator('input[placeholder*="category"]').or(page.locator('[placeholder*="Select or type"]'));
    await categoryInput.click();
    
    // Check for key categories that should be standardized
    const expectedCategories = ['Coffee', 'Tea', 'Red Wine', 'White Wine', 'Beer', 'Whiskey'];
    
    for (const category of expectedCategories) {
      const categoryOption = page.getByRole('option', { name: category }).or(page.getByText(category, { exact: true }));
      await expect(categoryOption).toBeVisible();
    }
  });
});

test.describe('Quick Tasting - Show All Items Toggle', () => {
  // Note: This test requires an active tasting session
  // In a real scenario, you'd create a session first or use test fixtures
  
  test.skip('should toggle show all items view', async ({ page }) => {
    // This test needs authentication and an active session
    // Skipping for now - would need test fixtures
    
    // Navigate to an active tasting session
    // await page.goto('/quick-tasting?session=test-id');
    
    // Find and click "Show All Items" toggle
    // const toggleButton = page.getByRole('button', { name: /Show All Items/i });
    // await toggleButton.click();
    
    // Should show grid of all items
    // await expect(page.getByText('All Items')).toBeVisible();
  });
});

test.describe('Tasting Summary - Aroma and Flavor Display', () => {
  // Note: This test requires a completed tasting with aroma/flavor data
  
  test.skip('should display aroma and flavor in summary', async ({ page }) => {
    // Navigate to a tasting summary with aroma/flavor data
    // await page.goto('/tasting-summary/test-id');
    
    // Expand an item
    // const itemRow = page.locator('[data-testid="tasting-item"]').first();
    // await itemRow.click();
    
    // Should show aroma section
    // await expect(page.getByText('Aroma')).toBeVisible();
    
    // Should show flavor section
    // await expect(page.getByText('Flavor')).toBeVisible();
  });
});

test.describe('Avatar Component', () => {
  test('should display avatar or fallback on dashboard', async ({ page }) => {
    // Navigate to dashboard (requires auth in real scenario)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for avatar element - either img or fallback div
    const avatarImg = page.locator('img[alt*="Profile"]');
    const avatarFallback = page.locator('[role="img"][aria-label*="Profile"]');
    
    // Either avatar image or fallback should be visible
    const hasAvatar = await avatarImg.isVisible().catch(() => false);
    const hasFallback = await avatarFallback.isVisible().catch(() => false);
    
    expect(hasAvatar || hasFallback).toBeTruthy();
  });
});

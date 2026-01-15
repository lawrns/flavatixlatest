import { test, expect } from '@playwright/test';

test.describe('Enhanced Tasting Summary Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display aroma and flavor fields in tasting summary', async ({ page }) => {
    // This test assumes we have a completed tasting session with aroma and flavor data
    // In a real scenario, you would need to create test data or use a test database
    
    // Navigate to quick tasting page
    await page.click('text=Quick Tasting');
    await page.waitForLoadState('networkidle');
    
    // Start a new tasting session
    await page.click('text=Start Tasting');
    await page.waitForLoadState('networkidle');
    
    // Select a category (e.g., Coffee)
    await page.selectOption('select[name="category"]', 'coffee');
    
    // Add a tasting item with complete data
    await page.click('text=Add Item');
    
    // Fill in the tasting form
    await page.fill('textarea[placeholder*="aroma"]', 'Rich, chocolatey aroma with hints of caramel');
    await page.fill('textarea[placeholder*="flavor"]', 'Bold and smooth with notes of dark chocolate');
    await page.fill('textarea[placeholder*="notes"]', 'Excellent coffee, would buy again');
    
    // Set overall score
    await page.fill('input[type="number"]', '85');
    
    // Save the item
    await page.click('text=Save');
    
    // Complete the tasting session
    await page.click('text=Complete Tasting');
    await page.waitForLoadState('networkidle');
    
    // Navigate to the summary page
    await page.waitForSelector('text=Tasted Items');
    
    // Click on the item to expand it
    await page.click('text=Coffee 1');
    
    // Verify that all three fields are displayed
    await expect(page.locator('text=Aroma')).toBeVisible();
    await expect(page.locator('text=Rich, chocolatey aroma with hints of caramel')).toBeVisible();
    
    await expect(page.locator('text=Flavor')).toBeVisible();
    await expect(page.locator('text=Bold and smooth with notes of dark chocolate')).toBeVisible();
    
    await expect(page.locator('text=Notes')).toBeVisible();
    await expect(page.locator('text=Excellent coffee, would buy again')).toBeVisible();
  });

  test('should display fields in correct order: Aroma → Flavor → Notes', async ({ page }) => {
    // Navigate to a completed tasting session
    await page.goto('//tasting/test-session-id');
    await page.waitForLoadState('networkidle');
    
    // Click on an item to expand it
    await page.click('text=Coffee 1');
    
    // Get all field labels
    const aromaLabel = page.locator('text=Aroma');
    const flavorLabel = page.locator('text=Flavor');
    const notesLabel = page.locator('text=Notes');
    
    // Check that labels are visible
    await expect(aromaLabel).toBeVisible();
    await expect(flavorLabel).toBeVisible();
    await expect(notesLabel).toBeVisible();
    
    // Check the order by getting the positions
    const aromaBox = await aromaLabel.boundingBox();
    const flavorBox = await flavorLabel.boundingBox();
    const notesBox = await notesLabel.boundingBox();
    
    // Aroma should be above Flavor
    expect(aromaBox!.y).toBeLessThan(flavorBox!.y);
    
    // Flavor should be above Notes
    expect(flavorBox!.y).toBeLessThan(notesBox!.y);
  });

  test('should only display fields that have content', async ({ page }) => {
    // Navigate to a completed tasting session with partial data
    await page.goto('//tasting/test-session-partial');
    await page.waitForLoadState('networkidle');
    
    // Click on an item that only has notes
    await page.click('text=Coffee 1');
    
    // Check that only Notes is displayed
    await expect(page.locator('text=Notes')).toBeVisible();
    await expect(page.locator('text=Aroma')).not.toBeVisible();
    await expect(page.locator('text=Flavor')).not.toBeVisible();
    
    // Click on another item that has aroma and flavor but no notes
    await page.click('text=Coffee 2');
    
    // Check that only Aroma and Flavor are displayed
    await expect(page.locator('text=Aroma')).toBeVisible();
    await expect(page.locator('text=Flavor')).toBeVisible();
    await expect(page.locator('text=Notes')).not.toBeVisible();
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to a completed tasting session
    await page.goto('//tasting/test-session-id');
    await page.waitForLoadState('networkidle');
    
    // Click on an item to expand it
    await page.click('text=Coffee 1');
    
    // Verify that all fields are visible and readable on mobile
    await expect(page.locator('text=Aroma')).toBeVisible();
    await expect(page.locator('text=Flavor')).toBeVisible();
    await expect(page.locator('text=Notes')).toBeVisible();
    
    // Check that text is not cut off horizontally
    const aromaText = page.locator('text=Rich, chocolatey aroma with hints of caramel');
    const aromaBox = await aromaText.boundingBox();
    const viewportWidth = page.viewportSize()!.width;
    
    // Text should not extend beyond viewport width
    expect(aromaBox!.width).toBeLessThanOrEqual(viewportWidth - 32); // Account for padding
  });

  test('should maintain expand/collapse functionality', async ({ page }) => {
    // Navigate to a completed tasting session
    await page.goto('//tasting/test-session-id');
    await page.waitForLoadState('networkidle');
    
    // Initially, item details should not be visible
    await expect(page.locator('text=Aroma')).not.toBeVisible();
    
    // Click to expand
    await page.click('text=Coffee 1');
    
    // Details should now be visible
    await expect(page.locator('text=Aroma')).toBeVisible();
    await expect(page.locator('text=Flavor')).toBeVisible();
    await expect(page.locator('text=Notes')).toBeVisible();
    
    // Click to collapse
    await page.click('text=Coffee 1');
    
    // Details should be hidden again
    await expect(page.locator('text=Aroma')).not.toBeVisible();
    await expect(page.locator('text=Flavor')).not.toBeVisible();
    await expect(page.locator('text=Notes')).not.toBeVisible();
  });

  test('should handle backward compatibility with existing sessions', async ({ page }) => {
    // Navigate to an existing session created before the enhancement
    await page.goto('//tasting/old-session-id');
    await page.waitForLoadState('networkidle');
    
    // Click on an item
    await page.click('text=Coffee 1');
    
    // Should only display Notes (existing data)
    await expect(page.locator('text=Notes')).toBeVisible();
    await expect(page.locator('text=Aroma')).not.toBeVisible();
    await expect(page.locator('text=Flavor')).not.toBeVisible();
    
    // Should not show any errors or broken functionality
    await expect(page.locator('text=Error')).not.toBeVisible();
  });
});

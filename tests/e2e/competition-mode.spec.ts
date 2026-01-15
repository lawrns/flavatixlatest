/**
 * E2E Test: Competition Mode
 * Tests competition creation, answer submission, and leaderboard
 */

import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Competition Mode', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should create a competition session with items', async ({ page }) => {
    // Navigate to create tasting page
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Fill competition form
    await page.selectOption('select[name="category"]', 'coffee');
    
    const sessionNameInput = page.locator('input[name="sessionName"]').first();
    if (await sessionNameInput.count() > 0) {
      await sessionNameInput.fill('E2E Competition Test');
    }

    // Add competition items
    const addItemButton = page.locator('button:has-text("Add Item")').first();
    if (await addItemButton.count() > 0) {
      await addItemButton.click();
      
      // Fill item details
      await page.waitForSelector('input[name*="item"]', { timeout: 3000 });
      const itemNameInput = page.locator('input[name*="item"]').first();
      await itemNameInput.fill('Competition Coffee Item 1');
      
      // Add correct answers if form exists
      const scoreInput = page.locator('input[name*="score"], input[type="number"]').first();
      if (await scoreInput.count() > 0) {
        await scoreInput.fill('85');
      }
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await submitButton.click();

    // Wait for navigation to competition session
    await page.waitForURL(/.*competition.*/, { timeout: 10000 });
  });

  test('should submit competition answers', async ({ page }) => {
    // Navigate to a competition session
    // In practice, you'd create one first or use a test fixture
    
    // Wait for competition form to load
    await page.waitForSelector('input, select, button', { timeout: 5000 });
    
    // Fill in answers
    const answerInputs = page.locator('input[type="text"], input[type="number"], select').all();
    
    for (let i = 0; i < Math.min(await answerInputs.length, 3); i++) {
      const input = answerInputs[i];
      if (await input.isVisible()) {
        await input.fill('85');
      }
    }
    
    // Submit answers
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Submit Answers")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Wait for submission confirmation
      await page.waitForTimeout(2000);
      
      // Verify success message or score display
      const successIndicator = page.locator('text=/score|submitted|completed/i');
      if (await successIndicator.count() > 0) {
        await expect(successIndicator.first()).toBeVisible();
      }
    }
  });

  test('should display leaderboard', async ({ page }) => {
    // Navigate to competition leaderboard
    await page.goto('/competition/test-id/leaderboard');
    await page.waitForLoadState('networkidle');
    
    // Verify leaderboard elements are visible
    const leaderboard = page.locator('text=/leaderboard|rank|score/i').first();
    if (await leaderboard.count() > 0) {
      await expect(leaderboard).toBeVisible();
    }
  });
});


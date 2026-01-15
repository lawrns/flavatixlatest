/**
 * E2E Test: Social Features
 * Tests like, comment, and follow interactions
 */

import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Social Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to social feed
    await page.goto('/social');
    await page.waitForLoadState('networkidle');
  });

  test('should like a post', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid*="post"], .post, article', { timeout: 10000 });
    
    // Find the first like button
    const likeButton = page.locator('button:has-text("Like"), button[aria-label*="like" i], [data-testid*="like"]').first();
    
    if (await likeButton.count() > 0) {
      const initialText = await likeButton.textContent();
      
      // Click like button
      await likeButton.click();
      
      // Wait for UI update (button text or state change)
      await page.waitForTimeout(1000);
      
      // Verify like was applied (button state changed or count increased)
      const updatedText = await likeButton.textContent();
      // The button text or state should have changed
      expect(updatedText).not.toBe(initialText);
    }
  });

  test('should comment on a post', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid*="post"], .post, article', { timeout: 10000 });
    
    // Find comment button
    const commentButton = page.locator('button:has-text("Comment"), button[aria-label*="comment" i]').first();
    
    if (await commentButton.count() > 0) {
      await commentButton.click();
      
      // Wait for comment modal or form to appear
      await page.waitForSelector('textarea, input[type="text"]', { timeout: 3000 });
      
      // Type a comment
      const commentInput = page.locator('textarea, input[type="text"]').first();
      await commentInput.fill('E2E test comment');
      
      // Submit comment
      const submitButton = page.locator('button:has-text("Post"), button:has-text("Submit"), button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for comment to appear
        await page.waitForTimeout(1000);
        
        // Verify comment appears (look for the comment text)
        await expect(page.locator('text=E2E test comment')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should follow a user', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid*="post"], .post, article', { timeout: 10000 });
    
    // Find follow button
    const followButton = page.locator('button:has-text("Follow"), button[aria-label*="follow" i]').first();
    
    if (await followButton.count() > 0) {
      const initialText = await followButton.textContent();
      
      // Click follow button
      await followButton.click();
      
      // Wait for UI update
      await page.waitForTimeout(1000);
      
      // Verify follow state changed
      const updatedText = await followButton.textContent();
      expect(updatedText).not.toBe(initialText);
    }
  });
});


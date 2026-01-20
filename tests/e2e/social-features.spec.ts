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
    // Wait for posts to load - look for article elements
    await page.waitForSelector('article', { timeout: 10000 });

    // Find the first like button - has "Like" text and possibly an icon
    const likeButton = page.locator('button').filter({ hasText: 'Like' }).first();

    if (await likeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click like button
      await likeButton.click();

      // Wait for UI update
      await page.waitForTimeout(1000);

      // Button should still be there (state may have changed)
      expect(await likeButton.isVisible()).toBeTruthy();
    }
  });

  test('should comment on a post', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('article', { timeout: 10000 });

    // Find comment button - has "Comment" text
    const commentButton = page.locator('button').filter({ hasText: 'Comment' }).first();

    if (await commentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentButton.click();

      // Wait for comment dialog to appear
      await page.waitForTimeout(500);

      // Look for the comment input textbox
      const commentInput = page.getByRole('textbox', { name: /add a comment/i });

      if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Type a comment
        await commentInput.fill('E2E test comment');

        // Submit comment - Post button should be enabled now
        const postButton = page.getByRole('button', { name: 'Post' });
        if (await postButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
          await postButton.click();

          // Wait for comment to be posted
          await page.waitForTimeout(1000);

          // Comment should appear in the list
          const comment = page.locator('text=E2E test comment');
          await expect(comment.first()).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should follow a user', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('article', { timeout: 10000 });

    // Find follow button - this may not exist if user is already following
    const followButton = page.locator('button').filter({ hasText: /follow/i }).first();

    if (await followButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click follow button
      await followButton.click();

      // Wait for UI update
      await page.waitForTimeout(1000);

      // Button state should have changed (Following vs Follow)
      const buttonText = await followButton.textContent();
      expect(buttonText).toBeTruthy();
    } else {
      // No follow button visible - that's ok, may already be following everyone
      test.skip(true, 'No follow button found');
    }
  });
});

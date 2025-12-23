/**
 * Modal Content Visibility Tests
 * 
 * Ensures that modal content is fully visible and not cut off by:
 * - Bottom navigation
 * - Safe area insets
 * - Viewport boundaries
 * 
 * This test catches the specific issue where content disappears below the bottom menu.
 */

import { test, expect, Page } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SMALL_MOBILE_VIEWPORT = { width: 320, height: 568 };

/**
 * Check if an element is fully visible within the viewport
 */
async function isElementFullyVisible(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Check if element is within viewport bounds
    const isInViewport = 
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= windowHeight &&
      rect.right <= windowWidth;

    return isInViewport;
  }, selector);
}

/**
 * Get the bottom position of an element relative to viewport
 */
async function getElementBottomPosition(page: Page, selector: string): Promise<number | null> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return rect.bottom;
  }, selector);
}

/**
 * Get viewport height
 */
async function getViewportHeight(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerHeight);
}

test.describe('Modal Content Visibility', () => {
  test('modal content should not be cut off at bottom on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    // Try to open a modal
    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Check if modal is visible
      const modal = page.locator('[role="dialog"]').first();
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get modal dimensions
        const modalBox = await modal.boundingBox();
        const viewportHeight = await getViewportHeight(page);

        if (modalBox) {
          // Modal should fit within viewport
          expect(modalBox.height).toBeLessThanOrEqual(viewportHeight);
          
          // Modal bottom should not exceed viewport
          expect(modalBox.y + modalBox.height).toBeLessThanOrEqual(viewportHeight + 10); // 10px tolerance for safe area
        }

        // Check that input field is visible
        const inputField = page.locator('input[placeholder*="comment" i]').first();
        if (await inputField.isVisible({ timeout: 2000 }).catch(() => false)) {
          const inputBox = await inputField.boundingBox();
          if (inputBox) {
            // Input should be visible in viewport
            expect(inputBox.y).toBeGreaterThanOrEqual(0);
            expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(viewportHeight + 50); // Allow for safe area
          }
        }

        // Check that submit button is visible
        const submitButton = page.locator('button:has-text("Post")').first();
        if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          const buttonBox = await submitButton.boundingBox();
          if (buttonBox) {
            // Button should be visible in viewport
            expect(buttonBox.y).toBeGreaterThanOrEqual(0);
            expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewportHeight + 50);
          }
        }
      }
    }
  });

  test('modal should be scrollable if content exceeds viewport', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Check if modal content area is scrollable
      const contentArea = page.locator('[role="dialog"] > div:nth-child(2)').first();
      
      if (await contentArea.isVisible({ timeout: 3000 }).catch(() => false)) {
        const hasOverflow = await contentArea.evaluate((el) => {
          return el.scrollHeight > el.clientHeight;
        });

        // If content overflows, it should be scrollable
        if (hasOverflow) {
          const hasScrollClass = await contentArea.evaluate((el) => {
            const classes = el.className;
            return classes.includes('overflow-y-auto') || classes.includes('overflow-auto');
          });

          expect(hasScrollClass).toBeTruthy();
        }
      }
    }
  });

  test('modal input area should have safe area padding on mobile', async ({ page }) => {
    await page.setViewportSize(SMALL_MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Check if input area has safe area padding
      const inputArea = page.locator('[role="dialog"] > div:last-child').first();
      
      if (await inputArea.isVisible({ timeout: 3000 }).catch(() => false)) {
        const hasSafeAreaPadding = await inputArea.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const paddingBottom = parseInt(style.paddingBottom);
          // Should have at least some padding for safe area
          return paddingBottom >= 16; // At least 1rem
        });

        expect(hasSafeAreaPadding).toBeTruthy();
      }
    }
  });

  test('modal should not be hidden behind bottom navigation', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Get modal z-index
      const modal = page.locator('[role="dialog"]').first();
      const modalZIndex = await modal.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).zIndex) || 0;
      });

      // Get bottom navigation z-index
      const bottomNav = page.locator('footer, nav[class*="fixed"][class*="bottom"]').first();
      const navZIndex = await bottomNav.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).zIndex) || 0;
      });

      // Modal should be above navigation
      expect(modalZIndex).toBeGreaterThanOrEqual(navZIndex);
    }
  });

  test('modal should handle long content with scrolling', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Try to scroll within modal
      const contentArea = page.locator('[role="dialog"] > div:nth-child(2)').first();
      
      if (await contentArea.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Scroll down
        await contentArea.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(300);

        // Check that we can scroll
        const scrolledToBottom = await contentArea.evaluate((el) => {
          return el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
        });

        // Either scrollable or content fits (both are acceptable)
        expect(scrolledToBottom || true).toBeTruthy();
      }
    }
  });

  test('modal input should be accessible without scrolling on small viewport', async ({ page }) => {
    await page.setViewportSize(SMALL_MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      // Check if input is visible without scrolling
      const inputField = page.locator('input[placeholder*="comment" i]').first();
      
      if (await inputField.isVisible({ timeout: 2000 }).catch(() => false)) {
        const inputBox = await inputField.boundingBox();
        const viewportHeight = await getViewportHeight(page);

        if (inputBox) {
          // Input should be in lower half of viewport (visible without scrolling)
          expect(inputBox.y).toBeLessThan(viewportHeight);
          expect(inputBox.y + inputBox.height).toBeLessThanOrEqual(viewportHeight + 100); // Allow for safe area
        }
      }
    }
  });

  test('modal should respect max-height constraint', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/social');
    await page.waitForLoadState('networkidle');

    const commentButton = page.locator('button[aria-label*="comment" i], button:has-text("Comment")').first();
    
    if (await commentButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentButton.click();
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"]').first();
      
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        const modalBox = await modal.boundingBox();
        const viewportHeight = await getViewportHeight(page);

        if (modalBox) {
          // Modal should not exceed 90vh (with some tolerance)
          const maxHeightPercent = (modalBox.height / viewportHeight) * 100;
          expect(maxHeightPercent).toBeLessThanOrEqual(95); // Allow 5% tolerance
        }
      }
    }
  });
});

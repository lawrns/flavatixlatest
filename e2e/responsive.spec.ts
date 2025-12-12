import { test, expect } from '@playwright/test';

/**
 * Responsive Smoke Tests
 * 
 * Verifies that key pages don't have horizontal overflow at common mobile viewports.
 * Run with: npm run test:e2e -- responsive.spec.ts
 */

const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 12', width: 375, height: 667 },
  { name: 'iPhone 12 Pro Max', width: 414, height: 896 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 800 },
];

const PAGES_TO_TEST = [
  { path: '/', name: 'Landing' },
  { path: '/auth', name: 'Auth' },
  // Authenticated pages would need login - skip for now or mock
];

// Helper to check for horizontal overflow
async function checkNoHorizontalOverflow(page: any) {
  const hasOverflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth + 1;
  });
  return !hasOverflow;
}

test.describe('Responsive Layout - No Horizontal Overflow', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const pageInfo of PAGES_TO_TEST) {
        test(`${pageInfo.name} page has no horizontal overflow`, async ({ page }) => {
          await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
          
          // Wait for any animations to settle
          await page.waitForTimeout(500);
          
          const noOverflow = await checkNoHorizontalOverflow(page);
          expect(noOverflow).toBe(true);
        });
      }
    });
  }
});

test.describe('Flavor Wheels Page - Mobile Responsive', () => {
  // This test requires authentication - skip if not logged in
  test.skip(({ browserName }) => true, 'Requires authentication setup');

  test('wheel container fits within viewport at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/flavor-wheels');
    
    // Check the wheel visualization container doesn't overflow
    const wheelContainer = page.locator('.flavor-wheel-svg');
    if (await wheelContainer.count() > 0) {
      const box = await wheelContainer.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('controls wrap properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/flavor-wheels');
    
    const noOverflow = await checkNoHorizontalOverflow(page);
    expect(noOverflow).toBe(true);
  });
});

test.describe('Core Pages - Visual Regression Candidates', () => {
  // These are marked as candidates for visual snapshot testing
  // Enable by removing .skip when ready to capture baselines
  
  test.skip('Dashboard at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
  });

  test.skip('Taste page at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/taste');
    await expect(page).toHaveScreenshot('taste-mobile.png');
  });

  test.skip('Review page at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/review');
    await expect(page).toHaveScreenshot('review-mobile.png');
  });
});

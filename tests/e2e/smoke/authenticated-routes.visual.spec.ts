/**
 * Visual regression smoke tests for authenticated app surfaces.
 * Covers the pages modified in the UI system cleanup pass.
 *
 * Runs on: desktop 1280×800 and mobile 390×844
 *
 * Tip: to update snapshots after intentional UI changes, run:
 *   npx playwright test tests/e2e/smoke/authenticated-routes.visual.spec.ts --update-snapshots
 */

import { test, expect, Page } from '@playwright/test';
import { login } from '../helpers/auth';

const BLANK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnPZXQAAAAASUVORK5CYII=',
  'base64'
);

async function stabilizePage(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.addInitScript(() => {
    window.localStorage.setItem('flavatix:onboarding-seen', 'true');
  });
  await page.route('https://**/*', async (route) => {
    if (route.request().resourceType() === 'image') {
      await route.fulfill({ status: 200, body: BLANK_PNG, contentType: 'image/png' });
    } else {
      await route.abort();
    }
  });
}

async function freezePage(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      img, [style*="background-image"] { visibility: hidden !important; }
    `,
  });
}

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

const authenticatedRoutes = [
  { name: 'dashboard', path: '/dashboard', heading: 'Dashboard' },
  { name: 'taste-hub', path: '/taste', heading: 'Taste' },
  { name: 'review-hub', path: '/review', heading: 'Reviews' },
  { name: 'create-tasting', path: '/create-tasting', heading: 'Create Tasting Session' },
  { name: 'review-create', path: '/review/create', heading: null },
  { name: 'settings', path: '/settings', heading: 'Settings' },
];

test.describe('authenticated routes — visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizePage(page);
    await login(page);
  });

  for (const vp of viewports) {
    for (const route of authenticatedRoutes) {
      test(`${route.name} — ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        if (route.heading) {
          await expect(page.getByRole('heading', { name: route.heading })).toBeVisible({
            timeout: 10000,
          });
        }

        await freezePage(page);
        await expect(page).toHaveScreenshot(`${route.name}-${vp.name}.png`, { fullPage: true });
      });
    }
  }
});

test.describe('authenticated routes — interaction smoke', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizePage(page);
    await login(page);
  });

  test('taste hub — primary ModeCard routes correctly', async ({ page }) => {
    await page.goto('/taste');
    await page.getByRole('button', { name: /Quick Tasting/i }).click();
    await expect(page).toHaveURL(/\/quick-tasting/);
  });

  test('taste hub — secondary ModeCard routes correctly', async ({ page }) => {
    await page.goto('/taste');
    await page.getByRole('button', { name: /My Tastings/i }).click();
    await expect(page).toHaveURL(/\/my-tastings/);
  });

  test('review hub — Structured Review routes to /review/create', async ({ page }) => {
    await page.goto('/review');
    await page.getByRole('button', { name: /Structured Review/i }).click();
    await expect(page).toHaveURL(/\/review\/create/);
  });

  test('review hub — Quick Note routes to /review/prose', async ({ page }) => {
    await page.goto('/review');
    await page.getByRole('button', { name: /Quick Note/i }).click();
    await expect(page).toHaveURL(/\/review\/prose/);
  });

  test('/review/structured redirects to /review/create', async ({ page }) => {
    await page.goto('/review/structured');
    await expect(page).toHaveURL(/\/review\/create/, { timeout: 8000 });
  });

  test('/review/history redirects to /review/my-reviews', async ({ page }) => {
    await page.goto('/review/history');
    await expect(page).toHaveURL(/\/review\/my-reviews/, { timeout: 8000 });
  });

  test('settings — dark mode toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    const toggle = page.getByRole('switch', { name: /dark mode/i });
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await expect(toggle).toBeFocused();
  });

  test('dashboard — Jump to section contains expected links', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Social Feed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Profile/i })).toBeVisible();
  });
});

test.describe('authenticated routes — accessibility smoke', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizePage(page);
    await login(page);
  });

  test('review/create — required fields have aria-required', async ({ page }) => {
    await page.goto('/review/create');
    await page.waitForLoadState('networkidle');
    const itemNameInput = page.locator('input[aria-required="true"]').first();
    await expect(itemNameInput).toBeVisible({ timeout: 10000 });
  });

  test('settings — notification switch has aria-checked', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    const notifSwitch = page.getByRole('switch', { name: /push notifications/i });
    await expect(notifSwitch).toHaveAttribute('aria-checked');
  });

  test('flavor wheels — controls visible on desktop, collapsible on mobile', async ({
    page,
  }) => {
    // Desktop: controls always shown
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/flavor-wheels');
    await page.waitForLoadState('networkidle');
    const desktopControls = page.locator('.hidden.sm\\:block select').first();
    await expect(desktopControls).toBeVisible({ timeout: 15000 });

    // Mobile: controls behind <details>
    await page.setViewportSize({ width: 390, height: 844 });
    const summary = page.getByText(/Filters & View Mode/i);
    await expect(summary).toBeVisible();
  });
});

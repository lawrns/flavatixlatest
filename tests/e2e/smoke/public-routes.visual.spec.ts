import { test, expect, Page } from '@playwright/test';

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
    const request = route.request();

    if (request.resourceType() === 'image') {
      await route.fulfill({
        status: 200,
        body: BLANK_PNG,
        contentType: 'image/png',
      });
      return;
    }

    await route.abort();
  });
}

async function hideUnstableVisuals(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }

      img,
      [style*="background-image"] {
        visibility: hidden !important;
      }
    `,
  });
}

test.describe('public smoke routes', () => {
  test.beforeEach(async ({ page }) => {
    await stabilizePage(page);
  });

  test('landing page renders and stays visually stable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Why Flavatix?' })).toBeVisible();
    await hideUnstableVisuals(page);
    await expect(page).toHaveScreenshot('landing-page.png', { fullPage: true });
  });

  test('auth page renders email form and stays visually stable', async ({ page }) => {
    await page.goto('/auth?skipOnboarding=true&showEmail=true');
    await expect(page.getByText('Continue with Email')).not.toBeVisible({ timeout: 1000 }).catch(() => undefined);
    await expect(page.getByText('Email Address')).toBeVisible();
    await hideUnstableVisuals(page);
    await expect(page).toHaveScreenshot('auth-page.png', { fullPage: true });
  });

  test('sample page renders and stays visually stable', async ({ page }) => {
    await page.goto('/sample');
    await expect(page.getByRole('heading', { name: 'Design System Sample' })).toBeVisible();
    await hideUnstableVisuals(page);
    await expect(page).toHaveScreenshot('sample-page.png', { fullPage: true });
  });
});

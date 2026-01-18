import { test, expect, Page } from '@playwright/test';

async function loginAndHandleOnboarding(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('flavatix:onboarding-seen', 'true');
  });

  await page.goto('/auth?skipOnboarding=true&showEmail=1');
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/dashboard')) {
    return;
  }

  const skipButton = page.getByRole('button', { name: 'Skip' });
  const continueEmail = page.getByRole('button', { name: /continue with email/i });
  const emailInput = page.getByPlaceholder('your@email.com');

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (page.url().includes('/dashboard')) {
      return;
    }

    if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipButton.click();
      await page.waitForTimeout(500);
    }

    if (await continueEmail.isVisible({ timeout: 1000 }).catch(() => false)) {
      await continueEmail.click();
      await page.waitForTimeout(500);
    }

    if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      break;
    }

    await page.waitForTimeout(500);
  }

  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('han@han.com');
  await page.getByPlaceholder('Enter your password').fill('hennie12');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('/dashboard');
}

test.describe('User Story: Whisky Journaling (Pro Vibe)', () => {
  test('should allow a user to create a whisky tasting and generate a flavor wheel', async ({ page }) => {
    // 1. Login
    await loginAndHandleOnboarding(page);

    // 2. Create Whisky Tasting
    await page.goto('/taste');
    await page.getByText(/quick tasting/i).click();

    // Select Whisky category (button grid or combobox)
    const whiskeyButton = page.getByRole('button', { name: 'Whiskey' });
    const whiskyButtonAlt = page.getByRole('button', { name: 'Whisky' });

    if (await whiskeyButton.isVisible().catch(() => false)) {
      await whiskeyButton.click();
    } else if (await whiskyButtonAlt.isVisible().catch(() => false)) {
      await whiskyButtonAlt.click();
    } else {
      await page.getByRole('combobox').click();
      await page.getByRole('option', { name: /whiskey/i }).click();
      await page.getByRole('button', { name: /start/i }).click();
    }

    // 3. Rename the auto-added item
    const itemHeading = page.getByRole('heading', { name: 'Item 1' });
    await expect(itemHeading).toBeVisible({ timeout: 10000 });
    await itemHeading.click();
    const nameInput = page.getByPlaceholder(/enter name/i);
    await nameInput.fill('Laphroaig 10');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Laphroaig 10')).toBeVisible();

    // 4. Record Notes
    await page.getByPlaceholder('Describe the aroma...').fill(
      'Intense peat smoke, seaweed, medicinal iodine, salt spray'
    );
    await page.getByPlaceholder('Describe the flavor, taste, and mouthfeel...').fill(
      'Deep smoke, seaweed, vanilla sweetness, black pepper, long finish'
    );
    await page.getByPlaceholder('Additional notes...').fill('Long, dry finish with coastal brine.');

    // Set score using fill (works with range inputs in Playwright)
    const scoreSlider = page.getByLabel('Overall Score');
    await scoreSlider.fill('92');
    // Wait for debounced update to complete (300ms debounce + buffer)
    await page.waitForTimeout(500);

    // 5. Complete Session
    // Wait for item to be marked complete (score > 0 marks it complete)
    const completeButton = page.getByRole('button', { name: /Complete Tasting/i });
    await expect(completeButton).toBeEnabled({ timeout: 30000 });
    await completeButton.click();
    await expect(page).toHaveURL(/\/tasting-summary\//, { timeout: 15000 });

    // 6. Verify Summary Page
    await expect(page.getByText('Laphroaig 10')).toBeVisible();
    await expect(page.getByText('92', { exact: true }).first()).toBeVisible();
  });
});

test.describe('User Story: Coffee Collaborative Study (Playful Vibe)', () => {
  test('should allow a host to navigate to study creation', async ({ page }) => {
    // Login
    await loginAndHandleOnboarding(page);

    // Navigate directly to new study form
    await page.goto('/taste/create/study/new');
    await expect(page.getByRole('heading', { name: 'Create Study Tasting' })).toBeVisible();

    // Verify the form fields are visible
    await expect(page.getByText('Tasting Name')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create & Start/i })).toBeVisible();
  });
});

test.describe('User Story: Mezcal Competition (High Stakes)', () => {
  test('should allow navigating to competition creation', async ({ page }) => {
    // Login
    await loginAndHandleOnboarding(page);

    // Navigate directly to new competition form
    await page.goto('/taste/create/competition/new');
    await expect(page.getByRole('heading', { name: 'Create Competition', level: 1 })).toBeVisible();

    // Verify form fields are visible
    await expect(page.getByText('Competition Name')).toBeVisible();
    await expect(page.getByRole('button', { name: /Next: Add Items/i })).toBeVisible();
  });
});

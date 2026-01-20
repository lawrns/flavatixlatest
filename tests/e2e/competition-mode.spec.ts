/**
 * E2E Test: Competition Mode
 * Tests competition creation flow with two-step wizard
 */

import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Competition Mode', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display competition creation page', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Check page heading
    await expect(page.getByRole('heading', { name: 'Create Competition' })).toBeVisible();

    // Check step indicators
    await expect(page.getByText('Setup & Parameters')).toBeVisible();
    await expect(page.getByText('Items & Answers')).toBeVisible();

    // Check form elements
    await expect(page.getByText('Competition Name')).toBeVisible();
    await expect(page.getByText('Base Category')).toBeVisible();
  });

  test('should fill competition setup form', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Fill competition name - find by placeholder
    const nameTextbox = page.getByRole('textbox', { name: /coffee cupping competition/i });
    await nameTextbox.fill('E2E Competition Test');

    // Select category via combobox - type and press Enter
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();
    await categoryCombobox.fill('Coffee');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify form filled
    await expect(nameTextbox).toHaveValue('E2E Competition Test');
  });

  test('should navigate to items step', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Fill competition name - find by placeholder
    await page.getByRole('textbox', { name: /coffee cupping competition/i }).fill('Test Competition');

    // Fill category
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();
    await categoryCombobox.fill('Coffee');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Next
    await page.getByRole('button', { name: /next.*add items/i }).click();
    await page.waitForLoadState('networkidle');

    // Should show Add Item button on step 2 (multiple may exist)
    await expect(page.getByRole('button', { name: /add item/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display blind tasting option', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Check for blind tasting checkbox
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).toBeVisible();
    await expect(blindCheckbox).not.toBeChecked();

    // Toggle it
    await blindCheckbox.click();
    await expect(blindCheckbox).toBeChecked();
  });
});


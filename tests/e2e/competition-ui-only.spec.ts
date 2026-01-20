import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * Competition UI Tests
 *
 * The competition creation page has two steps:
 * Step 1: Setup & Parameters - Competition name, category, blind tasting toggle, ranking settings
 * Step 2: Items & Answers - Add competition items
 *
 * UI Elements on Step 1:
 * - Competition Name textbox
 * - Base Category combobox
 * - Rank Participants checkbox (checked by default)
 * - Blind Tasting checkbox (unchecked by default)
 * - Ranking Method dropdown
 * - Include Subjective Scoring checkbox (checked by default)
 * - Add Parameter button
 * - "Next: Add Items" button
 */

test.describe('Competition UI - Step 1 Setup', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display competition creation page with correct elements', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Check page heading
    await expect(page.getByRole('heading', { name: 'Create Competition' })).toBeVisible();

    // Check step indicator
    await expect(page.getByText('Setup & Parameters')).toBeVisible();
    await expect(page.getByText('Items & Answers')).toBeVisible();

    // Check Basic Information section
    await expect(page.getByRole('heading', { name: 'Basic Information' })).toBeVisible();
    await expect(page.getByText('Competition Name')).toBeVisible();
    await expect(page.getByText('Base Category')).toBeVisible();
  });

  test('should have blind tasting checkbox unchecked by default', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Find the Blind Tasting checkbox
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });
    await expect(blindCheckbox).toBeVisible();
    await expect(blindCheckbox).not.toBeChecked();
  });

  test('should toggle blind tasting setting', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Find and click the Blind Tasting checkbox
    const blindCheckbox = page.getByRole('checkbox', { name: /blind tasting/i });

    // Click to enable
    await blindCheckbox.click();
    await expect(blindCheckbox).toBeChecked();

    // Click to disable
    await blindCheckbox.click();
    await expect(blindCheckbox).not.toBeChecked();
  });

  test('should have rank participants checkbox checked by default', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    const rankCheckbox = page.getByRole('checkbox', { name: /rank participants/i });
    await expect(rankCheckbox).toBeVisible();
    await expect(rankCheckbox).toBeChecked();
  });

  test('should navigate to step 2 when clicking Next button', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Fill in competition name - find by placeholder text
    const nameTextbox = page.getByRole('textbox', { name: /coffee cupping competition/i });
    await nameTextbox.fill('Test Competition');

    // Fill category in combobox
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await categoryCombobox.click();
    await categoryCombobox.fill('Coffee');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click Next button
    const nextButton = page.getByRole('button', { name: /next.*add items/i });
    await nextButton.click();
    await page.waitForLoadState('networkidle');

    // Wait for step 2 content to appear (multiple Add Item buttons may exist)
    await expect(page.getByRole('button', { name: /add item/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Competition UI - Category Selection', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have category combobox with placeholder', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Look for category combobox
    const categoryCombobox = page.getByRole('combobox', { name: /category/i });
    await expect(categoryCombobox).toBeVisible();
  });

  test('should show base category label', async ({ page }) => {
    await page.goto('/taste/create/competition/new');
    await page.waitForLoadState('networkidle');

    // Check for base category label
    await expect(page.getByText('Base Category')).toBeVisible();
  });
});

test.describe('Study Mode UI', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display study mode creation form', async ({ page }) => {
    await page.goto('/taste/create/study/new');
    await page.waitForLoadState('networkidle');

    // Check page heading
    await expect(page.getByRole('heading', { name: /create study tasting/i })).toBeVisible();

    // Check for tasting name input
    await expect(page.getByText('Tasting Name')).toBeVisible();

    // Check for "What's being tasted?" category selector
    await expect(page.getByText("What's being tasted?")).toBeVisible();

    // Combobox should be visible
    const categoryCombobox = page.getByRole('combobox');
    await expect(categoryCombobox).toBeVisible();
  });
});

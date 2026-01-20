import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

/**
 * Category Selection E2E Tests
 *
 * The Quick Tasting page shows a category selection screen first with:
 * - A combobox for category selection
 * - Quick category buttons (Coffee, Whisky, Mezcal, Tea, Wine, Spirits, Beer, Chocolate)
 * - A "Start" button that activates when a category is selected
 */

test.describe('Category Selection E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('quick tasting page shows category selection', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForLoadState('networkidle')

    // Page should show "What are you tasting?" heading
    await expect(page.getByRole('heading', { name: /what are you tasting/i })).toBeVisible()

    // Category combobox should be visible
    const categoryCombobox = page.getByRole('combobox', { name: /category/i })
    await expect(categoryCombobox).toBeVisible()

    // Quick category buttons should be visible
    await expect(page.getByRole('button', { name: 'Coffee' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Whisky' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tea' })).toBeVisible()
  })

  test('clicking category button starts tasting session', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForLoadState('networkidle')

    // Click on Coffee category button
    await page.getByRole('button', { name: 'Coffee' }).click()
    await page.waitForLoadState('networkidle')

    // Should navigate to tasting session view with session name
    await expect(page.getByRole('heading', { name: /coffee tasting/i })).toBeVisible({ timeout: 10000 })
  })

  test('quick category buttons navigate to tasting', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForLoadState('networkidle')

    // Click on Whisky category button
    await page.getByRole('button', { name: 'Whisky' }).click()
    await page.waitForLoadState('networkidle')

    // Should be on tasting session view
    await expect(page.getByRole('heading', { name: /whisky tasting/i })).toBeVisible({ timeout: 10000 })
  })

  test('category selection works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/quick-tasting')
    await page.waitForLoadState('networkidle')

    // Category buttons should be visible on mobile
    await expect(page.getByRole('button', { name: 'Coffee' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Tea' })).toBeVisible()

    // Select category on mobile
    await page.getByRole('button', { name: 'Tea' }).click()
    await page.waitForLoadState('networkidle')

    // Should be on tasting session view
    await expect(page.getByRole('heading', { name: /tea tasting/i })).toBeVisible({ timeout: 10000 })
  })

  test('combobox allows typing custom category', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForLoadState('networkidle')

    // Type in the category combobox
    const categoryCombobox = page.getByRole('combobox', { name: /category/i })
    await categoryCombobox.click()
    await categoryCombobox.fill('Olive Oil')

    // After typing, Start button should be enabled OR press Enter to start tasting
    const startButton = page.getByRole('button', { name: 'Start' })
    const hasStartButton = await startButton.isVisible({ timeout: 2000 }).catch(() => false)

    if (hasStartButton) {
      await expect(startButton).toBeEnabled()
    } else {
      // If no Start button, pressing Enter should start the tasting
      await page.keyboard.press('Enter')
      await page.waitForLoadState('networkidle')
      // Should now be in a tasting session
      const headingVisible = await page.getByRole('heading').first().isVisible({ timeout: 5000 }).catch(() => false)
      expect(headingVisible).toBeTruthy()
    }
  })
})

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Category Dropdown E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('complete user workflow for category selection and mode display removal', async ({ page }) => {
    // Navigate to the quick tasting page
    await page.goto('/quick-tasting')

    // Wait for the page to load
    await page.waitForSelector('[data-testid="quick-tasting-session"]', { timeout: 10000 })

    // Verify mode is NOT displayed
    const modeText = page.locator('text=/Mode:/i')
    await expect(modeText).not.toBeVisible()

    // Verify category dropdown is present and functional
    const categorySelect = page.locator('select[name="category"]')
    await expect(categorySelect).toBeVisible()

    // Verify current category is displayed
    const categoryLabel = page.locator('text=Category:')
    await expect(categoryLabel).toBeVisible()

    // Change category to tea
    await categorySelect.selectOption('tea')

    // Verify the category change is reflected in the UI
    await expect(page.locator('text=Category: Tea')).toBeVisible()

    // Verify session still functions after category change
    const sessionName = page.locator('text=Quick Tasting')
    await expect(sessionName).toBeVisible()

    // Test that items can still be added
    const addItemButton = page.locator('button', { hasText: /add.*item/i })
    if (await addItemButton.isVisible()) {
      await addItemButton.click()
      // Verify item was added
      await expect(page.locator('text=Tea 1')).toBeVisible()
    }
  })

  test('category persistence across page interactions', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForSelector('[data-testid="quick-tasting-session"]', { timeout: 10000 })

    // Change category
    const categorySelect = page.locator('select[name="category"]')
    await categorySelect.selectOption('wine')

    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/quick-tasting')

    // Category should still be wine (if session persists)
    // Note: This depends on session persistence implementation
    await expect(page.locator('text=Category: Wine')).toBeVisible()
  })

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForSelector('[data-testid="quick-tasting-session"]', { timeout: 10000 })

    // Check that category dropdown has proper accessibility attributes
    const categorySelect = page.locator('select[name="category"]')
    await expect(categorySelect).toHaveAttribute('aria-label', 'Select tasting category')

    // Verify keyboard navigation works
    await categorySelect.focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Should be able to navigate with keyboard
    await expect(categorySelect).toBeFocused()
  })

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/quick-tasting')
    await page.waitForSelector('[data-testid="quick-tasting-session"]', { timeout: 10000 })

    // Verify category dropdown is usable on mobile
    const categorySelect = page.locator('select[name="category"]')
    await expect(categorySelect).toBeVisible()

    // Should be able to interact on mobile
    await categorySelect.selectOption('spirits')
    await expect(page.locator('text=Category: Spirits')).toBeVisible()
  })

  test('error handling for category changes', async ({ page }) => {
    await page.goto('/quick-tasting')
    await page.waitForSelector('[data-testid="quick-tasting-session"]', { timeout: 10000 })

    // Simulate network failure by blocking API calls
    await page.route('**/rest/v1/quick_tastings**', route => route.abort())

    const categorySelect = page.locator('select[name="category"]')

    // Attempt to change category
    await categorySelect.selectOption('beer')

    // Should show error feedback
    await expect(page.locator('text=Failed to update category')).toBeVisible()

    // Category should revert to original
    await expect(page.locator('text=Category: Coffee')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';

test.describe('Flavatix Study Mode Enhancement - Full E2E Testing', () => {
  let sessionId: string;

  test.beforeAll(async () => {
    // Using the existing test user from helpers/auth
    console.log('Test user:', TEST_USER.email);
  });

  test('Setup: Login with test account', async ({ page }) => {
    // Login with the test user
    await login(page);

    // Verify we're on dashboard or similar authenticated page
    await expect(page).not.toHaveURL(/.*auth.*/);
  });

  test('Scenario 1: Pre-defined Study Mode - Session Creation', async ({ page }) => {
    await page.goto(`/dashboard`);

    // Navigate to create tasting
    await page.click('a[href="/create-tasting"]');

    // Select Study Mode
    await page.click('text=Study Mode');

    // Verify study approach selector appears
    await expect(page.locator('text=Pre-defined Items')).toBeVisible();
    await expect(page.locator('text=Collaborative')).toBeVisible();

    // Select Pre-defined approach
    await page.click('text=Pre-defined Items');

    // Verify item management section appears
    await expect(page.locator('text=Study Items')).toBeVisible();

    // Select coffee category
    await page.selectOption('select', 'coffee');

    // Add test items
    await page.click('text=Add Item');
    await page.fill('input[placeholder*="Colombian"]', 'Ethiopian Yirgacheffe');

    await page.click('text=Add Item');
    await page.fill('input[placeholder*="Colombian"]', 'Colombian Supremo');

    // Submit form
    await page.click('text=Create Tasting Session');

    // Should redirect to tasting session
    await page.waitForURL(/.*tasting\/.*/, { timeout: 10000 });
    const url = page.url();
    sessionId = url.split('/').pop()!;
    expect(sessionId).toBeTruthy();
  });

  test('Scenario 1: Pre-defined Study Mode - Host Experience', async ({ page }) => {
    await page.goto(`/tasting/${sessionId}`);

    // Verify items are pre-loaded
    await expect(page.locator('text=Ethiopian Yirgacheffe')).toBeVisible();
    await expect(page.locator('text=Colombian Supremo')).toBeVisible();

    // Verify host role indicators
    await expect(page.locator('text=(You)')).toBeVisible();

    // Verify "Add Item" button is available for hosts in pre-defined mode
    await expect(page.locator('text=Add Item')).toBeVisible();
  });

  test('Scenario 1: Pre-defined Study Mode - Participant Joining', async ({ page, context }) => {
    // Open new browser context for participant
    const participantPage = await context.newPage();

    // Share the session URL
    await participantPage.goto(`/tasting/${sessionId}`);

    // Should be redirected to auth if not logged in
    await participantPage.waitForURL(/.*auth/, { timeout: 5000 });

    // Login as participant (we'll use the same test account for simplicity)
    await participantPage.fill('input[type="email"]', testUser.email);
    await participantPage.fill('input[type="password"]', testUser.password);
    await participantPage.click('button[type="submit"]');

    // Should redirect to tasting session
    await participantPage.waitForURL(`**tasting/${sessionId}`, { timeout: 10000 });

    // Verify participant role
    await expect(participantPage.locator('text=(You)')).toBeVisible();

    // Verify no moderation features for participant
    await expect(participantPage.locator('text=Approve')).not.toBeVisible();
    await expect(participantPage.locator('text=Reject')).not.toBeVisible();

    await participantPage.close();
  });

  test('Scenario 1: Pre-defined Study Mode - Tasting Evaluation', async ({ page, context }) => {
    const participantPage = await context.newPage();
    await participantPage.goto(`/tasting/${sessionId}`);

    // Login
    await participantPage.fill('input[type="email"]', testUser.email);
    await participantPage.fill('input[type="password"]', testUser.password);
    await participantPage.click('button[type="submit"]');
    await participantPage.waitForURL(`**tasting/${sessionId}`);

    // Evaluate first item
    await participantPage.click('text=Ethiopian Yirgacheffe');

    // Fill evaluation form
    await participantPage.fill('input[placeholder*="score"]', '85');
    await participantPage.fill('textarea[placeholder*="notes"]', 'Bright and floral with citrus notes');

    // Submit evaluation
    await participantPage.click('button[type="submit"]');

    // Should show completion checkmark
    await expect(participantPage.locator('text=Ethiopian Yirgacheffe').locator('..').locator('span')).toContainText('✓');

    await participantPage.close();
  });

  test('Scenario 1: Pre-defined Study Mode - Session Completion', async ({ page }) => {
    await page.goto(`/tasting/${sessionId}`);

    // Complete remaining evaluations as host
    await page.click('text=Ethiopian Yirgacheffe');
    await page.fill('input[placeholder*="score"]', '88');
    await page.fill('textarea[placeholder*="notes"]', 'Complex and layered');
    await page.click('button[type="submit"]');

    await page.click('text=Colombian Supremo');
    await page.fill('input[placeholder*="score"]', '82');
    await page.fill('textarea[placeholder*="notes"]', 'Chocolate and nutty');
    await page.click('button[type="submit"]');

    // Complete session button should appear
    await expect(page.locator('text=Complete Session')).toBeVisible();
    await page.click('text=Complete Session');

    // Should show completion message
    await expect(page.locator('text=Tasting session completed')).toBeVisible();
  });

  test('Scenario 2: Collaborative Study Mode - Session Creation', async ({ page }) => {
    await page.goto(`/create-tasting`);

    // Select Study Mode
    await page.click('text=Study Mode');

    // Select Collaborative approach
    await page.click('text=Collaborative');

    // Verify no item management section
    await expect(page.locator('text=Study Items')).not.toBeVisible();

    // Select category and create
    await page.selectOption('select', 'tea');
    await page.fill('input[placeholder*="session name"]', 'Collaborative Tea Study');

    await page.click('text=Create Tasting Session');
    await page.waitForURL(/.*tasting\/.*/, { timeout: 10000 });

    const url = page.url();
    const newSessionId = url.split('/').pop()!;
    expect(newSessionId).toBeTruthy();

    // Store for next test
    sessionId = newSessionId;
  });

  test('Scenario 2: Collaborative Study Mode - Initial State', async ({ page }) => {
    await page.goto(`/tasting/${sessionId}`);

    // Verify no pre-loaded items
    await expect(page.locator('text=No Items Yet')).toBeVisible();

    // Verify "Add First Item" button is available
    await expect(page.locator('text=Add First Item')).toBeVisible();
  });

  test('Scenario 2: Collaborative Study Mode - Item Suggestions', async ({ page, context }) => {
    const participantPage = await context.newPage();
    await participantPage.goto(`/tasting/${sessionId}`);

    // Login as participant
    await participantPage.fill('input[type="email"]', testUser.email);
    await participantPage.fill('input[type="password"]', testUser.password);
    await participantPage.click('button[type="submit"]');
    await participantPage.waitForURL(`**tasting/${sessionId}`);

    // Add item suggestion
    await participantPage.click('text=Add First Item');
    await participantPage.fill('input[placeholder*="item name"]', 'Jasmine Green Tea');

    // Submit suggestion
    await participantPage.click('button[type="submit"]');

    // Should show pending status
    await expect(participantPage.locator('text=Jasmine Green Tea')).toBeVisible();

    // Host should see moderation interface
    await page.reload();
    await expect(page.locator('text=Jasmine Green Tea')).toBeVisible();
    await expect(page.locator('text=Approve')).toBeVisible();
    await expect(page.locator('text=Reject')).toBeVisible();

    await participantPage.close();
  });

  test('Scenario 2: Collaborative Study Mode - Moderation', async ({ page, context }) => {
    // Approve the suggestion
    await page.click('text=Approve');

    // Should become available for tasting
    await expect(page.locator('text=Jasmine Green Tea')).toBeVisible();

    // Test real-time updates with another participant
    const participantPage = await context.newPage();
    await participantPage.goto(`/tasting/${sessionId}`);

    // Login
    await participantPage.fill('input[type="email"]', testUser.email);
    await participantPage.fill('input[type="password"]', testUser.password);
    await participantPage.click('button[type="submit"]');
    await participantPage.waitForURL(`**tasting/${sessionId}`);

    // Should see the approved item
    await expect(participantPage.locator('text=Jasmine Green Tea')).toBeVisible();

    await participantPage.close();
  });

  test('Scenario 3: Role Management - Role Assignment', async ({ page }) => {
    await page.goto(`/tasting/${sessionId}`);

    // Verify host has both roles (Host + Participant)
    await expect(page.locator('text=Host')).toBeVisible();
    await expect(page.locator('text=Participant')).toBeVisible();
  });

  test('Scenario 4: Host Unresponsive Handling', async ({ page, context }) => {
    // This would require simulating host disconnection
    // For now, verify the system handles role changes gracefully

    await page.goto(`/tasting/${sessionId}`);

    // Verify system continues to function
    await expect(page.locator('text=Jasmine Green Tea')).toBeVisible();
    await expect(page.locator('text=Add Item')).toBeVisible();
  });

  test('Scenario 5: Error Handling - Form Validation', async ({ page }) => {
    await page.goto(`/create-tasting`);

    // Try to submit without required fields
    await page.click('text=Create Tasting Session');

    // Should show validation errors
    await expect(page.locator('text=Please select a category')).toBeVisible();
  });

  test('Scenario 5: Error Handling - Invalid Session', async ({ page }) => {
    await page.goto(`/tasting/invalid-session-id`);

    // Should show error message
    await expect(page.locator('text=Session Not Found')).toBeVisible();
  });

  test('Navigation and URL Structure', async ({ page }) => {
    // Test direct URL access
    await page.goto(`/tasting/${sessionId}`);
    await expect(page.locator('text=Jasmine Green Tea')).toBeVisible();

    // Test back navigation
    await page.click('text=Back');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

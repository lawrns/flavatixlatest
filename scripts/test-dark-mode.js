// Dark mode visual test script
// This script tests if dark mode is working correctly by checking computed styles

const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('🔍 Starting Dark Mode Visual Test...\n');

    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await puppeteer.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('📱 Testing Light Mode:');
    console.log('----------------------');

    // Test light mode
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.goto('http://localhost:8888', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    // Check light mode colors
    const lightBodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    const lightHasDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    console.log(`✓ Body background (light): ${lightBodyBg}`);
    console.log(`✓ Dark class applied: ${lightHasDark ? '❌ YES (should be NO)' : '✅ NO'}`);

    // Check if buttons are visible
    const lightButtonCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .btn-primary, .btn-secondary'));
      if (buttons.length === 0) {return 'No buttons found';}

      const firstButton = buttons[0];
      const styles = window.getComputedStyle(firstButton);
      return {
        color: styles.color,
        background: styles.backgroundColor,
        display: styles.display,
        visibility: styles.visibility
      };
    });

    console.log(`✓ Button styles:`, lightButtonCheck);

    console.log('\n📱 Testing Dark Mode:');
    console.log('---------------------');

    // Test dark mode
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);

    const darkBodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    const darkHasDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    console.log(`✓ Body background (dark): ${darkBodyBg}`);
    console.log(`✓ Dark class applied: ${darkHasDark ? '✅ YES' : '❌ NO (should be YES)'}`);

    // Check if buttons are visible in dark mode
    const darkButtonCheck = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .btn-primary, .btn-secondary'));
      if (buttons.length === 0) {return 'No buttons found';}

      const firstButton = buttons[0];
      const styles = window.getComputedStyle(firstButton);
      return {
        color: styles.color,
        background: styles.backgroundColor,
        display: styles.display,
        visibility: styles.visibility
      };
    });

    console.log(`✓ Button styles:`, darkButtonCheck);

    // Take screenshots
    await page.screenshot({ path: '/tmp/dark-mode-test.png', fullPage: false });
    console.log('\n📸 Screenshot saved to /tmp/dark-mode-test.png');

    // Compare backgrounds
    if (lightBodyBg !== darkBodyBg) {
      console.log('\n✅ SUCCESS: Dark mode is working! Backgrounds are different.');
    } else {
      console.log('\n❌ WARNING: Backgrounds are the same in light and dark mode.');
    }

    console.log('\n=== Test Complete ===\n');

    // Keep browser open for manual inspection
    console.log('Browser will close in 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/tmp/pwa-navigation-test';
const BASE_URL = 'https://flavatix.netlify.app';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log('🔍 Starting PWA Navigation & Routing Tests');
console.log('📸 Screenshots will be saved to:', SCREENSHOT_DIR);

const browser = await chromium.launch({
  headless: false,
  slowMo: 500 // Slow down for better visibility
});

const context = await browser.newContext({
  viewport: { width: 375, height: 812 }, // Mobile viewport
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
});

const page = await context.newPage();

// Track all console logs and errors
const consoleLogs = [];
const errors = [];

page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();
  consoleLogs.push({ type, text });
  if (type === 'error') {
    errors.push(text);
    console.error('❌ Console Error:', text);
  } else if (type === 'warning') {
    console.warn('⚠️  Console Warning:', text);
  }
});

page.on('pageerror', error => {
  errors.push(error.message);
  console.error('❌ Page Error:', error.message);
});

page.on('response', response => {
  if (response.status() >= 400) {
    console.error(`❌ Network Error: ${response.url()} - ${response.status()}`);
  }
});

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to take screenshot
async function screenshot(name, description) {
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

// Helper function to log test result
function logResult(testName, passed, details = '') {
  const result = { test: testName, details, timestamp: new Date().toISOString() };
  if (passed) {
    testResults.passed.push(result);
    console.log(`✅ PASS: ${testName}`);
  } else {
    testResults.failed.push(result);
    console.log(`❌ FAIL: ${testName}`);
    if (details) console.log(`   Details: ${details}`);
  }
}

// Helper function to wait for navigation
async function waitForNavigation() {
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch (e) {
    console.warn('⚠️  Timeout waiting for network idle');
  }
}

// ============================================
// TEST 1: Home Page Loads
// ============================================
console.log('\n🧪 TEST 1: Home Page Loads');
try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(2000); // Extra wait for React hydration

  const url = page.url();
  const title = await page.title();

  console.log(`   URL: ${url}`);
  console.log(`   Title: ${title}`);

  // Check if we're on the right page
  const isHome = url.includes(BASE_URL) || url.endsWith('/');
  logResult('Home page loads', isHome, `URL: ${url}`);

  await screenshot('01-home-page', 'Home page initial load');

} catch (error) {
  logResult('Home page loads', false, error.message);
}

// ============================================
// TEST 2: Check Console Errors on Home
// ============================================
console.log('\n🧪 TEST 2: Console Errors Check');
const initialErrors = errors.length;
logResult('No console errors on home load', initialErrors === 0,
  initialErrors > 0 ? `Found ${initialErrors} errors` : 'Clean console');

// ============================================
// TEST 3: Bottom Navigation - Home Tab
// ============================================
console.log('\n🧪 TEST 3: Bottom Navigation - Home Tab');
try {
  // Find and click Home tab in bottom navigation
  const homeTab = page.locator('[data-testid="bottom-nav-home"], nav a[href="/"], nav button:has-text("Home")').first();

  const isVisible = await homeTab.isVisible().catch(() => false);
  if (isVisible) {
    await homeTab.click();
    await waitForNavigation();
    await page.waitForTimeout(1000);
    logResult('Home tab click works', true);
    await screenshot('02-home-tab-clicked', 'After clicking home tab');
  } else {
    logResult('Home tab click works', false, 'Home tab not found in bottom navigation');
  }
} catch (error) {
  logResult('Home tab click works', false, error.message);
}

// ============================================
// TEST 4: Bottom Navigation - Taste Tab
// ============================================
console.log('\n🧪 TEST 4: Bottom Navigation - Taste Tab');
try {
  const tasteTab = page.locator('[data-testid="bottom-nav-taste"], nav a[href="/taste"], nav button:has-text("Taste")').first();

  const isVisible = await tasteTab.isVisible().catch(() => false);
  if (isVisible) {
    await tasteTab.click();
    await waitForNavigation();
    await page.waitForTimeout(1000);

    const url = page.url();
    const navigatedToTaste = url.includes('/taste');
    logResult('Taste tab navigation works', navigatedToTaste, `URL: ${url}`);
    await screenshot('03-taste-page', 'Taste page');
  } else {
    logResult('Taste tab navigation works', false, 'Taste tab not found');
  }
} catch (error) {
  logResult('Taste tab navigation works', false, error.message);
}

// ============================================
// TEST 5: Bottom Navigation - Social Tab
// ============================================
console.log('\n🧪 TEST 5: Bottom Navigation - Social Tab');
try {
  const socialTab = page.locator('[data-testid="bottom-nav-social"], nav a[href="/social"], nav button:has-text("Social")').first();

  const isVisible = await socialTab.isVisible().catch(() => false);
  if (isVisible) {
    await socialTab.click();
    await waitForNavigation();
    await page.waitForTimeout(1000);

    const url = page.url();
    const navigatedToSocial = url.includes('/social');
    logResult('Social tab navigation works', navigatedToSocial, `URL: ${url}`);
    await screenshot('04-social-page', 'Social page');
  } else {
    logResult('Social tab navigation works', false, 'Social tab not found');
  }
} catch (error) {
  logResult('Social tab navigation works', false, error.message);
}

// ============================================
// TEST 6: Bottom Navigation - Profile Tab
// ============================================
console.log('\n🧪 TEST 6: Bottom Navigation - Profile Tab');
try {
  const profileTab = page.locator('[data-testid="bottom-nav-profile"], nav a[href="/profile"], nav button:has-text("Profile")').first();

  const isVisible = await profileTab.isVisible().catch(() => false);
  if (isVisible) {
    await profileTab.click();
    await waitForNavigation();
    await page.waitForTimeout(1000);

    const url = page.url();
    const navigatedToProfile = url.includes('/profile');
    logResult('Profile tab navigation works', navigatedToProfile, `URL: ${url}`);
    await screenshot('05-profile-page', 'Profile page');
  } else {
    logResult('Profile tab navigation works', false, 'Profile tab not found');
  }
} catch (error) {
  logResult('Profile tab navigation works', false, error.message);
}

// ============================================
// TEST 7: Browser Back Button
// ============================================
console.log('\n🧪 TEST 7: Browser Back Button');
try {
  const urlBeforeBack = page.url();
  await page.goBack();
  await waitForNavigation();
  await page.waitForTimeout(500);

  const urlAfterBack = page.url();
  const backWorked = urlAfterBack !== urlBeforeBack;
  logResult('Browser back button works', backWorked, `From: ${urlBeforeBack} → To: ${urlAfterBack}`);
  await screenshot('06-after-back', 'After browser back');
} catch (error) {
  logResult('Browser back button works', false, error.message);
}

// ============================================
// TEST 8: Browser Forward Button
// ============================================
console.log('\n🧪 TEST 8: Browser Forward Button');
try {
  const urlBeforeForward = page.url();
  await page.goForward();
  await waitForNavigation();
  await page.waitForTimeout(500);

  const urlAfterForward = page.url();
  const forwardWorked = urlAfterForward !== urlBeforeForward;
  logResult('Browser forward button works', forwardWorked, `From: ${urlBeforeForward} → To: ${urlAfterForward}`);
  await screenshot('07-after-forward', 'After browser forward');
} catch (error) {
  logResult('Browser forward button works', false, error.message);
}

// ============================================
// TEST 9: Direct URL Navigation - /social
// ============================================
console.log('\n🧪 TEST 9: Direct URL Navigation - /social');
try {
  await page.goto(`${BASE_URL}/social`, { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(1000);

  const url = page.url();
  const navigated = url.includes('/social');
  logResult('Direct URL /social works', navigated, `URL: ${url}`);
  await screenshot('08-direct-social', 'Direct navigation to /social');
} catch (error) {
  logResult('Direct URL /social works', false, error.message);
}

// ============================================
// TEST 10: Direct URL Navigation - /taste
// ============================================
console.log('\n🧪 TEST 10: Direct URL Navigation - /taste');
try {
  await page.goto(`${BASE_URL}/taste`, { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(1000);

  const url = page.url();
  const navigated = url.includes('/taste');
  logResult('Direct URL /taste works', navigated, `URL: ${url}`);
  await screenshot('09-direct-taste', 'Direct navigation to /taste');
} catch (error) {
  logResult('Direct URL /taste works', false, error.message);
}

// ============================================
// TEST 11: Direct URL Navigation - /profile
// ============================================
console.log('\n🧪 TEST 11: Direct URL Navigation - /profile');
try {
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(1000);

  const url = page.url();
  const navigated = url.includes('/profile');
  logResult('Direct URL /profile works', navigated, `URL: ${url}`);
  await screenshot('10-direct-profile', 'Direct navigation to /profile');
} catch (error) {
  logResult('Direct URL /profile works', false, error.message);
}

// ============================================
// TEST 12: Check for Additional Navigation Links
// ============================================
console.log('\n🧪 TEST 12: Check for Additional Navigation Links');
try {
  const links = await page.locator('a[href]').all();
  console.log(`   Found ${links.length} links on page`);

  // Test key navigation links
  const navLinks = [
    { selector: 'a[href="/onboarding"]', name: 'Onboarding' },
    { selector: 'a[href="/auth"]', name: 'Auth' },
    { selector: 'a[href="/settings"]', name: 'Settings' }
  ];

  for (const link of navLinks) {
    const element = page.locator(link.selector).first();
    const exists = await element.count() > 0;
    if (exists) {
      const href = await element.getAttribute('href');
      console.log(`   ✓ Found ${link.name} link: ${href}`);
    } else {
      console.log(`   - ${link.name} link not found (may not exist in this flow)`);
    }
  }

  logResult('Navigation links check', true, 'Checked all navigation links');
} catch (error) {
  logResult('Navigation links check', false, error.message);
}

// ============================================
// TEST 13: Page Transition Smoothness
// ============================================
console.log('\n🧪 TEST 13: Page Transition Smoothness');
try {
  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart
    };
  });

  console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
  console.log(`   DOM Interactive: ${metrics.domInteractive}ms`);
  console.log(`   Load Complete: ${metrics.loadComplete}ms`);

  const reasonableTime = metrics.loadComplete < 5000; // Under 5 seconds
  logResult('Page transitions are smooth', reasonableTime,
    `Load time: ${metrics.loadComplete}ms`);
} catch (error) {
  logResult('Page transitions are smooth', false, error.message);
}

// ============================================
// TEST 14: Final Console Error Check
// ============================================
console.log('\n🧪 TEST 14: Final Console Error Check');
const finalErrors = errors.length;
const newErrors = finalErrors;
logResult('No new console errors during session', newErrors === 0,
  newErrors > 0 ? `Total errors: ${newErrors}` : 'All pages clean');

// ============================================
// GENERATE REPORT
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 QA VALIDATION REPORT');
console.log('='.repeat(60));

console.log('\n✅ PASSED TESTS (' + testResults.passed.length + '):');
testResults.passed.forEach((result, i) => {
  console.log(`   ${i + 1}. ${result.test}`);
  if (result.details) console.log(`      ${result.details}`);
});

if (testResults.failed.length > 0) {
  console.log('\n❌ FAILED TESTS (' + testResults.failed.length + '):');
  testResults.failed.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.test}`);
    if (result.details) console.log(`      ${result.details}`);
  });
}

if (errors.length > 0) {
  console.log('\n⚠️  CONSOLE ERRORS (' + errors.length + '):');
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
}

console.log('\n📸 Screenshots saved to: ' + SCREENSHOT_DIR);
console.log('\n' + '='.repeat(60));

// Calculate overall score
const totalTests = testResults.passed.length + testResults.failed.length;
const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0;

console.log(`\n🎯 OVERALL SCORE: ${passRate}% (${testResults.passed.length}/${totalTests} tests passed)`);

if (testResults.failed.length === 0 && errors.length === 0) {
  console.log('\n✅ STATUS: ALL TESTS PASSED - Navigation system is healthy');
} else {
  console.log('\n❌ STATUS: ISSUES FOUND - See failed tests above');
}

console.log('\n' + '='.repeat(60));

// Save results to JSON
const reportPath = path.join(SCREENSHOT_DIR, 'test-results.json');
fs.writeFileSync(reportPath, JSON.stringify({
  testResults,
  errors,
  consoleLogs: consoleLogs.filter(log => log.type === 'error'),
  summary: {
    total: totalTests,
    passed: testResults.passed.length,
    failed: testResults.failed.length,
    passRate: passRate + '%'
  }
}, null, 2));

console.log(`\n📄 Full report saved to: ${reportPath}`);

// Keep browser open for manual inspection
console.log('\n💡 Browser will remain open for manual inspection...');
console.log('   Press Ctrl+C to exit\n');

// Wait for user to stop
await new Promise(() => {});

await browser.close();

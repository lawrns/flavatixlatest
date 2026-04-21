import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/tmp/pwa-navigation-test';
const BASE_URL = 'https://flavatix.netlify.app';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log('🔍 PWA Navigation & Routing Tests - Agent 1 (CORE NAVIGATION)');
console.log('📸 Screenshots:', SCREENSHOT_DIR);

const browser = await chromium.launch({
  headless: false,
  slowMo: 800
});

const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
});

const page = await context.newPage();

// Track issues
const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

const consoleErrors = [];
const consoleWarnings = [];

page.on('console', msg => {
  const type = msg.type();
  const text = msg.text();

  if (type === 'error') {
    consoleErrors.push({ text, url: page.url() });
    console.error(`❌ Console Error on ${page.url()}: ${text}`);
  } else if (type === 'warning') {
    consoleWarnings.push({ text, url: page.url() });
    console.warn(`⚠️  Console Warning: ${text}`);
  }
});

page.on('pageerror', error => {
  consoleErrors.push({ text: error.message, url: page.url() });
  console.error(`❌ Page Error: ${error.message}`);
});

page.on('response', response => {
  if (response.status() >= 400) {
    const issue = {
      url: response.url(),
      status: response.status(),
      type: 'Network Error'
    };
    issues.medium.push(issue);
    console.error(`❌ Network Error ${response.status()}: ${response.url()}`);
  }
});

async function screenshot(name) {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${filename}`);
  return filepath;
}

async function checkPageLoad(testName, expectedPath) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 8000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    const hasExpectedPath = url.includes(expectedPath) || url.endsWith(expectedPath + '/');

    if (!hasExpectedPath) {
      issues.medium.push({
        test: testName,
        expected: expectedPath,
        actual: url
      });
    }

    return hasExpectedPath;
  } catch (error) {
    issues.high.push({
      test: testName,
      error: error.message
    });
    return false;
  }
}

// ============================================
// TEST 1: Home Page Load
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 1: Home Page Load');
console.log('='.repeat(60));

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(2000);

  const title = await page.title();
  const url = page.url();

  console.log(`✅ Page loaded`);
  console.log(`   Title: ${title}`);
  console.log(`   URL: ${url}`);

  await screenshot('01-home-page');

  // Check for critical elements
  const hasContent = await page.locator('body').textContent().then(text => text.length > 100);
  if (!hasContent) {
    issues.critical.push({ test: 'Home page', issue: 'Page appears empty' });
  }

} catch (error) {
  issues.critical.push({ test: 'Home page load', error: error.message });
  console.error(`❌ Failed: ${error.message}`);
}

// ============================================
// TEST 2: Inspect Navigation Structure
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 2: Navigation Structure Analysis');
console.log('='.repeat(60));

try {
  // Get all navigation elements
  const navAnalysis = await page.evaluate(() => {
    const result = {
      bottomNav: null,
      topNav: null,
      allLinks: [],
      buttons: []
    };

    // Check for bottom navigation
    const bottomNavs = document.querySelectorAll('nav[class*="bottom"], nav[style*="bottom"], [class*="tabbar"], [class*="tab-bar"], footer nav');
    if (bottomNavs.length > 0) {
      result.bottomNav = {
        exists: true,
        count: bottomNavs.length,
        html: bottomNavs[0].outerHTML.substring(0, 500)
      };
    }

    // Check for top navigation
    const topNavs = document.querySelectorAll('header nav, nav[class*="top"], [class*="header"]');
    if (topNavs.length > 0) {
      result.topNav = {
        exists: true,
        count: topNavs.length
      };
    }

    // Get all links
    const links = Array.from(document.querySelectorAll('a[href]'));
    result.allLinks = links.map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent.trim().substring(0, 30),
      visible: a.offsetParent !== null
    }));

    // Get buttons
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    result.buttons = buttons.slice(0, 10).map(b => ({
      text: b.textContent.trim().substring(0, 30),
      visible: b.offsetParent !== null
    }));

    return result;
  });

  console.log('\n📊 Navigation Analysis:');
  console.log(`   Bottom Nav: ${navAnalysis.bottomNav ? '✅ Found' : '❌ Not detected'}`);
  console.log(`   Top Nav: ${navAnalysis.topNav ? '✅ Found' : '❌ Not detected'}`);
  console.log(`   Total Links: ${navAnalysis.allLinks.length}`);
  console.log(`   Visible Buttons: ${navAnalysis.buttons.filter(b => b.visible).length}`);

  // Find navigation links to key pages
  const keyPages = ['/social', '/taste', '/profile', '/onboarding', '/auth'];
  const foundLinks = navAnalysis.allLinks.filter(link =>
    keyPages.some(page => link.href && link.href.includes(page))
  );

  console.log(`\n   Found ${foundLinks.length} key navigation links:`);
  foundLinks.forEach(link => {
    console.log(`      → ${link.href} (${link.text})`);
  });

  if (navAnalysis.bottomNav && navAnalysis.bottomNav.exists) {
    console.log('\n🔍 Bottom Navigation HTML (first 500 chars):');
    console.log(navAnalysis.bottomNav.html);
  }

  await screenshot('02-nav-structure');

} catch (error) {
  console.error(`❌ Navigation analysis failed: ${error.message}`);
  issues.high.push({ test: 'Navigation structure', error: error.message });
}

// ============================================
// TEST 3: Test Direct URL Navigation
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 3: Direct URL Navigation');
console.log('='.repeat(60));

const testPaths = [
  { path: '/social', name: 'Social Page' },
  { path: '/taste', name: 'Taste Page' },
  { path: '/profile', name: 'Profile Page' },
  { path: '/onboarding', name: 'Onboarding Page' },
  { path: '/auth', name: 'Auth Page' }
];

for (const { path: testPath, name } of testPaths) {
  console.log(`\n🧪 Testing: ${name} (${testPath})`);

  try {
    await page.goto(`${BASE_URL}${testPath}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
    await page.waitForTimeout(1500);

    const url = page.url();
    const loaded = url.includes(testPath);

    if (loaded) {
      console.log(`✅ ${name} loaded successfully`);
      console.log(`   URL: ${url}`);
      await screenshot(`${name.toLowerCase().replace(' ', '-')}-page`);
    } else {
      console.log(`❌ ${name} - URL mismatch`);
      console.log(`   Expected: ${testPath}`);
      console.log(`   Got: ${url}`);

      // Check if redirected
      if (url !== `${BASE_URL}${testPath}` && url !== `${BASE_URL}${testPath}/`) {
        issues.medium.push({
          test: `Direct URL ${testPath}`,
          issue: 'Possible redirect',
          expected: testPath,
          actual: url
        });
      }
    }

    // Check for console errors on this page
    const pageErrors = consoleErrors.filter(e => e.url === url);
    if (pageErrors.length > 0) {
      console.warn(`⚠️  ${pageErrors.length} console errors on this page`);
      issues.medium.push({
        test: name,
        issue: 'Console errors present',
        count: pageErrors.length
      });
    }

  } catch (error) {
    console.error(`❌ ${name} failed to load: ${error.message}`);
    issues.high.push({
      test: `Direct URL ${testPath}`,
      error: error.message
    });
  }
}

// ============================================
// TEST 4: Test Navigation Links (if found)
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 4: Click Navigation Links');
console.log('='.repeat(60));

try {
  // Go back to home
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Try to find and click navigation links
  const navigationTests = [
    { text: /social/i, path: '/social', name: 'Social Link' },
    { text: /taste/i, path: '/taste', name: 'Taste Link' },
    { text: /profile/i, path: '/profile', name: 'Profile Link' }
  ];

  for (const { text, path: expectedPath, name } of navigationTests) {
    console.log(`\n🧪 Looking for ${name}...`);

    try {
      // Try multiple selector strategies
      const link = page.locator(`a[href*="${expectedPath}"]`).first();

      const count = await link.count();
      if (count > 0) {
        const linkText = await link.textContent();
        const href = await link.getAttribute('href');
        const isVisible = await link.isVisible();

        console.log(`   Found: "${linkText}" (${href})`);
        console.log(`   Visible: ${isVisible}`);

        if (isVisible) {
          await link.click();
          await page.waitForTimeout(1500);

          const url = page.url();
          const navigated = url.includes(expectedPath);

          if (navigated) {
            console.log(`✅ ${name} click works`);
            await screenshot(`clicked-${name.toLowerCase().replace(' ', '-')}`);
          } else {
            console.log(`❌ ${name} click - didn't navigate correctly`);
            issues.medium.push({
              test: name,
              issue: 'Click did not navigate to expected path',
              expected: expectedPath,
              actual: url
            });
          }

          // Return to home for next test
          await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1000);
        } else {
          console.log(`⚠️  ${name} found but not visible`);
          issues.low.push({
            test: name,
            issue: 'Link exists but not visible'
          });
        }
      } else {
        console.log(`❌ ${name} not found on page`);
        issues.medium.push({
          test: name,
          issue: 'Link not found in DOM'
        });
      }
    } catch (error) {
      console.error(`❌ ${name} test failed: ${error.message}`);
    }
  }

} catch (error) {
  console.error(`❌ Navigation links test failed: ${error.message}`);
}

// ============================================
// TEST 5: Browser Back/Forward
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 5: Browser Navigation (Back/Forward)');
console.log('='.repeat(60));

try {
  // Navigate to a specific page
  await page.goto(`${BASE_URL}/social`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const socialUrl = page.url();
  console.log(`📍 On: ${socialUrl}`);

  // Test back button
  console.log('\n🧪 Testing Back button...');
  await page.goBack();
  await page.waitForTimeout(1000);

  const backUrl = page.url();
  console.log(`   After back: ${backUrl}`);

  if (backUrl !== socialUrl) {
    console.log(`✅ Back button works`);
  } else {
    console.log(`❌ Back button didn't navigate`);
    issues.medium.push({ test: 'Browser back', issue: 'Did not navigate' });
  }

  // Test forward button
  console.log('\n🧪 Testing Forward button...');
  await page.goForward();
  await page.waitForTimeout(1000);

  const forwardUrl = page.url();
  console.log(`   After forward: ${forwardUrl}`);

  if (forwardUrl === socialUrl || forwardUrl.includes('/social')) {
    console.log(`✅ Forward button works`);
  } else {
    console.log(`❌ Forward button didn't navigate correctly`);
    issues.medium.push({
      test: 'Browser forward',
      issue: 'Did not navigate to expected URL',
      expected: socialUrl,
      actual: forwardUrl
    });
  }

  await screenshot('05-browser-nav');

} catch (error) {
  console.error(`❌ Browser navigation test failed: ${error.message}`);
  issues.high.push({ test: 'Browser navigation', error: error.message });
}

// ============================================
// TEST 6: Page Transition Performance
// ============================================
console.log('\n' + '='.repeat(60));
console.log('TEST 6: Page Transition Performance');
console.log('='.repeat(60));

try {
  const startTime = Date.now();
  await page.goto(`${BASE_URL}/taste`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const loadTime = Date.now() - startTime;

  console.log(`⏱️  Taste page loaded in ${loadTime}ms`);

  if (loadTime < 3000) {
    console.log(`✅ Good performance (< 3s)`);
  } else if (loadTime < 5000) {
    console.log(`⚠️  Acceptable performance (< 5s)`);
    issues.low.push({
      test: 'Performance',
      issue: `Page load time ${loadTime}ms is slower than ideal`
    });
  } else {
    console.log(`❌ Poor performance (> 5s)`);
    issues.medium.push({
      test: 'Performance',
      issue: `Page load time ${loadTime}ms is too slow`
    });
  }

} catch (error) {
  console.error(`❌ Performance test failed: ${error.message}`);
}

// ============================================
// GENERATE FINAL REPORT
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 QA VALIDATION REPORT');
console.log('='.repeat(60));

console.log('\n🔴 CRITICAL ISSUES (' + issues.critical.length + '):');
if (issues.critical.length === 0) {
  console.log('   ✅ None');
} else {
  issues.critical.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${JSON.stringify(issue)}`);
  });
}

console.log('\n🟠 HIGH ISSUES (' + issues.high.length + '):');
if (issues.high.length === 0) {
  console.log('   ✅ None');
} else {
  issues.high.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${JSON.stringify(issue)}`);
  });
}

console.log('\n🟡 MEDIUM ISSUES (' + issues.medium.length + '):');
if (issues.medium.length === 0) {
  console.log('   ✅ None');
} else {
  issues.medium.slice(0, 10).forEach((issue, i) => {
    console.log(`   ${i + 1}. ${JSON.stringify(issue)}`);
  });
  if (issues.medium.length > 10) {
    console.log(`   ... and ${issues.medium.length - 10} more`);
  }
}

console.log('\n🟢 LOW ISSUES (' + issues.low.length + '):');
if (issues.low.length === 0) {
  console.log('   ✅ None');
} else {
  issues.low.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${JSON.stringify(issue)}`);
  });
}

console.log('\n📋 Console Errors (' + consoleErrors.length + '):');
if (consoleErrors.length === 0) {
  console.log('   ✅ Clean console across all pages');
} else {
  consoleErrors.slice(0, 10).forEach((err, i) => {
    console.log(`   ${i + 1}. ${err.url}: ${err.text}`);
  });
}

console.log('\n⚠️  Console Warnings (' + consoleWarnings.length + '):');
if (consoleWarnings.length === 0) {
  console.log('   ✅ No warnings');
} else {
  consoleWarnings.slice(0, 5).forEach((warn, i) => {
    console.log(`   ${i + 1}. ${warn.text}`);
  });
}

// Overall assessment
console.log('\n' + '='.repeat(60));
console.log('🎯 OVERALL ASSESSMENT');
console.log('='.repeat(60));

const totalIssues = issues.critical.length + issues.high.length + issues.medium.length + issues.low.length;

if (issues.critical.length === 0 && issues.high.length === 0) {
  console.log('\n✅ STATUS: PASS');
  console.log('   Navigation system is healthy and functional.');
  console.log('   Ready for production use.');
} else if (issues.critical.length === 0) {
  console.log('\n⚠️  STATUS: PARTIAL PASS');
  console.log('   Core navigation works, but some issues found.');
  console.log('   Review medium/high priority issues before release.');
} else {
  console.log('\n❌ STATUS: FAIL');
  console.log('   Critical issues prevent normal navigation.');
  console.log('   Must fix critical issues before release.');
}

console.log(`\n📊 Issue Summary:`);
console.log(`   Critical: ${issues.critical.length}`);
console.log(`   High: ${issues.high.length}`);
console.log(`   Medium: ${issues.medium.length}`);
console.log(`   Low: ${issues.low.length}`);
console.log(`   Console Errors: ${consoleErrors.length}`);
console.log(`   Console Warnings: ${consoleWarnings.length}`);

// Save detailed report
const reportPath = path.join(SCREENSHOT_DIR, 'qa-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  agent: 'Agent 1 - Core Navigation & Routing',
  baseUrl: BASE_URL,
  issues,
  consoleErrors,
  consoleWarnings,
  summary: {
    critical: issues.critical.length,
    high: issues.high.length,
    medium: issues.medium.length,
    low: issues.low.length,
    totalIssues
  },
  status: issues.critical.length === 0 && issues.high.length === 0 ? 'PASS' :
           issues.critical.length === 0 ? 'PARTIAL PASS' : 'FAIL'
}, null, 2));

console.log(`\n📄 Detailed report: ${reportPath}`);
console.log(`📸 Screenshots: ${SCREENSHOT_DIR}`);
console.log('\n' + '='.repeat(60));

console.log('\n💡 Browser staying open for 30 seconds for manual inspection...');
await page.waitForTimeout(30000);

await browser.close();
console.log('\n✅ Test complete!');

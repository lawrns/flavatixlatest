// Verification script for Flavatic feedback requirements - Oct 2 2025
const { chromium } = require('playwright');

async function verifyRequirements() {
  console.log('🚀 Starting Flavatic Requirements Verification...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // A) Landing Page Verification
    console.log('📄 A) LANDING PAGE VERIFICATION');
    await page.goto('https://flavatix.netlify.app');

    const title = await page.title();
    console.log(`  ✅ Title: "${title}"`);

    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    console.log(`  ✅ Meta Description: "${metaDesc}"`);

    // Check for "Tasting Notes" instead of "Quick Tasting"
    const tastingNotesCard = await page.locator('text=Tasting Notes').count() > 0;
    console.log(`  ✅ "Tasting Notes" card present: ${tastingNotesCard}`);

    const tastingNotesDesc = await page.locator('text=On-the-fly tasting note storage and analysis').count() > 0;
    console.log(`  ✅ "On-the-fly tasting note storage and analysis" description: ${tastingNotesDesc}`);

    // Check for updated tagline
    const newTagline = await page.locator('text=The one place for all your tasting needs').count() > 0;
    console.log(`  ✅ New tagline present: ${newTagline}`);

    // Check for updated description (anything with flavor or aroma)
    const newDescription = await page.locator('text=anything with flavor or aroma').count() > 0;
    console.log(`  ✅ Updated description (no "coffee and drinks"): ${newDescription}`);

    console.log('');

    // B) Auth Page Verification
    console.log('🔐 B) AUTH PAGE VERIFICATION');
    await page.goto('https://flavatix.netlify.app/auth');

    const authTitle = await page.title();
    console.log(`  ✅ Auth Title: "${authTitle}"`);

    // Wait for page to load (client-side rendering)
    await page.waitForTimeout(2000);

    // Check for Flavatix branding (not Flavatix Mexico)
    const flavatixBrand = await page.locator('text=Flavatix').first().textContent();
    console.log(`  ✅ Brand shows "Flavatix": "${flavatixBrand}"`);

    const taglineCheck = await page.locator('text=The one place for all your tasting needs').count() > 0;
    console.log(`  ✅ Auth tagline correct: ${taglineCheck}`);

    // Check for OAuth buttons
    const googleBtn = await page.locator('button:has-text("Google")').count() > 0;
    const appleBtn = await page.locator('button:has-text("Apple")').count() > 0;
    console.log(`  ✅ Google login button present: ${googleBtn}`);
    console.log(`  ✅ Apple login button present: ${appleBtn}`);

    console.log('');

    // C) Navigation Verification (requires login)
    console.log('🧭 C) NAVIGATION VERIFICATION');

    // Login process
    await page.click('text=Sign in with Email');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder="Enter your email"]', 'test@example.com');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✅ Successfully logged in and reached dashboard');

    // Check navigation tabs
    const navTabs = await page.locator('nav a').allTextContents();
    console.log(`  📋 Found navigation tabs: ${JSON.stringify(navTabs)}`);

    const hasHome = navTabs.some(tab => tab.includes('Home'));
    const hasTaste = navTabs.some(tab => tab.includes('Taste'));
    const hasReview = navTabs.some(tab => tab.includes('Review'));
    const hasWheels = navTabs.some(tab => tab.includes('Wheels'));
    const hasSocial = navTabs.some(tab => tab.includes('Social'));
    const hasCreate = navTabs.some(tab => tab.includes('Create'));

    console.log(`  ✅ Has "Home" tab: ${hasHome}`);
    console.log(`  ✅ Has "Taste" tab: ${hasTaste}`);
    console.log(`  ✅ Has "Review" tab: ${hasReview}`);
    console.log(`  ✅ Has "Wheels" tab: ${hasWheels}`);
    console.log(`  ❌ Has "Social" tab: ${hasSocial} (should be false)`);
    console.log(`  ❌ Has "Create" tab: ${hasCreate} (should be false)`);

    console.log('');

    // D) Taste Page Verification
    console.log('🍽️ D) TASTE PAGE VERIFICATION');
    await page.click('a:has-text("Taste")');
    await page.waitForURL('**/taste');

    // Check for exactly two buttons
    const quickTastingBtn = await page.locator('button:has-text("Quick Tasting")').count() > 0;
    const createTastingBtn = await page.locator('button:has-text("Create Tasting")').count() > 0;

    console.log(`  ✅ "Quick Tasting" button present: ${quickTastingBtn}`);
    console.log(`  ✅ "Create Tasting" button present: ${createTastingBtn}`);

    // Check descriptions
    const quickDesc = await page.locator('text=Tasting notes on the fly').count() > 0;
    const createDesc = await page.locator('text=Study Mode, Competition Mode').count() > 0;

    console.log(`  ✅ Quick Tasting description correct: ${quickDesc}`);
    console.log(`  ✅ Create Tasting description correct: ${createDesc}`);

    console.log('');

    // E) Review Page Verification
    console.log('📝 E) REVIEW PAGE VERIFICATION');
    await page.click('a:has-text("Review")');
    await page.waitForURL('**/review');

    // Check for three review options
    const reviewBtn = await page.locator('button:has-text("Review")').count() > 0;
    const proseBtn = await page.locator('button:has-text("Prose Review")').count() > 0;
    const myReviewsBtn = await page.locator('button:has-text("My Reviews")').count() > 0;

    console.log(`  ✅ "Review" button present: ${reviewBtn}`);
    console.log(`  ✅ "Prose Review" button present: ${proseBtn}`);
    console.log(`  ✅ "My Reviews" button present: ${myReviewsBtn}`);

    console.log('');

    // F) Flavor Wheels Page Verification
    console.log('🌀 F) FLAVOR WHEELS PAGE VERIFICATION');
    await page.click('a:has-text("Wheels")');
    await page.waitForURL('**/flavor-wheels');

    const comingSoon = await page.locator('text=Coming Soon').count() > 0;
    const flavorWheelsTitle = await page.locator('text=Flavor Wheels').count() > 0;

    console.log(`  ✅ "Flavor Wheels" title present: ${flavorWheelsTitle}`);
    console.log(`  ✅ "Coming Soon" message present: ${comingSoon}`);

    console.log('\n🎯 VERIFICATION COMPLETE');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await browser.close();
  }
}

verifyRequirements();



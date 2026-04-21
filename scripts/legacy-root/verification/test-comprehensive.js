const puppeteer = require('puppeteer');

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive Flavatix application test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('❌ Browser Console Error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  // Listen for failed requests
  page.on('requestfailed', request => {
    console.error('❌ Failed Request:', request.url(), request.failure().errorText);
  });
  
  try {
    // Test 1: Home page
    console.log('🏠 Testing home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.title();
    console.log('✅ Home page loaded:', title);
    
    // Test 2: Navigate to create tasting
    console.log('🍷 Testing create tasting page...');
    await page.click('a[href="/auth"]');
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // For now, let's go directly to create-tasting to test the form
    await page.goto('http://localhost:3000/create-tasting', { waitUntil: 'networkidle2' });
    
    // Check if we're redirected to auth (expected behavior)
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      console.log('✅ Properly redirected to auth page when not logged in');
      
      // Test auth page
      console.log('🔐 Testing auth page...');
      await page.waitForSelector('h1', { timeout: 10000 });
      
      // Try to go back to create-tasting without auth
      await page.goto('http://localhost:3000/create-tasting', { waitUntil: 'networkidle2' });
      
      // Should redirect back to auth
      if (page.url().includes('/auth')) {
        console.log('✅ Auth protection working correctly');
      }
    }
    
    // Test 3: Test invalid tasting ID
    console.log('🛡️ Testing invalid tasting ID handling...');
    await page.goto('http://localhost:3000/tasting/invalid-uuid', { waitUntil: 'networkidle2' });
    
    // Should show error page
    const errorText = await page.evaluate(() => {
      return document.body.textContent || '';
    });
    
    if (errorText.includes('Session Not Found') || errorText.includes('invalid input syntax for type uuid')) {
      console.log('✅ Invalid UUID error handling working');
    } else {
      console.log('⚠️ Unexpected response for invalid UUID');
    }
    
    // Test 4: Test non-existent but valid UUID
    console.log('🔍 Testing non-existent tasting ID...');
    await page.goto('http://localhost:3000/tasting/00000000-0000-0000-0000-000000000000', { waitUntil: 'networkidle2' });
    
    const notFoundText = await page.evaluate(() => {
      return document.body.textContent || '';
    });
    
    if (notFoundText.includes('Session Not Found') || notFoundText.includes('not found')) {
      console.log('✅ Non-existent tasting handling working');
    }
    
    // Test 5: Test other pages
    console.log('📄 Testing other pages...');
    
    const pagesToTest = [
      { url: '/sample', name: 'Sample page' },
      { url: '/social', name: 'Social page' },
      { url: '/profile', name: 'Profile page' },
      { url: '/quick-tasting', name: 'Quick tasting page' }
    ];
    
    for (const testPage of pagesToTest) {
      try {
        console.log(`🔍 Testing ${testPage.name}...`);
        await page.goto(`http://localhost:3000${testPage.url}`, { waitUntil: 'networkidle2' });
        
        // Check if page loaded without major errors
        const pageText = await page.evaluate(() => {
          return document.body.textContent || '';
        });
        
        if (pageText.length > 100) { // Basic check that content loaded
          console.log(`✅ ${testPage.name} loaded successfully`);
        } else {
          console.log(`⚠️ ${testPage.name} may have issues - minimal content`);
        }
      } catch (error) {
        console.error(`❌ Error testing ${testPage.name}:`, error.message);
      }
    }
    
    // Test 6: Test API endpoints
    console.log('🔌 Testing API endpoints...');
    
    // Test create tasting API with invalid data
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/tastings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Missing required fields
            mode: 'study'
          })
        });
        return {
          status: res.status,
          data: await res.json()
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (response.status === 400) {
      console.log('✅ API validation working - returns 400 for missing fields');
    } else {
      console.log('⚠️ API validation may have issues:', response);
    }
    
    console.log('🎉 Comprehensive test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
runComprehensiveTest().catch(console.error);

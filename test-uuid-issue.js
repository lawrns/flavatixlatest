const puppeteer = require('puppeteer');

async function testTastingCreationFlow() {
  console.log('🔍 Testing tasting creation flow to identify UUID issue...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  // Listen for console logs and errors
  page.on('console', msg => {
    console.log(`🖥️ Console [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.error('❌ Failed Request:', request.url(), request.failure().errorText);
  });
  
  // Monitor network requests
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`📡 API Response: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Test the API endpoint directly
    console.log('🔌 Testing API endpoint directly...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/tastings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
            mode: 'study',
            study_approach: 'collaborative',
            category: 'coffee',
            session_name: 'Test Session'
          })
        });
        
        const data = await response.json();
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📊 API Response:', apiResponse);
    
    // Test with invalid data
    console.log('🧪 Testing API with invalid user_id...');
    
    const invalidResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/tastings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'undefined', // This might be the issue
            mode: 'study',
            study_approach: 'collaborative',
            category: 'coffee',
            session_name: 'Test Session'
          })
        });
        
        const data = await response.json();
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📊 Invalid API Response:', invalidResponse);
    
    // Test tasting page with invalid UUID
    console.log('🛡️ Testing tasting page with invalid UUID...');
    await page.goto('http://localhost:3000/tasting/undefined', { waitUntil: 'networkidle2' });
    
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.textContent,
        url: window.location.href
      };
    });
    
    console.log('📄 Page Content:', pageContent);
    
    // Test with "undefined" string
    console.log('🔍 Testing with "undefined" string...');
    await page.goto('http://localhost:3000/tasting/undefined', { waitUntil: 'networkidle2' });
    
    // Wait a bit to see if error appears
    await page.waitForTimeout(2000);
    
    const errorContent = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('*');
      for (const element of errorElements) {
        if (element.textContent && element.textContent.includes('Session Not Found')) {
          return element.textContent;
        }
      }
      return null;
    });
    
    console.log('🔍 Error content found:', errorContent);
    
    console.log('✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testTastingCreationFlow().catch(console.error);

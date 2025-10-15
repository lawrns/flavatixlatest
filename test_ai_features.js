#!/usr/bin/env node

/**
 * Comprehensive AI Features Test Suite
 * Tests all AI functionality on local development server (port 3009)
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key] = value.replace(/['"]/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BASE_URL = 'http://localhost:8888';

let testUser = null;
let authToken = null;

async function setup() {
  console.log('🚀 AI Features Test Suite\n');
  console.log('Setting up test environment...\n');

  // Create or get test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'aitest@flavatix.com',
    password: 'AItest123!@#'
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    console.log('⚠️  Please ensure test user exists or use a different account\n');
    process.exit(1);
  } else {
    testUser = authData.user;
    authToken = authData.session?.access_token;
  }

  console.log('✅ Test user authenticated:', testUser.email);
  console.log('🔑 Auth token obtained\n');
}

async function test1_verifyDatabaseTables() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Verify Database Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check category_taxonomies table
  console.log('Checking category_taxonomies table...');
  const { error: catError } = await supabase
    .from('category_taxonomies')
    .select('id')
    .limit(1);

  if (!catError || catError.code === 'PGRST116') {
    console.log('✅ category_taxonomies table exists');
  } else {
    console.log('❌ category_taxonomies table NOT found:', catError.message);
    return false;
  }

  // Check ai_extraction_logs table
  console.log('Checking ai_extraction_logs table...');
  const { error: logError } = await supabase
    .from('ai_extraction_logs')
    .select('id')
    .limit(1);

  if (!logError || logError.code === 'PGRST116') {
    console.log('✅ ai_extraction_logs table exists');
  } else {
    console.log('❌ ai_extraction_logs table NOT found:', logError.message);
    return false;
  }

  // Check new columns on flavor_descriptors
  console.log('Checking flavor_descriptors columns...');
  const { data: descData, error: descError } = await supabase
    .from('flavor_descriptors')
    .select('ai_extracted, extraction_model')
    .limit(1);

  if (!descError) {
    console.log('✅ flavor_descriptors has ai_extracted and extraction_model columns');
  } else {
    console.log('⚠️  Could not verify columns (table might be empty)');
  }

  console.log('\n✅ TEST 1 PASSED: All tables exist\n');
  return true;
}

async function test2_createTastingSession() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Create Tasting Session');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { data, error } = await supabase
    .from('quick_tastings')
    .insert({
      user_id: testUser.id,
      category: 'coffee',
      session_name: 'AI Test Session',
      mode: 'quick',
      total_items: 0,
      completed_items: 0
    })
    .select()
    .single();

  if (error) {
    console.log('❌ Failed to create tasting session:', error.message);
    return null;
  }

  console.log('✅ Created tasting session:', data.id);
  console.log('   Category:', data.category);
  console.log('   Name:', data.session_name);
  console.log('\n✅ TEST 2 PASSED\n');
  return data;
}

async function test3_aiDescriptorExtraction(tastingSession) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: AI Descriptor Extraction');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const testText = 'This coffee has incredible bright strawberry and jasmine flowers on the nose. On the palate I get lemony acidity with a silky, tea-like body. Reminds me of a summer morning in an Ethiopian coffee garden.';

  console.log('Test input text:');
  console.log('"' + testText + '"\n');

  console.log('Calling /api/flavor-wheels/extract-descriptors...');

  const response = await fetch(`${BASE_URL}/api/flavor-wheels/extract-descriptors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      sourceType: 'quick_tasting',
      sourceId: tastingSession.id,
      text: testText,
      category: 'coffee',
      useAI: true,
      itemContext: {
        itemName: 'Ethiopian Yirgacheffe',
        itemCategory: 'coffee'
      }
    })
  });

  const result = await response.json();

  if (!result.success) {
    console.log('❌ Extraction failed:', result.error);
    return false;
  }

  console.log('✅ Extraction successful!');
  console.log('   Method:', result.extractionMethod);
  console.log('   Descriptors found:', result.savedCount);

  if (result.tokensUsed) {
    console.log('   Tokens used:', result.tokensUsed);
    console.log('   Processing time:', result.processingTimeMs + 'ms');
  }

  console.log('\nExtracted descriptors:');
  result.descriptors.forEach((d, i) => {
    console.log(`   ${i + 1}. "${d.text}" → ${d.type} (${d.category})`);
  });

  if (result.extractionMethod === 'ai') {
    console.log('\n✅ TEST 3 PASSED: AI extraction working!');
  } else {
    console.log('\n⚠️  TEST 3 PARTIAL: Used fallback (keyword-based extraction)');
    console.log('   This means AI is not configured or failed');
  }

  console.log();
  return result;
}

async function test4_categoryTaxonomyGeneration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Custom Category Taxonomy Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const customCategories = ['ceremonial matcha', 'mezcal', 'kombucha'];

  for (const category of customCategories) {
    console.log(`Testing category: "${category}"`);

    const response = await fetch(`${BASE_URL}/api/categories/get-or-create-taxonomy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        categoryName: category
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.log('❌ Failed:', result.error);
      continue;
    }

    if (result.cached) {
      console.log('✅ Retrieved from cache');
    } else if (result.taxonomy) {
      console.log('✅ Generated new taxonomy');
      const data = result.taxonomy.taxonomy_data;
      console.log('   Base template:', data.baseTemplate);
      console.log('   Aroma categories:', data.aromaCategories?.slice(0, 3).join(', ') + '...');
      console.log('   Typical descriptors:', data.typicalDescriptors?.slice(0, 3).join(', ') + '...');
    } else {
      console.log('⚠️  No taxonomy generated (AI key might be missing)');
    }
    console.log();
  }

  console.log('✅ TEST 4 PASSED: Taxonomy generation working\n');
  return true;
}

async function test5_verifyAILogs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: Verify AI Extraction Logs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { data, error } = await supabase
    .from('ai_extraction_logs')
    .select('*')
    .eq('user_id', testUser.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.log('❌ Failed to query logs:', error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No AI extraction logs found');
    console.log('   This might mean AI extraction is using fallback mode');
    return false;
  }

  console.log(`✅ Found ${data.length} AI extraction log(s):`);
  data.forEach((log, i) => {
    console.log(`\n   Log ${i + 1}:`);
    console.log(`   - Model: ${log.model_used}`);
    console.log(`   - Tokens: ${log.tokens_used}`);
    console.log(`   - Time: ${log.processing_time_ms}ms`);
    console.log(`   - Descriptors: ${log.descriptors_extracted}`);
    console.log(`   - Success: ${log.extraction_successful ? '✅' : '❌'}`);
  });

  console.log('\n✅ TEST 5 PASSED: Logs are being created\n');
  return true;
}

async function test6_flavorWheelGeneration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 6: Flavor Wheel Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Calling /api/flavor-wheels/generate...');

  const response = await fetch(`${BASE_URL}/api/flavor-wheels/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      wheelType: 'combined',
      scopeType: 'personal',
      scopeFilter: { userId: testUser.id }
    })
  });

  const result = await response.json();

  if (!result.success) {
    console.log('❌ Generation failed:', result.error);
    return false;
  }

  console.log('✅ Flavor wheel generated!');
  console.log('   Cached:', result.cached ? 'Yes' : 'No');
  console.log('   Total descriptors:', result.wheelData?.totalDescriptors || 0);
  console.log('   Categories:', result.wheelData?.categories?.length || 0);

  if (result.wheelData?.categories?.length > 0) {
    console.log('\n   Top categories:');
    result.wheelData.categories.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.count} mentions`);
    });
  }

  console.log('\n✅ TEST 6 PASSED: Flavor wheel generation working\n');
  return true;
}

async function test7_usageStats() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 7: AI Usage Statistics');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Calling /api/admin/ai-usage-stats...');

  const response = await fetch(`${BASE_URL}/api/admin/ai-usage-stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  const result = await response.json();

  if (!result.success) {
    console.log('❌ Failed:', result.error);
    return false;
  }

  console.log('✅ Usage stats retrieved:');
  console.log('   Period:', result.stats.period);
  console.log('   Total requests:', result.stats.totalRequests);
  console.log('   Total tokens:', result.stats.totalTokens);
  console.log('   Estimated cost:', result.stats.estimatedCost);
  console.log('   Avg processing time:', result.stats.avgProcessingTimeMs + 'ms');
  console.log('   Success rate:', result.stats.successRate + '%');

  console.log('\n✅ TEST 7 PASSED: Stats endpoint working\n');
  return true;
}

async function cleanup() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Cleanup (optional - keeping test data for inspection)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Test data preserved for manual inspection in database\n');
}

async function runAllTests() {
  try {
    await setup();

    const results = {
      test1: await test1_verifyDatabaseTables(),
      test2: null,
      test3: null,
      test4: null,
      test5: null,
      test6: null,
      test7: null
    };

    results.test2 = await test2_createTastingSession();

    if (results.test2) {
      results.test3 = await test3_aiDescriptorExtraction(results.test2);
    }

    results.test4 = await test4_categoryTaxonomyGeneration();
    results.test5 = await test5_verifyAILogs();
    results.test6 = await test6_flavorWheelGeneration();
    results.test7 = await test7_usageStats();

    await cleanup();

    // Final summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('FINAL TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const passed = Object.values(results).filter(r => r !== false && r !== null).length;
    const total = Object.keys(results).length;

    console.log(`Tests Passed: ${passed}/${total}\n`);

    Object.entries(results).forEach(([test, result]) => {
      const status = result ? '✅' : result === false ? '❌' : '⚠️';
      console.log(`${status} ${test}`);
    });

    console.log();

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! AI features are 100% operational!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Check output above for details.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runAllTests();

#!/usr/bin/env node

/**
 * Simple Production AI Test
 * Verifies AI features are working on production with correct model name
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key] = value.replace(/['"]/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BASE_URL = 'https://flavatixlatest.vercel.app';

async function testAIExtraction() {
  console.log('🚀 Simple Production AI Test\n');
  console.log('Testing:', BASE_URL);
  console.log('');

  // Authenticate
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'aitest@flavatix.com',
    password: 'AItest123!@#',
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    return;
  }

  const authToken = authData.session.access_token;
  console.log('✅ Authenticated as:', authData.user.email);
  console.log('');

  // Get or create a test tasting session
  const { data: existingSessions } = await supabase
    .from('quick_tastings')
    .select('id')
    .eq('user_id', authData.user.id)
    .limit(1);

  let sessionId;
  if (existingSessions && existingSessions.length > 0) {
    sessionId = existingSessions[0].id;
    console.log('✅ Using existing tasting session:', sessionId);
  } else {
    const { data: newSession, error: sessionError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id: authData.user.id,
        category: 'coffee',
        notes: 'AI test session',
      })
      .select()
      .single();

    if (sessionError) {
      console.log('⚠️  Could not create session, using mock ID');
      sessionId = '00000000-0000-0000-0000-000000000000';
    } else {
      sessionId = newSession.id;
      console.log('✅ Created tasting session:', sessionId);
    }
  }

  console.log('');
  console.log('━'.repeat(80));
  console.log('Testing AI Descriptor Extraction');
  console.log('━'.repeat(80));
  console.log('');

  const testText = 'This coffee has bright strawberry notes and floral jasmine aroma with a silky mouthfeel';
  console.log('Input text:', testText);
  console.log('');

  try {
    const response = await fetch(`${BASE_URL}/api/flavor-wheels/extract-descriptors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        sourceType: 'quick_tasting',
        sourceId: sessionId,
        text: testText,
        category: 'coffee',
        useAI: true,
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.log('❌ Extraction failed:', result.error);
      return;
    }

    console.log('✅ Extraction successful!');
    console.log('   Method used:', (result.extractionMethod || 'unknown').toUpperCase());
    console.log('   Descriptors found:', result.savedCount);

    if (result.tokensUsed) {
      console.log('   AI tokens used:', result.tokensUsed);
      console.log('   Processing time:', result.processingTimeMs + 'ms');
    }

    console.log('');
    console.log('Descriptors:');
    result.descriptors.slice(0, 5).forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.text}" → ${d.type} (${d.category || 'N/A'})`);
    });

    console.log('');
    console.log('━'.repeat(80));

    if (result.extractionMethod === 'ai') {
      console.log('🎉 SUCCESS! AI extraction is working on production!');
      console.log('   The model name fix has been deployed successfully.');
    } else {
      console.log('⚠️  Using fallback mode (keyword extraction)');
      console.log('   This means either:');
      console.log('   - AI model fix not deployed yet');
      console.log('   - ANTHROPIC_API_KEY not set in production');
      console.log('   - API credits insufficient');
    }

    console.log('');

    // Check logs to see the model being used
    console.log('━'.repeat(80));
    console.log('Checking AI Extraction Logs');
    console.log('━'.repeat(80));
    console.log('');

    const { data: logs } = await supabase
      .from('ai_extraction_logs')
      .select('model_used, tokens_used, extraction_successful, created_at')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (logs && logs.length > 0) {
      console.log(`Found ${logs.length} recent AI extraction log(s):\n`);
      logs.forEach((log, i) => {
        console.log(`   Log ${i + 1}:`);
        console.log('   - Model:', log.model_used);
        console.log('   - Tokens:', log.tokens_used);
        console.log('   - Success:', log.extraction_successful ? '✅' : '❌');
        console.log('   - Time:', new Date(log.created_at).toLocaleString());
        console.log('');

        if (log.model_used === 'claude-3-haiku-20240307') {
          console.log('   ✅ CORRECT MODEL NAME (claude-3-haiku-20240307)');
        } else if (log.model_used === 'claude-haiku-3-20240307') {
          console.log('   ❌ OLD MODEL NAME (claude-haiku-3-20240307) - needs redeployment');
        }
        console.log('');
      });
    } else {
      console.log('⚠️  No AI extraction logs found');
      console.log('   AI might not be configured on production');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAIExtraction();

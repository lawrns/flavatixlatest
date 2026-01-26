#!/usr/bin/env node

/**
 * Quick Setup Script for PWA Analytics
 *
 * This script helps you set up PWA analytics tracking for Flavatix.
 * Run: node setup_analytics.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupAnalytics() {
  console.log('\n🔧 Flavatix PWA Analytics Setup\n');
  console.log('This script will guide you through setting up analytics tracking.\n');

  // Check if .env.local exists
  const envPath = path.join(__dirname, '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env.local file\n');
  } else {
    console.log('⚠️  No .env.local found. Creating new file.\n');
    if (fs.existsSync('.env.example')) {
      envContent = fs.readFileSync('.env.example', 'utf8');
    }
  }

  // Ask for Google Analytics ID
  const gaId = await question('Enter your Google Analytics 4 Measurement ID (G-XXXXXXXXXX) or press Enter to skip: ');
  if (gaId.trim()) {
    if (envContent.includes('NEXT_PUBLIC_GA_ID=')) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_GA_ID=.*/,
        `NEXT_PUBLIC_GA_ID=${gaId.trim()}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_GA_ID=${gaId.trim()}\n`;
    }
    console.log('✅ Google Analytics 4 configured\n');
  } else {
    console.log('⏭️  Skipping Google Analytics (optional)\n');
  }

  // Save .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment variables updated\n');

  // Ask about database migration
  const runMigration = await question('Apply database migration now? (yes/no): ');

  if (runMigration.toLowerCase() === 'yes' || runMigration.toLowerCase() === 'y') {
    console.log('\n🔄 Applying database migration...\n');

    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Cannot apply migration: Missing Supabase credentials');
      console.log('   Please apply migration manually in Supabase SQL Editor:');
      console.log('   File: migrations/add_analytics_tables.sql\n');
    } else {
      console.log('⚠️  Automatic migration not yet implemented.');
      console.log('   Please apply migration manually in Supabase SQL Editor:');
      console.log('   File: migrations/add_analytics_tables.sql\n');
    }
  } else {
    console.log('\n⏭️  Skipping migration. Apply it later with:');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Run the SQL from: migrations/add_analytics_tables.sql\n');
  }

  // Summary
  console.log('✅ Analytics setup complete!\n');
  console.log('📝 Next steps:\n');
  console.log('   1. Apply database migration (if not done already)');
  console.log('   2. Start the dev server: npm run dev');
  console.log('   3. Check browser console for analytics initialization');
  console.log('   4. View metrics at: /admin/analytics (create this route)');
  console.log('   5. Monitor GA4 at: https://analytics.google.com\n');
  console.log('📖 Documentation: ANALYTICS_IMPLEMENTATION.md\n');

  rl.close();
}

setupAnalytics().catch(console.error);

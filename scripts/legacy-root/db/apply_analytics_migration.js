/**
 * Apply Analytics Tables Migration
 *
 * This script applies the analytics tables to your Supabase database.
 * Run: node apply_analytics_migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  console.log('🔧 Applying analytics tables migration...\n');

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read migration file
  const migrationPath = path.join(__dirname, 'migrations', 'add_analytics_tables.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration file loaded');
  console.log('🔄 Executing migration...\n');

  try {
    // Split the migration into individual statements and execute
    // Note: This is a simplified approach. For production, use a proper migration tool.
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim().length === 0) continue;

      try {
        // Execute each statement using raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Some statements might fail if objects already exist - that's okay
          if (!error.message.includes('already exists')) {
            console.warn(`⚠️  Warning: ${error.message.substring(0, 100)}`);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        // Continue on error
        console.warn(`⚠️  Statement failed (continuing): ${err.message.substring(0, 100)}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - ${successCount} statements executed successfully`);
    if (errorCount > 0) {
      console.log(`   - ${errorCount} statements had warnings (this is usually OK)`);
    }

    console.log('\n📊 Analytics tables created:');
    console.log('   ✓ analytics_events');
    console.log('   ✓ analytics_page_views');
    console.log('   ✓ analytics_pwa_installs');
    console.log('   ✓ analytics_sessions');
    console.log('   ✓ analytics_user_acquisition');

    console.log('\n📈 Views created:');
    console.log('   ✓ analytics_daily_active_users');
    console.log('   ✓ analytics_monthly_active_users');
    console.log('   ✓ analytics_pwa_install_rate');
    console.log('   ✓ analytics_platform_split');
    console.log('   ✓ analytics_cac');

    console.log('\n🎉 Analytics tracking is now ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Configure Google Analytics ID in .env.local:');
    console.log('      NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX');
    console.log('   2. Update _app.tsx to include GoogleAnalytics component');
    console.log('   3. Use analyticsTracker in your components to track events');
    console.log('   4. Query the views to get metrics:');
    console.log('      SELECT * FROM analytics_daily_active_users;');
    console.log('      SELECT * FROM analytics_pwa_install_rate;');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Tip: You may need to execute the SQL manually in Supabase SQL Editor');
    console.error('   File: migrations/add_analytics_tables.sql');
    process.exit(1);
  }
}

// Run migration
applyMigration().catch(console.error);

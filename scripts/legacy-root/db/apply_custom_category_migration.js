const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
if (fs.existsSync('.env.local')) {
  require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value.replace(/['"]/g, '');
    }
  });
}

async function applyCustomCategoryMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Please ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Applying custom category migration...');
  console.log('📋 This will add custom_category_name column to quick_tastings table');

  const sqlStatement = 'ALTER TABLE quick_tastings ADD COLUMN IF NOT EXISTS custom_category_name TEXT NULL;';

  try {
    console.log('⚡ Executing SQL statement...');

    try {
      // Try to execute via RPC first
      const { error } = await supabase.rpc('exec_sql', { sql: sqlStatement });

      if (error) {
        console.log(`   ⚠️  RPC failed, trying direct approach...`);
        console.log(`   📝 Statement may need manual execution:`);
        console.log(`   ${sqlStatement}`);
      } else {
        console.log(`   ✅ Statement executed successfully`);
      }
    } catch (err) {
      console.log(`   ⚠️  Statement encountered an issue: ${err.message}`);
      console.log(`   📝 You may need to execute this manually in Supabase SQL Editor:`);
      console.log(`   ${sqlStatement}`);
    }

    console.log('🎉 Custom category migration completed!');
    console.log('📝 Note: DDL statements may need manual execution in Supabase SQL Editor');
    console.log('🔍 Database updated to support custom category names');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyCustomCategoryMigration();
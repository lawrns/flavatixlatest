const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Please ensure you have:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=...');
    console.log('SUPABASE_SERVICE_ROLE_KEY=...');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sql = fs.readFileSync('migrations/flavor_wheels_schema.sql', 'utf8');

  console.log('🚀 Applying Flavor Wheels schema migration...');
  console.log('📋 This will create:');
  console.log('   - flavor_descriptors table');
  console.log('   - flavor_wheels table');
  console.log('   - aroma_molecules table');
  console.log('   - Associated indexes, triggers, and RLS policies');
  console.log('');

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

      console.log(`⚡ [${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Try to execute via RPC if available
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          // RPC method not available, need manual execution
          console.log(`   ⚠️  Needs manual execution via Supabase SQL Editor`);
          skipCount++;
        } else {
          console.log(`   ✅ Executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ⚠️  Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Needs manual execution: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (skipCount > 0 || errorCount > 0) {
      console.log('\n📝 MANUAL STEPS REQUIRED:');
      console.log('1. Open Supabase Dashboard: ' + supabaseUrl.replace('https://', 'https://app.supabase.com/project/'));
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of migrations/flavor_wheels_schema.sql');
      console.log('4. Click "Run" to execute the migration');
      console.log('\n✨ This is normal for DDL operations with Supabase JS client');
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }

    console.log('\n🔍 After manual execution, verify tables exist:');
    console.log('   - flavor_descriptors');
    console.log('   - flavor_wheels');
    console.log('   - aroma_molecules');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();

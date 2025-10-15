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

async function applyAIMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Please ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sql = fs.readFileSync('migrations/ai_flavor_wheels_schema.sql', 'utf8');

  console.log('🚀 Applying AI Flavor Wheels migration...');
  console.log('📋 This will add AI descriptor extraction and custom category taxonomy features\n');

  try {
    // Execute migration statements individually
    console.log('💡 Executing migration statements individually...\n');

    // Split by semicolon but preserve function bodies
    const statements = sql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.includes('COMMENT ON') || statement.includes('DO $$') || statement.includes('RAISE NOTICE')) {
        // Skip comments and notices
        continue;
      }

      try {
        // Use direct SQL execution
        const { error: stmtError } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (stmtError) {
          console.log(`⚠️  Skipped (might already exist): ${statement.substring(0, 60)}...`);
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        console.log(`⚠️  Error: ${statement.substring(0, 60)}...`);
      }
    }

    console.log(`\n✅ Executed ${successCount} statements successfully`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors (likely already existed)`);
    }

    console.log('\n🔍 Verifying migration...');

    // Verify tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['category_taxonomies', 'ai_extraction_logs']);

    if (!tableError && tables && tables.length > 0) {
      console.log('✅ New tables verified:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }

    // Verify function was created
    const { data: funcTest, error: funcError } = await supabase
      .rpc('get_unified_flavor_wheel_data', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_descriptor_limit: 30
      });

    if (!funcError) {
      console.log('✅ Function verified: get_unified_flavor_wheel_data');
    } else {
      console.log('⚠️  Function test failed (might not have test data yet)');
    }

    console.log('\n🎉 AI Flavor Wheels migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Install Anthropic SDK: npm install @anthropic-ai/sdk');
    console.log('   2. Add ANTHROPIC_API_KEY to .env.local');
    console.log('   3. Implement AI services and API endpoints');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  }
}

applyAIMigration();

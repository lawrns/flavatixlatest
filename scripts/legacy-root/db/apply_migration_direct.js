const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  console.log('🔑 Using service role key for direct database access...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const sql = fs.readFileSync('migrations/flavor_wheels_schema.sql', 'utf8');

  console.log('🚀 Applying Flavor Wheels Migration...\n');

  try {
    // Execute the full SQL file
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n📝 Manual execution required. Please:');
      console.log('1. Open Supabase Dashboard SQL Editor');
      console.log('2. Copy contents of migrations/flavor_wheels_schema.sql');
      console.log('3. Execute the SQL');
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');
    console.log('\n🔍 Verifying tables...');

    // Verify tables were created
    const { data: tables, error: verifyError } = await supabase
      .from('flavor_descriptors')
      .select('id')
      .limit(1);

    if (verifyError && verifyError.code === '42P01') {
      console.log('⚠️  Tables not found. Trying alternative approach...');
      console.log('\n📝 Please execute the migration manually via Supabase SQL Editor');
      process.exit(1);
    }

    console.log('✅ Tables verified!');
    console.log('\n🎉 Migration complete! Flavor wheels feature is ready.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual execution required via Supabase SQL Editor');
    process.exit(1);
  }
}

applyMigration();

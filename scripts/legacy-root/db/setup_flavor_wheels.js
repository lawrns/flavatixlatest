const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function setupFlavorWheels() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🚀 Setting up Flavor Wheels Feature...\n');

  try {
    // Step 1: Check if tables already exist
    console.log('1️⃣  Checking existing tables...');
    const { error: checkError } = await supabase
      .from('flavor_descriptors')
      .select('id')
      .limit(1);

    if (!checkError || checkError.code !== '42P01') {
      console.log('✅ Tables already exist!');
      console.log('\n🎉 Flavor Wheels feature is ready to use!');
      process.exit(0);
    }

    console.log('⚠️  Tables not found. Manual setup required.\n');
    console.log('📋 SETUP INSTRUCTIONS:');
    console.log('═'.repeat(60));
    console.log('\nThe database schema must be created via Supabase SQL Editor:');
    console.log('\n1. Open Supabase Dashboard:');
    console.log(`   ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`);
    console.log('\n2. Navigate to: SQL Editor (left sidebar)');
    console.log('\n3. Click "New Query"');
    console.log('\n4. Copy the ENTIRE contents of this file:');
    console.log('   migrations/flavor_wheels_schema.sql');
    console.log('\n5. Paste into SQL Editor');
    console.log('\n6. Click "Run" (or press Cmd/Ctrl + Enter)');
    console.log('\n7. Verify success - you should see:');
    console.log('   - flavor_descriptors table created');
    console.log('   - flavor_wheels table created');
    console.log('   - aroma_molecules table created');
    console.log('   - 8 rows inserted into aroma_molecules');
    console.log('\n8. Run this script again to verify: node setup_flavor_wheels.js');
    console.log('\n' + '═'.repeat(60));
    console.log('\n💡 TIP: The migration file is located at:');
    console.log('   ' + __dirname + '/migrations/flavor_wheels_schema.sql');
    console.log('\n📖 For detailed info, see: FLAVOR_WHEELS_SETUP.md\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupFlavorWheels();

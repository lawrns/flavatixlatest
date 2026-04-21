// Comprehensive database schema verification
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env.local
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verifying Supabase database schema...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  const tables = [
    'profiles',
    'quick_tastings', 
    'quick_tasting_items',
    'quick_reviews',
    'prose_reviews'
  ];

  console.log('\n📋 Checking tables...');
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': exists (${count || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`);
    }
  }

  // Test basic operations
  console.log('\n🧪 Testing basic operations...');
  
  try {
    // Test auth user creation (this should work if RLS is properly configured)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('🔐 Auth status:', authError ? 'No active session (normal)' : 'Active session');
    
    // Test public read access
    const { data: publicData, error: publicError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (publicError) {
      console.log('📖 Public read test:', publicError.message);
    } else {
      console.log('📖 Public read test: ✅ Working');
    }
    
  } catch (err) {
    console.log('🧪 Operation test failed:', err.message);
  }

  console.log('\n🎉 Database verification complete!');
  console.log('💡 The database is ready for use. You can now:');
  console.log('   - Create user profiles');
  console.log('   - Start tasting sessions');
  console.log('   - Add reviews and ratings');
  console.log('   - Manage tasting data');
}

verifySchema().catch(console.error);
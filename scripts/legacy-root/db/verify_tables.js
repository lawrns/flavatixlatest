const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    process.env[key] = value;
  }
});

async function verifyTables() {
  console.log('🔍 Verifying social tables after Supabase push...\n');
  
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const tables = ['tasting_likes', 'tasting_comments', 'tasting_shares', 'user_follows'];
  let allExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allExist = false;
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (e) {
      console.log(`❌ ${table}: Table not found or inaccessible`);
      allExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allExist) {
    console.log('🎉 SUCCESS: All social tables are ready!');
    console.log('🚀 Your social feed is now fully functional with database persistence!');
  } else {
    console.log('⚠️  Some tables are missing. Please run the SQL in your Supabase dashboard.');
    console.log('📋 Copy the SQL from social_tables.sql and run it in SQL Editor.');
  }
  console.log('='.repeat(50));
}

verifyTables().catch(console.error);

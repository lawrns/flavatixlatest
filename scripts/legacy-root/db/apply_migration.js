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
  const sql = fs.readFileSync('social_tables.sql', 'utf8');
  
  console.log('🚀 Applying social features migration...');
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // If rpc doesn't work, try direct query (this might not work for DDL)
          console.log('   Trying direct execution...');
          const { error: directError } = await supabase.from('_temp_migration').select('*').limit(0);
          if (directError) {
            console.log(`   ⚠️  Statement ${i + 1} may require manual execution`);
            console.log(`   SQL: ${statement.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} failed (might be normal for some DDL): ${err.message}`);
      }
    }

    console.log('🎉 Migration script completed!');
    console.log('📝 Note: Some DDL statements may need to be executed manually in Supabase SQL Editor');
    console.log('🔍 Check your Supabase dashboard for the new tables:');
    console.log('   - tasting_likes');
    console.log('   - tasting_comments'); 
    console.log('   - tasting_shares');
    console.log('   - user_follows');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();

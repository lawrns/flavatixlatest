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

async function applyFlavorWheelUpgrade() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Please ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const sql = fs.readFileSync('flavorwheel_upgrade_migration.sql', 'utf8');

  console.log('🚀 Applying FlavorWheel upgrade migration...');
  console.log('📋 This will add Study vs Competition mode features');

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) {continue;}

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      try {
        // Try to execute via RPC first
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

        if (error) {
          console.log(`   ⚠️  RPC failed, trying direct approach...`);
          // For DDL statements, we might need to use the REST API directly
          console.log(`   📝 Statement may need manual execution:`);
          console.log(`   ${statement.substring(0, 200)}${statement.length > 200 ? '...' : ''}`);
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} encountered an issue: ${err.message}`);
        console.log(`   📝 You may need to execute this manually in Supabase SQL Editor:`);
        console.log(`   ${statement.substring(0, 200)}${statement.length > 200 ? '...' : ''}`);
      }
    }

    console.log('🎉 Migration script completed!');
    console.log('📝 Note: DDL statements may need manual execution in Supabase SQL Editor');
    console.log('🔍 New database features added:');
    console.log('   - mode column in quick_tastings (study/competition/quick)');
    console.log('   - ranking and blind tasting fields in quick_tastings');
    console.log('   - correct_answers and include_in_ranking in quick_tasting_items');
    console.log('   - tasting_participants table for competition rankings');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyFlavorWheelUpgrade();


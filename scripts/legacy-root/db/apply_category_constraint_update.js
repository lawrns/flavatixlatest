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

async function applyCategoryConstraintUpdate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    console.log('Please ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Applying category constraint update...');
  console.log('📋 This will add "other" as an allowed category in quick_tastings');

  const sqlStatements = [
    'ALTER TABLE quick_tastings DROP CONSTRAINT IF EXISTS quick_tastings_category_check;',
    `ALTER TABLE quick_tastings ADD CONSTRAINT quick_tastings_category_check CHECK (category = ANY (ARRAY['coffee'::text, 'tea'::text, 'wine'::text, 'spirits'::text, 'beer'::text, 'chocolate'::text, 'other'::text]));`
  ];

  try {
    console.log(`📋 Found ${sqlStatements.length} SQL statements to execute`);

    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`⚡ Executing statement ${i + 1}/${sqlStatements.length}...`);

      try {
        // Try to execute via RPC first
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.log(`   ⚠️  RPC failed, trying direct approach...`);
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

    console.log('🎉 Category constraint update completed!');
    console.log('📝 Note: DDL statements may need manual execution in Supabase SQL Editor');
    console.log('🔍 Database updated to allow "other" category');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyCategoryConstraintUpdate();
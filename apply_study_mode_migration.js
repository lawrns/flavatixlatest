// Apply Study Mode database migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key] = value.replace(/['"]/g, ''); // Remove quotes if present
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔄 Applying Study Mode database schema...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'migrations', 'study_mode_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split the SQL into individual statements, handling multiline comments and complex statements
    const statements = [];
    let currentStatement = '';
    let inComment = false;

    const lines = sql.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('--')) {continue;}

      // Handle multiline comments
      if (trimmed.startsWith('/*')) {
        inComment = true;
        continue;
      }
      if (trimmed.endsWith('*/')) {
        inComment = false;
        continue;
      }
      if (inComment) {continue;}

      currentStatement += line + '\n';

      // If line ends with semicolon, it's a complete statement
      if (trimmed.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    // Execute each statement using raw SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        try {
          // Use the REST API to execute raw SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: statement })
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Error in statement ${i + 1}:`, errorData);
            console.error('Statement:', statement.substring(0, 200) + '...');
            process.exit(1);
          }

          const result = await response.json();
          if (result.error) {
            console.error(`❌ Error in statement ${i + 1}:`, result.error);
            console.error('Statement:', statement.substring(0, 200) + '...');
            process.exit(1);
          }

        } catch (fetchError) {
          console.error(`❌ Network error in statement ${i + 1}:`, fetchError);
          process.exit(1);
        }
      }
    }

    console.log('✅ Study Mode database schema applied successfully!');

    // Verify the tables were created
    console.log('\n🔍 Verifying Study Mode tables...');
    const studyTables = [
      'study_sessions',
      'study_categories',
      'study_participants',
      'study_items',
      'study_responses',
      'study_ai_cache'
    ];

    for (const table of studyTables) {
      try {
        const { count, error } = await supabase
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

    console.log('\n🎉 Study Mode migration complete!');
    console.log('🚀 The Study Mode feature is now ready for testing.');

  } catch (error) {
    console.error('❌ Unexpected error during migration:', error);
    process.exit(1);
  }
}

applyMigration();

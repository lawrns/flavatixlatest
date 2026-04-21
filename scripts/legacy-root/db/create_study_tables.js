// Create Study Mode tables manually
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/['"]/g, '');
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Creating Study Mode tables...');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  const statements = [
    // 1. study_sessions
    `CREATE TABLE IF NOT EXISTS public.study_sessions (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      base_category VARCHAR(100) NOT NULL,
      host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
      session_code VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE
    )`,

    // 2. study_categories
    `CREATE TABLE IF NOT EXISTS public.study_categories (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      has_text BOOLEAN DEFAULT FALSE,
      has_scale BOOLEAN DEFAULT FALSE,
      has_boolean BOOLEAN DEFAULT FALSE,
      scale_max INTEGER,
      rank_in_summary BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT valid_scale_max CHECK (
        (has_scale = FALSE AND scale_max IS NULL) OR
        (has_scale = TRUE AND scale_max >= 5 AND scale_max <= 100)
      ),
      CONSTRAINT at_least_one_param CHECK (has_text OR has_scale OR has_boolean)
    )`,

    // 3. study_participants
    `CREATE TABLE IF NOT EXISTS public.study_participants (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(session_id, user_id)
    )`,

    // 4. study_items
    `CREATE TABLE IF NOT EXISTS public.study_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      photo_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // 5. study_responses
    `CREATE TABLE IF NOT EXISTS public.study_responses (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
      participant_id UUID NOT NULL REFERENCES public.study_participants(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES public.study_items(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.study_categories(id) ON DELETE CASCADE,
      text_response TEXT,
      scale_response INTEGER,
      boolean_response BOOLEAN,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT valid_scale_response CHECK (
        (scale_response IS NULL) OR
        (scale_response >= 1 AND scale_response <= 100)
      ),
      UNIQUE(session_id, participant_id, item_id, category_id)
    )`,

    // 6. study_ai_cache
    `CREATE TABLE IF NOT EXISTS public.study_ai_cache (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
      item_id UUID REFERENCES public.study_items(id) ON DELETE CASCADE,
      category_id UUID REFERENCES public.study_categories(id) ON DELETE CASCADE,
      descriptor_type VARCHAR(50) NOT NULL,
      descriptors JSONB DEFAULT '[]'::jsonb,
      confidence_score DECIMAL(3,2),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
      UNIQUE(session_id, item_id, category_id, descriptor_type)
    )`
  ];

  console.log('📋 Executing table creation statements...');

  for (let i = 0; i < statements.length; i++) {
    console.log(`⚡ Creating table ${i + 1}/6...`);

    try {
      // Try using the RPC method first
      const { error } = await supabase.rpc('exec_sql', { sql: statements[i] });
      if (error) {throw error;}
      console.log(`   ✅ Table ${i + 1} created successfully`);
    } catch (err) {
      console.log(`   ⚠️  RPC failed, trying direct REST API...`);

      // Fallback to direct REST API
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: statements[i] })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`   ✅ Table ${i + 1} created successfully (via REST)`);
      } catch (restError) {
        console.error(`❌ Failed to create table ${i + 1}:`, restError.message);
        console.error('SQL:', statements[i].substring(0, 100) + '...');
        // Continue with other tables
      }
    }
  }

  console.log('\n🎉 Table creation complete!');
  console.log('🔍 Verifying tables exist...');

  // Verify tables
  const tables = ['study_sessions', 'study_categories', 'study_participants', 'study_items', 'study_responses', 'study_ai_cache'];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists (${count || 0} records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

createTables().catch(console.error);

// Create Study Mode tables using direct PostgreSQL connection
const { Client } = require('pg');
const fs = require('fs');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/['"]/g, '');
  }
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to database...');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const statements = [
      // Enable UUID extension
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

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

    console.log('📋 Creating tables...');

    for (let i = 0; i < statements.length; i++) {
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      try {
        await client.query(statements[i]);
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        console.error('SQL:', statements[i].substring(0, 100) + '...');
        // Continue with other statements
      }
    }

    // Create indexes
    const indexStatements = [
      `CREATE INDEX IF NOT EXISTS idx_study_sessions_host_id ON public.study_sessions(host_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_sessions_session_code ON public.study_sessions(session_code)`,
      `CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON public.study_sessions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_study_categories_session_id ON public.study_categories(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_categories_sort_order ON public.study_categories(session_id, sort_order)`,
      `CREATE INDEX IF NOT EXISTS idx_study_participants_session_id ON public.study_participants(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_participants_user_id ON public.study_participants(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_items_session_id ON public.study_items(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_responses_session_item ON public.study_responses(session_id, item_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_responses_participant ON public.study_responses(participant_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_ai_cache_session ON public.study_ai_cache(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_study_ai_cache_expires ON public.study_ai_cache(expires_at)`
    ];

    console.log('\n📋 Creating indexes...');
    for (let i = 0; i < indexStatements.length; i++) {
      console.log(`⚡ Creating index ${i + 1}/${indexStatements.length}...`);
      try {
        await client.query(indexStatements[i]);
        console.log(`   ✅ Index ${i + 1} created successfully`);
      } catch (error) {
        console.error(`❌ Index ${i + 1} failed:`, error.message);
      }
    }

    // Enable RLS
    const rlsStatements = [
      `ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.study_categories ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.study_participants ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.study_responses ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE public.study_ai_cache ENABLE ROW LEVEL SECURITY`
    ];

    console.log('\n📋 Enabling Row Level Security...');
    for (let i = 0; i < rlsStatements.length; i++) {
      console.log(`⚡ Enabling RLS ${i + 1}/${rlsStatements.length}...`);
      try {
        await client.query(rlsStatements[i]);
        console.log(`   ✅ RLS ${i + 1} enabled successfully`);
      } catch (error) {
        console.error(`❌ RLS ${i + 1} failed:`, error.message);
      }
    }

    console.log('\n🎉 Study Mode tables created successfully!');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'study_%'
      ORDER BY table_name
    `);

    console.log('Created tables:');
    rows.forEach(row => {
      console.log(`✅ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

createTables();

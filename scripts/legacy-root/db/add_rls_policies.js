// Add RLS policies to Study Mode tables
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

async function addPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const policyStatements = [
      // study_sessions policies
      `CREATE POLICY "Users can view sessions they host or participate in"
        ON public.study_sessions FOR SELECT
        USING (
          host_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.study_participants sp
            WHERE sp.session_id = study_sessions.id AND sp.user_id = auth.uid()
          )
        )`,

      `CREATE POLICY "Users can create their own sessions"
        ON public.study_sessions FOR INSERT
        WITH CHECK (host_id = auth.uid())`,

      `CREATE POLICY "Hosts can update their sessions"
        ON public.study_sessions FOR UPDATE
        USING (host_id = auth.uid())`,

      `CREATE POLICY "Hosts can delete their sessions"
        ON public.study_sessions FOR DELETE
        USING (host_id = auth.uid())`,

      // study_categories policies
      `CREATE POLICY "Users can view categories for sessions they can access"
        ON public.study_categories FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_categories.session_id AND (
              ss.host_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.study_participants sp
                WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
              )
            )
          )
        )`,

      `CREATE POLICY "Hosts can manage categories for their sessions"
        ON public.study_categories FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_categories.session_id AND ss.host_id = auth.uid()
          )
        )`,

      // study_participants policies
      `CREATE POLICY "Users can view participants in sessions they can access"
        ON public.study_participants FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_participants.session_id AND (
              ss.host_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.study_participants sp
                WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
              )
            )
          )
        )`,

      `CREATE POLICY "Users can join sessions"
        ON public.study_participants FOR INSERT
        WITH CHECK (user_id = auth.uid())`,

      `CREATE POLICY "Users can leave sessions"
        ON public.study_participants FOR DELETE
        USING (user_id = auth.uid())`,

      // study_items policies
      `CREATE POLICY "Users can view items in sessions they can access"
        ON public.study_items FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_items.session_id AND (
              ss.host_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.study_participants sp
                WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
              )
            )
          )
        )`,

      `CREATE POLICY "Hosts can manage items in their sessions"
        ON public.study_items FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_items.session_id AND ss.host_id = auth.uid()
          )
        )`,

      // study_responses policies
      `CREATE POLICY "Users can view responses in sessions they can access"
        ON public.study_responses FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_responses.session_id AND (
              ss.host_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.study_participants sp
                WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
              )
            )
          )
        )`,

      `CREATE POLICY "Users can manage their own responses"
        ON public.study_responses FOR ALL
        USING (
          participant_id IN (
            SELECT id FROM public.study_participants
            WHERE user_id = auth.uid()
          )
        )`,

      // study_ai_cache policies
      `CREATE POLICY "Users can view AI cache for sessions they can access"
        ON public.study_ai_cache FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.study_sessions ss
            WHERE ss.id = study_ai_cache.session_id AND (
              ss.host_id = auth.uid() OR
              EXISTS (
                SELECT 1 FROM public.study_participants sp
                WHERE sp.session_id = ss.id AND sp.user_id = auth.uid()
              )
            )
          )
        )`,

      `CREATE POLICY "Service role can manage AI cache"
        ON public.study_ai_cache FOR ALL
        USING (auth.jwt()->>'role' = 'service_role')`
    ];

    console.log('📋 Adding RLS policies...');

    for (let i = 0; i < policyStatements.length; i++) {
      console.log(`⚡ Adding policy ${i + 1}/${policyStatements.length}...`);

      try {
        await client.query(policyStatements[i]);
        console.log(`   ✅ Policy ${i + 1} added successfully`);
      } catch (error) {
        // Skip if policy already exists
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Policy ${i + 1} already exists, skipping`);
        } else {
          console.error(`❌ Policy ${i + 1} failed:`, error.message);
        }
      }
    }

    // Grant permissions
    const grantStatements = [
      `GRANT ALL ON public.study_sessions TO authenticated`,
      `GRANT ALL ON public.study_categories TO authenticated`,
      `GRANT ALL ON public.study_participants TO authenticated`,
      `GRANT ALL ON public.study_items TO authenticated`,
      `GRANT ALL ON public.study_responses TO authenticated`,
      `GRANT ALL ON public.study_ai_cache TO authenticated`,

      `GRANT ALL ON public.study_sessions TO service_role`,
      `GRANT ALL ON public.study_categories TO service_role`,
      `GRANT ALL ON public.study_participants TO service_role`,
      `GRANT ALL ON public.study_items TO service_role`,
      `GRANT ALL ON public.study_responses TO service_role`,
      `GRANT ALL ON public.study_ai_cache TO service_role`
    ];

    console.log('\n📋 Granting permissions...');

    for (let i = 0; i < grantStatements.length; i++) {
      console.log(`⚡ Granting permission ${i + 1}/${grantStatements.length}...`);

      try {
        await client.query(grantStatements[i]);
        console.log(`   ✅ Permission ${i + 1} granted successfully`);
      } catch (error) {
        console.error(`❌ Permission ${i + 1} failed:`, error.message);
      }
    }

    console.log('\n🎉 RLS policies and permissions added successfully!');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

addPolicies();

#!/usr/bin/env node

/**
 * Fix Flavor Wheels RLS Policies
 * This script generates the SQL needed to fix the 401 Unauthorized issues
 */

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Flavor Wheels RLS Policy & Data Fix Script            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('⚠️ NOTE: Copy and execute this SQL in Supabase Dashboard SQL Editor\n');
  console.log('📋 SQL statements:\n');

  const fullSql = `
-- Enable RLS on all tables
ALTER TABLE flavor_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_wheels ENABLE ROW LEVEL SECURITY;
ALTER TABLE aroma_molecules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can insert their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can update their own descriptors" ON flavor_descriptors;
DROP POLICY IF EXISTS "Users can delete their own descriptors" ON flavor_descriptors;

DROP POLICY IF EXISTS "Users can view their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can insert their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can update their own wheels" ON flavor_wheels;
DROP POLICY IF EXISTS "Users can delete their own wheels" ON flavor_wheels;

DROP POLICY IF EXISTS "Anyone can view aroma molecules" ON aroma_molecules;
DROP POLICY IF EXISTS "Service role can manage aroma molecules" ON aroma_molecules;

-- Create policies for flavor_descriptors
CREATE POLICY "Users can view their own descriptors"
    ON flavor_descriptors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own descriptors"
    ON flavor_descriptors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own descriptors"
    ON flavor_descriptors FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own descriptors"
    ON flavor_descriptors FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for flavor_wheels
CREATE POLICY "Users can view their own wheels"
    ON flavor_wheels FOR SELECT
    USING (
        user_id = auth.uid()
        OR scope_type = 'universal'
    );

CREATE POLICY "Users can insert their own wheels"
    ON flavor_wheels FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR (user_id IS NULL AND scope_type = 'universal')
    );

CREATE POLICY "Users can update their own wheels"
    ON flavor_wheels FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own wheels"
    ON flavor_wheels FOR DELETE
    USING (user_id = auth.uid());

-- Create policies for aroma_molecules
CREATE POLICY "Anyone can view aroma molecules"
    ON aroma_molecules FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage aroma molecules"
    ON aroma_molecules FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON TABLE flavor_descriptors TO authenticated;
GRANT SELECT ON TABLE flavor_descriptors TO anon;

GRANT ALL ON TABLE flavor_wheels TO authenticated;
GRANT SELECT ON TABLE flavor_wheels TO anon;

GRANT SELECT ON TABLE aroma_molecules TO authenticated;
GRANT SELECT ON TABLE aroma_molecules TO anon;
GRANT ALL ON TABLE aroma_molecules TO service_role;
  `.trim();

  console.log('─'.repeat(60));
  console.log(fullSql);
  console.log('─'.repeat(60));

  console.log('\n\n✅ Copy the SQL above and execute it in Supabase Dashboard');
  console.log('   Dashboard: https://app.supabase.com/project/kobuclkvlacdwvxmakvq/sql/new');
  console.log('   Steps: SQL Editor → New Query → Paste → Run\n');
  console.log('✨ After running SQL, test at http://localhost:3032/flavor-wheels\n');
}

main();

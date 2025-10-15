#!/usr/bin/env node

/**
 * AI Flavor Wheels Migration Script
 * Executes the AI schema migration against Supabase database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'your-database-connection-string';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/ai_flavor_wheels_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Running AI Flavor Wheels migration...\n');

    // Execute migration
    const result = await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const verification = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('category_taxonomies', 'ai_extraction_logs')
      ORDER BY table_name;
    `);

    if (verification.rows.length === 2) {
      console.log('✅ All tables created:');
      verification.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Warning: Expected 2 tables, found', verification.rows.length);
    }

    // Check column additions
    console.log('\n🔍 Verifying column additions to existing tables...');
    const columnCheck = await client.query(`
      SELECT
        table_name,
        column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          (table_name = 'flavor_descriptors' AND column_name IN ('normalized_form', 'ai_extracted', 'extraction_model'))
          OR (table_name = 'quick_tastings' AND column_name IN ('taxonomy_id', 'auto_flavor_wheel'))
          OR (table_name = 'flavor_wheels' AND column_name IN ('aggregation_scope', 'descriptor_limit'))
        )
      ORDER BY table_name, column_name;
    `);

    console.log(`✅ Found ${columnCheck.rows.length} new columns:`);
    columnCheck.rows.forEach(row => {
      console.log(`   - ${row.table_name}.${row.column_name}`);
    });

    // Check function creation
    console.log('\n🔍 Verifying database functions...');
    const functionCheck = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name = 'get_unified_flavor_wheel_data';
    `);

    if (functionCheck.rows.length > 0) {
      console.log('✅ Function created: get_unified_flavor_wheel_data');
    } else {
      console.log('⚠️  Function not found: get_unified_flavor_wheel_data');
    }

    console.log('\n🎉 AI Flavor Wheels migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

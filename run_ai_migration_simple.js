const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'your-database-connection-string',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Running AI Flavor Wheels migration...\n');

    const sql = fs.readFileSync('migrations/ai_flavor_wheels_schema.sql', 'utf8');

    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('category_taxonomies', 'ai_extraction_logs')
      ORDER BY table_name
    `);

    console.log('📊 Tables created:');
    result.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

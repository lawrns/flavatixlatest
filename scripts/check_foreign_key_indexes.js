const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:lBCpicVSvM4M5iRm@db.kobuclkvlacdwvxmakvq.supabase.co:5432/postgres'
});

async function checkForeignKeyIndexes() {
  await client.connect();
  
  try {
    // Find all foreign keys without indexes
    const result = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      LEFT JOIN pg_indexes pi
        ON pi.tablename = tc.table_name
        AND pi.schemaname = tc.table_schema
        AND pi.indexdef LIKE '%' || kcu.column_name || '%'
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND pi.indexname IS NULL
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('\n=== Foreign Keys Without Indexes ===\n');
    
    if (result.rows.length === 0) {
      console.log('✅ All foreign keys have indexes!');
      return;
    }
    
    console.log(`Found ${result.rows.length} foreign keys without indexes:\n`);
    
    const missingIndexes = [];
    
    result.rows.forEach(row => {
      console.log(`Table: ${row.table_name}`);
      console.log(`  Column: ${row.column_name}`);
      console.log(`  References: ${row.foreign_table_name}.${row.foreign_column_name}`);
      console.log(`  Constraint: ${row.constraint_name}`);
      console.log('');
      
      missingIndexes.push({
        table: row.table_name,
        column: row.column_name,
        constraint: row.constraint_name,
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name
      });
    });
    
    // Generate migration SQL
    console.log('\n=== Suggested Migration SQL ===\n');
    console.log('-- Add missing indexes on foreign keys\n');
    
    missingIndexes.forEach(idx => {
      const indexName = `idx_${idx.table}_${idx.column}`;
      console.log(`CREATE INDEX IF NOT EXISTS ${indexName}`);
      console.log(`  ON public.${idx.table}(${idx.column});`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking foreign key indexes:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkForeignKeyIndexes();


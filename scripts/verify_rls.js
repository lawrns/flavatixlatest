const { Client } = require('pg');

// Use environment variable for database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env.local file');
  process.exit(1);
}

const client = new Client({
  connectionString
});

async function verifyRLS() {
  await client.connect();
  
  try {
    // Get all tables with RLS enabled
    const rlsTablesResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        relrowsecurity as rls_enabled,
        relforcerowsecurity as rls_forced
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log('\n=== RLS Status for All Tables ===\n');
    
    const issues = [];
    
    for (const table of rlsTablesResult.rows) {
      const tableName = table.tablename;
      const rlsEnabled = table.rls_enabled;
      
      // Get policies for this table
      const policiesResult = await client.query(`
        SELECT 
          policyname,
          cmd,
          permissive,
          roles
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = $1
        ORDER BY cmd, policyname
      `, [tableName]);
      
      const policies = policiesResult.rows;
      const commands = [...new Set(policies.map(p => p.cmd))];
      
      console.log(`Table: ${tableName}`);
      console.log(`  RLS Enabled: ${rlsEnabled}`);
      console.log(`  Policies: ${policies.length}`);
      
      if (rlsEnabled && policies.length === 0) {
        issues.push({
          table: tableName,
          issue: 'RLS enabled but no policies found',
          severity: 'CRITICAL'
        });
        console.log(`  ⚠️  WARNING: RLS enabled but no policies!`);
      }
      
      // Check for required policies (SELECT, INSERT, UPDATE, DELETE)
      const requiredCommands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      const missingCommands = requiredCommands.filter(cmd => !commands.includes(cmd));
      
      if (rlsEnabled && missingCommands.length > 0) {
        // Some tables might not need all commands (e.g., read-only tables)
        // But we should flag it for review
        console.log(`  ⚠️  Missing policies for: ${missingCommands.join(', ')}`);
        issues.push({
          table: tableName,
          issue: `Missing policies for: ${missingCommands.join(', ')}`,
          severity: 'HIGH'
        });
      }
      
      if (policies.length > 0) {
        console.log(`  Commands covered: ${commands.join(', ')}`);
        policies.forEach(p => {
          console.log(`    - ${p.policyname} (${p.cmd})`);
        });
      }
      
      console.log('');
    }
    
    console.log('\n=== Summary ===\n');
    console.log(`Total tables: ${rlsTablesResult.rows.length}`);
    console.log(`Tables with RLS enabled: ${rlsTablesResult.rows.filter(t => t.rls_enabled).length}`);
    console.log(`Issues found: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\n=== Issues ===\n');
      issues.forEach(issue => {
        console.log(`${issue.severity}: ${issue.table} - ${issue.issue}`);
      });
    } else {
      console.log('\n✅ All tables have appropriate RLS policies!');
    }
    
  } catch (error) {
    console.error('Error verifying RLS:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyRLS();


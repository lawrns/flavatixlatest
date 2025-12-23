const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:lBCpicVSvM4M5iRm@db.kobuclkvlacdwvxmakvq.supabase.co:5432/postgres'
});

async function exportSchema() {
  await client.connect();
  
  try {
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    let schema = `-- Auto-generated schema from production database
-- Generated at: ${new Date().toISOString()}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER SCHEMA "public" OWNER TO "postgres";

`;

    // Get extensions
    const extensionsResult = await client.query(`
      SELECT extname 
      FROM pg_extension 
      WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'extensions')
      ORDER BY extname
    `);
    
    for (const ext of extensionsResult.rows) {
      schema += `CREATE EXTENSION IF NOT EXISTS "${ext.extname}" WITH SCHEMA "extensions";\n\n`;
    }

    // For each table, get its definition using pg_dump approach
    // We'll use a simpler method: query information_schema
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Get column definitions
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Get constraints
      const constraintsResult = await client.query(`
        SELECT 
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as constraint_def
        FROM pg_constraint
        WHERE conrelid = 'public.${tableName}'::regclass
      `);
      
      // Get indexes
      const indexesResult = await client.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
        AND tablename = $1
      `, [tableName]);
      
      // Get RLS policies
      const policiesResult = await client.query(`
        SELECT 
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = $1
      `, [tableName]);
      
      schema += `-- Table: ${tableName}\n`;
      schema += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
      
      const columns = [];
      for (const col of columnsResult.rows) {
        let colDef = `  ${col.column_name} `;
        
        // Map data types
        if (col.data_type === 'character varying') {
          colDef += `VARCHAR(${col.character_maximum_length || 255})`;
        } else if (col.data_type === 'timestamp without time zone') {
          colDef += 'TIMESTAMP';
        } else if (col.data_type === 'timestamp with time zone') {
          colDef += 'TIMESTAMPTZ';
        } else if (col.data_type === 'USER-DEFINED') {
          colDef += col.udt_name.toUpperCase();
        } else {
          colDef += col.data_type.toUpperCase();
        }
        
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        
        columns.push(colDef);
      }
      
      schema += columns.join(',\n');
      schema += '\n);\n\n';
      
      // Add constraints
      for (const constraint of constraintsResult.rows) {
        if (constraint.constraint_type !== 'p') { // Skip primary keys (handled in CREATE TABLE)
          schema += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${constraint.constraint_name} ${constraint.constraint_def};\n`;
        }
      }
      
      if (constraintsResult.rows.length > 0) {
        schema += '\n';
      }
      
      // Add indexes
      for (const index of indexesResult.rows) {
        if (!index.indexdef.includes('UNIQUE') && !index.indexdef.includes('PRIMARY')) {
          schema += `${index.indexdef};\n`;
        }
      }
      
      if (indexesResult.rows.length > 0) {
        schema += '\n';
      }
      
      // Add RLS
      const rlsResult = await client.query(`
        SELECT relrowsecurity, relforcerowsecurity
        FROM pg_class
        WHERE relname = $1 AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      `, [tableName]);
      
      if (rlsResult.rows.length > 0 && rlsResult.rows[0].relrowsecurity) {
        schema += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;
        
        // Add policies
        for (const policy of policiesResult.rows) {
          schema += `CREATE POLICY ${policy.policyname} ON public.${tableName}\n`;
          schema += `  AS ${policy.permissive}\n`;
          schema += `  FOR ${policy.cmd}\n`;
          if (policy.qual) {
            schema += `  USING (${policy.qual})\n`;
          }
          if (policy.with_check) {
            schema += `  WITH CHECK (${policy.with_check})\n`;
          }
          schema += ';\n\n';
        }
      }
      
      schema += '\n';
    }
    
    console.log(schema);
    
  } catch (error) {
    console.error('Error exporting schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

exportSchema();


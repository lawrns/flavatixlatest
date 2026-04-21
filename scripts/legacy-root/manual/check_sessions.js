// Check if any study sessions were created
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

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function checkSessions() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check study sessions
    const { rows: sessions } = await client.query(`
      SELECT id, name, base_category, session_code, status, created_at
      FROM public.study_sessions
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log('\n📋 Study Sessions:');
    if (sessions.length === 0) {
      console.log('   No sessions found');
    } else {
      sessions.forEach(session => {
        console.log(`   ✅ ${session.name} (${session.session_code}) - ${session.status} - ${session.created_at}`);
      });
    }

    // Check categories for the latest session
    if (sessions.length > 0) {
      const latestSessionId = sessions[0].id;
      const { rows: categories } = await client.query(`
        SELECT name, has_text, has_scale, has_boolean, scale_max, rank_in_summary
        FROM public.study_categories
        WHERE session_id = $1
        ORDER BY sort_order
      `, [latestSessionId]);

      console.log(`\n📋 Categories for latest session (${sessions[0].name}):`);
      categories.forEach(category => {
        const types = [];
        if (category.has_text) {types.push('Text');}
        if (category.has_scale) {types.push(`Scale(1-${category.scale_max})`);}
        if (category.has_boolean) {types.push('Yes/No');}
        const ranked = category.rank_in_summary ? ' (Ranked)' : '';
        console.log(`   ✅ ${category.name}: ${types.join(', ')}${ranked}`);
      });
    }

    // Check participants
    const { rows: participants } = await client.query(`
      SELECT sp.session_id, ss.name as session_name, sp.role, sp.joined_at
      FROM public.study_participants sp
      JOIN public.study_sessions ss ON sp.session_id = ss.id
      ORDER BY sp.joined_at DESC
      LIMIT 5
    `);

    console.log('\n👥 Participants:');
    if (participants.length === 0) {
      console.log('   No participants found');
    } else {
      participants.forEach(participant => {
        console.log(`   ✅ ${participant.session_name} - ${participant.role} - ${participant.joined_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkSessions();

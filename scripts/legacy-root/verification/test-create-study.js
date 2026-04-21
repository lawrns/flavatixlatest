const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {envVars[key.trim()] = value.trim();}
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStudyCreation() {
  console.log('Authenticating...');
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'han@han.com',
    password: 'hennie12'
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  console.log('Authenticated as:', session.user.id);

  try {
    const studyMetadata = {
      baseCategory: 'Coffee',
      categories: [
        { name: 'Roast', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 0 }
      ],
      studyMode: true
    };

    console.log('Creating study session...');
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id: session.user.id,
        session_name: 'Test Study Session',
        category: 'coffee',
        mode: 'study',
        study_approach: 'predefined',
        notes: JSON.stringify(studyMetadata),
        total_items: 0,
        completed_items: 0
      })
      .select()
      .single();

    if (tastingError) {throw new Error(`Tasting Error: ${tastingError.message} (${tastingError.code})`);}
    console.log('Study Session created:', tasting.id);

    console.log('✅ Study creation flow verified successfully!');

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
}

testStudyCreation();

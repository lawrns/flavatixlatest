const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompetitionCreation() {
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
    // 1. Create quick_tasting
    console.log('Creating competition session...');
    const { data: tasting, error: tastingError } = await supabase
      .from('quick_tastings')
      .insert({
        user_id: session.user.id,
        category: 'Mezcal',
        session_name: 'Test Competition Script',
        mode: 'competition',
        rank_participants: true,
        ranking_type: 'points',
        total_items: 1,
        completed_items: 0,
        is_blind_items: true
      })
      .select()
      .single();

    if (tastingError) throw new Error(`Tasting Error: ${tastingError.message} (${tastingError.code})`);
    console.log('Tasting created:', tasting.id);

    // 2. Create item
    console.log('Creating item...');
    const { data: item, error: itemError } = await supabase
      .from('quick_tasting_items')
      .insert({
        tasting_id: tasting.id,
        item_name: 'Test Mezcal 1',
        item_order: 1,
        correct_answers: { aroma: 'Smoky', flavor: 'Agave', overall_score: 90 },
        include_in_ranking: true
      })
      .select()
      .single();

    if (itemError) throw new Error(`Item Error: ${itemError.message} (${itemError.code})`);
    console.log('Item created:', item.id);

    // 3. Create metadata
    console.log('Creating metadata...');
    const { error: metaError } = await supabase
      .from('competition_item_metadata')
      .insert({
        item_id: item.id,
        tasting_id: tasting.id,
        item_order: 1,
        is_blind: true
      });

    if (metaError) throw new Error(`Metadata Error: ${metaError.message} (${metaError.code})`);
    console.log('Metadata created');

    // 4. Create answer key
    console.log('Creating answer key...');
    const { error: keyError } = await supabase
      .from('competition_answer_keys')
      .insert({
        tasting_id: tasting.id,
        item_id: item.id,
        parameter_name: 'Region',
        parameter_type: 'multiple_choice',
        correct_answer: { options: ['Oaxaca'] },
        answer_options: ['Oaxaca', 'Durango', 'Puebla'],
        points: 5
      });

    if (keyError) throw new Error(`Answer Key Error: ${keyError.message} (${keyError.code})`);
    console.log('Answer key created');

    console.log('✅ Competition creation flow verified successfully!');

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }
}

testCompetitionCreation();

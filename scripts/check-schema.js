const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking quick_tasting_items table schema...\n');

  // Query to check columns
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quick_tasting_items'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('Error checking schema:', error);

    // Try direct query instead
    const { data: items, error: itemsError } = await supabase
      .from('quick_tasting_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.error('Error querying items:', itemsError);
    } else {
      console.log('Sample item structure:', items[0] ? Object.keys(items[0]) : 'No items found');
    }
  } else {
    console.log('Table columns:', data);
  }
}

checkSchema();

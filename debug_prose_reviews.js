// Debug script for prose review database issues
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables like the test scripts do
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugProseReviews() {
  console.log('🔍 Debugging prose review database issues...\n');

  try {
    // 1. Check if prose_reviews table exists
    console.log('1️⃣ Checking prose_reviews table...');
    const { data: tableData, error: tableError } = await supabase
      .from('prose_reviews')
      .select('*')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('❌ prose_reviews table does not exist!');
      return;
    }

    console.log('✅ prose_reviews table exists');

    // 2. Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .rpc('describe_table', { table_name: 'prose_reviews' });

    if (structureError) {
      console.log('Could not get table structure:', structureError.message);
    } else {
      console.log('Table structure:', structureData);
    }

    // 3. Try to get existing records
    console.log('\n3️⃣ Checking existing records...');
    const { data: records, error: recordsError } = await supabase
      .from('prose_reviews')
      .select('*')
      .limit(5);

    if (recordsError) {
      console.log('❌ Error fetching records:', recordsError);
    } else {
      console.log(`✅ Found ${records.length} records`);
      if (records.length > 0) {
        console.log('Sample record:', JSON.stringify(records[0], null, 2));
      }
    }

    // 4. Test inserting a sample record to identify constraint issues
    console.log('\n4️⃣ Testing sample insertion...');
    const testRecord = {
      user_id: '3323dde5-c11c-4dc0-ba09-37510aa6b457', // Test user from our testing
      item_name: 'Test Prose Review Item',
      category: 'Coffee',
      review_content: 'This is a test review to identify database constraint issues.',
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('prose_reviews')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.log('❌ Insert failed with error:', insertError);
      console.log('Error details:', JSON.stringify(insertError, null, 2));

      // Check specific error types
      if (insertError.code === '22P02') {
        console.log('🔍 Error 22P02: Invalid input syntax - likely a UUID or data type issue');
      } else if (insertError.code === '23505') {
        console.log('🔍 Error 23505: Unique constraint violation');
      } else if (insertError.code === '23503') {
        console.log('🔍 Error 23503: Foreign key constraint violation');
      } else if (insertError.code === '23502') {
        console.log('🔍 Error 23502: Not null constraint violation');
      }
    } else {
      console.log('✅ Insert successful:', insertData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugProseReviews();

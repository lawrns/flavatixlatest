// Test script to replicate the exact prose review save process
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
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
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Use service role for testing (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data exactly as the frontend would send
const testUserId = '3323dde5-c11c-4dc0-ba09-37510aa6b457'; // From our test user

// Mock the generateReviewId function
function generateReviewId(category, itemName, batchId, date) {
  const reviewDate = date || new Date();
  const month = reviewDate.getMonth() + 1;
  const day = reviewDate.getDate();
  const year = reviewDate.getFullYear().toString().slice(-2);
  const formattedDate = `${month}/${day}/${year}`;

  const categoryPrefix = category.slice(0, 4).toUpperCase();
  const cleanedName = itemName.replace(/\s+/g, '').toUpperCase();
  const namePrefix = cleanedName.slice(0, 4);
  const cleanedBatchId = batchId.replace(/[^\w-]/g, '');

  return `${categoryPrefix}${namePrefix}${cleanedBatchId}-${formattedDate}`;
}

async function testProseReviewSave() {
  console.log('🧪 Testing prose review save process...\n');

  try {
    // Generate review ID like the frontend does
    const reviewId = generateReviewId('Coffee', 'Test Prose Coffee Review', '');
    console.log('📝 Generated review ID:', reviewId);

    // Create review data exactly as frontend does
    const reviewData = {
      user_id: testUserId,
      review_id: reviewId,
      item_name: 'Test Prose Coffee Review',
      picture_url: '',
      brand: '',
      country: '',
      state: '',
      region: '',
      vintage: '',
      batch_id: '',
      upc_barcode: '',
      category: 'Coffee',
      review_content: 'This coffee has a rich, complex profile with notes of dark chocolate, caramel sweetness, and subtle nuttiness. The aroma is intense and inviting, with roasted coffee beans and a hint of spice. The flavor is well-balanced with good acidity and a smooth finish. Overall, an excellent espresso blend that would be perfect for morning brewing.',
      status: 'completed'
    };

    console.log('📤 Attempting to insert review data...');
    console.log('Data keys:', Object.keys(reviewData));
    console.log('Data sample:', {
      user_id: reviewData.user_id,
      review_id: reviewData.review_id,
      item_name: reviewData.item_name,
      category: reviewData.category,
      status: reviewData.status
    });

    // First test if we can query a public table
    console.log('🔍 Testing service role access on public table...');
    const { data: testData, error: testError } = await supabase
      .from('aroma_molecules')
      .select('descriptor')
      .limit(1);

    if (testError) {
      console.log('❌ Cannot access public table:', testError.message);
      return;
    } else {
      console.log('✅ Can access public table');
    }

    // Now try the prose_reviews insert
    console.log('📤 Attempting prose_reviews insert...');
    const { data, error } = await supabase
      .from('prose_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.log('❌ Insert failed with error:');
      console.log('Code:', error.code);
      console.log('Message:', error.message);
      console.log('Details:', error.details);
      console.log('Hint:', error.hint);

      // Check specific error types
      if (error.code === '22P02') {
        console.log('🔍 Error 22P02: Invalid input syntax - likely a data type issue');
      } else if (error.code === '23505') {
        console.log('🔍 Error 23505: Unique constraint violation');
      } else if (error.code === '23503') {
        console.log('🔍 Error 23503: Foreign key constraint violation');
      } else if (error.code === '23502') {
        console.log('🔍 Error 23502: Not null constraint violation');
      }
    } else {
      console.log('✅ Insert successful!');
      console.log('Review ID:', data.id);
      console.log('Review data:', data);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testProseReviewSave();

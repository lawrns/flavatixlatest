const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function insertTestData() {
  try {
    console.log('🚀 Inserting test flavor descriptors...');
    
    // Insert test descriptors for the dev user (5022ee8c-faa7-472a-b3ce-401a3916aa24)
    const testDescriptors = [
      { descriptor_text: 'lemon', descriptor_type: 'aroma', category: 'Fruity', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-1', confidence_score: 0.9, intensity: 4 },
      { descriptor_text: 'orange', descriptor_type: 'aroma', category: 'Fruity', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-2', confidence_score: 0.8, intensity: 3 },
      { descriptor_text: 'vanilla', descriptor_type: 'flavor', category: 'Sweet', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_review', source_id: 'test-3', confidence_score: 0.95, intensity: 5 },
      { descriptor_text: 'caramel', descriptor_type: 'flavor', category: 'Sweet', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_review', source_id: 'test-4', confidence_score: 0.85, intensity: 4 },
      { descriptor_text: 'smoke', descriptor_type: 'aroma', category: 'Woody', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'prose_review', source_id: 'test-5', confidence_score: 0.9, intensity: 3 },
      { descriptor_text: 'chocolate', descriptor_type: 'flavor', category: 'Sweet', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'prose_review', source_id: 'test-6', confidence_score: 0.88, intensity: 4 },
      { descriptor_text: 'rose', descriptor_type: 'aroma', category: 'Floral', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-7', confidence_score: 0.7, intensity: 2 },
      { descriptor_text: 'mint', descriptor_type: 'aroma', category: 'Herbal', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_review', source_id: 'test-8', confidence_score: 0.92, intensity: 4 },
      { descriptor_text: 'apple', descriptor_type: 'flavor', category: 'Fruity', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'prose_review', source_id: 'test-9', confidence_score: 0.8, intensity: 3 },
      { descriptor_text: 'cinnamon', descriptor_type: 'aroma', category: 'Spicy', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-10', confidence_score: 0.85, intensity: 3 },
      { descriptor_text: 'pepper', descriptor_type: 'aroma', category: 'Spicy', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_review', source_id: 'test-11', confidence_score: 0.9, intensity: 4 },
      { descriptor_text: 'cedar', descriptor_type: 'aroma', category: 'Woody', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'prose_review', source_id: 'test-12', confidence_score: 0.75, intensity: 3 },
      { descriptor_text: 'jasmine', descriptor_type: 'aroma', category: 'Floral', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-13', confidence_score: 0.8, intensity: 2 },
      { descriptor_text: 'mushroom', descriptor_type: 'aroma', category: 'Earthy', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_review', source_id: 'test-14', confidence_score: 0.7, intensity: 3 },
      { descriptor_text: 'soil', descriptor_type: 'aroma', category: 'Earthy', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'prose_review', source_id: 'test-15', confidence_score: 0.65, intensity: 2 },
      { descriptor_text: 'strawberry', descriptor_type: 'flavor', category: 'Fruity', user_id: '5022ee8c-faa7-472a-b3ce-401a3916aa24', source_type: 'quick_tasting', source_id: 'test-16', confidence_score: 0.9, intensity: 4 }
    ];

    const { data, error } = await supabase
      .from('flavor_descriptors')
      .insert(testDescriptors)
      .select();

    if (error) {
      console.error('❌ Error inserting test data:', error);
      return;
    }

    console.log('✅ Successfully inserted', data.length, 'test descriptors');
    
    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('flavor_descriptors')
      .select('descriptor_text, descriptor_type, category')
      .eq('user_id', '5022ee8c-faa7-472a-b3ce-401a3916aa24');

    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
      return;
    }

    console.log('📊 Test data summary:');
    console.log('   Total descriptors:', verifyData.length);
    
    const byType = verifyData.reduce((acc, item) => {
      acc[item.descriptor_type] = (acc[item.descriptor_type] || 0) + 1;
      return acc;
    }, {});
    
    const byCategory = verifyData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   By type:', byType);
    console.log('   By category:', byCategory);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertTestData();

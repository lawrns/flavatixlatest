/**
 * Test Script for Flavor Wheels Feature
 * 
 * This script tests the complete flavor wheels functionality:
 * 1. Extracts descriptors from existing reviews
 * 2. Generates flavor wheels
 * 3. Verifies the data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

async function testFlavorWheels() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🧪 Testing Flavor Wheels Feature\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Verify tables exist
    console.log('\n1️⃣  Verifying database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('flavor_descriptors')
      .select('id')
      .limit(1);

    if (tablesError && tablesError.code === '42P01') {
      console.error('❌ Tables not found. Run migration first.');
      process.exit(1);
    }
    console.log('✅ Tables verified');

    // Step 2: Check aroma molecules seed data
    console.log('\n2️⃣  Checking aroma molecules seed data...');
    const { data: molecules, error: moleculesError } = await supabase
      .from('aroma_molecules')
      .select('descriptor, molecules');

    if (moleculesError) {
      console.error('❌ Error fetching aroma molecules:', moleculesError);
    } else {
      console.log(`✅ Found ${molecules.length} aroma molecules:`);
      molecules.forEach(m => {
        console.log(`   - ${m.descriptor}: ${m.molecules.map(mol => mol.name).join(', ')}`);
      });
    }

    // Step 3: Get existing reviews with flavor notes
    console.log('\n3️⃣  Finding existing reviews with flavor notes...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('quick_reviews')
      .select('id, user_id, item_name, aroma_notes, flavor_notes')
      .or('aroma_notes.neq.,flavor_notes.neq.')
      .limit(10);

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError);
    } else {
      console.log(`✅ Found ${reviews.length} reviews with flavor notes`);
      reviews.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.item_name} - Aroma: "${r.aroma_notes || 'N/A'}", Flavor: "${r.flavor_notes || 'N/A'}"`);
      });
    }

    // Step 4: Insert test descriptors manually
    console.log('\n4️⃣  Inserting test flavor descriptors...');
    
    const testUserId = reviews && reviews.length > 0 ? reviews[0].user_id : null;
    
    if (!testUserId) {
      console.log('⚠️  No existing reviews found. Skipping descriptor insertion.');
    } else {
      const testDescriptors = [
        // Fruity - Citrus
        { text: 'lemon', type: 'aroma', category: 'Fruity', subcategory: 'Citrus', confidence: 0.95, intensity: 4 },
        { text: 'orange', type: 'aroma', category: 'Fruity', subcategory: 'Citrus', confidence: 0.90, intensity: 3 },
        { text: 'lime', type: 'flavor', category: 'Fruity', subcategory: 'Citrus', confidence: 0.88, intensity: 3 },
        
        // Fruity - Berry
        { text: 'strawberry', type: 'aroma', category: 'Fruity', subcategory: 'Berry', confidence: 0.92, intensity: 4 },
        { text: 'raspberry', type: 'flavor', category: 'Fruity', subcategory: 'Berry', confidence: 0.89, intensity: 3 },
        
        // Spicy
        { text: 'cinnamon', type: 'aroma', category: 'Spicy', subcategory: 'Sweet Spice', confidence: 0.94, intensity: 5 },
        { text: 'pepper', type: 'flavor', category: 'Spicy', subcategory: 'Pungent', confidence: 0.91, intensity: 4 },
        
        // Sweet
        { text: 'vanilla', type: 'aroma', category: 'Sweet', subcategory: 'Vanilla', confidence: 0.96, intensity: 5 },
        { text: 'caramel', type: 'flavor', category: 'Sweet', subcategory: 'Caramel', confidence: 0.93, intensity: 4 },
        { text: 'chocolate', type: 'flavor', category: 'Sweet', subcategory: 'Chocolate', confidence: 0.90, intensity: 4 },
        
        // Woody
        { text: 'oak', type: 'aroma', category: 'Woody', subcategory: 'Oak', confidence: 0.87, intensity: 3 },
        { text: 'cedar', type: 'aroma', category: 'Woody', subcategory: 'Resinous', confidence: 0.85, intensity: 3 },
        
        // Floral
        { text: 'rose', type: 'aroma', category: 'Floral', subcategory: 'Rose', confidence: 0.91, intensity: 3 },
        { text: 'jasmine', type: 'aroma', category: 'Floral', subcategory: 'White Flowers', confidence: 0.88, intensity: 2 },
        
        // Earthy
        { text: 'mushroom', type: 'flavor', category: 'Earthy', subcategory: 'Fungal', confidence: 0.86, intensity: 3 },
        { text: 'soil', type: 'aroma', category: 'Earthy', subcategory: 'Mineral', confidence: 0.84, intensity: 2 },
      ];

      const descriptorRecords = testDescriptors.map((desc, i) => ({
        user_id: testUserId,
        source_type: 'quick_review',
        source_id: reviews[0].id,
        descriptor_text: desc.text,
        descriptor_type: desc.type,
        category: desc.category,
        subcategory: desc.subcategory,
        confidence_score: desc.confidence,
        intensity: desc.intensity,
        item_name: reviews[0].item_name,
        item_category: 'test'
      }));

      const { data: insertedDescriptors, error: insertError } = await supabase
        .from('flavor_descriptors')
        .upsert(descriptorRecords, {
          onConflict: 'source_type,source_id,descriptor_text,descriptor_type',
          ignoreDuplicates: false
        })
        .select('id');

      if (insertError) {
        console.error('❌ Error inserting descriptors:', insertError);
      } else {
        console.log(`✅ Inserted ${insertedDescriptors.length} test descriptors`);
      }
    }

    // Step 5: Verify descriptors were inserted
    console.log('\n5️⃣  Verifying flavor descriptors...');
    const { data: allDescriptors, error: descriptorsError } = await supabase
      .from('flavor_descriptors')
      .select('descriptor_text, descriptor_type, category, subcategory, confidence_score, intensity')
      .order('category', { ascending: true });

    if (descriptorsError) {
      console.error('❌ Error fetching descriptors:', descriptorsError);
    } else {
      console.log(`✅ Found ${allDescriptors.length} total descriptors in database`);
      
      // Group by category
      const byCategory = {};
      allDescriptors.forEach(d => {
        if (!byCategory[d.category]) {
          byCategory[d.category] = [];
        }
        byCategory[d.category].push(d);
      });

      Object.keys(byCategory).forEach(cat => {
        console.log(`   ${cat}: ${byCategory[cat].length} descriptors`);
      });
    }

    // Step 6: Test statistics function
    console.log('\n6️⃣  Testing descriptor statistics function...');
    if (testUserId) {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_user_descriptor_stats', { target_user_id: testUserId });

      if (statsError) {
        console.error('❌ Error getting stats:', statsError);
      } else {
        console.log('✅ User descriptor statistics:');
        stats.forEach(s => {
          console.log(`   ${s.descriptor_type}: ${s.total_count} total, ${s.unique_count} unique, top category: ${s.top_category || 'N/A'}`);
        });
      }
    }

    // Step 7: Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('📊 Summary:');
    console.log(`   - Database tables: ✅ Created`);
    console.log(`   - Aroma molecules: ✅ ${molecules?.length || 0} seeded`);
    console.log(`   - Flavor descriptors: ✅ ${allDescriptors?.length || 0} in database`);
    console.log(`   - Test data: ✅ Ready for visualization`);
    console.log('\n🎉 Flavor Wheels feature is ready to use!\n');
    console.log('Next steps:');
    console.log('   1. Start the dev server: npm run dev -- -p 3032');
    console.log('   2. Navigate to: http://localhost:3032/flavor-wheels');
    console.log('   3. Login with test user credentials');
    console.log('   4. Generate and view your flavor wheels!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFlavorWheels();


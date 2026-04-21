#!/usr/bin/env node

/**
 * Seed Flavor Descriptors Test Data
 * This script inserts sample flavor descriptors into the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const parseEnv = (content) => {
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  return env;
};

const env = parseEnv(envContent);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Sample test data with rich flavor descriptors
const sampleDescriptors = [
  // Fruity - Citrus
  { text: 'lemon', type: 'aroma', category: 'Fruity', subcategory: 'Citrus', confidence: 0.95, intensity: 4 },
  { text: 'orange peel', type: 'aroma', category: 'Fruity', subcategory: 'Citrus', confidence: 0.90, intensity: 3 },
  { text: 'grapefruit', type: 'flavor', category: 'Fruity', subcategory: 'Citrus', confidence: 0.88, intensity: 4 },
  { text: 'lime zest', type: 'aroma', category: 'Fruity', subcategory: 'Citrus', confidence: 0.85, intensity: 3 },

  // Fruity - Berry
  { text: 'strawberry', type: 'flavor', category: 'Fruity', subcategory: 'Berry', confidence: 0.92, intensity: 5 },
  { text: 'raspberry', type: 'aroma', category: 'Fruity', subcategory: 'Berry', confidence: 0.89, intensity: 4 },
  { text: 'blackberry', type: 'flavor', category: 'Fruity', subcategory: 'Berry', confidence: 0.87, intensity: 3 },
  { text: 'blueberry', type: 'flavor', category: 'Fruity', subcategory: 'Berry', confidence: 0.84, intensity: 3 },

  // Fruity - Stone Fruit
  { text: 'peach', type: 'aroma', category: 'Fruity', subcategory: 'Stone Fruit', confidence: 0.91, intensity: 4 },
  { text: 'apricot', type: 'flavor', category: 'Fruity', subcategory: 'Stone Fruit', confidence: 0.88, intensity: 3 },
  { text: 'cherry', type: 'flavor', category: 'Fruity', subcategory: 'Stone Fruit', confidence: 0.93, intensity: 5 },

  // Sweet
  { text: 'vanilla', type: 'flavor', category: 'Sweet', subcategory: 'Vanilla', confidence: 0.96, intensity: 5 },
  { text: 'caramel', type: 'flavor', category: 'Sweet', subcategory: 'Caramelized', confidence: 0.94, intensity: 4 },
  { text: 'honey', type: 'aroma', category: 'Sweet', subcategory: 'Honey', confidence: 0.90, intensity: 4 },
  { text: 'butterscotch', type: 'flavor', category: 'Sweet', subcategory: 'Caramelized', confidence: 0.87, intensity: 3 },
  { text: 'brown sugar', type: 'aroma', category: 'Sweet', subcategory: 'Caramelized', confidence: 0.89, intensity: 4 },

  // Smoky
  { text: 'smoke', type: 'aroma', category: 'Smoky', subcategory: 'Wood Smoke', confidence: 0.95, intensity: 5 },
  { text: 'campfire', type: 'aroma', category: 'Smoky', subcategory: 'Wood Smoke', confidence: 0.88, intensity: 4 },
  { text: 'charred oak', type: 'flavor', category: 'Smoky', subcategory: 'Charred', confidence: 0.91, intensity: 4 },
  { text: 'peaty', type: 'aroma', category: 'Smoky', subcategory: 'Peat', confidence: 0.93, intensity: 5 },

  // Spicy
  { text: 'cinnamon', type: 'aroma', category: 'Spicy', subcategory: 'Sweet Spice', confidence: 0.92, intensity: 4 },
  { text: 'black pepper', type: 'flavor', category: 'Spicy', subcategory: 'Pepper', confidence: 0.90, intensity: 3 },
  { text: 'ginger', type: 'aroma', category: 'Spicy', subcategory: 'Root Spice', confidence: 0.88, intensity: 3 },
  { text: 'clove', type: 'flavor', category: 'Spicy', subcategory: 'Sweet Spice', confidence: 0.89, intensity: 4 },
  { text: 'nutmeg', type: 'aroma', category: 'Spicy', subcategory: 'Sweet Spice', confidence: 0.85, intensity: 3 },

  // Woody
  { text: 'oak', type: 'aroma', category: 'Woody', subcategory: 'Oak', confidence: 0.94, intensity: 4 },
  { text: 'cedar', type: 'aroma', category: 'Woody', subcategory: 'Cedar', confidence: 0.87, intensity: 3 },
  { text: 'pine', type: 'flavor', category: 'Woody', subcategory: 'Resinous', confidence: 0.82, intensity: 2 },
  { text: 'sandalwood', type: 'aroma', category: 'Woody', subcategory: 'Exotic Wood', confidence: 0.86, intensity: 3 },

  // Floral
  { text: 'rose', type: 'aroma', category: 'Floral', subcategory: 'Rose', confidence: 0.90, intensity: 4 },
  { text: 'jasmine', type: 'aroma', category: 'Floral', subcategory: 'White Floral', confidence: 0.88, intensity: 3 },
  { text: 'lavender', type: 'flavor', category: 'Floral', subcategory: 'Herbal Floral', confidence: 0.85, intensity: 3 },
  { text: 'elderflower', type: 'aroma', category: 'Floral', subcategory: 'White Floral', confidence: 0.83, intensity: 2 },

  // Nutty
  { text: 'almond', type: 'flavor', category: 'Nutty', subcategory: 'Tree Nut', confidence: 0.91, intensity: 4 },
  { text: 'hazelnut', type: 'aroma', category: 'Nutty', subcategory: 'Tree Nut', confidence: 0.89, intensity: 3 },
  { text: 'walnut', type: 'flavor', category: 'Nutty', subcategory: 'Tree Nut', confidence: 0.86, intensity: 3 },
  { text: 'roasted nuts', type: 'aroma', category: 'Nutty', subcategory: 'Roasted', confidence: 0.92, intensity: 4 },

  // Herbal
  { text: 'mint', type: 'aroma', category: 'Herbal', subcategory: 'Mint', confidence: 0.93, intensity: 4 },
  { text: 'eucalyptus', type: 'aroma', category: 'Herbal', subcategory: 'Medicinal', confidence: 0.87, intensity: 3 },
  { text: 'thyme', type: 'flavor', category: 'Herbal', subcategory: 'Savory Herb', confidence: 0.84, intensity: 2 },
  { text: 'sage', type: 'aroma', category: 'Herbal', subcategory: 'Savory Herb', confidence: 0.82, intensity: 3 },

  // Earthy
  { text: 'mushroom', type: 'aroma', category: 'Earthy', subcategory: 'Mushroom', confidence: 0.88, intensity: 3 },
  { text: 'soil', type: 'flavor', category: 'Earthy', subcategory: 'Mineral', confidence: 0.85, intensity: 2 },
  { text: 'tobacco', type: 'aroma', category: 'Earthy', subcategory: 'Tobacco', confidence: 0.90, intensity: 4 },
  { text: 'leather', type: 'flavor', category: 'Earthy', subcategory: 'Leather', confidence: 0.87, intensity: 3 },

  // Chocolate
  { text: 'dark chocolate', type: 'flavor', category: 'Chocolate', subcategory: 'Dark', confidence: 0.95, intensity: 5 },
  { text: 'cocoa', type: 'aroma', category: 'Chocolate', subcategory: 'Cocoa', confidence: 0.93, intensity: 4 },
  { text: 'milk chocolate', type: 'flavor', category: 'Chocolate', subcategory: 'Milk', confidence: 0.89, intensity: 4 },

  // Metaphors
  { text: 'velvet texture', type: 'metaphor', category: 'Texture', subcategory: 'Smooth', confidence: 0.80, intensity: 4 },
  { text: 'silk on the palate', type: 'metaphor', category: 'Texture', subcategory: 'Smooth', confidence: 0.78, intensity: 3 },
  { text: 'crisp autumn morning', type: 'metaphor', category: 'Freshness', subcategory: 'Clean', confidence: 0.75, intensity: 3 },
  { text: 'warm embrace', type: 'metaphor', category: 'Warmth', subcategory: 'Comfort', confidence: 0.82, intensity: 4 }
];

async function seedDescriptors() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Flavor Descriptors Test Data Seeding Script           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Get the first user from profiles table
    console.log('📋 Finding test user...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ No user found. Please ensure you have at least one user in the profiles table.');
      console.error('   Error:', profileError?.message);
      process.exit(1);
    }

    const userId = profiles[0].user_id;
    const userName = profiles[0].full_name || 'Test User';
    console.log(`✅ Using user: ${userName} (${userId})\n`);

    // Create multiple test tastings to simulate real data
    const testSources = [
      { type: 'quick_tasting', id: '11111111-1111-1111-1111-111111111111' },
      { type: 'quick_tasting', id: '22222222-2222-2222-2222-222222222222' },
      { type: 'quick_review', id: '33333333-3333-3333-3333-333333333333' },
      { type: 'prose_review', id: '44444444-4444-4444-4444-444444444444' }
    ];

    console.log('📝 Preparing flavor descriptors...');

    // Distribute descriptors across different sources
    const descriptorRecords = [];
    sampleDescriptors.forEach((descriptor, index) => {
      const source = testSources[index % testSources.length];
      descriptorRecords.push({
        user_id: userId,
        source_type: source.type,
        source_id: source.id,
        descriptor_text: descriptor.text,
        descriptor_type: descriptor.type,
        category: descriptor.category,
        subcategory: descriptor.subcategory,
        confidence_score: descriptor.confidence,
        intensity: descriptor.intensity
      });
    });

    console.log(`📊 Inserting ${descriptorRecords.length} flavor descriptors...\n`);

    // Insert in batches to avoid timeout
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < descriptorRecords.length; i += batchSize) {
      const batch = descriptorRecords.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('flavor_descriptors')
        .upsert(batch, {
          onConflict: 'source_type,source_id,descriptor_text,descriptor_type',
          ignoreDuplicates: false
        })
        .select('id');

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        errorCount += batch.length;
      } else {
        const count = data?.length || 0;
        successCount += count;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${count} descriptors inserted`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Results: ${successCount} succeeded, ${errorCount} failed`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n✅ Test data inserted successfully!');
      console.log(`\n🎨 Summary by category:`);

      const categories = {};
      descriptorRecords.forEach(d => {
        categories[d.category] = (categories[d.category] || 0) + 1;
      });

      Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
        console.log(`   ${cat.padEnd(15)} ${count} descriptors`);
      });

      console.log('\n🧪 Next steps:');
      console.log('   1. Visit http://localhost:3032/flavor-wheels');
      console.log('   2. Select a wheel type (Aroma, Flavor, Combined, Metaphor)');
      console.log('   3. Choose "Personal" scope');
      console.log('   4. Click "Regenerate Wheel"');
      console.log('   5. The wheel should now generate with your test data!\n');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedDescriptors();

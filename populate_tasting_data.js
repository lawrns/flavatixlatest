const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('fs').readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value.replace(/['"]/g, '');
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

async function populateTastingData() {
  console.log('🚀 Populating tasting data for flavor wheels...');

  try {
    // Get existing user
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(1);

    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ No user found');
      return;
    }

    const userId = profiles[0].user_id;
    console.log(`✅ Using user: ${profiles[0].full_name} (${userId})`);

    // Create multiple quick tastings with various items
    const tastingData = [
      {
        category: 'coffee',
        session_name: 'Morning Coffee Tasting',
        items: [
          { name: 'Ethiopian Yirgacheffe', notes: 'Bright citrus, floral jasmine, delicate honey sweetness', overall_score: 92 },
          { name: 'Colombian Supremo', notes: 'Rich chocolate, caramel, nutty almond undertones', overall_score: 88 },
          { name: 'Jamaican Blue Mountain', notes: 'Mild, smooth, with hints of cocoa and subtle sweetness', overall_score: 95 }
        ]
      },
      {
        category: 'wine',
        session_name: 'Red Wine Comparison',
        items: [
          { name: 'Cabernet Sauvignon', notes: 'Dark plum, black currant, cedar wood, firm tannins', overall_score: 89 },
          { name: 'Pinot Noir', notes: 'Cherry, raspberry, earthy mushroom, silky texture', overall_score: 91 },
          { name: 'Merlot', notes: 'Plum, chocolate, vanilla oak, soft tannins', overall_score: 87 }
        ]
      },
      {
        category: 'tea',
        session_name: 'Premium Tea Collection',
        items: [
          { name: 'Darjeeling First Flush', notes: 'Muscatel grape, rose petal, honey sweetness, brisk finish', overall_score: 94 },
          { name: 'Jasmine Pearl', notes: 'Floral jasmine, fresh green leaves, sweet honey notes', overall_score: 90 },
          { name: 'Assam Breakfast', notes: 'Malty sweetness, dried fruit, robust and full-bodied', overall_score: 86 }
        ]
      },
      {
        category: 'chocolate',
        session_name: 'Artisan Chocolate Tasting',
        items: [
          { name: 'Dark 85%', notes: 'Intense cocoa, dark fruit, subtle bitterness, smooth finish', overall_score: 93 },
          { name: 'Milk Chocolate', notes: 'Creamy vanilla, caramel, roasted nuts, balanced sweetness', overall_score: 88 },
          { name: 'White Chocolate', notes: 'Creamy butter, vanilla, subtle sweetness, smooth texture', overall_score: 85 }
        ]
      }
    ];

    let totalTastings = 0;
    let totalItems = 0;

    for (const tasting of tastingData) {
      // Create tasting session
      const { data: tastingRecord, error: tastingError } = await supabase
        .from('quick_tastings')
        .insert({
          user_id: userId,
          category: tasting.category,
          session_name: tasting.session_name,
          notes: `Comprehensive ${tasting.category} tasting session`
        })
        .select()
        .single();

      if (tastingError) {
        console.error(`❌ Failed to create ${tasting.session_name}:`, tastingError);
        continue;
      }

      console.log(`✅ Created tasting: ${tasting.session_name}`);
      totalTastings++;

      // Add items to tasting
      for (const item of tasting.items) {
        const { data: itemRecord, error: itemError } = await supabase
          .from('quick_tasting_items')
          .insert({
            tasting_id: tastingRecord.id,
            item_name: item.name,
            notes: item.notes,
            overall_score: item.overall_score
          })
          .select()
          .single();

        if (itemError) {
          console.error(`❌ Failed to add item ${item.name}:`, itemError);
        } else {
          console.log(`   ➕ Added item: ${item.name} (Score: ${item.overall_score})`);
          totalItems++;
        }
      }
    }

    // Create quick reviews with detailed flavor profiles
    const quickReviewData = [
      {
        item_name: 'Single Origin Ethiopian',
        category: 'coffee',
        brand: 'Blue Bottle',
        country: 'Ethiopia',
        region: 'Yirgacheffe',
        vintage: '2024',
        aroma_notes: 'Bright lemon zest, fresh jasmine flowers, honey sweetness',
        aroma_intensity: 85,
        flavor_notes: 'Citrus acidity, floral jasmine, delicate honey sweetness, clean finish',
        flavor_intensity: 82,
        salt_score: 15,
        acidity_score: 88,
        sweetness_score: 75,
        overall_score: 92
      },
      {
        item_name: 'Napa Valley Cabernet',
        category: 'wine',
        brand: 'Opus One',
        country: 'USA',
        region: 'Napa Valley',
        vintage: '2019',
        aroma_notes: 'Black currant, cedar wood, dark plum, subtle vanilla',
        aroma_intensity: 78,
        flavor_notes: 'Rich black fruit, firm tannins, oak influence, long finish',
        flavor_intensity: 85,
        acidity_score: 82,
        sweetness_score: 25,
        overall_score: 91
      },
      {
        item_name: 'Gyokuro Premium Green',
        category: 'tea',
        brand: 'Ippodo',
        country: 'Japan',
        region: 'Kyoto',
        vintage: '2024',
        aroma_notes: 'Fresh seaweed, steamed vegetable, umami richness',
        aroma_intensity: 72,
        flavor_notes: 'Deep umami, sweet vegetable notes, clean mineral finish',
        flavor_intensity: 88,
        acidity_score: 65,
        sweetness_score: 45,
        overall_score: 89
      },
      {
        item_name: 'Artisan Dark Chocolate',
        category: 'chocolate',
        brand: 'Pacari',
        country: 'Ecuador',
        region: 'Manabi',
        vintage: '2024',
        aroma_notes: 'Intense cocoa powder, dark fruit, subtle floral notes',
        aroma_intensity: 80,
        flavor_notes: 'Pure cocoa, blackberry, balanced acidity, smooth texture',
        flavor_intensity: 85,
        acidity_score: 70,
        sweetness_score: 30,
        overall_score: 94
      },
      {
        item_name: 'Aged Scotch Whisky',
        category: 'spirits',
        brand: 'Macallan',
        country: 'Scotland',
        region: 'Speyside',
        vintage: '2015',
        aroma_notes: 'Sherry cask, dried fruit, oak wood, subtle smoke',
        aroma_intensity: 75,
        flavor_notes: 'Rich sherry, dried fruit, vanilla oak, warming finish',
        flavor_intensity: 90,
        acidity_score: 55,
        sweetness_score: 60,
        overall_score: 96
      }
    ];

    let totalQuickReviews = 0;

    for (const review of quickReviewData) {
      const { data: reviewRecord, error: reviewError } = await supabase
        .from('quick_reviews')
        .insert({
          user_id: userId,
          item_name: review.item_name,
          category: review.category,
          brand: review.brand,
          country: review.country,
          region: review.region,
          vintage: review.vintage,
          aroma_notes: review.aroma_notes,
          aroma_intensity: review.aroma_intensity,
          flavor_notes: review.flavor_notes,
          flavor_intensity: review.flavor_intensity,
          salt_score: review.salt_score,
          acidity_score: review.acidity_score,
          sweetness_score: review.sweetness_score,
          overall_score: review.overall_score,
          status: 'published'
        })
        .select()
        .single();

      if (reviewError) {
        console.error(`❌ Failed to create quick review for ${review.item_name}:`, reviewError);
      } else {
        console.log(`✅ Created quick review: ${review.item_name} (Score: ${review.overall_score})`);
        totalQuickReviews++;
      }
    }

    // Create prose reviews with rich descriptive content
    const proseReviewData = [
      {
        item_name: 'Montrachet Grand Cru',
        category: 'wine',
        brand: 'Domaine de la Romanée-Conti',
        country: 'France',
        region: 'Burgundy',
        vintage: '2018',
        review_content: `This Montrachet Grand Cru opens with an ethereal bouquet of white flowers, honeyed brioche, and subtle mineral notes that dance on the nose. On the palate, it unfolds with layers of complexity - ripe Anjou pear, toasted hazelnut, and a crystalline acidity that cuts through the rich, creamy texture like a perfectly sharpened blade. The finish is interminable, leaving traces of salted butter caramel and wet stone that linger for minutes. This is white Burgundy at its most profound, a wine that speaks of limestone soils, meticulous viticulture, and the magic that happens when Chardonnay expresses its fullest potential. 98 points.`,
        status: 'published'
      },
      {
        item_name: 'Blue Mountain Peak',
        category: 'coffee',
        brand: 'Jamaica Blue Mountain',
        country: 'Jamaica',
        region: 'Blue Mountains',
        vintage: '2024',
        review_content: `Sipping this Blue Mountain Peak is like experiencing a gentle sunrise over misty Caribbean hills. The aroma is pure and delicate - fresh mountain air carrying hints of jasmine and soft cocoa. The first sip reveals a silky body with bright, sweet acidity that reminds me of tropical fruits kissed by morning dew. There's a subtle nuttiness that emerges mid-palate, like roasted almonds wrapped in honey, leading to a clean, lingering finish that leaves the palate refreshed and begging for another sip. This coffee doesn't overwhelm; it enchants. 95 points.`,
        status: 'published'
      },
      {
        item_name: 'Puerh Ancient Tree',
        category: 'tea',
        brand: 'Xiaguan',
        country: 'China',
        region: 'Yunnan',
        vintage: '2012',
        review_content: `This ancient tree Puerh has matured into something truly special. The dry leaf gives off aromas of damp earth, fermented fruit, and aged leather that immediately transport you to misty Yunnan mountains. Once brewed, it reveals layers of complexity - dark fruit compote, earthy mushrooms, and a subtle smokiness that speaks of traditional processing. The texture is velvety smooth with a warming quality that spreads through the body like a gentle embrace. The finish is long and contemplative, with notes of camphor and aged balsamic that evolve over time. A tea for quiet reflection. 92 points.`,
        status: 'published'
      }
    ];

    let totalProseReviews = 0;

    for (const review of proseReviewData) {
      const { data: reviewRecord, error: reviewError } = await supabase
        .from('prose_reviews')
        .insert({
          user_id: userId,
          item_name: review.item_name,
          category: review.category,
          brand: review.brand,
          country: review.country,
          region: review.region,
          vintage: review.vintage,
          review_content: review.review_content,
          status: review.status
        })
        .select()
        .single();

      if (reviewError) {
        console.error(`❌ Failed to create prose review for ${review.item_name}:`, reviewError);
      } else {
        console.log(`✅ Created prose review: ${review.item_name}`);
        totalProseReviews++;
      }
    }

    console.log('\n🎉 Data population completed!');
    console.log(`📊 Summary:`);
    console.log(`   • ${totalTastings} tasting sessions created`);
    console.log(`   • ${totalItems} tasting items added`);
    console.log(`   • ${totalQuickReviews} quick reviews created`);
    console.log(`   • ${totalProseReviews} prose reviews created`);
    console.log(`   • Total reviews: ${totalQuickReviews + totalProseReviews}`);

    console.log('\n🔄 Flavor descriptors should now be automatically extracted from these reviews.');
    console.log('🌟 Visit your flavor wheels to see the populated data!');

  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

populateTastingData();

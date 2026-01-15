#!/usr/bin/env node

/**
 * Generate AI-powered UI images for Flavatix
 * Uses OpenAI DALL-E API to create custom branded assets
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../public/generated-images');

if (!API_KEY) {
  console.error('❌ OPENAI_API_KEY not set. Export it and try again.');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Call OpenAI DALL-E 3 API to generate image
 */
async function generateImage(prompt, filename) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            const imageUrl = response.data[0].url;

            // Download the image
            downloadImage(imageUrl, filename)
              .then(() => {
                console.log(`✅ Generated: ${filename}`);
                resolve();
              })
              .catch(reject);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err.message}`));
          }
        } else {
          reject(new Error(`API Error (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

/**
 * Download image from URL and save locally
 */
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUTPUT_DIR, filename);

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', (err) => {
          fs.unlink(filepath, () => reject(err));
        });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * Image generation specs
 */
const imageSpecs = [
  // ONBOARDING CARDS
  {
    filename: 'onboarding-discover.png',
    prompt: 'Modern premium illustration of a crystal tasting glass with rich burgundy wine, catching warm golden light, minimalist flat design, rust-red and amber color palette, transparent background, high-end luxury aesthetic, 2025 UI style',
  },
  {
    filename: 'onboarding-taste.png',
    prompt: 'Beautiful abstract flavor wheel visualization spinning with emerald green and blue gradient colors, smooth curves, modern minimalist design, sophisticated palette, transparent background, premium UI element',
  },
  {
    filename: 'onboarding-connect.png',
    prompt: 'Stylized illustration of hands toasting wine glasses together, warm amber and purple gradient, celebration moment, inclusive diverse hands, minimalist flat design, transparent background, premium luxury aesthetic',
  },
  {
    filename: 'onboarding-ready.png',
    prompt: 'Flavatix logo concept: glowing geometric tasting vessel with warm amber light, sophisticated minimalist design, rust-red primary color (#C63C22), surrounded by subtle stars, premium luxury feel, transparent background',
  },

  // EMPTY STATES
  {
    filename: 'empty-tastings.png',
    prompt: 'Cute minimalist illustration of a patient tasting glass character with expressive eyes, waiting gesture, warm amber and cream color palette, flat design, whimsical personality, transparent background, 2025 modern UI style',
  },
  {
    filename: 'empty-flavor-wheel.png',
    prompt: 'Abstract colorful flavor wheel with segments gradually appearing in vibrant colors (citrus yellow, fruity red, earthy brown, fresh green), modern geometric design, sophisticated palette, transparent background, premium illustration',
  },
  {
    filename: 'empty-social.png',
    prompt: 'Lonely elegant tasting glass reaching outward with gentle motion lines, surrounded by small floating hearts, warm rust-red and cream colors, minimalist flat design, emotional connection theme, transparent background',
  },
  {
    filename: 'empty-competition.png',
    prompt: 'Minimalist trophy illustration with decorative geometric patterns, amber and gold accents, doubt icon replacing crown jewel, modern flat design, sophisticated yet playful, transparent background, premium feel',
  },
  {
    filename: 'empty-search.png',
    prompt: 'Curious magnifying glass character with expressive confused face, surrounded by small flavor elements (coffee beans, wine drops, tea leaves), warm color palette, minimalist flat design, transparent background, friendly personality',
  },

  // CATEGORY HERO BACKGROUNDS
  {
    filename: 'category-coffee-hero.png',
    prompt: 'Premium macro photography aesthetic: close-up of rich espresso crema with perfect microfoam, warm golden light from above, shallow depth of field, professional coffee shop aesthetic, rich brown and cream tones, luxury feel',
  },
  {
    filename: 'category-wine-hero.png',
    prompt: 'Luxury wine photography: deep burgundy wine swirling in crystal glass, catching warm golden light, sommelier hand visible, sophisticated vineyard backdrop slightly blurred, premium high-end aesthetic, rich wine tones',
  },
  {
    filename: 'category-spirits-hero.png',
    prompt: 'Premium spirits photography: amber whiskey or rum in crystal glass with ice cubes catching light, warm golden amber glow, luxury bar aesthetic, sophisticated dark backdrop, premium high-end photography',
  },
  {
    filename: 'category-tea-hero.png',
    prompt: 'Elegant tea photography: steaming cup of premium tea with visible vapor, delicate white porcelain cup, tea leaves macro detail, soft natural window light, serene zen aesthetic, warm cream and green tones',
  },
  {
    filename: 'category-chocolate-hero.png',
    prompt: 'Premium chocolate photography: broken dark chocolate bar with rich cocoa texture detail, melting moment aesthetic, cocoa powder dusting, warm golden light, luxury artisan chocolate feel, deep brown and amber tones',
  },

  // DASHBOARD GRAPHICS
  {
    filename: 'dashboard-quick-action.png',
    prompt: 'Modern gradient illustration for UI card: bold linear gradient from rust-red (#C63C22) to amber (#F97316), smooth clean design, subtle texture overlay, premium dashboard button background, 2025 UI style',
  },
  {
    filename: 'stats-icon-streak.png',
    prompt: 'Minimalist flame icon illustration with gradient fill (amber to red), premium UI element, flat design, 128px square, transparent background, sophisticated modern style',
  },
  {
    filename: 'stats-icon-category.png',
    prompt: 'Coffee bean icon illustration with premium gradient fill (brown to amber), minimalist flat design, 128px square, transparent background, luxury aesthetic',
  },
  {
    filename: 'stats-icon-network.png',
    prompt: 'Connected nodes network icon illustration with gradient fill (blue to purple), minimalist flat design, 128px square, transparent background, modern sophisticated style',
  },
];

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Generating Flavatix UI images...\n');
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  let completed = 0;
  let failed = 0;

  for (const spec of imageSpecs) {
    try {
      console.log(`📝 Generating: ${spec.filename}`);
      await generateImage(spec.prompt, spec.filename);
      completed++;
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to generate ${spec.filename}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✨ Generation complete!`);
  console.log(`✅ Completed: ${completed}/${imageSpecs.length}`);
  if (failed > 0) {
    console.log(`⚠️ Failed: ${failed}/${imageSpecs.length}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

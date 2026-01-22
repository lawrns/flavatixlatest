import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configuration
const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const THEME_COLOR = '#7C3AED'; // Purple from manifest
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Generate a simple, modern icon with "F" for Flavatix
async function generateIcon(size: number) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.224}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="central">F</text>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`));
}

// Generate shortcut icons
async function generateShortcutIcons() {
  const shortcuts = [
    { name: 'quick-tasting', icon: '⚡' },
    { name: 'flavor-wheel', icon: '🎯' }
  ];

  for (const shortcut of shortcuts) {
    const size = 96;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.224}" fill="#7C3AED"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}"
              fill="white" text-anchor="middle" dominant-baseline="central">${shortcut.icon}</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(ICONS_DIR, `${shortcut.name}.png`));
  }
}

// Generate favicon.ico (using 192x192 as base)
async function generateFavicon() {
  const size = 192;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.224}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="central">F</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(process.cwd(), 'public', 'favicon.png'));
}

// Main execution
async function main() {
  console.log('🎨 Generating PWA icons...\n');

  // Generate main icons
  for (const size of SIZES) {
    await generateIcon(size);
    console.log(`✅ Generated icon-${size}x${size}.png`);
  }

  // Generate shortcut icons
  await generateShortcutIcons();
  console.log(`✅ Generated shortcut icons`);

  // Generate favicon
  await generateFavicon();
  console.log(`✅ Generated favicon.png`);

  console.log(`\n🎉 All icons generated successfully!`);
  console.log(`📁 Location: ${ICONS_DIR}`);
}

main().catch(console.error);

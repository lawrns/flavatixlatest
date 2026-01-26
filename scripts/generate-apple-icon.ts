import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Generate Apple touch icon (180x180 is the standard size)
async function generateAppleTouchIcon() {
  const size = 180;
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
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));

  console.log('✅ Generated apple-touch-icon.png (180x180)');
}

generateAppleTouchIcon().catch(console.error);

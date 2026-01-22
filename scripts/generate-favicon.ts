import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Generate favicon.ico with multiple sizes
async function generateFavicon() {
  const sizes = [16, 32, 48];
  const buffers: Buffer[] = [];

  for (const size of sizes) {
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold"
              fill="white" text-anchor="middle" dominant-baseline="central">F</text>
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    buffers.push(pngBuffer);
  }

  // Write favicon.ico (simple ICO format - just using the largest size)
  const publicDir = path.join(process.cwd(), 'public');
  await sharp(buffers[1]) // Use 32x32
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ Generated favicon.ico');
}

generateFavicon().catch(console.error);

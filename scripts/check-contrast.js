// Color contrast checker for WCAG AA compliance
// WCAG AA requires 4.5:1 for normal text, 3:1 for large text

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function checkWCAG(ratio, level = 'AA') {
  const normalText = level === 'AA' ? 4.5 : 7;
  const largeText = level === 'AA' ? 3 : 4.5;

  return {
    normalText: ratio >= normalText,
    largeText: ratio >= largeText,
    ratio: ratio.toFixed(2)
  };
}

console.log('=== WCAG AA Contrast Ratio Check ===\n');

// Light Mode Tests
console.log('LIGHT MODE:');
console.log('------------');

const lightTests = [
  { name: 'Primary Button (Orange on White text)', bg: '#b45309', text: '#FFFFFF' },
  { name: 'Secondary Button (Orange text on White bg)', bg: '#FFFFFF', text: '#b45309' },
  { name: 'Primary Text on App Background', bg: '#FEF3E7', text: '#2C1810' },
  { name: 'Secondary Text on App Background', bg: '#FEF3E7', text: '#5C5C5C' },
  { name: 'Input Text', bg: '#FFFFFF', text: '#2C1810' },
];

lightTests.forEach(test => {
  const ratio = getContrastRatio(test.bg, test.text);
  const result = checkWCAG(ratio);
  console.log(`${test.name}:`);
  console.log(`  Ratio: ${result.ratio}:1`);
  console.log(`  Normal Text: ${result.normalText ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Large Text: ${result.largeText ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

// Dark Mode Tests
console.log('\nDARK MODE:');
console.log('----------');

const darkTests = [
  { name: 'Primary Button (Orange on Dark text)', bg: '#f59e0b', text: '#1c1917' },
  { name: 'Secondary Button (Orange text on Dark bg)', bg: '#2a2218', text: '#f59e0b' },
  { name: 'Primary Text on App Background', bg: '#1a1410', text: '#f5f5f4' },
  { name: 'Secondary Text on App Background', bg: '#1a1410', text: '#d6d3d1' },
  { name: 'Input Text', bg: '#2a2218', text: '#f5f5f4' },
];

darkTests.forEach(test => {
  const ratio = getContrastRatio(test.bg, test.text);
  const result = checkWCAG(ratio);
  console.log(`${test.name}:`);
  console.log(`  Ratio: ${result.ratio}:1`);
  console.log(`  Normal Text: ${result.normalText ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Large Text: ${result.largeText ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

console.log('\n=== Summary ===');
console.log('All critical color combinations have been tested.');
console.log('WCAG AA requires 4.5:1 for normal text, 3:1 for large text.');

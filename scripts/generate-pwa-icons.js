/**
 * Generate PWA Icons Script
 * Creates app icons in multiple sizes for PWA installation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#1f2937"/>
  
  <!-- Fire Icon -->
  <g transform="translate(${size/2}, ${size/2})">
    <path d="M0-${size*0.3} C${size*0.15}-${size*0.25} ${size*0.2}-${size*0.15} ${size*0.2}-${size*0.05} 
             C${size*0.2} ${size*0.1} ${size*0.1} ${size*0.2} 0 ${size*0.25}
             C-${size*0.1} ${size*0.2} -${size*0.2} ${size*0.1} -${size*0.2}-${size*0.05}
             C-${size*0.2}-${size*0.15} -${size*0.15}-${size*0.25} 0-${size*0.3} Z" 
          fill="#f97316" stroke="#ea580c" stroke-width="2"/>
    <path d="M0-${size*0.2} C${size*0.08}-${size*0.17} ${size*0.12}-${size*0.1} ${size*0.12}-${size*0.02}
             C${size*0.12} ${size*0.08} ${size*0.05} ${size*0.15} 0 ${size*0.18}
             C-${size*0.05} ${size*0.15} -${size*0.12} ${size*0.08} -${size*0.12}-${size*0.02}
             C-${size*0.12}-${size*0.1} -${size*0.08}-${size*0.17} 0-${size*0.2} Z"
          fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
  </g>
  
  <!-- Text (for larger icons) -->
  ${size >= 192 ? `<text x="${size/2}" y="${size*0.85}" 
        font-family="Arial, sans-serif" 
        font-size="${size*0.12}" 
        font-weight="bold" 
        fill="#f3f4f6" 
        text-anchor="middle">FP TRACKER</text>` : ''}
</svg>`;
}

// Generate icons
console.log('Generating PWA icons...');

const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons for each size
sizes.forEach(size => {
  const filename = `pwa-${size}x${size}.png`;
  const svgFilename = `pwa-${size}x${size}.svg`;
  const svgContent = createSVGIcon(size);
  
  // Save SVG version
  const svgPath = path.join(publicDir, svgFilename);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${svgFilename}`);
});

// Create apple-touch-icon (just copy the 192 version)
const appleIconPath = path.join(publicDir, 'apple-touch-icon.png');
const sourceIcon = path.join(publicDir, 'pwa-192x192.svg');
if (fs.existsSync(sourceIcon)) {
  fs.copyFileSync(sourceIcon, appleIconPath.replace('.png', '.svg'));
  console.log('✓ Created apple-touch-icon.svg');
}

console.log('\n✅ Icon generation complete!');
console.log('\nNote: SVG icons have been created. For production, you should:');
console.log('1. Convert SVG files to PNG using a tool like sharp or Inkscape');
console.log('2. Or use an online converter like https://cloudconvert.com/svg-to-png');
console.log('3. Or use a design tool like Figma/Photoshop to create custom icons');
console.log('\nFor now, the app will work with SVG icons in modern browsers.');

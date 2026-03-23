import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple placeholder PNG creation (you'll need to replace these with actual PNG files)
// For now, we'll copy the SVG as placeholder

const iconSizes = [16, 32, 152, 167, 180, 192, 310, 512];

iconSizes.forEach(size => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" fill="#3b82f6" rx="80"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">DM</text>
</svg>`;
  
  fs.writeFileSync(path.join(__dirname, 'public', `icon-${size}x${size}.svg`), svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

// Create favicon.ico placeholder
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), '');
console.log('Created favicon.ico placeholder');

console.log('Icon generation complete! Note: These are SVG placeholders. For production, convert them to PNG files using a tool like sharp or an online converter.');

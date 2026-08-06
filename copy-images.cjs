// Run this script with: node copy-images.cjs
const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, 'client', 'public', 'images');
fs.mkdirSync(destDir, { recursive: true });

const srcDir = 'C:\\Users\\deban\\.gemini\\antigravity-ide\\brain\\4b6bb122-b779-4640-8610-2e9310972268';

const files = [
  { src: 'media__1786024917349.jpg', dest: 'hero-1.jpg' }, // Tie-dye Chase Your Vision photo
  { src: 'media__1786024917490.jpg', dest: 'hero-2.jpg' }, // Speed Racer photo
  { src: 'media__1786023007024.png', dest: 'hero-3.jpg' },
  { src: 'new_arrival_1_1786025196149.png', dest: 'new-arrival-1.png' },
  { src: 'new_arrival_2_1786025208524.png', dest: 'new-arrival-2.png' },
  { src: 'new_arrival_3_1786025220436.png', dest: 'new-arrival-3.png' },
  { src: 'new_arrival_4_1786025233333.png', dest: 'new-arrival-4.png' },
  { src: 'hero_banner_1786023920522.png', dest: 'hero-banner.png' },
];

files.forEach(({ src, dest }) => {
  const srcPath = path.join(srcDir, src);
  const destPath = path.join(destDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${dest}`);
  } else {
    console.log(`✗ Source not found: ${src}`);
  }
});

console.log('\nDone! Images in:', destDir);
if (fs.existsSync(destDir)) {
  console.log('Files:', fs.readdirSync(destDir));
}

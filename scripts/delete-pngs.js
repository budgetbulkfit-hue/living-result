const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(dir);

// Don't delete favicon.png or apple-touch-icon.png if they exist
const excludeList = ['favicon.png', 'apple-touch-icon.png'];

const pngs = files.filter(f => f.toLowerCase().endsWith('.png') && !excludeList.includes(f));

let deletedCount = 0;
let bytesRecovered = 0;

for (const png of pngs) {
  const webpName = png.replace(/\.png$/i, '.webp');
  const webpPath = path.join(dir, webpName);
  const pngPath = path.join(dir, png);

  // Only delete if the webp version exists
  if (fs.existsSync(webpPath)) {
    bytesRecovered += fs.statSync(pngPath).size;
    fs.unlinkSync(pngPath);
    deletedCount++;
    console.log(`Deleted: ${png}`);
  } else {
    console.log(`Skipped: ${png} (No corresponding .webp found)`);
  }
}

console.log(`\nDeleted ${deletedCount} PNG files.`);
console.log(`Recovered space: ${(bytesRecovered / 1024 / 1024).toFixed(2)} MB`);

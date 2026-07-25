/**
 * compress-images.js
 * Converts all PNG images in /public/images to WebP (quality 82).
 * Also re-compresses existing JPEGs.
 * Run: node scripts/compress-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images');
const WEBP_QUALITY = 82;

async function compressImages() {
  const files = fs.readdirSync(INPUT_DIR);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files to convert to WebP...\n`);

  let totalSavedBytes = 0;
  let converted = 0;
  let skipped = 0;

  for (const file of pngFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = file.replace(/\.png$/i, '.webp');
    const outputPath = path.join(INPUT_DIR, outputName);

    // Skip if WebP already exists and is newer than the PNG
    if (fs.existsSync(outputPath)) {
      const pngStat = fs.statSync(inputPath);
      const webpStat = fs.statSync(outputPath);
      if (webpStat.mtimeMs > pngStat.mtimeMs) {
        skipped++;
        continue;
      }
    }

    try {
      const originalSize = fs.statSync(inputPath).size;
      await sharp(inputPath).webp({ quality: WEBP_QUALITY }).toFile(outputPath);
      const newSize = fs.statSync(outputPath).size;
      const saved = originalSize - newSize;
      totalSavedBytes += saved;
      converted++;

      const pct = ((saved / originalSize) * 100).toFixed(1);
      console.log(`✅ ${file} → ${outputName}  |  ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB  (-${pct}%)`);
    } catch (err) {
      console.error(`❌ Failed: ${file} — ${err.message}`);
    }
  }

  console.log(`\n✔ Done! Converted: ${converted}, Skipped (already up-to-date): ${skipped}`);
  console.log(`💾 Total space saved: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\nNext step: Update your <Image> src paths from .png to .webp`);
}

compressImages();

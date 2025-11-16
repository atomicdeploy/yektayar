#!/usr/bin/env node
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PUBLIC_DIR = join(__dirname, '..', 'public');
const IMAGE_FILES = ['welcome-hero.jpg'];
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 90;

// Responsive image sizes for different pixel densities
const IMAGE_SIZES = {
  '1x': { width: 640, suffix: '' },
  '2x': { width: 1280, suffix: '@2x' },
  '3x': { width: 1920, suffix: '@3x' }
};

/**
 * Generate thumbnail for blur placeholder (LQIP - Low Quality Image Placeholder)
 */
async function generateThumbnail(inputPath) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '-thumb.jpg');
  
  try {
    await sharp(inputPath)
      .resize(20, null, { fit: 'inside' })
      .jpeg({ quality: 20 })
      .toFile(outputPath);
    
    console.log(`   📐 Thumbnail: ${outputPath.split('/').pop()}`);
  } catch (error) {
    console.error(`   ❌ Error generating thumbnail:`, error.message);
  }
}

/**
 * Convert images to WebP format for better performance
 */
async function convertToWebP() {
  console.log('🖼️  Converting images to WebP format...\n');

  for (const imageFile of IMAGE_FILES) {
    const inputPath = join(PUBLIC_DIR, imageFile);
    const baseName = imageFile.replace(/\.(jpg|jpeg|png)$/i, '');

    try {
      // Check if source file exists
      await fs.access(inputPath);

      // Get input file stats
      const inputStats = await fs.stat(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      console.log(`✅ ${imageFile} (${inputSizeKB} KB)`);

      // Generate multiple sizes for each format
      for (const [density, config] of Object.entries(IMAGE_SIZES)) {
        const webpPath = join(PUBLIC_DIR, `${baseName}${config.suffix}.webp`);
        const jpegPath = join(PUBLIC_DIR, `${baseName}${config.suffix}.jpg`);

        // Convert to WebP
        await sharp(inputPath)
          .resize(config.width, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(webpPath);

        // Optimize JPEG - skip if it's the same as input to avoid overwriting
        if (jpegPath !== inputPath) {
          await sharp(inputPath)
            .resize(config.width, null, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY, progressive: true })
            .toFile(jpegPath);
        }

        const webpStats = await fs.stat(webpPath);
        
        console.log(`   ${density} (${config.width}px):`);
        
        // Only report JPEG stats if we created a new file (not the original)
        if (jpegPath !== inputPath) {
          const jpegStats = await fs.stat(jpegPath);
          console.log(`      JPG: ${(jpegStats.size / 1024).toFixed(2)} KB`);
          console.log(`      WebP: ${(webpStats.size / 1024).toFixed(2)} KB (${((1 - webpStats.size / jpegStats.size) * 100).toFixed(1)}% smaller)`);
        } else {
          console.log(`      JPG: ${inputSizeKB} KB (original)`);
          console.log(`      WebP: ${(webpStats.size / 1024).toFixed(2)} KB (${((1 - webpStats.size / inputStats.size) * 100).toFixed(1)}% smaller)`);
        }
      }

      // Generate thumbnail for blur placeholder
      await generateThumbnail(inputPath);

      console.log('');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  ${imageFile} not found - skipping WebP conversion`);
        console.warn(`   Please add the hero image to ${PUBLIC_DIR}\n`);
      } else {
        console.error(`❌ Error converting ${imageFile}:`, error.message, '\n');
      }
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 YektaYar Image Optimization\n');
  console.log('=' .repeat(50) + '\n');

  try {
    await convertToWebP();

    console.log('=' .repeat(50));
    console.log('✨ Image optimization complete!\n');
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

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

/**
 * Convert images to WebP format for better performance
 */
async function convertToWebP() {
  console.log('🖼️  Converting images to WebP format...\n');

  for (const imageFile of IMAGE_FILES) {
    const inputPath = join(PUBLIC_DIR, imageFile);
    const outputPath = join(PUBLIC_DIR, imageFile.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    try {
      // Check if source file exists
      await fs.access(inputPath);

      // Get input file stats
      const inputStats = await fs.stat(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      // Get output file stats
      const outputStats = await fs.stat(outputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✅ ${imageFile}`);
      console.log(`   Original: ${inputSizeKB} KB`);
      console.log(`   WebP: ${outputSizeKB} KB (${savings}% smaller)\n`);
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
 * Optimize JPG images
 */
async function optimizeJPEG() {
  console.log('📦 Optimizing JPEG images...\n');

  for (const imageFile of IMAGE_FILES) {
    if (!imageFile.match(/\.jpe?g$/i)) continue;

    const inputPath = join(PUBLIC_DIR, imageFile);
    const tempPath = join(PUBLIC_DIR, `${imageFile}.tmp`);

    try {
      // Check if source file exists
      await fs.access(inputPath);

      // Get input file stats
      const inputStats = await fs.stat(inputPath);
      const inputSizeKB = (inputStats.size / 1024).toFixed(2);

      // Optimize JPEG
      await sharp(inputPath)
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(tempPath);

      // Replace original with optimized version
      await fs.rename(tempPath, inputPath);

      // Get output file stats
      const outputStats = await fs.stat(inputPath);
      const outputSizeKB = (outputStats.size / 1024).toFixed(2);
      const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`✅ ${imageFile} optimized`);
      console.log(`   Before: ${inputSizeKB} KB`);
      console.log(`   After: ${outputSizeKB} KB (${savings}% smaller)\n`);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {}

      if (error.code === 'ENOENT') {
        console.warn(`⚠️  ${imageFile} not found - skipping optimization\n`);
      } else {
        console.error(`❌ Error optimizing ${imageFile}:`, error.message, '\n');
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
    await optimizeJPEG();

    console.log('=' .repeat(50));
    console.log('✨ Image optimization complete!\n');
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

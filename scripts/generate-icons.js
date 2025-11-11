#!/usr/bin/env node
/**
 * Generate favicons and PNG icons from SVG sources
 * This script generates various icon sizes needed for web applications
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'logo');
const ADMIN_PUBLIC_DIR = path.join(ROOT_DIR, 'packages', 'admin-panel', 'public');
const MOBILE_PUBLIC_DIR = path.join(ROOT_DIR, 'packages', 'mobile-app', 'public');

// Icon sizes for various purposes
const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating icons for web applications...\n');

  // Read the icon SVG with background
  const iconSvgPath = path.join(ASSETS_DIR, 'icon.svg');
  const iconSvg = fs.readFileSync(iconSvgPath);

  // Ensure output directories exist
  if (!fs.existsSync(ADMIN_PUBLIC_DIR)) {
    fs.mkdirSync(ADMIN_PUBLIC_DIR, { recursive: true });
  }
  if (!fs.existsSync(MOBILE_PUBLIC_DIR)) {
    fs.mkdirSync(MOBILE_PUBLIC_DIR, { recursive: true });
  }

  // Generate PNG icons for admin panel
  console.log('📦 Generating PNG icons for admin panel...');
  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(ADMIN_PUBLIC_DIR, name);
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }

  // Generate PNG icons for mobile app
  console.log('\n📦 Generating PNG icons for mobile app...');
  for (const { size, name } of ICON_SIZES) {
    const outputPath = path.join(MOBILE_PUBLIC_DIR, name);
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico with multiple sizes (16, 32, 48)
  // Note: Sharp doesn't support ICO format directly, so we'll create the main favicon as PNG
  // and rely on modern browsers that support PNG favicons
  console.log('\n📦 Generating favicon.png (modern browsers)...');
  const faviconPathAdmin = path.join(ADMIN_PUBLIC_DIR, 'favicon.png');
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPathAdmin);
  console.log('  ✓ Generated favicon.png for admin panel (32x32)');

  const faviconPathMobile = path.join(MOBILE_PUBLIC_DIR, 'favicon.png');
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPathMobile);
  console.log('  ✓ Generated favicon.png for mobile app (32x32)');

  // Also copy the SVG logo for use in the apps
  console.log('\n📦 Copying logo SVG...');
  const logoSvgPath = path.join(ASSETS_DIR, 'logo.svg');
  
  const logoOutputPathAdmin = path.join(ADMIN_PUBLIC_DIR, 'logo.svg');
  fs.copyFileSync(logoSvgPath, logoOutputPathAdmin);
  console.log('  ✓ Copied logo.svg to admin panel');

  const logoOutputPathMobile = path.join(MOBILE_PUBLIC_DIR, 'logo.svg');
  fs.copyFileSync(logoSvgPath, logoOutputPathMobile);
  console.log('  ✓ Copied logo.svg to mobile app');

  // Copy icon.svg as well for reference
  const iconOutputPathAdmin = path.join(ADMIN_PUBLIC_DIR, 'icon.svg');
  fs.copyFileSync(iconSvgPath, iconOutputPathAdmin);
  console.log('  ✓ Copied icon.svg to admin panel');

  const iconOutputPathMobile = path.join(MOBILE_PUBLIC_DIR, 'icon.svg');
  fs.copyFileSync(iconSvgPath, iconOutputPathMobile);
  console.log('  ✓ Copied icon.svg to mobile app');

  console.log('\n✅ Icon generation complete!\n');
  console.log('Generated files for both admin panel and mobile app:');
  console.log(`  - ${ICON_SIZES.length} PNG icons in various sizes (per app)`);
  console.log(`  - favicon.png for modern browsers`);
  console.log(`  - logo.svg and icon.svg for reference`);
  console.log(`\nOutput directories:`);
  console.log(`  - Admin Panel: ${ADMIN_PUBLIC_DIR}`);
  console.log(`  - Mobile App: ${MOBILE_PUBLIC_DIR}`);
}

// Run the script
generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

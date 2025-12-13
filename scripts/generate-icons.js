#!/usr/bin/env node
/**
 * Generate favicons and PNG icons from SVG sources
 * This script generates various icon sizes needed for web applications
 * Now supports both light and dark mode variants
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const ASSETS_DIR = join(ROOT_DIR, 'assets', 'logo');
const ADMIN_PUBLIC_DIR = join(ROOT_DIR, 'packages', 'admin-panel', 'public');
const MOBILE_PUBLIC_DIR = join(ROOT_DIR, 'packages', 'mobile-app', 'public');
const DESKTOP_BUILD_DIR = join(ROOT_DIR, 'packages', 'desktop-app', 'build');

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

// Icon variants (light and dark)
const ICON_VARIANTS = [
  { suffix: '', svg: 'icon.svg', description: 'light mode' },
  { suffix: '-dark', svg: 'icon-dark.svg', description: 'dark mode' },
];

async function generateIcons() {
  console.log('🎨 Generating icons for web applications...\n');

  // Ensure output directories exist
  if (!existsSync(ADMIN_PUBLIC_DIR)) {
    mkdirSync(ADMIN_PUBLIC_DIR, { recursive: true });
  }
  if (!existsSync(MOBILE_PUBLIC_DIR)) {
    mkdirSync(MOBILE_PUBLIC_DIR, { recursive: true });
  }
  if (!existsSync(DESKTOP_BUILD_DIR)) {
    mkdirSync(DESKTOP_BUILD_DIR, { recursive: true });
  }

  // Generate PNG icons for each variant
  for (const { suffix, svg, description } of ICON_VARIANTS) {
    const iconSvgPath = join(ASSETS_DIR, svg);
    const iconSvg = readFileSync(iconSvgPath);

    // Generate PNG icons for admin panel
    console.log(`📦 Generating PNG icons for admin panel (${description})...`);
    for (const { size, name } of ICON_SIZES) {
      const fileName = name.replace('.png', `${suffix}.png`);
      const outputPath = join(ADMIN_PUBLIC_DIR, fileName);
      await sharp(iconSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated ${fileName} (${size}x${size})`);
    }

    // Generate PNG icons for mobile app
    console.log(`\n📦 Generating PNG icons for mobile app (${description})...`);
    for (const { size, name } of ICON_SIZES) {
      const fileName = name.replace('.png', `${suffix}.png`);
      const outputPath = join(MOBILE_PUBLIC_DIR, fileName);
      await sharp(iconSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated ${fileName} (${size}x${size})`);
    }
    console.log('');
  }

  // Generate favicon.ico with multiple sizes (16, 32, 48)
  // Note: Sharp doesn't support ICO format directly, so we'll create the main favicon as PNG
  // and rely on modern browsers that support PNG favicons
  // Use dark variant as default favicon
  console.log('📦 Generating favicon.png (modern browsers)...');
  const darkIconSvgPath = join(ASSETS_DIR, 'icon-dark.svg');
  const darkIconSvg = readFileSync(darkIconSvgPath);
  
  const faviconPathAdmin = join(ADMIN_PUBLIC_DIR, 'favicon.png');
  await sharp(darkIconSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPathAdmin);
  console.log('  ✓ Generated favicon.png for admin panel (32x32, dark variant as default)');

  const faviconPathMobile = join(MOBILE_PUBLIC_DIR, 'favicon.png');
  await sharp(darkIconSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPathMobile);
  console.log('  ✓ Generated favicon.png for mobile app (32x32, dark variant as default)');

  // Also copy the SVG logo for use in the apps
  console.log('\n📦 Copying logo SVG files...');
  const logoSvgPath = join(ASSETS_DIR, 'logo.svg');
  
  const logoOutputPathAdmin = join(ADMIN_PUBLIC_DIR, 'logo.svg');
  copyFileSync(logoSvgPath, logoOutputPathAdmin);
  console.log('  ✓ Copied logo.svg to admin panel');

  const logoOutputPathMobile = join(MOBILE_PUBLIC_DIR, 'logo.svg');
  copyFileSync(logoSvgPath, logoOutputPathMobile);
  console.log('  ✓ Copied logo.svg to mobile app');

  // Copy both icon variants for reference
  for (const { suffix, svg } of ICON_VARIANTS) {
    const iconSvgPath = join(ASSETS_DIR, svg);
    const iconFileName = `icon${suffix}.svg`;
    
    const iconOutputPathAdmin = join(ADMIN_PUBLIC_DIR, iconFileName);
    copyFileSync(iconSvgPath, iconOutputPathAdmin);
    console.log(`  ✓ Copied ${iconFileName} to admin panel`);

    const iconOutputPathMobile = join(MOBILE_PUBLIC_DIR, iconFileName);
    copyFileSync(iconSvgPath, iconOutputPathMobile);
    console.log(`  ✓ Copied ${iconFileName} to mobile app`);
  }

  // Generate desktop app icons (256x256 PNG for Electron)
  // Use the light variant for desktop
  console.log('\n📦 Generating desktop app icon...');
  const lightIconSvgPath = join(ASSETS_DIR, 'icon.svg');
  const lightIconSvg = readFileSync(lightIconSvgPath);
  const desktopIconPath = join(DESKTOP_BUILD_DIR, 'icon.png');
  await sharp(lightIconSvg)
    .resize(256, 256)
    .png()
    .toFile(desktopIconPath);
  console.log('  ✓ Generated icon.png for desktop app (256x256)');

  console.log('\n✅ Icon generation complete!\n');
  console.log('Generated files for admin panel, mobile app, and desktop app:');
  console.log(`  - ${ICON_SIZES.length} PNG icons in various sizes per variant (light & dark)`);
  console.log(`  - favicon.png for modern browsers (dark variant as default)`);
  console.log(`  - 256x256 PNG icon for desktop app`);
  console.log(`  - logo.svg, icon.svg, and icon-dark.svg for reference`);
  console.log(`\nOutput directories:`);
  console.log(`  - Admin Panel: ${ADMIN_PUBLIC_DIR}`);
  console.log(`  - Mobile App: ${MOBILE_PUBLIC_DIR}`);
  console.log(`  - Desktop App: ${DESKTOP_BUILD_DIR}`);
  console.log(`\nNote: Update manifest.json files to reference icon variants with prefers-color-scheme media queries.`);
}

// Run the script
generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

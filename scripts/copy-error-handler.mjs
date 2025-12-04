#!/usr/bin/env node
/**
 * Copy error-handler.js from shared package to app public directories
 * This ensures all apps use the same error handler
 */

import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const sourceFile = join(rootDir, 'packages/shared/public/error-handler.js');
const targets = [
  join(rootDir, 'packages/admin-panel/public/error-handler.js'),
  join(rootDir, 'packages/mobile-app/public/error-handler.js')
];

console.log('📋 Copying error-handler.js from shared package...');

targets.forEach(target => {
  try {
    // Ensure directory exists
    mkdirSync(dirname(target), { recursive: true });
    // Copy file
    copyFileSync(sourceFile, target);
    console.log(`✅ Copied to ${target.replace(rootDir, '.')}`);
  } catch (error) {
    console.error(`❌ Failed to copy to ${target}:`, error.message);
    process.exit(1);
  }
});

console.log('✨ Done!');

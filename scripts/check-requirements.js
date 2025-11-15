#!/usr/bin/env node

/**
 * YektaYar Requirements Checker
 * 
 * This script checks that all required tools and dependencies are installed
 * and meet the minimum version requirements for building and running the project.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Icons
const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

// Track overall status
let hasErrors = false;
let hasWarnings = false;

/**
 * Execute a command and return the output
 */
function execCommand(command, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : undefined 
    }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Parse semantic version string
 */
function parseVersion(versionStr) {
  if (!versionStr) return null;
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  };
}

/**
 * Compare two versions
 */
function compareVersions(version, required) {
  const v = parseVersion(version);
  const r = parseVersion(required);
  
  if (!v || !r) return false;
  
  if (v.major > r.major) return true;
  if (v.major < r.major) return false;
  if (v.minor > r.minor) return true;
  if (v.minor < r.minor) return false;
  return v.patch >= r.patch;
}

/**
 * Print formatted message
 */
function print(icon, color, message, indent = 0) {
  const indentation = '  '.repeat(indent);
  console.log(`${indentation}${icon} ${color}${message}${colors.reset}`);
}

/**
 * Check if a command exists
 */
function commandExists(command) {
  return execCommand(`which ${command}`, true) !== null;
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  print(icons.info, colors.cyan, 'Checking Node.js...', 0);
  
  const version = execCommand('node --version');
  if (!version) {
    print(icons.error, colors.red, 'Node.js is not installed', 1);
    print(icons.info, colors.yellow, 'Install from: https://nodejs.org/', 1);
    hasErrors = true;
    return;
  }
  
  const required = '18.0.0';
  const isValid = compareVersions(version, `v${required}`);
  
  if (isValid) {
    print(icons.success, colors.green, `Node.js ${version} (>= ${required} required)`, 1);
  } else {
    print(icons.error, colors.red, `Node.js ${version} is too old (>= ${required} required)`, 1);
    print(icons.info, colors.yellow, 'Update from: https://nodejs.org/', 1);
    hasErrors = true;
  }
}

/**
 * Check npm version
 */
function checkNpmVersion() {
  print(icons.info, colors.cyan, 'Checking npm...', 0);
  
  const version = execCommand('npm --version');
  if (!version) {
    print(icons.error, colors.red, 'npm is not installed', 1);
    hasErrors = true;
    return;
  }
  
  const required = '9.0.0';
  const isValid = compareVersions(version, required);
  
  if (isValid) {
    print(icons.success, colors.green, `npm ${version} (>= ${required} required)`, 1);
  } else {
    print(icons.error, colors.red, `npm ${version} is too old (>= ${required} required)`, 1);
    print(icons.info, colors.yellow, 'Update with: npm install -g npm@latest', 1);
    hasErrors = true;
  }
}

/**
 * Check if dependencies are installed
 */
function checkDependencies() {
  print(icons.info, colors.cyan, 'Checking project dependencies...', 0);
  
  const rootNodeModules = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(rootNodeModules)) {
    print(icons.error, colors.red, 'Dependencies are not installed', 1);
    print(icons.info, colors.yellow, 'Run: npm install', 1);
    hasErrors = true;
    return;
  }
  
  print(icons.success, colors.green, 'Root dependencies are installed', 1);
  
  // Check workspace dependencies
  const workspaces = ['backend', 'admin-panel', 'mobile-app', 'shared'];
  let allInstalled = true;
  
  for (const workspace of workspaces) {
    const workspaceNodeModules = path.join(process.cwd(), 'packages', workspace, 'node_modules');
    if (!fs.existsSync(workspaceNodeModules)) {
      print(icons.warning, colors.yellow, `Workspace @yektayar/${workspace} dependencies not installed`, 1);
      allInstalled = false;
    }
  }
  
  if (allInstalled) {
    print(icons.success, colors.green, 'All workspace dependencies are installed', 1);
  } else {
    print(icons.warning, colors.yellow, 'Some workspace dependencies may need installation', 1);
    print(icons.info, colors.yellow, 'Run: npm install', 1);
    hasWarnings = true;
  }
}

/**
 * Check Capacitor CLI
 */
function checkCapacitor() {
  print(icons.info, colors.cyan, 'Checking Capacitor CLI...', 0);
  
  const mobileAppPackageJson = path.join(process.cwd(), 'packages', 'mobile-app', 'package.json');
  
  if (!fs.existsSync(mobileAppPackageJson)) {
    print(icons.warning, colors.yellow, 'Mobile app package.json not found', 1);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(mobileAppPackageJson, 'utf-8'));
  const hasCapacitorCli = packageJson.devDependencies?.['@capacitor/cli'];
  
  if (hasCapacitorCli) {
    print(icons.success, colors.green, `Capacitor CLI ${hasCapacitorCli} installed (in mobile-app)`, 1);
    print(icons.info, colors.cyan, 'Note: Use "npx cap" commands for mobile builds', 1);
  } else {
    print(icons.error, colors.red, 'Capacitor CLI not found in mobile-app dependencies', 1);
    hasErrors = true;
  }
}

/**
 * Check optional dependencies
 */
function checkOptionalDependencies() {
  print(icons.info, colors.cyan, 'Checking optional dependencies...', 0);
  
  // Check Bun (for backend)
  if (commandExists('bun')) {
    const version = execCommand('bun --version');
    print(icons.success, colors.green, `Bun ${version} (for backend development)`, 1);
  } else {
    print(icons.info, colors.yellow, 'Bun not installed (optional, for backend)', 1);
    print(icons.info, colors.cyan, 'Install from: https://bun.sh/', 1);
  }
  
  // Check Java (for Android builds)
  if (commandExists('java')) {
    const version = execCommand('java -version 2>&1 | head -n 1');
    print(icons.success, colors.green, `Java installed (for Android builds)`, 1);
  } else {
    print(icons.info, colors.yellow, 'Java not installed (needed for Android builds)', 1);
    print(icons.info, colors.cyan, 'Install JDK 17 or later', 1);
  }
  
  // Check Android SDK
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (androidHome && fs.existsSync(androidHome)) {
    print(icons.success, colors.green, `Android SDK found at ${androidHome}`, 1);
  } else {
    print(icons.info, colors.yellow, 'Android SDK not found (needed for Android builds)', 1);
    print(icons.info, colors.cyan, 'Install Android Studio or set ANDROID_HOME', 1);
  }
}

/**
 * Check build output directories
 */
function checkBuildOutputs() {
  print(icons.info, colors.cyan, 'Checking build outputs...', 0);
  
  const builds = [
    { name: 'Shared package', path: 'packages/shared/dist' },
    { name: 'Backend', path: 'packages/backend/dist' },
    { name: 'Admin panel', path: 'packages/admin-panel/dist' },
    { name: 'Mobile app', path: 'packages/mobile-app/dist' },
  ];
  
  let anyBuilt = false;
  for (const build of builds) {
    const buildPath = path.join(process.cwd(), build.path);
    if (fs.existsSync(buildPath)) {
      print(icons.success, colors.green, `${build.name} is built`, 1);
      anyBuilt = true;
    }
  }
  
  if (!anyBuilt) {
    print(icons.info, colors.yellow, 'No build outputs found (run builds as needed)', 1);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('');
  console.log('='.repeat(60));
  
  if (hasErrors) {
    print(icons.error, colors.red + colors.bold, 'REQUIREMENTS CHECK FAILED', 0);
    console.log('');
    print(icons.info, colors.yellow, 'Please install missing requirements and try again.', 0);
    print(icons.info, colors.cyan, 'Run: bash ./scripts/install-dev-tools.sh', 0);
    process.exit(1);
  } else if (hasWarnings) {
    print(icons.warning, colors.yellow + colors.bold, 'REQUIREMENTS CHECK PASSED WITH WARNINGS', 0);
    console.log('');
    print(icons.info, colors.cyan, 'All critical requirements are met.', 0);
    print(icons.info, colors.cyan, 'Address warnings for optimal experience.', 0);
  } else {
    print(icons.success, colors.green + colors.bold, 'ALL REQUIREMENTS MET!', 0);
    console.log('');
    print(icons.info, colors.cyan, 'You\'re ready to build and run the project.', 0);
  }
  
  console.log('='.repeat(60));
  
  // Check if this looks like a fresh clone and suggest post-clone setup
  const hasEnvFile = fs.existsSync(path.join(process.cwd(), '.env'));
  if (!hasEnvFile && !hasErrors) {
    console.log('');
    print(icons.info, colors.cyan + colors.bold, 'First time here?', 0);
    print(icons.info, colors.cyan, 'Run the post-clone setup for an enhanced experience:', 0);
    console.log('');
    console.log(colors.yellow + '  bash ./scripts/post-clone-setup.sh' + colors.reset);
    console.log('');
    print(icons.info, colors.cyan, 'This will:', 0);
    print(icons.info, colors.cyan, '  • Install missing optional tools', 1);
    print(icons.info, colors.cyan, '  • Enhance your bash configuration with git-aware prompt', 1);
    print(icons.info, colors.cyan, '  • Add useful development aliases', 1);
    print(icons.info, colors.cyan, '  • Set up npm completions', 1);
    print(icons.info, colors.cyan, '  • Configure keyboard shortcuts (Ctrl-Backspace, Ctrl-Delete)', 1);
  }
  
  console.log('');
}

/**
 * Main function
 */
function main() {
  console.log('');
  console.log(colors.cyan + colors.bold + 'YektaYar Requirements Checker' + colors.reset);
  console.log('='.repeat(60));
  console.log('');
  
  checkNodeVersion();
  console.log('');
  
  checkNpmVersion();
  console.log('');
  
  checkDependencies();
  console.log('');
  
  checkCapacitor();
  console.log('');
  
  checkOptionalDependencies();
  console.log('');
  
  checkBuildOutputs();
  console.log('');
  
  printSummary();
}

// Run the script
main();

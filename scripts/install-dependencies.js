#!/usr/bin/env node

/**
 * YektaYar Dependency Installer
 * 
 * This script ensures that all directories containing package.json files
 * have their dependencies properly installed. It's useful when:
 * - A new dependency is added to any package
 * - You've pulled changes that update package.json files
 * - You want to ensure all packages have up-to-date dependencies
 * 
 * For npm workspaces monorepos, it intelligently runs npm install at the
 * root level which handles all workspace dependencies.
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
  package: '📦',
  install: '🔧',
};

/**
 * Execute a command and return the output
 */
function execCommand(command, cwd, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      cwd: cwd,
      stdio: silent ? 'pipe' : 'inherit'
    }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Print formatted message
 */
function print(icon, color, message, indent = 0) {
  const indentation = '  '.repeat(indent);
  console.log(`${indentation}${icon} ${color}${message}${colors.reset}`);
}

/**
 * Find all directories containing package.json files
 */
function findPackageJsonDirs(rootDir, excludeDirs = ['node_modules', '.git', 'dist', 'build']) {
  const packageDirs = [];
  
  function searchDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      // Check if current directory has package.json
      const hasPackageJson = entries.some(entry => entry.isFile() && entry.name === 'package.json');
      if (hasPackageJson) {
        packageDirs.push(dir);
      }
      
      // Recursively search subdirectories
      for (const entry of entries) {
        if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
          searchDir(path.join(dir, entry.name));
        }
      }
    } catch (error) {
      // Skip directories we don't have permission to read
    }
  }
  
  searchDir(rootDir);
  return packageDirs;
}

/**
 * Check if dependencies need to be installed
 */
function needsInstallation(packageDir, rootDir, isWorkspace) {
  const nodeModulesPath = path.join(packageDir, 'node_modules');
  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageLockPath = path.join(packageDir, 'package-lock.json');
  
  // For workspace packages, check the root node_modules since dependencies are hoisted
  if (isWorkspace) {
    const rootNodeModules = path.join(rootDir, 'node_modules');
    if (!fs.existsSync(rootNodeModules)) {
      return { needs: true, reason: 'root node_modules not found' };
    }
    
    // Check if root package-lock is newer than root node_modules
    const rootPackageLock = path.join(rootDir, 'package-lock.json');
    if (fs.existsSync(rootPackageLock)) {
      try {
        const rootPackageLockStat = fs.statSync(rootPackageLock);
        const rootNodeModulesStat = fs.statSync(rootNodeModules);
        
        if (rootPackageLockStat.mtime > rootNodeModulesStat.mtime) {
          return { needs: true, reason: 'root package-lock.json is newer' };
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    // For workspace packages, they're considered up to date if root node_modules exists
    return { needs: false, reason: 'workspace dependencies via root' };
  }
  
  // For non-workspace packages (root or standalone)
  // If node_modules doesn't exist, definitely needs installation
  if (!fs.existsSync(nodeModulesPath)) {
    return { needs: true, reason: 'node_modules not found' };
  }
  
  // Check if package.json is newer than node_modules
  try {
    const packageJsonStat = fs.statSync(packageJsonPath);
    const nodeModulesStat = fs.statSync(nodeModulesPath);
    
    if (packageJsonStat.mtime > nodeModulesStat.mtime) {
      return { needs: true, reason: 'package.json is newer than node_modules' };
    }
    
    // If package-lock.json exists and is newer than node_modules, needs installation
    if (fs.existsSync(packageLockPath)) {
      const packageLockStat = fs.statSync(packageLockPath);
      if (packageLockStat.mtime > nodeModulesStat.mtime) {
        return { needs: true, reason: 'package-lock.json is newer than node_modules' };
      }
    }
  } catch (error) {
    return { needs: true, reason: 'unable to check timestamps' };
  }
  
  return { needs: false, reason: 'up to date' };
}

/**
 * Get package name from package.json
 */
function getPackageName(packageDir) {
  try {
    const packageJsonPath = path.join(packageDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.name || path.basename(packageDir);
  } catch (error) {
    return path.basename(packageDir);
  }
}

/**
 * Check if root package.json uses workspaces
 */
function hasWorkspaces(rootDir) {
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return Boolean(packageJson.workspaces);
  } catch (error) {
    return false;
  }
}

/**
 * Check if directory is a workspace package
 */
function isWorkspacePackage(packageDir, rootDir) {
  const relativeDir = path.relative(rootDir, packageDir);
  // Check if this is within a workspace directory (like packages/*)
  return relativeDir.startsWith('packages' + path.sep) && packageDir !== rootDir;
}

/**
 * Install dependencies for workspace monorepo
 */
function installWorkspaceDependencies(rootDir) {
  print(icons.info, colors.cyan, 'Installing dependencies for workspace monorepo...', 1);
  print(icons.info, colors.blue, 'This will install dependencies for all packages', 1);
  console.log('');
  
  try {
    const command = 'npm install --no-audit';
    print(icons.install, colors.blue, `Running: ${command}`, 2);
    
    // Run the command and capture the result
    // Note: We ignore the exit code because postinstall hooks may cause warnings
    execCommand(command, rootDir, false);
    
    // Verify installation by checking if node_modules exist
    const rootNodeModules = path.join(rootDir, 'node_modules');
    if (fs.existsSync(rootNodeModules)) {
      print(icons.success, colors.green, 'Dependencies installed successfully for all packages', 2);
      return true;
    } else {
      print(icons.error, colors.red, 'Failed to install dependencies', 2);
      return false;
    }
  } catch (error) {
    // Even if there's an error, check if node_modules was created
    const rootNodeModules = path.join(rootDir, 'node_modules');
    if (fs.existsSync(rootNodeModules)) {
      print(icons.success, colors.green, 'Dependencies installed (with warnings)', 2);
      return true;
    }
    print(icons.error, colors.red, `Error installing dependencies: ${error.message}`, 2);
    return false;
  }
}

/**
 * Install dependencies for a standalone package
 */
function installStandaloneDependencies(packageDir) {
  const packageName = getPackageName(packageDir);
  const relativeDir = path.relative(process.cwd(), packageDir) || '.';
  
  print(icons.info, colors.cyan, `Installing dependencies for ${colors.bold}${packageName}${colors.reset}${colors.cyan} (${relativeDir})`, 1);
  
  try {
    const command = 'npm install --no-audit --no-fund';
    print(icons.install, colors.blue, `Running: ${command}`, 2);
    
    // Run the command
    execCommand(command, packageDir, false);
    
    // Verify installation by checking if node_modules exist
    const nodeModules = path.join(packageDir, 'node_modules');
    if (fs.existsSync(nodeModules)) {
      print(icons.success, colors.green, `Dependencies installed successfully for ${packageName}`, 2);
      return true;
    } else {
      print(icons.error, colors.red, `Failed to install dependencies for ${packageName}`, 2);
      return false;
    }
  } catch (error) {
    // Even if there's an error, check if node_modules was created
    const nodeModules = path.join(packageDir, 'node_modules');
    if (fs.existsSync(nodeModules)) {
      print(icons.success, colors.green, `Dependencies installed for ${packageName} (with warnings)`, 2);
      return true;
    }
    print(icons.error, colors.red, `Error installing dependencies for ${packageName}: ${error.message}`, 2);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('');
  console.log(colors.cyan + colors.bold + 'YektaYar Dependency Installer' + colors.reset);
  console.log('='.repeat(60));
  console.log('');
  
  const rootDir = process.cwd();
  const isWorkspaceMonorepo = hasWorkspaces(rootDir);
  
  // Find all package.json directories
  print(icons.info, colors.cyan, 'Scanning for package.json files...', 0);
  const packageDirs = findPackageJsonDirs(rootDir);
  
  if (packageDirs.length === 0) {
    print(icons.warning, colors.yellow, 'No package.json files found', 1);
    return;
  }
  
  print(icons.success, colors.green, `Found ${packageDirs.length} package(s)`, 1);
  
  if (isWorkspaceMonorepo) {
    print(icons.info, colors.cyan, 'Detected npm workspaces monorepo', 1);
  }
  
  console.log('');
  
  // Sort so root is processed first
  packageDirs.sort((a, b) => {
    if (a === rootDir) return -1;
    if (b === rootDir) return 1;
    return a.localeCompare(b);
  });
  
  // Check each package
  const packagesToInstall = [];
  const packagesUpToDate = [];
  
  print(icons.info, colors.cyan, 'Checking dependency status...', 0);
  console.log('');
  
  for (const packageDir of packageDirs) {
    const packageName = getPackageName(packageDir);
    const relativeDir = path.relative(rootDir, packageDir) || '.';
    const isRoot = packageDir === rootDir;
    const isWorkspacePkg = isWorkspaceMonorepo && isWorkspacePackage(packageDir, rootDir);
    
    const status = needsInstallation(packageDir, rootDir, isWorkspacePkg);
    
    print(icons.package, colors.blue, `${colors.bold}${packageName}${colors.reset}${colors.blue} (${relativeDir})`, 1);
    
    if (status.needs) {
      print(icons.warning, colors.yellow, `Needs installation: ${status.reason}`, 2);
      packagesToInstall.push({ dir: packageDir, name: packageName, isRoot });
    } else {
      print(icons.success, colors.green, `Up to date: ${status.reason}`, 2);
      packagesUpToDate.push({ dir: packageDir, name: packageName });
    }
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  
  // Install dependencies if needed
  if (packagesToInstall.length === 0) {
    print(icons.success, colors.green + colors.bold, 'All packages have up-to-date dependencies!', 0);
    console.log('');
    return;
  }
  
  print(icons.info, colors.cyan, `Found ${packagesToInstall.length} package(s) needing installation`, 0);
  console.log('');
  
  let success = false;
  
  if (isWorkspaceMonorepo) {
    // For workspace monorepo, check if any workspace packages need installation
    const workspacePackagesNeedInstall = packagesToInstall.some(pkg => 
      isWorkspacePackage(pkg.dir, rootDir)
    );
    const rootNeedsInstall = packagesToInstall.some(pkg => pkg.isRoot);
    
    if (workspacePackagesNeedInstall || rootNeedsInstall) {
      // Just run npm install at root, which handles all workspaces
      success = installWorkspaceDependencies(rootDir);
    }
  } else {
    // For standalone packages, install each one separately
    let successCount = 0;
    let failCount = 0;
    
    for (const pkg of packagesToInstall) {
      const result = installStandaloneDependencies(pkg.dir);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      console.log('');
    }
    
    success = failCount === 0;
  }
  
  // Print summary
  console.log('='.repeat(60));
  console.log('');
  
  if (success) {
    print(icons.success, colors.green + colors.bold, 'Successfully installed all dependencies!', 0);
  } else {
    print(icons.error, colors.red + colors.bold, 'Failed to install some dependencies', 0);
    print(icons.info, colors.yellow, 'Please check the errors above and resolve them manually.', 0);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('');
}

// Run the script
main();

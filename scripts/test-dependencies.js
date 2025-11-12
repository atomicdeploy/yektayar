#!/usr/bin/env node

/**
 * Test script to verify dependency compatibility across workspaces
 * This helps prevent version conflicts in package.json files
 */

const fs = require('fs');
const path = require('path');

const workspaces = ['packages/admin-panel', 'packages/backend', 'packages/mobile-app', 'packages/shared'];
const issues = [];

// Check for consistent versions across workspaces
const versionMap = new Map();

workspaces.forEach(workspace => {
  const packageJsonPath = path.join(process.cwd(), workspace, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    issues.push(`Package.json not found at ${packageJsonPath}`);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  Object.entries(allDeps).forEach(([dep, version]) => {
    if (!versionMap.has(dep)) {
      versionMap.set(dep, new Map());
    }
    versionMap.get(dep).set(workspace, version);
  });
});

// Check for version mismatches
versionMap.forEach((workspaceVersions, dep) => {
  if (workspaceVersions.size > 1) {
    const versions = Array.from(workspaceVersions.values());
    const uniqueVersions = new Set(versions);
    
    if (uniqueVersions.size > 1) {
      const details = Array.from(workspaceVersions.entries())
        .map(([ws, ver]) => `  ${ws}: ${ver}`)
        .join('\n');
      
      console.warn(`⚠️  Version mismatch for "${dep}":\n${details}`);
    }
  }
});

// Check critical vite/plugin compatibility
const criticalCompatibility = [
  { pkg: 'vite', plugin: '@vitejs/plugin-vue', minVersion: 6 }
];

criticalCompatibility.forEach(({ pkg, plugin, minVersion }) => {
  workspaces.forEach(workspace => {
    const packageJsonPath = path.join(process.cwd(), workspace, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return;
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    const pkgVersion = allDeps[pkg];
    const pluginVersion = allDeps[plugin];
    
    if (pkgVersion && pluginVersion) {
      const pkgMajor = parseInt(pkgVersion.replace(/^\^|~/, '').split('.')[0]);
      const pluginMajor = parseInt(pluginVersion.replace(/^\^|~/, '').split('.')[0]);
      
      if (pkgMajor >= 7 && pluginMajor < minVersion) {
        issues.push(
          `${workspace}: "${plugin}" version ${pluginVersion} may not be compatible with "${pkg}" version ${pkgVersion}. ` +
          `Please use "${plugin}@^${minVersion}.0.0" or higher.`
        );
      }
    }
  });
});

if (issues.length > 0) {
  console.error('\n❌ Dependency compatibility issues found:\n');
  issues.forEach(issue => console.error(`  - ${issue}`));
  process.exit(1);
}

console.log('✅ All dependency compatibility checks passed!');

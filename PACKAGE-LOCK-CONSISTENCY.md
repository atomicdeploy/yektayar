# Package Lock Consistency Guide

## Overview

This document explains the `"peer": true` inconsistency issue in `package-lock.json` and how we've resolved it.

## The Problem

Team members working on different machines (GitHub Copilot coding agent vs. local VPS) were experiencing repeated additions and removals of lines like:

```json
"peer": true,
```

in the `package-lock.json` file. This created unnecessary git conflicts and made collaboration difficult.

## Root Cause

The issue stems from how different versions of npm handle **peer dependencies**:

1. **npm v7+** (released October 2020) changed how peer dependencies work:
   - Automatically installs peer dependencies (previous versions required manual installation)
   - Marks peer dependencies with `"peer": true` in lockfile version 3
   - Uses a different resolution algorithm

2. **Inconsistencies arise when**:
   - Team members use different npm versions (e.g., npm 9 vs npm 10)
   - Different operating systems (Windows vs. Linux vs. macOS)
   - Different Node.js versions
   - Installing dependencies on "dirty" node_modules (not a clean install)

3. **What is `"peer": true`?**
   - It's a flag in `package-lock.json` indicating a package was installed to satisfy a peer dependency
   - Example: If package A requires package B as a peer, npm v7+ will install B and mark it with `"peer": true`

## The Solution

We've implemented three measures to ensure consistency:

### 1. `.npmrc` Configuration

Created a `.npmrc` file in the repository root with settings to ensure consistent npm behavior:

```ini
# Use lockfile version 3 (npm v7+)
lockfile-version=3

# Always install peer dependencies automatically (npm v7+ default)
auto-install-peers=true

# Use exact versions from package-lock.json
package-lock=true
```

### 2. `.nvmrc` File

Created a `.nvmrc` file specifying the exact Node.js version:

```
20.19.5
```

This ensures all team members can use the same Node.js version with tools like `nvm`.

### 3. Engine Requirements

The `package.json` already specifies minimum versions:

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

This ensures everyone uses npm v9+ which has consistent peer dependency handling.

## Best Practices

### For All Developers

1. **Use the specified Node.js version**:
   ```bash
   # If you have nvm installed
   nvm use
   ```

2. **Always do clean installs when switching branches**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use `npm ci` in CI/CD pipelines**:
   - This uses the lockfile exclusively and doesn't modify it
   - Ensures reproducible builds

4. **Before committing**:
   - Review `package-lock.json` changes carefully
   - Unexpected `"peer": true` changes might indicate version mismatch
   - Run `npm install` again if you see unexpected changes

### For CI/CD

Use `npm ci` instead of `npm install`:

```bash
npm ci  # Clean install from lockfile only
```

### Version Checking

You can verify your environment with:

```bash
node --version   # Should be 20.19.5 or compatible
npm --version    # Should be >= 9.0.0
```

## Troubleshooting

### Still seeing inconsistencies?

1. **Check your npm version**:
   ```bash
   npm --version
   ```
   Should be >= 9.0.0

2. **Check your Node.js version**:
   ```bash
   node --version
   ```
   Should be >= 18.0.0 (preferably 20.19.5)

3. **Do a completely clean install**:
   ```bash
   # Remove everything
   rm -rf node_modules package-lock.json
   rm -rf packages/*/node_modules
   
   # Fresh install
   npm install
   ```

4. **Check for global npm configuration**:
   ```bash
   npm config list
   ```
   Global settings might override local `.npmrc`

### Why not just `.gitignore` package-lock.json?

**Never ignore `package-lock.json`!** It's critical for:
- Reproducible builds
- Security (locks exact versions)
- CI/CD consistency
- Team collaboration

The solution is to ensure everyone uses the same tools, not to ignore the lockfile.

## Technical Details

### What are Peer Dependencies?

Peer dependencies are packages that your package expects the consumer to provide. For example:
- A Vue plugin expects Vue to be installed
- A React component library expects React to be installed

Before npm v7:
```bash
npm install vue-plugin
# Warning: UNMET PEER DEPENDENCY vue
# You had to manually: npm install vue
```

After npm v7:
```bash
npm install vue-plugin
# Automatically installs vue and marks it with "peer": true
```

### Lockfile Version 3

npm v7+ uses lockfile version 3 which:
- Has better peer dependency resolution
- Includes the `"peer": true` flag
- Is more deterministic across platforms
- Better handles workspace scenarios

## References

- [npm v7 Release Notes](https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/)
- [npm peer dependencies documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies)
- [package-lock.json specification](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json)

## Questions?

If you continue to experience issues with package-lock.json inconsistencies after following this guide, please:

1. Document your npm version, Node version, and OS
2. Show the diff of what changed in package-lock.json
3. Share the output of `npm config list`
4. Open an issue with these details

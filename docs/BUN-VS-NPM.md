# Bun vs NPM in YektaYar

This document explains how `bun` and `npm` are used in the YektaYar project and provides guidance on when to use each tool.

---

## Overview

YektaYar uses a **hybrid approach** with both `npm` and `bun`:

- **npm**: Used for workspace management and package installation across the entire monorepo
- **bun**: Used as the runtime for the backend server only

---

## Why This Hybrid Approach?

### NPM (Package Manager)
- ✅ Mature and stable workspace support
- ✅ Compatible with all packages in the ecosystem
- ✅ Well-documented and widely used
- ✅ Works consistently across all platforms
- ✅ Better support for frontend build tools (Vite)

### Bun (Backend Runtime)
- ✅ Significantly faster than Node.js
- ✅ Built-in TypeScript support (no compilation needed)
- ✅ Drop-in replacement for Node.js
- ✅ Better performance for API servers
- ✅ Built-in hot reload with `--watch` flag

---

## Installation

### Installing NPM
NPM comes with Node.js:

```bash
# Check if npm is installed
npm --version

# If not installed, install Node.js 18+ which includes npm
# Visit: https://nodejs.org/
```

### Installing Bun

```bash
# macOS, Linux, and WSL
curl -fsSL https://bun.sh/install | bash

# Or using npm
npm install -g bun

# Verify installation
bun --version
```

---

## Usage in YektaYar

### Root Level (Use NPM)

```bash
# Install all dependencies for all packages
npm install

# Start all services in development
npm run dev

# Start individual services
npm run dev:backend    # Starts backend with bun
npm run dev:admin      # Starts admin panel with npm
npm run dev:mobile     # Starts mobile app with npm

# Build all packages
npm run build

# Clean all dependencies and builds
npm run clean
```

### Backend Package (Can Use Both)

```bash
cd packages/backend

# Using npm (package management)
npm install            # Install dependencies
npm run dev           # Run with bun --watch
npm run build         # TypeScript compilation
npm start             # Run production build with bun

# Using bun directly (if you prefer)
bun install           # Install dependencies (alternative)
bun run src/index.ts  # Run directly without compilation
bun --watch src/index.ts  # Run with hot reload
```

### Frontend Packages (Use NPM)

```bash
# Admin Panel
cd packages/admin-panel
npm install
npm run dev
npm run build

# Mobile App
cd packages/mobile-app
npm install
npm run dev
npm run build
```

---

## When to Use What?

### Use NPM When:
- ✅ Working at the root of the monorepo
- ✅ Managing workspaces
- ✅ Installing dependencies for any package
- ✅ Running frontend development servers (Vite)
- ✅ Building frontend applications
- ✅ You need maximum compatibility

### Use Bun When:
- ✅ Running the backend in development
- ✅ Running the backend in production
- ✅ You want faster execution
- ✅ You want to skip the TypeScript compilation step
- ✅ You prefer bun's DX features

---

## Comparison Table

| Feature | NPM | Bun |
|---------|-----|-----|
| Package Management | ✅ Recommended | ⚠️ Works but not recommended |
| Backend Runtime | ✅ Works (Node.js) | ✅ **Recommended** |
| Frontend Development | ✅ **Recommended** | ⚠️ Limited Vite support |
| TypeScript Support | ⚠️ Needs compilation | ✅ Native support |
| Speed (runtime) | Standard | **2-3x faster** |
| Speed (package install) | Standard | **Faster** |
| Ecosystem Compatibility | ✅ 100% | ⚠️ ~95% |
| Production Ready | ✅ Yes | ✅ Yes (for servers) |

---

## Development Workflow Examples

### Starting Development (Recommended)

```bash
# 1. Install dependencies with npm (once)
npm install

# 2. Start all services with npm scripts
npm run dev

# This automatically:
# - Uses bun for the backend (via npm run dev:backend)
# - Uses npm/vite for frontend packages
```

### Backend Development Only

```bash
# Option 1: Using npm scripts (recommended)
cd packages/backend
npm run dev

# Option 2: Using bun directly
cd packages/backend
bun --watch src/index.ts

# Option 3: Using bun with environment variables
cd packages/backend
PORT=4000 bun --watch src/index.ts
```

### Full Stack Development

```bash
# Terminal 1: Backend (with bun via npm)
npm run dev:backend

# Terminal 2: Admin Panel (with npm)
npm run dev:admin

# Terminal 3: Mobile App (with npm)
npm run dev:mobile
```

---

## Common Commands Reference

### Package Management
```bash
# Install dependencies (use npm)
npm install                    # Root and all workspaces
npm install -w @yektayar/backend  # Specific package

# Update dependencies (use npm)
npm update
npm update -w @yektayar/backend

# Add new dependency (use npm)
npm install package-name -w @yektayar/backend
```

### Running Scripts
```bash
# Use npm scripts (recommended)
npm run dev                    # All services
npm run dev:backend            # Backend with bun
npm run build                  # Build all
npm run lint                   # Lint all
npm run test                   # Test all

# Or use workspace-specific scripts
npm run dev -w @yektayar/backend
npm run build -w @yektayar/admin-panel
```

---

## Performance Comparison

### Backend Startup Time
- **Node.js**: ~2-3 seconds
- **Bun**: ~0.5-1 second
- **Improvement**: 2-3x faster

### Package Installation (First Time)
- **npm**: ~30-60 seconds
- **bun**: ~10-20 seconds
- **Improvement**: 2-3x faster

### API Request Handling
- **Node.js**: Baseline
- **Bun**: 1.5-2x faster
- **Note**: Actual improvement depends on the workload

---

## Troubleshooting

### Issue: Bun not found
```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (usually done automatically)
export PATH="$HOME/.bun/bin:$PATH"

# Verify
bun --version
```

### Issue: Backend won't start with bun
```bash
# Check bun version (need 1.0.0+)
bun --version

# Try with Node.js instead
node dist/index.js

# Check for syntax errors
cd packages/backend
npm run build
```

### Issue: Package installation fails with bun
```bash
# Use npm instead (recommended for package management)
npm install

# If you must use bun, try:
bun install --force
```

### Issue: Different behavior between bun and Node.js
```bash
# This is rare but can happen
# Solution: File an issue and use Node.js in the meantime

# Run with Node.js:
cd packages/backend
npm run build
node dist/index.js
```

---

## Migration Guide

### From Pure NPM to Hybrid (Current Setup)

Already done! The project is set up with the hybrid approach.

### To Pure Bun (Not Recommended)

If you want to use bun for everything:

```bash
# Convert package-lock.json to bun.lockb
bun install

# Update all scripts to use bun
# In package.json, replace npm/npx with bun/bunx
```

**Note**: This is **not recommended** because:
- Vite has better support with npm
- Some frontend packages may have compatibility issues
- The hybrid approach gives the best of both worlds

### Back to Pure NPM (If Needed)

```bash
# 1. Update backend package.json scripts
cd packages/backend
# Change "dev": "bun run --watch src/index.ts"
# To: "dev": "tsx watch src/index.ts"

# 2. Install Node.js alternative to bun
npm install -D tsx

# 3. Use Node.js in production
# Change "start": "bun run dist/index.js"
# To: "start": "node dist/index.js"
```

---

## Recommendations

### For Development
- ✅ Use **npm** for all package management
- ✅ Use **npm scripts** to start services
- ✅ Let the backend use **bun** automatically via npm scripts
- ✅ Use **npm** for frontend packages

### For Production
- ✅ Use **npm** for package installation
- ✅ Use **bun** to run the backend server
- ✅ Build frontend with **npm**
- ✅ Set up PM2 with bun as the interpreter

### For CI/CD
```yaml
# .github/workflows/ci.yml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v3
    with:
      node-version: '18'
  
  - name: Setup Bun
    uses: oven-sh/setup-bun@v1
    with:
      bun-version: latest
  
  - name: Install dependencies
    run: npm install
  
  - name: Build all
    run: npm run build
  
  - name: Test all
    run: npm run test
```

---

## Best Practices

1. **Always use npm for dependency management**
   - Consistent lock files
   - Better workspace support
   - More reliable

2. **Use npm scripts to run bun**
   - Centralized configuration
   - Easy to change runtime later
   - Consistent across team

3. **Document any bun-specific issues**
   - Help team members troubleshoot
   - Track compatibility problems

4. **Keep both tools updated**
   ```bash
   # Update npm
   npm install -g npm@latest
   
   # Update bun
   bun upgrade
   ```

5. **Test with both runtimes occasionally**
   - Ensure Node.js compatibility
   - Fallback option if bun has issues

---

## FAQ

### Q: Why not use bun for everything?
**A**: Bun is excellent for backend servers but has limited support for some frontend build tools. The hybrid approach gives us the best performance while maintaining compatibility.

### Q: Can I use yarn or pnpm instead of npm?
**A**: Yes, but npm is recommended for this project because:
- It's included with Node.js
- Better workspace support
- Project is already configured for it

### Q: Is bun production-ready?
**A**: Yes! Bun 1.0+ is production-ready for server applications. Many companies use it in production.

### Q: Will switching to bun break anything?
**A**: If you follow the hybrid approach (npm for management, bun for backend runtime), no. The project is designed for this.

### Q: How do I update bun?
**A**: Run `bun upgrade` or reinstall with `curl -fsSL https://bun.sh/install | bash`

### Q: What if a package doesn't work with bun?
**A**: Use npm to install it and run it with Node.js. Report the issue to bun's GitHub.

---

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [NPM Documentation](https://docs.npmjs.com/)
- [Elysia.js Documentation](https://elysiajs.com/)
- [Bun GitHub Issues](https://github.com/oven-sh/bun/issues)

---

**Last Updated**: 2025-11-10  
**Version**: 1.0

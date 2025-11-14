# Quick Reference: Package Lock Consistency

## For New Contributors

### Setup (One-time)

1. Install the correct Node.js version:
   ```bash
   # If you have nvm (Node Version Manager):
   nvm use
   
   # Or manually install Node.js 20.19.5 from:
   # https://nodejs.org/
   ```

2. Verify your setup:
   ```bash
   npm run check:requirements
   ```

3. If you see warnings about version mismatches, fix them before contributing.

### Daily Workflow

1. **Before starting work** (especially after pulling changes):
   ```bash
   npm install
   ```

2. **Before committing**:
   - Check for unexpected package-lock.json changes:
     ```bash
     git diff package-lock.json
     ```
   - If you see many `"peer": true` additions/removals, verify your Node/npm versions

3. **If package-lock.json keeps changing**:
   - Do a clean install:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```
   - Check your Node.js version matches .nvmrc
   - Check your npm version is >= 9.0.0

## For CI/CD

Use `npm ci` instead of `npm install`:

```bash
npm ci  # Uses lockfile, doesn't modify it
```

## What We Fixed

This project now has:
- ✅ `.npmrc` - Enforces consistent npm behavior
- ✅ `.nvmrc` - Specifies exact Node.js version
- ✅ Enhanced requirements checker - Warns about version mismatches
- ✅ Documentation - Complete guide in PACKAGE-LOCK-CONSISTENCY.md

## Still Having Issues?

See the full guide: [PACKAGE-LOCK-CONSISTENCY.md](./PACKAGE-LOCK-CONSISTENCY.md)

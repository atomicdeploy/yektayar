# Troubleshooting Development Errors

This guide helps you understand and fix common errors when developing YektaYar.

## Error: "APP_VERSION not found in import.meta.env"

### What it means
This error occurs when the application tries to access the `APP_VERSION` environment variable, but it's not available. This typically happens in development mode.

### Solution
**No action needed!** As of the latest update, this has been fixed with a fallback mechanism. The app will:
- Show `Version: dev` in development mode when APP_VERSION is not explicitly set
- Log a warning to the console (not an error)
- Continue running normally

The version is automatically injected during the Vite build process from `package.json`.

### How it works
The Vite configuration automatically defines `APP_VERSION`:

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
  }
})
```

In development mode with hot module reload, this value might not always be immediately available, so the app uses a sensible fallback.

## Error: "getActivePinia() was called but there was no active Pinia"

### What it means
This error occurs when you try to access a Pinia store before the Vue app has been mounted and Pinia has been initialized.

### Common scenarios
1. **Using `yektayarDebug` API before app loads**: If you call `yektayarDebug.getConfig()` in the browser console immediately after page load, you might get this error.

2. **API configuration errors**: If the API is not configured correctly, the main app doesn't mount, so Pinia is never initialized.

### Solution

#### For `yektayarDebug` API usage:
The error handling has been improved. When you call debug methods before the store is ready, you'll now see a clear message:

```
[yektayarDebug] Pinia store is not yet initialized. 
The app is still loading. Please wait for the app to fully mount, 
or call this after the page has loaded.
```

**Available methods without Pinia:**
- `yektayarDebug.help()` - Always works, displays help information

**Methods that require Pinia:**
- All other methods (getConfig, setConfig, etc.) require the app to be fully loaded

#### For API configuration errors:
If you see the API configuration error screen, you need to:

1. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit and set API_BASE_URL
   nano .env
   ```

2. **Set the API_BASE_URL**:
   ```
   API_BASE_URL=http://localhost:3000
   ```

3. **Make sure the backend is running**:
   ```bash
   npm run dev:backend
   ```

4. **Restart the frontend**:
   ```bash
   npm run dev:mobile
   # or
   npm run dev:admin
   ```

## Using the Debug Console API

The `yektayarDebug` API is available in the browser console for debugging and testing.

### When the app is fully loaded:
```javascript
// Get help
yektayarDebug.help()

// Get current configuration
yektayarDebug.getConfig()

// Get welcome screen config
yektayarDebug.welcome.getConfig()

// Skip typewriter animation
yektayarDebug.welcome.setSkipAll(true)
```

### When the app shows an error screen:
Only `help()` will work:
```javascript
// This works
yektayarDebug.help()

// These will show an error (store not initialized)
yektayarDebug.getConfig()  // ❌ Error
yektayarDebug.welcome.getConfig()  // ❌ Error
```

This is expected behavior - the debug API needs the full app to be running.

## Development Workflow Best Practices

To avoid these errors:

1. **Always set up `.env` first**:
   ```bash
   ./scripts/manage-env.sh init
   ```

2. **Start backend before frontend**:
   ```bash
   npm run dev:backend    # Terminal 1
   npm run dev:mobile     # Terminal 2
   ```

3. **Wait for app to fully load** before using debug console APIs

4. **Check console for warnings** - they often provide helpful context

## Quick Start (Avoiding All Errors)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
./scripts/manage-env.sh init
# Edit .env and set API_BASE_URL=http://localhost:3000

# 3. Start backend
npm run dev:backend

# 4. In another terminal, start mobile app
npm run dev:mobile

# 5. Open browser to http://localhost:8100

# 6. Wait for app to fully load, then use debug API
# Open browser console and type:
yektayarDebug.help()
```

## Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly: `./scripts/manage-env.sh show`
3. Test backend connectivity: `./scripts/manage-env.sh test`
4. Clear browser cache and reload
5. Restart both backend and frontend servers

For more help, see:
- [QUICK-START.md](../QUICK-START.md) - Complete setup guide
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Detailed development guide
- [ENV-GUIDE.md](../ENV-GUIDE.md) - Environment configuration guide

# Environment Variables in APK Builds - Technical Explanation

## How It Works

### 1. Build-Time Variable Injection

The `vite.config.ts` uses Vite's `define` option to inject environment variables **at build time**. This means the values are baked into the JavaScript bundle during the `npm run build:production` step.

```typescript
define: {
  'import.meta.env.API_BASE_URL': JSON.stringify(
    process.env.VITE_API_BASE_URL || 
    process.env.API_BASE_URL || 
    'http://localhost:3000'
  ),
  // ... other vars
}
```

**What this does:**
- At build time, Vite replaces all instances of `import.meta.env.API_BASE_URL` in your code with the actual string value
- The value comes from Node.js `process.env` during the build
- The replacement happens before the code is bundled into the final JavaScript files

### 2. GitHub Actions Workflow Flow

```yaml
- name: Build mobile app web assets
  run: |
    cd packages/mobile-app
    npm run build:production
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL || 'https://api.yektayar.ir' }}
    VITE_ENVIRONMENT: production
```

**The flow:**

1. GitHub Actions sets `API_BASE_URL` environment variable from secrets
2. `npm run build:production` runs Vite build
3. Vite reads `process.env.API_BASE_URL` during build
4. Vite replaces `import.meta.env.API_BASE_URL` with the actual value in all source files
5. The bundled JavaScript files in `dist/` now contain the hardcoded API URL
6. Capacitor syncs these files to Android assets
7. Android APK packages these assets
8. **Result**: APK contains JavaScript with the API URL hardcoded as a string literal

### 3. Priority Order

The code checks variables in this order:
1. `VITE_API_BASE_URL` (Vite convention)
2. `API_BASE_URL` (our convention)
3. `'http://localhost:3000'` (fallback)

### 4. GitHub Environment Integration

Since the workflow now uses `environment: android`:

```yaml
jobs:
  build-android:
    runs-on: ubuntu-latest
    environment: android  # <-- This line
```

The workflow automatically gets access to:
- Environment secrets (like `API_BASE_URL`)
- Environment variables
- Environment protection rules

---

## How to Verify API_BASE_URL in Built APK

### Method 1: Extract and Inspect JavaScript Bundle

```bash
# 1. Extract the APK
unzip app-debug.apk -d extracted/

# 2. Find the main JavaScript bundle
find extracted/assets -name "index-*.js" -o -name "main-*.js"

# 3. Search for the API URL
grep -r "api.yektayar.ir" extracted/assets/
```

**What to look for:**
- The bundled JavaScript will contain the actual URL as a string
- Example: `apiBaseUrl:"https://api.yektayar.ir"`

### Method 2: Use APK Analyzer (Android Studio)

```bash
# Open Android Studio
# Build > Analyze APK...
# Select your app-debug.apk
# Navigate to assets/public/
# Open the JavaScript files and search for "api.yektayar.ir"
```

### Method 3: Check at Runtime via ADB

```bash
# 1. Install the APK
adb install app-debug.apk

# 2. Start logcat filtering
adb logcat -s YektaYar:*

# 3. Launch the app
# Look for initialization logs showing API URL
```

**Expected output:**
```
I/YektaYar: [main.ts:43] API URL: https://api.yektayar.ir
I/YektaYar: [main.ts:172] === YektaYar Mobile App Initialization ===
I/YektaYar: [main.ts:173] Environment: production
```

### Method 4: Use apktool to Decompile

```bash
# 1. Install apktool
# Ubuntu/Debian: apt-get install apktool
# Mac: brew install apktool

# 2. Decompile the APK
apktool d app-debug.apk

# 3. Search in extracted assets
grep -r "api.yektayar.ir" app-debug/assets/
```

### Method 5: Automated Verification Script

Create a verification script:

```bash
#!/bin/bash
# verify-apk-env.sh

APK_FILE="$1"
EXPECTED_URL="${2:-https://api.yektayar.ir}"

if [ ! -f "$APK_FILE" ]; then
    echo "❌ APK file not found: $APK_FILE"
    exit 1
fi

echo "🔍 Verifying API URL in APK: $APK_FILE"
echo "Expected URL: $EXPECTED_URL"
echo ""

# Extract APK to temp directory
TEMP_DIR=$(mktemp -d)
unzip -q "$APK_FILE" -d "$TEMP_DIR"

# Search for API URL in assets
if grep -r "$EXPECTED_URL" "$TEMP_DIR/assets/" > /dev/null 2>&1; then
    echo "✅ API URL found in APK assets!"
    echo ""
    echo "Occurrences:"
    grep -r "$EXPECTED_URL" "$TEMP_DIR/assets/" | head -5
    RESULT=0
else
    echo "❌ API URL NOT found in APK assets!"
    echo ""
    echo "Searching for any API base URL patterns..."
    grep -rE "(http|https)://[a-zA-Z0-9.-]+\.[a-z]{2,}" "$TEMP_DIR/assets/" | grep -i "api" | head -5
    RESULT=1
fi

# Cleanup
rm -rf "$TEMP_DIR"

exit $RESULT
```

**Usage:**
```bash
chmod +x verify-apk-env.sh
./verify-apk-env.sh app-debug.apk https://api.yektayar.ir
```

---

## Common Issues and Solutions

### Issue 1: Wrong API URL in APK

**Cause:** Environment variable not set during build

**Solution:**
```bash
# For local builds
API_BASE_URL=https://api.yektayar.ir npm run build:production

# Or set in .env.production
echo "API_BASE_URL=https://api.yektayar.ir" > .env.production
```

### Issue 2: GitHub Secrets Not Working

**Causes:**
- Secret not added to "android" environment
- Typo in secret name
- Environment not specified in workflow

**Solution:**
1. Go to GitHub repo → Settings → Environments → android
2. Add secret: `API_BASE_URL` = `https://api.yektayar.ir`
3. Verify workflow has `environment: android`

### Issue 3: Variable Not Replaced

**Cause:** Using runtime variable access instead of build-time

**Wrong:**
```typescript
// This won't work - tries to read at runtime
const url = process.env.API_BASE_URL
```

**Correct:**
```typescript
// This works - replaced at build time
const url = import.meta.env.API_BASE_URL
```

---

## Technical Details

### Vite's `define` Option

Vite performs **static replacement** during build:

**Before build (source code):**
```typescript
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.API_BASE_URL || '',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development'
};
```

**After build (bundled JavaScript):**
```javascript
export const config = {
  apiBaseUrl: "https://api.yektayar.ir",
  environment: "production"
};
```

The `import.meta.env.API_BASE_URL` is **literally replaced** with the string value.

### Why This Approach?

1. **Security**: No runtime variable reading needed
2. **Performance**: Values are constants, no lookup required
3. **Simplicity**: Works in all environments (web, mobile, etc.)
4. **Compatibility**: Standard Vite/Webpack pattern

### Build vs Runtime

| Aspect | Build-Time (Current) | Runtime |
|--------|---------------------|---------|
| When | During `npm run build` | When app starts |
| Access | `import.meta.env.X` | Not applicable in APK |
| Source | Node.js `process.env` | Would need native bridge |
| APK Size | Slightly larger (hardcoded) | Smaller |
| Flexibility | Requires rebuild | Can change without rebuild |
| Security | Values visible in bundle | Would be in native code |

---

## Verification Checklist

When building APK, verify:

- [ ] GitHub Actions workflow shows environment variables in logs
- [ ] Build step shows: `API_BASE_URL: https://api.yektayar.ir`
- [ ] APK extraction shows URL in JavaScript bundle
- [ ] ADB logcat shows correct URL on app startup
- [ ] App connects to correct API endpoint

---

## Example: Complete Verification

```bash
# 1. Build APK with specific API URL
cd packages/mobile-app
API_BASE_URL=https://api.yektayar.ir npm run build:production
npm run cap:sync
cd android
./gradlew assembleDebug

# 2. Verify in APK
APK=app/build/outputs/apk/debug/app-debug.apk
unzip -q $APK -d /tmp/apk-check
grep -r "api.yektayar.ir" /tmp/apk-check/assets/
# Should show multiple matches

# 3. Test on device
adb install $APK
adb logcat -c
adb shell am start -n ir.yektayar.app/.MainActivity
sleep 2
adb logcat -d -s YektaYar:* | grep "API URL"
# Should show: API URL: https://api.yektayar.ir
```

---

## Summary

**Yes**, the current setup respects the `API_BASE_URL` from GitHub's "android" environment:

1. ✅ Workflow gets value from environment secrets
2. ✅ Passes it to build step via `env:` block
3. ✅ Vite reads it from `process.env` during build
4. ✅ Value is hardcoded into JavaScript bundle
5. ✅ Bundle is packaged into APK assets
6. ✅ App uses the hardcoded value at runtime

**To verify**: Extract APK, search assets for the URL, or check ADB logcat on app startup.

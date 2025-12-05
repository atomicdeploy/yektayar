# Version Synchronization - APK and Package.json

## Overview

The YektaYar mobile app ensures version consistency between `package.json` and the Android APK build. This document explains how version information flows through the build process and appears in the app.

---

## Version Sources and Flow

### Single Source of Truth: package.json

```json
{
  "name": "@yektayar/mobile-app",
  "version": "0.1.0",  // ← Single source of truth
  ...
}
```

### Version Flow Diagram

```
package.json (0.1.0)
    │
    ├─► Vite Build (vite.config.ts)
    │   └─► import.meta.env.APP_VERSION = "0.1.0"
    │       └─► JavaScript Bundle (dist/)
    │           └─► APK Assets
    │               └─► Runtime: logger.startup() shows version
    │
    └─► Gradle Build (build.gradle)
        └─► versionName = "0.1.0"
        └─► versionCode = 100 (calculated: 0*10000 + 1*100 + 0)
            └─► Android Manifest
                └─► APK Metadata
```

---

## Implementation Details

### 1. JavaScript/Web Version (via Vite)

**File**: `packages/mobile-app/vite.config.ts`

```typescript
import packageJson from './package.json'

export default defineConfig(({ mode }) => {
  return {
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
    }
  }
})
```

**Result**: All instances of `import.meta.env.APP_VERSION` in the source code are replaced with `"0.1.0"` at build time.

### 2. Android Native Version (via Gradle)

**File**: `packages/mobile-app/android/app/build.gradle`

```groovy
// Read version from package.json
def getVersionFromPackageJson() {
    def packageJson = new groovy.json.JsonSlurper().parseText(file('../../package.json').text)
    return packageJson.version
}

// Calculate version code from version name (e.g., "0.1.0" -> 100)
def getVersionCodeFromName(versionName) {
    def parts = versionName.split('\\.')
    def major = parts.length > 0 ? parts[0].toInteger() : 0
    def minor = parts.length > 1 ? parts[1].toInteger() : 0
    def patch = parts.length > 2 ? parts[2].toInteger() : 0
    return major * 10000 + minor * 100 + patch
}

def appVersion = getVersionFromPackageJson()
def appVersionCode = getVersionCodeFromName(appVersion)

android {
    defaultConfig {
        versionCode appVersionCode     // 100 for "0.1.0"
        versionName appVersion         // "0.1.0"
    }
}
```

**Version Code Calculation**:
- Format: `MAJOR * 10000 + MINOR * 100 + PATCH`
- Examples:
  - `0.1.0` → `0*10000 + 1*100 + 0` = `100`
  - `1.2.3` → `1*10000 + 2*100 + 3` = `10203`
  - `2.0.5` → `2*10000 + 0*100 + 5` = `20005`

**Why Version Code?**
- Android requires an integer `versionCode` for update management
- Higher version code = newer version
- Google Play uses this to determine which version is newer
- `versionName` is the human-readable string shown to users

---

## Where Version Appears

### 1. Console Logs on App Startup

**File**: `packages/mobile-app/src/main.ts`

```typescript
import { getPackageVersion } from '@yektayar/shared'

const APP_VERSION = getPackageVersion()

logger.startup('YektaYar Mobile App', {
  'API URL': config.apiBaseUrl,
  'Environment': import.meta.env.MODE || 'development',
  'Version': APP_VERSION,              // ← Shows here
  'Platform': 'Ionic/Capacitor'
})
```

**Output in console**:
```
🚀 YektaYar Mobile App
   API URL: https://api.yektayar.ir
   Environment: production
   Version: 0.1.0                      ← Version displayed
   Platform: Ionic/Capacitor
```

### 2. ADB Logcat

When using the WebViewConsoleLogger plugin:

```bash
adb logcat -s YektaYar:*
```

**Output**:
```
I/YektaYar: [main.ts:42] 🚀 YektaYar Mobile App
I/YektaYar: [main.ts:43] API URL: https://api.yektayar.ir
I/YektaYar: [main.ts:44] Environment: production
I/YektaYar: [main.ts:45] Version: 0.1.0         ← Version in logcat
I/YektaYar: [main.ts:46] Platform: Ionic/Capacitor
```

### 3. Android App Info

**Settings → Apps → YektaYar → App info**

Shows:
- **App name**: یکتایار (if system is Persian) or YektaYar (if English)
- **Version**: 0.1.0 (`versionName`)
- **Package**: ir.yektayar.app

### 4. APK Metadata

```bash
# View APK info
aapt dump badging app-debug.apk | grep version
```

**Output**:
```
package: name='ir.yektayar.app' versionCode='100' versionName='0.1.0'
```

### 5. Splash Screen

The splash screen shows:
- **Logo**: Vector graphic (scales to all sizes)
- **App Name**: یکتایار (in Persian)
- **Tagline**: پلتفرم مراقبت سلامت روان
- **Theme**: Automatically adjusts for light/dark mode

**Note**: Version is not displayed on splash screen, only app name and tagline.

---

## Verification Steps

### Method 1: Check Console Logs

```bash
# Build and run
cd packages/mobile-app
npm run build:production
npm run cap:sync
cd android
./gradlew assembleDebug

# Install
adb install app/build/outputs/apk/debug/app-debug.apk

# View startup logs
adb logcat -c
adb shell am start -n ir.yektayar.app/.MainActivity
sleep 2
adb logcat -d -s YektaYar:* | grep -E "Version|YektaYar Mobile App"
```

**Expected output**:
```
I/YektaYar: [main.ts:42] 🚀 YektaYar Mobile App
I/YektaYar: [main.ts:45] Version: 0.1.0
```

### Method 2: Check APK Metadata

```bash
aapt dump badging app-debug.apk | grep version
```

**Expected output**:
```
package: name='ir.yektayar.app' versionCode='100' versionName='0.1.0'
```

### Method 3: Check in App Settings

1. Install APK on Android device
2. Go to Settings → Apps → YektaYar
3. Verify:
   - App name: یکتایار (or YektaYar)
   - Version: 0.1.0
   - Package: ir.yektayar.app

### Method 4: Extract and Verify JavaScript Bundle

```bash
# Extract APK
unzip app-debug.apk -d extracted/

# Search for version in JavaScript
grep -r "0.1.0" extracted/assets/ | grep -v ".map"
# or
grep -r "Version.*0\.1\.0" extracted/assets/
```

---

## Updating the Version

### Step 1: Update package.json

```bash
cd packages/mobile-app

# Option 1: Manually edit package.json
# Change: "version": "0.1.0" to "version": "0.2.0"

# Option 2: Use npm version command
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

### Step 2: Build

```bash
# Clean build recommended after version change
npm run android:clean
npm run build:production
npm run cap:sync
cd android
./gradlew assembleDebug
```

**Result**:
- `versionName` in APK will be `0.2.0`
- `versionCode` in APK will be `200`
- JavaScript logs will show `Version: 0.2.0`

### Step 3: Verify

```bash
# Check APK metadata
aapt dump badging app/build/outputs/apk/debug/app-debug.apk | grep version

# Expected:
# package: name='ir.yektayar.app' versionCode='200' versionName='0.2.0'
```

---

## App Name Localization

### English (Default)

**File**: `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">YektaYar</string>
    <string name="title_activity_main">YektaYar</string>
</resources>
```

### Persian (Farsi)

**File**: `android/app/src/main/res/values-fa/strings.xml`

```xml
<resources>
    <string name="app_name">یکتایار</string>
    <string name="title_activity_main">یکتایار</string>
</resources>
```

**Result**: Android automatically selects the correct name based on system language.

---

## Console Output Examples

### Production Build

```
🚀 YektaYar Mobile App
   API URL: https://api.yektayar.ir
   Environment: production
   Version: 0.1.0
   Platform: Ionic/Capacitor

=== YektaYar Mobile App Initialization ===
Environment: production
✅ API validation successful
```

### Development Build

```
🚀 YektaYar Mobile App
   API URL: http://localhost:3000
   Environment: development
   Version: 0.1.0
   Platform: Ionic/Capacitor

=== YektaYar Mobile App Initialization ===
Environment: development
⚠️ API validation failed (this is normal in development)
```

---

## Troubleshooting

### Issue 1: Version Mismatch

**Symptom**: JavaScript logs show different version than APK metadata

**Cause**: Stale build cache

**Solution**:
```bash
cd packages/mobile-app
rm -rf dist/ android/app/build/
npm run build:production
npm run cap:sync
cd android
./gradlew clean assembleDebug
```

### Issue 2: Version Shows as "dev"

**Symptom**: Console logs show `Version: dev`

**Cause**: `APP_VERSION` not injected by Vite

**Solution**: Check `vite.config.ts` has the `define` block:
```typescript
define: {
  'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
}
```

### Issue 3: Wrong App Name

**Symptom**: App shows "YektaYar" instead of "یکتایار" on Persian system

**Cause**: Missing `values-fa/strings.xml`

**Solution**: Verify file exists with correct content:
```bash
cat android/app/src/main/res/values-fa/strings.xml
```

---

## Summary Checklist

When building APK, verify:

- [ ] `package.json` version is correct
- [ ] Vite config injects `APP_VERSION`
- [ ] Gradle reads version from `package.json`
- [ ] Console logs show correct version
- [ ] ADB logcat shows correct version
- [ ] APK metadata matches `package.json` version
- [ ] App name shows correctly in English
- [ ] App name shows correctly in Persian (if system is Persian)
- [ ] Splash screen displays with correct theme
- [ ] Version code increases with each version bump

---

## Related Files

- **Version Source**: `packages/mobile-app/package.json`
- **Vite Config**: `packages/mobile-app/vite.config.ts`
- **Gradle Config**: `packages/mobile-app/android/app/build.gradle`
- **Main Entry**: `packages/mobile-app/src/main.ts`
- **Version Utility**: `packages/shared/src/utils/version.ts`
- **Strings (EN)**: `android/app/src/main/res/values/strings.xml`
- **Strings (FA)**: `android/app/src/main/res/values-fa/strings.xml`
- **Logger**: `packages/shared/src/utils/logger.ts`

---

**Last Updated**: 2025-12-05  
**Document Version**: 1.0

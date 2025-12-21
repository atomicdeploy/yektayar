# Capacitor SDK 34 Compatibility Patches

## Overview

Capacitor 7.4.4 uses Android API Level 35 constants (`VANILLA_ICE_CREAM`, `windowOptOutEdgeToEdgeEnforcement`) that are not available in SDK 34. This document explains the patches required to build with SDK 34.

## Issue

When building with `compileSdkVersion = 34`, the following compilation errors occur:

```
error: cannot find symbol
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && ...
                                                    ^
  symbol:   variable VANILLA_ICE_CREAM
  location: class VERSION_CODES

error: cannot find symbol
    .resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);
                                       ^
  symbol:   variable windowOptOutEdgeToEdgeEnforcement
  location: class attr
```

## Affected Files

### 1. @capacitor/android - CapacitorWebView.java

**File:** `node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java`

**Line 66-72:** Commented out edge-to-edge logic for API 35

```java
// Temporarily disabled for SDK 34 compatibility
// if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && configEdgeToEdge.equals("auto")) {
//     TypedValue value = new TypedValue();
//     boolean foundOptOut = getContext().getTheme().resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);
//     boolean optOutValue = value.data != 0; // value is set to -1 on true as of Android 15, so we have to do this.
//
//     autoMargins = !(foundOptOut && optOutValue);
// }
```

### 2. @capacitor/keyboard - Keyboard.java

**File:** `node_modules/@capacitor/keyboard/android/src/main/java/com/capacitorjs/plugins/keyboard/Keyboard.java`

**Line 162-173:** Modified to use hardcoded API level 35 and disable edge-to-edge

```java
} else if (Build.VERSION.SDK_INT >= 35 && adjustMarginsForEdgeToEdge.equals("auto")) { // Auto means that we need to check the app's edge-to-edge preference
    // Temporarily disabled for SDK 34 compatibility
    // TypedValue value = new TypedValue();
    // boolean optOutAttributeExists = activity
    //     .getTheme()
    //     .resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);
    //
    // if (!optOutAttributeExists) { // Default is to apply edge to edge
    //     return true;
    // } else {
    //     return value.data == 0;
    // }
    return false; // Disable edge-to-edge for SDK 34
}
```

## Build Configuration Changes

### variables.gradle

Updated SDK versions to 34:

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 34  // Changed from 33 to 34
    targetSdkVersion = 34   // Changed from 33 to 34
    // ... other settings
}
```

### build.gradle (root)

Added global Java 17 compatibility for all subprojects:

```gradle
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
        }
    }
}
```

### app/build.gradle

Added explicit Java 17 compatibility:

```gradle
android {
    // ... other settings
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

### app/capacitor.build.gradle

Changed Java version from 21 to 17:

```gradle
android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17  // Changed from VERSION_21
      targetCompatibility JavaVersion.VERSION_17  // Changed from VERSION_21
  }
}
```

## Applying Patches

Since the patches are in `node_modules`, they need to be reapplied after `npm install`. Options:

### Option 1: Use patch-package (Recommended)

Install patch-package:

```bash
npm install --save-dev patch-package
```

Generate patches:

```bash
npx patch-package @capacitor/android
npx patch-package @capacitor/keyboard
```

Add to package.json:

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Option 2: Manual Script

Create a script to apply patches after install:

```bash
#!/bin/bash
# scripts/patch-capacitor-sdk34.sh

# Patch CapacitorWebView.java
sed -i 's/if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM/\/\/ if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM/' \
    node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/CapacitorWebView.java

# Patch Keyboard.java
sed -i 's/Build.VERSION_CODES.VANILLA_ICE_CREAM/35/' \
    node_modules/@capacitor/keyboard/android/src/main/java/com/capacitorjs/plugins/keyboard/Keyboard.java
```

### Option 3: Upgrade to SDK 35

The proper solution is to upgrade to Android SDK 35, which includes the required constants. However, this requires:

1. Android SDK Platform 35
2. Build Tools 35.x.x
3. Updated CI/CD environment

## Impact

### Functionality Impact

- **Edge-to-edge display on Android 15+**: Disabled for apps built with these patches
- **Keyboard edge-to-edge adjustments on Android 15+**: Disabled
- All other functionality remains intact

### Compatibility

- ✅ Works on Android 5.1+ (API 22+)
- ✅ Builds successfully with SDK 34
- ⚠️ Edge-to-edge features require SDK 35 for full support

## CI/CD Considerations

For GitHub Actions, you have two options:

### Option 1: Use SDK 34 with Patches

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'

- name: Install dependencies
  run: npm ci --legacy-peer-deps

- name: Apply Capacitor patches
  run: |
    chmod +x scripts/patch-capacitor-sdk34.sh
    ./scripts/patch-capacitor-sdk34.sh

- name: Build APK
  run: npm run android:build
```

### Option 2: Use SDK 35 (Preferred)

Update the workflow to install SDK 35:

```yaml
- name: Setup Android SDK
  run: |
    sdkmanager "platforms;android-35" "build-tools;35.0.0"
```

Then update variables.gradle back to SDK 35.

## Reverting Patches

To revert to full Capacitor functionality with SDK 35:

1. Update `variables.gradle`:
   ```gradle
   compileSdkVersion = 35
   targetSdkVersion = 35
   ```

2. Remove the patches from node_modules (or run `npm install` fresh)

3. Ensure CI/CD has SDK 35 installed

## Testing

After building with these patches:

```bash
# Build APK
npm run android:build

# Analyze APK
npm run android:analyze packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk

# Install on device
adb install packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Summary

These patches are temporary workarounds to build Capacitor 7.4.4 apps with SDK 34. The proper long-term solution is to upgrade the development and CI/CD environments to support Android SDK 35.

**Built APK Details:**
- Size: ~5.2M
- Min SDK: 22 (Android 5.1)
- Target SDK: 34 (Android 14)
- Functionality: Full except edge-to-edge on Android 15+

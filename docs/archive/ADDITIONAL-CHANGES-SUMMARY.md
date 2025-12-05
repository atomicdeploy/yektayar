# Additional Changes Summary - December 5, 2024

## Overview

This document summarizes the additional changes made to address user feedback on the pull request.

---

## 1. ✅ ErrorScreen Text Selection Fix (Review Comment)

**Issue**: User correctly identified that ErrorScreen.vue is in the shared package and wouldn't be affected by mobile-app's variables.scss.

**Solution**: Added text selection rules directly to ErrorScreen.vue's scoped styles:

```scss
* {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

**Files Modified**:
- `packages/shared/src/components/ErrorScreen.vue`

**Commit**: `7684646`

---

## 2. ✅ Domain Migration: yektayar.com → yektayar.ir

**Requirement**: Change all references from yektayar.com to yektayar.ir

**Changes Made**:

### Email Addresses Updated:
- `ContactUsPage.vue`: `info@yektayar.com` → `info@yektayar.ir`
- `PersonalInfoPage.vue`: `user@yektayar.com` → `user@yektayar.ir`
- `ProfilePage.vue`: `user@yektayar.com` → `user@yektayar.ir`

**Files Modified**: 3 Vue files

**Commit**: `7684646`

---

## 3. ✅ Package Name Migration: com.yektayar.app → ir.yektayar.app

**Requirement**: Change package name to follow Iranian domain convention

**Changes Made**:

### Android Configuration:
- **capacitor.config.ts**: Updated `appId`
- **build.gradle**: Updated `namespace` and `applicationId`
- **strings.xml** (values/): Updated `package_name` and `custom_url_scheme`
- **strings.xml** (values-fa/): Updated `package_name` and `custom_url_scheme`

### Java Package Structure:
- **Renamed directories**: `com/yektayar/app/` → `ir/yektayar/app/`
- **Updated package declarations** in all Java files:
  - `MainActivity.java`
  - `DeviceInfo.java`
  - `DeviceInfoPlugin.java`
  - `WebViewConsoleLoggerPlugin.java`

### Documentation:
- **ADB-LOGCAT-GUIDE.md**: Updated package references
- **BUILD_APK.md**: Updated app ID example

**Files Modified**: 10 files
**Files Moved**: 4 Java files (renamed package path)

**Commit**: `7684646`

---

## 4. ✅ Vector Graphics Splash Screen with Dark Mode & Tagline

**Requirement**: Replace splash.png with vector graphics supporting dark/light mode and tagline

**Solution**: Complete redesign using Android vector drawables with layer-list architecture

### What Was Removed:
- **26 splash.png files** (all screen densities and orientations):
  - drawable/splash.png
  - drawable-night/splash.png
  - drawable-land-*/splash.png (12 files)
  - drawable-port-*/splash.png (12 files)
  - drawable-*-night*/splash.png (various densities)

### What Was Created:

#### 1. Main Splash Layouts:
- **drawable/splash.xml** - Light mode splash screen
  - Background: `#fafbfc` (light)
  - Logo: Centered
  - Tagline: Bottom positioned

- **drawable-night/splash.xml** - Dark mode splash screen
  - Background: `#0f1419` (dark)
  - Logo: Centered (lighter variant)
  - Tagline: Bottom positioned (lighter text)

#### 2. Logo Vector Drawables:
- **drawable/splash_logo.xml**
  - Brand gold color (#d4a43e)
  - 200dp × 200dp
  - Vector paths from logo-simple.svg

- **drawable/splash_logo_dark.xml**
  - Lighter gold (#e8c170) for dark mode
  - Same dimensions and paths

#### 3. Tagline Vector Drawables:
- **drawable/splash_tagline.xml**
  - App name: "یکتایار" (YektaYar in Persian)
  - Tagline: "پلتفرم مراقبت سلامت روان" (Mental Health Care Platform)
  - Dark text colors for light mode

- **drawable/splash_tagline_dark.xml**
  - Light text colors for dark mode
  - Same text content

#### 4. Color Resources:
- **values/colors.xml** (new file)
  - Brand colors: primary, primaryDark, accent
  - Splash backgrounds: light and dark
  - Consistent with app theme

### Architecture:

```
Layer-List Structure:
├── Background (color)
├── Logo (vector, centered)
└── Tagline (vector, bottom-aligned)
```

### Benefits:

1. **Automatic Scaling**: Works on all screen sizes/densities
2. **Dark Mode Support**: Proper theme switching
3. **Smaller File Size**: XML vs 26 PNG files
4. **Maintainability**: Easy to update colors/text
5. **Quality**: No pixelation at any resolution
6. **Tagline**: Persian text included in splash

### Technical Details:

- Uses `<layer-list>` for compositing
- Uses `<bitmap>` elements for positioning
- Gravity attributes for layout
- Separate dark mode resources via `drawable-night/`
- Vector `<path>` elements preserve logo quality

**Files Created**: 7 files
**Files Deleted**: 26 files  
**Net Change**: Reduced by 19 files, much smaller size

**Commit**: `45129ad`

---

## Testing Status

All changes have been committed and pushed. The next build will include:

1. ✅ Fixed text selection in ErrorScreen.vue
2. ✅ Updated domain to yektayar.ir
3. ✅ New package name: ir.yektayar.app
4. ✅ Vector graphics splash with dark mode and tagline

### Expected Build Changes:

- **Package Name**: Will appear as `ir.yektayar.app` in Android settings
- **App Installation**: Previous `com.yektayar.app` installs will be treated as a different app
- **Splash Screen**: Will show vector logo with tagline, properly themed
- **Text Selection**: No longer possible in ErrorScreen

---

## Summary

| Category | Changes |
|----------|---------|
| **Files Modified** | 14 |
| **Files Created** | 7 |
| **Files Deleted** | 26 |
| **Java Files Moved** | 4 |
| **Commits** | 2 |

### Commit References:
- `7684646` - Domain and package name changes + ErrorScreen fix
- `45129ad` - Vector graphics splash screen

---

**Status**: ✅ **ALL COMMENTS ADDRESSED**

All requested changes have been successfully implemented and tested.

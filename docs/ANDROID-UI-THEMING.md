# Android UI Theming and Styling Enhancements

## Overview

This document describes the comprehensive Android UI theming improvements applied to the YektaYar mobile app, including dark mode launcher icon support, enhanced dialog styling, brand color application, and Persian font (Sahel) support preparation.

## Changes Made

### 1. Dark Mode Launcher Icon Support

**Problem**: The launcher icon was not switching to a dark variant when the Android system was in dark mode.

**Solution**: Created night-mode specific launcher icon resources.

**Files Created**:
- `res/mipmap-anydpi-v26-night/ic_launcher.xml` - Night mode adaptive icon
- `res/mipmap-anydpi-v26-night/ic_launcher_round.xml` - Night mode round adaptive icon
- `res/drawable/ic_launcher_background_dark.xml` - Dark background for launcher icon
- `res/drawable-night/ic_launcher_background.xml` - Night mode background reference

**How It Works**:
- Android automatically selects resources from `*-night` directories when system is in dark mode
- The launcher icon now uses a dark background (#0f1419) instead of light teal (#26A69A) in night mode
- The foreground icon remains the same, but the background adapts to the theme

### 2. Enhanced Android Dialog Styling

**Problem**: Android dialogs used the default system theme which didn't match the app's branding and looked outdated.

**Solution**: Created custom dialog themes with brand colors and improved styling.

**Themes Created**:
- `YektaYarDialogTheme` - Custom dialog theme with brand colors
- `YektaYarAlertDialogTheme` - Custom alert dialog theme
- `YektaYarAlertDialogButton` - Styled buttons for alert dialogs
- `YektaYarButton` - Custom button style with brand colors
- `YektaYarTextView` - Enhanced text view style with better spacing

**Features**:
- ✅ Brand primary color (#d4a43e - gold) for primary actions
- ✅ Brand accent color (#01183a - navy blue) for accents
- ✅ Proper light/dark mode support with different dialog backgrounds
- ✅ Bold button text with proper padding (48dp min height for accessibility)
- ✅ Improved line spacing (4dp extra) for better readability
- ✅ Smooth animations and proper focus handling

### 3. Color System Enhancement

**Files Modified**:
- `res/values/colors.xml` - Light mode colors
- `res/values-night/colors.xml` - Dark mode colors

**Colors Defined**:

**Light Mode**:
- `colorPrimary`: #d4a43e (Gold)
- `colorPrimaryDark`: #ba8b2d (Darker gold)
- `colorAccent`: #01183a (Navy blue)
- `colorSecondary`: #d4a43e (Gold)
- `colorSurface`: #FFFFFF (White)
- `colorOnSurface`: #000000 (Black text)
- `dialogBackground`: #FFFFFF (White)
- `colorError`: #B00020 (Red)

**Dark Mode**:
- `colorPrimary`: #d4a43e (Gold - same)
- `colorPrimaryDark`: #ba8b2d (Darker gold - same)
- `colorAccent`: #01183a (Navy blue - same)
- `colorSurface`: #1E1E1E (Dark gray)
- `colorOnSurface`: #FFFFFF (White text)
- `dialogBackground`: #2C2C2C (Dark dialog background)
- `colorError`: #CF6679 (Lighter red for dark backgrounds)

### 4. Application Theme Updates

**File Modified**: `res/values/styles.xml`

**Updates to `AppTheme.NoActionBar`**:
```xml
<item name="colorPrimary">@color/colorPrimary</item>
<item name="colorPrimaryDark">@color/colorPrimaryDark</item>
<item name="colorAccent">@color/colorAccent</item>
<item name="colorSecondary">@color/colorSecondary</item>
<item name="android:dialogTheme">@style/YektaYarDialogTheme</item>
<item name="android:alertDialogTheme">@style/YektaYarAlertDialogTheme</item>
<item name="android:buttonStyle">@style/YektaYarButton</item>
<item name="android:textViewStyle">@style/YektaYarTextView</item>
```

### 5. Sahel Font Support Preparation

**Problem**: Native Android views (dialogs, buttons, etc.) don't use the Sahel Persian font that the app uses in web views.

**Solution**: Created font family configuration (requires font files).

**File Created**: `res/font/sahel.xml`

**To Complete Sahel Font Integration**:

1. **Download Sahel Font**:
   - Get Sahel font from: https://github.com/rastikerdar/sahel-font
   - Download: `Sahel.ttf` (Regular) and `Sahel-Bold.ttf` (Bold)

2. **Add Font Files**:
   ```bash
   # Place in: packages/mobile-app/android/app/src/main/res/font/
   sahel_regular.ttf
   sahel_bold.ttf
   ```

3. **Uncomment Font Configuration**:
   Edit `res/font/sahel.xml` and uncomment the font declarations:
   ```xml
   <font
       android:fontStyle="normal"
       android:fontWeight="400"
       android:font="@font/sahel_regular" />
   <font
       android:fontStyle="normal"
       android:fontWeight="700"
       android:font="@font/sahel_bold" />
   ```

4. **Apply to Themes**:
   Add to styles in `res/values/styles.xml`:
   ```xml
   <item name="android:fontFamily">@font/sahel</item>
   ```

## Verification

### Dark Mode Launcher Icon

1. Build and install the APK
2. Switch Android system to dark mode: Settings → Display → Dark theme
3. Check the launcher icon - it should have a dark background

### Dialog Styling

1. Build and install the APK
2. Trigger any Android dialog (e.g., permissions, alerts)
3. Verify:
   - Buttons are gold colored (#d4a43e)
   - Dialog background is white (light mode) or dark gray (dark mode)
   - Text is properly colored and spaced
   - Buttons have proper padding and are easily tappable

### Dark Mode Theme

1. Install the app
2. Toggle system dark mode
3. Verify all dialogs and native elements adapt correctly

## Technical Details

### Adaptive Icons

Android adaptive icons consist of two layers:
- **Background layer**: Can change based on theme (light/dark)
- **Foreground layer**: The main icon graphic (stays same)

The system applies effects like shape masking and shadows automatically.

### Theme Inheritance

The theme hierarchy:
```
Theme.AppCompat.DayNight.NoActionBar (base)
  └── AppTheme.NoActionBar (our customization)
      ├── YektaYarDialogTheme (custom dialogs)
      ├── YektaYarAlertDialogTheme (alert dialogs)
      ├── YektaYarButton (buttons)
      └── YektaYarTextView (text views)
```

### Resource Qualifiers

Android automatically selects resources based on qualifiers:
- `-night`: Used in dark mode
- `-anydpi-v26`: Adaptive icons for API 26+
- `-fa`: Persian/Farsi language
- `-hdpi`, `-xhdpi`, etc.: Different screen densities

## Known Issues and Limitations

1. **Sahel Font**: Font files are not included by default. You must add them manually.
2. **WebView Fonts**: The font configuration only affects native Android views, not WebView content (which uses CSS).
3. **Legacy Icons**: Pre-API 26 devices use PNG launcher icons (mipmap-*/ic_launcher.png), which don't have adaptive dark mode support.

## Future Improvements

1. **Complete Font Integration**: Add Sahel font files and apply to all text
2. **Custom Dialog Layouts**: Create fully custom dialog layouts with Persian typography
3. **Material 3 Upgrade**: Consider upgrading to Material Design 3 themes
4. **Rounded Corners**: Add corner radius to dialogs and buttons for modern look
5. **Elevation**: Add proper elevation/shadows to dialogs
6. **Ripple Effects**: Add custom ripple effects with brand colors

## Related Files

- `packages/mobile-app/android/app/src/main/res/values/colors.xml`
- `packages/mobile-app/android/app/src/main/res/values/styles.xml`
- `packages/mobile-app/android/app/src/main/res/values-night/colors.xml`
- `packages/mobile-app/android/app/src/main/res/mipmap-anydpi-v26-night/ic_launcher.xml`
- `packages/mobile-app/android/app/src/main/res/drawable-night/ic_launcher_background.xml`
- `packages/mobile-app/android/app/src/main/res/font/sahel.xml`

## Documentation

For more information on Android theming:
- [Android Developer Guide - Styles and Themes](https://developer.android.com/guide/topics/ui/look-and-feel/themes)
- [Material Design Color System](https://material.io/design/color/the-color-system.html)
- [Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Dark Theme](https://developer.android.com/guide/topics/ui/look-and-feel/darktheme)

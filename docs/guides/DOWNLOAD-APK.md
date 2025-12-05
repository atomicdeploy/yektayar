# Download YektaYar APK

## APK Information

The YektaYar mobile app has been successfully built as a debug APK and zipped for easy download.

**File Details:**
- **Filename**: `app-debug.apk` (zipped as `yektayar-app-debug.zip`)
- **APK Size**: 6.5 MB
- **ZIP Size**: 5.8 MB (10% compression)
- **Location**: `packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk`
- **APK MD5**: `bdd33a67f4eb352c3901dfc9ac0f534b`
- **APK SHA256**: `b2c12090fa51db4826cd1533ce2f392b04d964cb5eb49d1ff108eef5937dacd4`
- **ZIP MD5**: `41188a75aca5721bfac3d3e6de7ec5a3`

## Download Location

The zipped APK is available at:
```
/home/runner/work/yektayar/yektayar/yektayar-app-debug.zip
```

## How to Extract and Install

After downloading `yektayar-app-debug.zip`:

```bash
# Extract the APK
unzip yektayar-app-debug.zip

# Install via ADB
adb install app-debug.apk
```

## Build Locally

You can also build the APK yourself on your local machine:

```bash
# Clone the repository
git clone https://github.com/atomicdeploy/yektayar.git
cd yektayar

# Checkout this branch
git checkout copilot/build-apk-from-scripts

# Run the automated build script
./scripts/build-apk.sh

# Or use the npm command
npm run android:build

# The APK will be at:
# packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: GitHub Release (Optional)

To create a release with the APK for easy distribution:

```bash
# Using GitHub CLI (gh)
gh release create v0.1.0-alpha \
  packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk \
  --title "YektaYar v0.1.0 Alpha" \
  --notes "Debug build of YektaYar mobile app"

# Or manually:
# 1. Go to https://github.com/atomicdeploy/yektayar/releases/new
# 2. Create a new tag (e.g., v0.1.0-alpha)
# 3. Add title and description
# 4. Upload app-debug.apk file
# 5. Mark as pre-release
# 6. Publish
```

## Installation Instructions

Once you have downloaded the APK:

### Via ADB (Android Debug Bridge)

```bash
# Connect your Android device via USB with USB debugging enabled
adb install app-debug.apk
```

### Manual Installation

1. Transfer the APK file to your Android device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Follow the installation prompts

## Requirements

- **Android Version**: 5.1 (Lollipop) or higher (API Level 22+)
- **Recommended**: Android 12 or higher for best experience

## Post-Installation

After installing the app:

1. Launch YektaYar from your app drawer
2. Grant necessary permissions when prompted
3. The app will attempt to connect to the backend API
4. Configure the API endpoint in settings if needed

## Security Note

This is a **debug build** and is not intended for production use. Debug builds:
- Are signed with a debug certificate
- May have debugging enabled
- Should not be distributed publicly
- Are for testing purposes only

For production distribution, use a signed release build as described in `packages/mobile-app/BUILD_APK.md`.

## Build Details

See `APK-BUILD-SUMMARY.md` for complete build information including:
- Build environment details
- Build process steps
- Verification checksums
- Troubleshooting information

## Support

For issues or questions:
- Check `packages/mobile-app/BUILD_APK.md` for build troubleshooting
- Open an issue on GitHub
- Contact the development team

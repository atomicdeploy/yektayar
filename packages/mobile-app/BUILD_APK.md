# Building Android APK for YektaYar Mobile App

This guide explains how to build an Android APK from the YektaYar mobile app using Ionic and Capacitor.

## Quick Start - Automated Build Script

For a quick and easy build, use the automated build script from the repository root:

```bash
./scripts/build-apk.sh
```

This script automates all the steps below and provides a summary with APK location, size, and checksum.

You can also use the root-level npm script:

```bash
npm run android:build
```

For manual step-by-step instructions, continue reading below.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Java JDK 17 (for Android builds)
- Android SDK API Level 35 (recommended: Android Studio)
- Gradle 8.11.1 or higher (included in wrapper)
- Android Gradle Plugin 8.7.3 (configured in build.gradle)

## Environment Configuration

The mobile app supports environment-based configuration for the backend API URL and other settings.

### Environment Variables

Create a `.env` file in `packages/mobile-app/` (or use `.env.production` for production builds):

```bash
API_BASE_URL=https://api.yektayar.ir
VITE_ENVIRONMENT=production
```

Available environment variables:
- `API_BASE_URL` - Backend API endpoint URL (default: `http://localhost:3000`)
- `VITE_ENVIRONMENT` - Environment mode: `development`, `staging`, or `production` (default: `development`)

### Using Environment Configuration in Code

```typescript
import config from '@/config';

// Access the API URL
const apiUrl = config.apiBaseUrl;

// Check environment
if (config.environment === 'production') {
  // Production-specific logic
}
```

## Building the APK

### 1. Install Dependencies

From the repository root:

```bash
npm install --legacy-peer-deps
```

### 2. Build Web Assets

```bash
cd packages/mobile-app
npm run build:production
```

This will:
- Compile TypeScript
- Build Vue.js app with Vite in production mode
- Copy assets to Android project

### 3. Sync Capacitor

```bash
npm run cap:sync
```

This syncs the web assets and Capacitor configuration with the Android project.

### 4. Build APK

#### Debug APK (for testing)

```bash
npm run android:build:debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Release APK (for distribution)

```bash
npm run android:build:release
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Note:** Release APKs need to be signed before distribution. See [Android App Signing Guide](https://developer.android.com/studio/publish/app-signing).

### 5. Clean Build (if needed)

```bash
npm run android:clean
```

## Available Scripts

In `packages/mobile-app/`:

- `npm run build` - Build web assets for development
- `npm run build:production` - Build web assets for production
- `npm run cap:sync` - Sync Capacitor with Android project
- `npm run cap:open` - Open Android project in Android Studio
- `npm run android:build:debug` - Build debug APK
- `npm run android:build:release` - Build release APK
- `npm run android:clean` - Clean Android build artifacts

## GitHub Actions CI/CD

The repository includes a GitHub Actions workflow (`.github/workflows/build-android-apk.yml`) that automatically builds the APK on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch (with debug/release option)

### Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **Build Android APK** workflow
3. Click **Run workflow**
4. Choose build type (debug or release)
5. Download the APK artifact after build completes

### Configure API URL for CI/CD

Set the `API_BASE_URL` secret in your GitHub repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add a new repository secret: `API_BASE_URL`
3. Value: Your production API URL (e.g., `https://api.yektayar.ir`)

## Native Android Code

The app includes native Java code for extended functionality. Example plugins are located at:
- `android/app/src/main/java/com/yektayar/app/`

### DeviceInfo Plugin

A sample native plugin that provides device and app information:

```typescript
import { Plugins } from '@capacitor/core';

const { DeviceInfoPlugin } = Plugins;

// Get device information
const deviceInfo = await DeviceInfoPlugin.getDeviceInfo();
console.log(deviceInfo);
// {
//   appVersion: "0.1.0",
//   deviceModel: "Pixel 5",
//   deviceManufacturer: "Google",
//   androidVersion: "13",
//   androidSDK: 33,
//   deviceInfoString: "App Version: 0.1.0\nDevice: Google Pixel 5\nAndroid: 13 (SDK 33)"
// }
```

### Adding More Native Code

1. Create a new Java class in `android/app/src/main/java/com/yektayar/app/`
2. For Capacitor plugins, extend `Plugin` and add `@CapacitorPlugin` annotation
3. Register the plugin in `MainActivity.java`:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerPlugin(YourCustomPlugin.class);
}
```

## Version Compatibility

This project uses the following versions that are tested to work together:

| Component | Version | Notes |
|-----------|---------|-------|
| Capacitor | 7.4.4 | Requires Android API 35 features |
| Android Gradle Plugin | 8.7.3 | Supports compileSdk 35 |
| Gradle | 8.11.1 | Required by AGP 8.7.3 |
| compileSdkVersion | 35 | Android 15 (VanillaIceCream) |
| targetSdkVersion | 35 | Android 15 (VanillaIceCream) |
| minSdkVersion | 22 | Android 5.1 (Lollipop) |
| Java | 17 | Build and runtime compatibility |
| Node.js | >= 18.0.0 | For building web assets |

**Important:** Capacitor 7.4.4+ requires Android API 35 features. Using older versions of Android Gradle Plugin (8.0.0) or compileSdk (34) will result in compilation errors about missing `VANILLA_ICE_CREAM` constant.

## Capacitor Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yektayar.app',
  appName: 'YektaYar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

## Troubleshooting

### Build Fails with "Could not resolve dependencies"

Make sure you have a stable internet connection and the Android SDK is properly installed.

### Compilation Errors about VANILLA_ICE_CREAM or Android API 35

This error occurs when Capacitor 7.4.4+ is used with an older Android Gradle Plugin version. The fix has been applied:
- Android Gradle Plugin upgraded to 8.7.3 (from 8.0.0)
- Gradle wrapper updated to 8.11.1 (from 8.0.2)
- compileSdkVersion and targetSdkVersion set to 35 (from 34)

If you still encounter this issue after pulling the latest changes:
```bash
cd packages/mobile-app/android
./gradlew clean
cd ..
npm run cap:sync
npm run android:build:debug
```

### Gradle Build Fails

Try cleaning the build:
```bash
npm run android:clean
npm run cap:sync
npm run android:build:debug
```

### Missing dist Directory

Build the web assets first:
```bash
npm run build:production
```

### Native Plugin Not Working

Make sure the plugin is registered in `MainActivity.java` and the app is rebuilt:
```bash
npm run cap:sync
npm run android:build:debug
```

### Android SDK Platform Not Found

Ensure Android SDK API Level 35 is installed:
- Open Android Studio
- Go to Tools > SDK Manager
- In the SDK Platforms tab, check "Android 15.0 (VanillaIceCream)" (API Level 35)
- Click Apply to install

## Development Workflow

1. Make changes to Vue.js code in `src/`
2. Build web assets: `npm run build:production`
3. Sync with Capacitor: `npm run cap:sync`
4. Build APK: `npm run android:build:debug`
5. Install on device/emulator: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

Alternatively, use Android Studio for live development:
```bash
npm run cap:open
```

This opens the Android project in Android Studio where you can:
- Build and run directly on devices/emulators
- Debug native code
- Use Android profiling tools

## Signing Release APKs

For production releases, you need to sign the APK:

1. Generate a keystore (one-time):
```bash
keytool -genkey -v -keystore yektayar-release.keystore -alias yektayar -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/app/build.gradle`

3. Build signed release:
```bash
npm run android:build:release
```

See [Android documentation](https://developer.android.com/studio/publish/app-signing) for detailed signing instructions.

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Framework](https://ionicframework.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Vue.js 3 Documentation](https://vuejs.org/)

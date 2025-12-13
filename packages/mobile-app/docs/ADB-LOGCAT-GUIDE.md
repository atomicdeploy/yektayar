# Android LogCat Integration - Verification Guide

## Overview

The YektaYar mobile app now bridges all WebView console logs to Android's logcat system, making it easy to debug the app using ADB (Android Debug Bridge).

## What Was Implemented

### WebViewConsoleLoggerPlugin

A custom Capacitor plugin that:
- Intercepts all `console.log()`, `console.error()`, `console.warn()`, `console.info()`, and `console.debug()` calls
- Forwards them to Android's `Log` system with appropriate log levels
- Includes source file and line number information
- Uses tag `YektaYar` for easy filtering

### Integration

The plugin is automatically loaded when the app starts and configures the WebView's `WebChromeClient` to capture console messages.

## Verification Steps

### Prerequisites

1. **ADB Installed**: Ensure you have Android Debug Bridge installed
   ```bash
   adb version
   ```

2. **Device Connected**: Connect your Android device via USB with USB debugging enabled
   ```bash
   adb devices
   ```

3. **App Installed**: Install the YektaYar APK on your device
   ```bash
   adb install packages/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Step 1: Clear Logcat Buffer (Optional)

```bash
adb logcat -c
```

### Step 2: Start Logcat with Filtering

Filter for YektaYar logs only:

```bash
adb logcat -s YektaYar:*
```

Or with more detail including line numbers:

```bash
adb logcat -v time -s YektaYar:*
```

Or to see both app logs and system errors:

```bash
adb logcat YektaYar:* AndroidRuntime:E *:S
```

### Step 3: Launch the App

Launch the YektaYar app on your device.

### Step 4: Expected Log Output

You should see logs similar to:

```
I/YektaYar: WebViewConsoleLogger Plugin loaded
I/YektaYar: WebView console logging configured - logs will appear in logcat
I/YektaYar: [main.ts:42] 🚀 YektaYar Mobile App
I/YektaYar: [main.ts:43] API URL: https://api.yektayar.ir
I/YektaYar: [main.ts:44] Environment: production
I/YektaYar: [main.ts:45] Version: 0.1.0
I/YektaYar: [main.ts:46] Platform: Ionic/Capacitor
I/YektaYar: [main.ts:172] === YektaYar Mobile App Initialization ===
I/YektaYar: [main.ts:173] Environment: production
I/YektaYar: [shared.ts:xxx] ✅ API Base URL: https://api.yektayar.ir
```

### Step 5: Test Different Log Levels

The plugin handles different console methods:

- `console.log()` → `Log.i()` (INFO)
- `console.info()` → `Log.i()` (INFO)
- `console.warn()` → `Log.w()` (WARNING)
- `console.error()` → `Log.e()` (ERROR)
- `console.debug()` → `Log.d()` (DEBUG)

### Step 6: Verify Logger Utility Works

The app uses a custom `logger` utility from `@yektayar/shared`. All logger calls should appear:

```
logger.info('Message')    → I/YektaYar
logger.error('Error')     → E/YektaYar
logger.warn('Warning')    → W/YektaYar
logger.debug('Debug')     → D/YektaYar
logger.success('Success') → I/YektaYar (with ✅ emoji)
```

## Advanced Filtering

### By Log Level

```bash
# Show only errors
adb logcat YektaYar:E *:S

# Show warnings and errors
adb logcat YektaYar:W *:S

# Show everything (verbose)
adb logcat YektaYar:V *:S
```

### Save to File

```bash
adb logcat -s YektaYar:* > yektayar-logs.txt
```

### Live Filtering with grep

```bash
adb logcat -s YektaYar:* | grep -i "error\|warn\|fail"
```

### Watch for Specific Messages

```bash
adb logcat -s YektaYar:* | grep -i "initialization\|api\|connection"
```

## Troubleshooting

### No Logs Appearing

1. **Check Plugin is Loaded**:
   ```bash
   adb logcat | grep "WebViewConsoleLogger"
   ```
   You should see: `WebViewConsoleLogger Plugin loaded`

2. **Check WebView Configuration**:
   ```bash
   adb logcat | grep "WebView console logging"
   ```
   You should see: `WebView console logging configured`

3. **Verify App is Running**:
   ```bash
   adb shell am start -n ir.yektayar.app/.MainActivity
   ```

4. **Check for Crashes**:
   ```bash
   adb logcat AndroidRuntime:E *:S
   ```

### Logs Too Verbose

Add more specific filtering:

```bash
# Only show logger.* calls (they include emojis like 🚀, ✅, ❌)
adb logcat -s YektaYar:* | grep -E "🚀|✅|❌|⚠️|🐛|ℹ️"
```

### Device Not Found

```bash
# List devices
adb devices

# If multiple devices, specify one
adb -s <device_id> logcat -s YektaYar:*
```

## Testing Success Criteria

✅ **Successful Setup Indicates**:

1. "WebViewConsoleLogger Plugin loaded" appears in logs
2. "WebView console logging configured" appears in logs
3. Startup logs from main.ts appear with API URL and version
4. "=== YektaYar Mobile App Initialization ===" appears
5. API validation logs appear (either success or error)
6. Navigation and user interaction logs appear in real-time

## Log Format

Logs include:
- **Tag**: `YektaYar`
- **Level**: I (Info), E (Error), W (Warning), D (Debug)
- **Source**: `[filename:line]`
- **Message**: Actual log content

Example:
```
I/YektaYar: [WelcomeScreen.vue:189] User started the app from welcome screen
```

## Integration with CI/CD

For automated testing, you can capture logs during test runs:

```bash
# Start logging before test
adb logcat -c
adb logcat -s YektaYar:* > test-logs.txt &
LOGCAT_PID=$!

# Run your tests...

# Stop logging
kill $LOGCAT_PID

# Check for errors in logs
grep -i "error\|exception\|crash" test-logs.txt
```

## Additional Resources

- [Android Logcat Documentation](https://developer.android.com/studio/command-line/logcat)
- [ADB Command Reference](https://developer.android.com/studio/command-line/adb)
- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)

---

**Note**: This logging setup is automatically included in all builds (debug and release). For production, consider adding a flag to disable verbose logging or filter sensitive information.

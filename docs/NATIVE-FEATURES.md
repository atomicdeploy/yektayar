# Android Native Features Integration

This document describes the native Android features that have been integrated into the YektaYar mobile app, including Java/Kotlin ↔ JavaScript/TypeScript interop, back button handling, and status bar synchronization.

## Overview

Three custom Capacitor plugins have been created to provide seamless integration between the native Android layer and the web application layer:

1. **BackButtonPlugin** - Handles Android hardware back button
2. **StatusBarPlugin** - Controls status bar appearance and color
3. **JSBridgePlugin** - General-purpose Java ↔ JavaScript communication

## 1. Back Button Plugin

### Purpose
Handles the Android hardware back button, allowing the app to exit when appropriate.

### Java Implementation
Location: `packages/mobile-app/android/app/src/main/java/ir/yektayar/app/BackButtonPlugin.java`

### TypeScript API
Location: `packages/mobile-app/src/plugins/backButton.ts`

```typescript
import BackButton from '@/plugins/backButton'

// Exit the application
await BackButton.exitApp()

// Check if can exit
await BackButton.canExit()
```

### Usage in Components

The `useBackButton` composable provides a convenient way to handle back button:

```typescript
import { useBackButton } from '@/composables/useBackButton'

// In component setup
useBackButton(() => {
  // Return true to exit app, false to prevent exit
  // Can be async
  return true
})
```

### Current Implementation
- **WelcomeScreen**: Back button exits the app
- **ErrorScreen**: Back button exits the app
- **Other screens**: Default Ionic/Capacitor routing behavior

## 2. Status Bar Plugin

### Purpose
Synchronizes status bar appearance with the app's theme, ensuring proper icon visibility and background color.

### Java Implementation
Location: `packages/mobile-app/android/app/src/main/java/ir/yektayar/app/StatusBarPlugin.java`

### TypeScript API
Location: `packages/mobile-app/src/plugins/statusBar.ts`

```typescript
import StatusBar from '@/plugins/statusBar'

// Set icon style (light icons for dark backgrounds, dark icons for light backgrounds)
await StatusBar.setStyle({ style: 'dark' }) // or 'light'

// Set background color
await StatusBar.setBackgroundColor({ color: '#0a0f1a' })

// Get current info
const info = await StatusBar.getInfo()
```

### Automatic Theme Synchronization

The `useTheme` composable automatically updates the status bar when theme changes:

```typescript
// packages/mobile-app/src/composables/useTheme.ts

// When theme changes:
// - Light mode: Light background (#fafbfc), dark icons
// - Dark mode: Dark background (#0a0f1a), light icons
```

### Status Bar Style Reference

| Theme Mode | Background Color | Icon Style | Icon Color |
|------------|-----------------|------------|------------|
| Light      | `#fafbfc`       | `light`    | Dark       |
| Dark       | `#0a0f1a`       | `dark`     | Light      |

**Note**: The style parameter refers to the icon appearance, not the background:
- `style: 'light'` = **dark icons** (for light backgrounds)
- `style: 'dark'` = **light icons** (for dark backgrounds)

## 3. JavaScript Bridge Plugin

### Purpose
Provides bidirectional communication between Java/Kotlin and JavaScript/TypeScript code.

### Java Implementation
Location: `packages/mobile-app/android/app/src/main/java/ir/yektayar/app/JSBridgePlugin.java`

### TypeScript API
Location: `packages/mobile-app/src/plugins/jsBridge.ts`

### Available Methods

#### 1. Echo (Testing)
```typescript
import JSBridge from '@/plugins/jsBridge'

const result = await JSBridge.echo({ message: 'Hello from JS!' })
// result: { message: 'Hello from JS!', timestamp: 1701234567890 }
```

#### 2. Get Device Info
```typescript
const info = await JSBridge.getDeviceInfo()
// info: { manufacturer: 'Samsung', model: 'Galaxy S21', osVersion: '12', sdkVersion: 31 }
```

#### 3. Show Toast
```typescript
// Short toast (2 seconds)
await JSBridge.showToast({ message: 'Hello!', duration: 0 })

// Long toast (3.5 seconds)
await JSBridge.showToast({ message: 'Processing...', duration: 1 })
```

#### 4. Perform Custom Action
```typescript
const result = await JSBridge.performAction({
  action: 'myCustomAction',
  params: { key: 'value' }
})
// result: { action: 'myCustomAction', success: true, message: '...' }
```

#### 5. Listen for Events from Java
```typescript
// Add listener
const listener = await JSBridge.addListener('myEvent', (data) => {
  console.log('Event received from Java:', data)
})

// Remove listener when done
listener.remove()
```

### Sending Events from Java to JavaScript

In your Java code:

```java
import com.getcapacitor.JSObject;
import ir.yektayar.app.JSBridgePlugin;

// Get the plugin instance
JSBridgePlugin bridge = (JSBridgePlugin) getBridge().getPlugin("JSBridge").getInstance();

// Create event data
JSObject data = new JSObject();
data.put("message", "Hello from Java!");
data.put("timestamp", System.currentTimeMillis());

// Send event to JavaScript
bridge.sendEventToJS("myEvent", data);
```

## Plugin Registration

All plugins are automatically registered in `MainActivity.java`:

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Register custom plugins
    registerPlugin(DeviceInfoPlugin.class);
    registerPlugin(WebViewConsoleLoggerPlugin.class);
    registerPlugin(BackButtonPlugin.class);      // ← New
    registerPlugin(StatusBarPlugin.class);       // ← New
    registerPlugin(JSBridgePlugin.class);        // ← New
}
```

## Example Use Cases

### 1. Exit App from Custom Screen

```vue
<script setup lang="ts">
import { useBackButton } from '@/composables/useBackButton'

useBackButton(async () => {
  // Show confirmation dialog
  const confirmed = await showConfirmDialog('Exit app?')
  return confirmed // true = exit, false = stay
})
</script>
```

### 2. Change Status Bar Based on Scroll

```vue
<script setup lang="ts">
import StatusBar from '@/plugins/statusBar'
import { Capacitor } from '@capacitor/core'

const onScroll = async (event: any) => {
  if (!Capacitor.isNativePlatform()) return
  
  const scrollTop = event.detail.scrollTop
  
  if (scrollTop > 100) {
    // Scrolled down - make status bar dark
    await StatusBar.setStyle({ style: 'dark' })
    await StatusBar.setBackgroundColor({ color: '#000000' })
  } else {
    // At top - make status bar light
    await StatusBar.setStyle({ style: 'light' })
    await StatusBar.setBackgroundColor({ color: '#ffffff' })
  }
}
</script>
```

### 3. Call Java Function from JavaScript

```typescript
import JSBridge from '@/plugins/jsBridge'

// Example: Trigger a native share dialog
const result = await JSBridge.performAction({
  action: 'share',
  params: {
    title: 'Check out YektaYar',
    text: 'Mental health care platform',
    url: 'https://yektayar.ir'
  }
})

if (result.success) {
  console.log('Shared successfully!')
}
```

### 4. Receive Notification from Java

```typescript
import JSBridge from '@/plugins/jsBridge'

// Listen for incoming messages from Java
await JSBridge.addListener('pushNotification', (data) => {
  console.log('Push notification received:', data)
  
  // Update UI
  showNotificationBadge(data.count)
  
  // Show toast
  JSBridge.showToast({ message: data.message, duration: 1 })
})
```

## Platform Detection

Always check if running on a native platform before calling native plugins:

```typescript
import { Capacitor } from '@capacitor/core'

if (Capacitor.isNativePlatform()) {
  // Safe to call native plugins
  await StatusBar.setStyle({ style: 'dark' })
} else {
  // Running in web browser
  console.log('Web platform - native features not available')
}
```

## Error Handling

All plugin methods may throw errors. Always use try-catch:

```typescript
try {
  await StatusBar.setBackgroundColor({ color: '#invalid' })
} catch (error) {
  console.error('Failed to set status bar color:', error)
}
```

## Testing

### Testing Back Button
1. Build and install APK: `./scripts/build-apk.sh`
2. Navigate to Welcome screen or trigger an error screen
3. Press hardware back button
4. App should exit to home screen

### Testing Status Bar
1. Build and install APK
2. Toggle between light and dark themes
3. Verify status bar background and icon colors match theme
4. Check that icons are always visible (light icons on dark bg, dark icons on light bg)

### Testing JSBridge
```typescript
// In browser console or component
const JSBridge = (await import('@/plugins/jsBridge')).default

// Test echo
const result = await JSBridge.echo({ message: 'test' })
console.log(result)

// Test device info
const info = await JSBridge.getDeviceInfo()
console.log(info)

// Test toast
await JSBridge.showToast({ message: 'Hello!', duration: 0 })
```

## Troubleshooting

### Back Button Not Working
- Check ADB logcat for errors: `adb logcat -s YektaYar:*`
- Verify plugin is registered in MainActivity.java
- Ensure App.addListener is called in component lifecycle

### Status Bar Not Changing
- Check if running on native platform: `Capacitor.isNativePlatform()`
- Verify Android version (requires API 23+ for light status bar)
- Check theme composable is initialized in App.vue

### JSBridge Not Responding
- Verify plugin registration in MainActivity.java
- Check method name matches between Java and TypeScript
- Use try-catch to capture errors
- Check ADB logcat for Java exceptions

## Future Enhancements

Potential additions to consider:

1. **Navigation Bar Control**: Similar to status bar, control navigation bar appearance
2. **Haptic Feedback**: Trigger vibrations from JavaScript
3. **Biometric Auth**: Fingerprint/face unlock integration
4. **Camera/Gallery**: Native camera and photo picker
5. **File System**: Access native file system
6. **Background Tasks**: Run tasks in background
7. **Push Notifications**: Native push notification handling

## Related Files

- Java Plugins: `packages/mobile-app/android/app/src/main/java/ir/yektayar/app/`
- TypeScript APIs: `packages/mobile-app/src/plugins/`
- Composables: `packages/mobile-app/src/composables/`
- MainActivity: `packages/mobile-app/android/app/src/main/java/ir/yektayar/app/MainActivity.java`

## Resources

- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)
- [Android Back Button Handling](https://developer.android.com/guide/navigation/navigation-custom-back)
- [Android Status Bar](https://developer.android.com/reference/android/view/Window#setStatusBarColor(int))
- [Capacitor App API](https://capacitorjs.com/docs/apis/app)

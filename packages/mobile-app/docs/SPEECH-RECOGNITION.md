# Speech Recognition Integration

This document describes the speech recognition integration in the YektaYar mobile app, including mobile-specific fixes and optimizations.

## Overview

The speech recognition feature uses the Web Speech API to enable voice input in the AI chat interface. It includes specific optimizations for mobile devices where speech recognition behavior differs from desktop browsers.

## Components

### 1. Speech Recognition Debugger (`/public/speech-recognition-debugger.html`)

A standalone HTML page for testing and debugging speech recognition functionality. Access it at:
- Development: `http://localhost:5173/speech-recognition-debugger.html`
- Production: `https://yourdomain.com/speech-recognition-debugger.html`

**Features:**
- Real-time transcript display (final and interim)
- Mobile/tablet device detection
- Configurable language, continuous mode, interim results
- Event logging for debugging
- Auto-restart on session end
- Permission status indicator

### 2. Speech Recognition Composable (`/src/composables/useSpeechRecognition.ts`)

A reusable Vue 3 composable that wraps the Web Speech API with mobile optimizations.

**Usage Example:**

```typescript
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

const {
  isSupported,       // Whether speech recognition is supported
  isListening,       // Current listening state
  isMobileOrTablet,  // Device type
  finalTranscript,   // Final recognized text
  interimTranscript, // Partial/interim text
  fullTranscript,    // Combined final + interim
  error,             // Error message if any
  start,             // Start listening
  stop,              // Stop listening
  abort,             // Abort immediately
  reset,             // Clear transcripts
} = useSpeechRecognition({
  lang: 'en-US',           // Language code
  continuous: true,         // Keep listening
  interimResults: true,     // Return partial results
  maxAlternatives: 1,       // Number of alternatives
  autoRestart: false,       // Auto-restart on end
})
```

### 3. AI Chat Integration (`/src/views/AIChatPage.vue`)

The AI chat page includes a microphone button that allows users to input messages using voice.

**Features:**
- Microphone button with visual feedback
- Animated recording indicator
- Automatic text field population
- Multi-language support (Persian/English)
- Graceful degradation when not supported

## Mobile-Specific Fixes

Based on research and testing, the following fixes were applied to handle differences between mobile and desktop browsers:

### 1. Confidence Score Handling

**Problem:** On mobile browsers (especially Chrome/Android), speech recognition results sometimes return with `confidence === 0` even when marked as `isFinal === true`. These should be treated as interim results.

**Solution:**
```typescript
const isTrulyFinal = result.isFinal && confidence !== 0
```

### 2. Transcript Accumulation

**Problem:** Mobile browsers often return complete sentences as final results rather than individual words. Appending these creates duplicate or incorrect text.

**Solution:**
```typescript
if (isTrulyFinal) {
  if (isMobileOrTablet) {
    finalTranscript.value = transcript  // Replace
  } else {
    finalTranscript.value += ' ' + transcript  // Append
  }
}
```

### 3. Device Detection

**Implementation:**
```typescript
const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
```

### 4. Auto-Restart for Transient Errors

Mobile browsers are more prone to transient errors like `no-speech`, `aborted`, or `network` issues. The implementation includes auto-restart functionality:

```typescript
const transientErrors = ['no-speech', 'aborted', 'network']
if (userWantsListening && autoRestart && transientErrors.includes(error)) {
  setTimeout(() => start(), 600)
}
```

## Browser Support

- **Chrome/Edge (Desktop & Android):** Full support
- **Safari (iOS/macOS):** Limited support, may require user interaction
- **Firefox:** Limited support
- **Other browsers:** May not support Web Speech API

## Testing

### Local Testing

1. **Run the debugger page:**
   ```bash
   npm run dev -w @yektayar/mobile-app
   # Navigate to http://localhost:5173/speech-recognition-debugger.html
   ```

2. **Test in AI Chat:**
   ```bash
   npm run dev -w @yektayar/mobile-app
   # Navigate to AI Chat page and click the microphone button
   ```

### Mobile Testing

For accurate mobile testing, deploy to a HTTPS endpoint (required for microphone permissions):

```bash
npm run build -w @yektayar/mobile-app
# Deploy to test server
```

Or use Capacitor for native testing:

```bash
npm run cap:sync
npm run cap:open
# Test on physical device or emulator
```

## Known Limitations

1. **HTTPS Required:** Microphone access requires HTTPS in production
2. **User Gesture Required:** Speech recognition must be initiated by user action (e.g., button click)
3. **Browser Variations:** Behavior differs significantly between browsers and platforms
4. **Network Dependency:** Web Speech API typically requires network connectivity
5. **Language Support:** Not all languages are supported equally across browsers

## Troubleshooting

### Permission Issues

If users see "Permission blocked" or "not-allowed" error:
1. Check browser permissions settings
2. Ensure HTTPS connection
3. Try a different browser
4. Check device microphone access

### No Speech Detected

If "no-speech" error occurs frequently:
1. Check microphone is working
2. Ensure ambient noise isn't too high
3. Try adjusting `continuous` and `autoRestart` options
4. Check language setting matches user's speech

### Mobile-Specific Issues

If transcripts are duplicated or incorrect on mobile:
1. Verify device detection is working correctly
2. Check the debugger page logs
3. Test with different `continuous` settings
4. Try disabling `autoRestart`

## Future Improvements

- [ ] Add confidence threshold configuration
- [ ] Support multiple language detection
- [ ] Implement custom grammar constraints
- [ ] Add silence detection timeout
- [ ] Offline speech recognition (if supported)
- [ ] Better error recovery strategies
- [ ] Accessibility improvements (keyboard shortcuts, screen reader support)

## References

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechRecognition Interface](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Browser Compatibility](https://caniuse.com/speech-recognition)
- [Mobile Speech Recognition Issues (Stack Overflow)](https://stackoverflow.com/questions/tagged/speech-recognition+mobile)

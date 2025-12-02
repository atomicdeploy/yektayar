# Speech Recognition Integration - Code Examples

This document shows the key code snippets from the implementation.

## 1. Mobile Detection Logic

```typescript
// From useSpeechRecognition.ts
const isMobileOrTablet = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)
})
```

## 2. Mobile-Optimized Result Handler

```typescript
// From useSpeechRecognition.ts - onresult handler
recognition.onresult = (event: SpeechRecognitionEvent) => {
  let interim = ''

  // Process results with mobile-optimized handling
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i]
    const alternative = result[0]
    const transcript = alternative.transcript
    const confidence = alternative.confidence

    // Mobile fix: treat confidence=0 as interim
    const isTrulyFinal = result.isFinal && confidence !== 0

    if (isTrulyFinal) {
      // On mobile: replace instead of append
      if (isMobileOrTablet.value) {
        finalTranscript.value = transcript
      } else {
        finalTranscript.value += (finalTranscript.value ? ' ' : '') + transcript
      }
    } else {
      // Interim result
      if (isMobileOrTablet.value) {
        interim = transcript
      } else {
        interim += transcript
      }
    }
  }

  // Update interim transcript
  if (interim) {
    interimTranscript.value = interim
  } else {
    interimTranscript.value = ''
  }
}
```

## 3. Usage in AI Chat Component

```vue
<script setup lang="ts">
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

// Speech Recognition composable
const {
  isSupported: isVoiceSupported,
  isListening,
  fullTranscript,
  start: startVoice,
  stop: stopVoice,
  reset: resetVoice,
} = useSpeechRecognition({
  lang: locale.value === 'fa' ? 'fa-IR' : 'en-US',
  continuous: false,
  interimResults: true,
  autoRestart: false,
})

// Watch for voice transcript changes
watch(fullTranscript, (newTranscript) => {
  if (newTranscript) {
    messageText.value = newTranscript
  }
})

// Toggle voice input
const toggleVoiceInput = () => {
  if (isListening.value) {
    stopVoice()
  } else {
    resetVoice()
    startVoice()
  }
}
</script>

<template>
  <ion-footer>
    <div class="message-input-container">
      <!-- Voice Input Button -->
      <ion-button
        @click="toggleVoiceInput"
        :disabled="!isVoiceSupported"
        class="voice-button"
        fill="clear"
        :class="{ 'recording': isListening }"
      >
        <ion-icon slot="icon-only" :icon="isListening ? micOff : mic"></ion-icon>
      </ion-button>
      
      <!-- Message Input -->
      <ion-textarea v-model="messageText" ... />
      
      <!-- Send Button -->
      <ion-button @click="sendMessage()" ... />
    </div>
    
    <!-- Voice Indicator -->
    <div v-if="isListening" class="voice-indicator">
      <div class="pulse"></div>
      <span>{{ locale === 'fa' ? 'در حال گوش دادن...' : 'Listening...' }}</span>
    </div>
  </ion-footer>
</template>
```

## 4. Debugger HTML - Key Section

```javascript
// From speech-recognition-debugger.html
const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

recognition.onresult = (event) => {
  let interim = '';
  
  // Mobile-optimized result handling
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const res = event.results[i];
    const transcript = res[0].transcript;
    const confidence = res[0].confidence;
    
    // On mobile: treat confidence=0 as interim, and handle final/interim differently
    const isTrulyFinal = res.isFinal && confidence !== 0;
    
    if (isTrulyFinal) {
      finalSegments++;
      // On mobile: replace instead of append for final results
      if (isMobileOrTablet) {
        ui.finalText.textContent = transcript;
      } else {
        ui.finalText.textContent += (ui.finalText.textContent ? ' ' : '') + transcript;
      }
      log('result:final', `confidence=${confidence.toFixed(2)} text="${transcript}"`);
    } else {
      // On mobile: replace instead of append for interim results
      if (isMobileOrTablet) {
        interim = transcript;
      } else {
        interim += transcript;
      }
      if (!res.isFinal || confidence === 0) {
        log('result:interim', `confidence=${confidence.toFixed(2)} text="${transcript}"`);
      }
    }
  }
  
  if (interim) {
    interimUpdates++;
    ui.interimText.textContent = ' ' + interim;
  } else {
    ui.interimText.textContent = '';
  }
  updateCounts();
};
```

## 5. Error Recovery Logic

```typescript
// From useSpeechRecognition.ts
recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
  error.value = event.error
  
  // Handle transient errors with auto-restart
  const transientErrors = ['no-speech', 'aborted', 'network']
  if (userWantsListening && options.autoRestart && transientErrors.includes(event.error)) {
    if (restartTimer) clearTimeout(restartTimer)
    restartTimer = window.setTimeout(() => {
      if (!isListening.value && userWantsListening) {
        start()
      }
    }, 600)
  }
}
```

## 6. TypeScript Interfaces

```typescript
// From useSpeechRecognition.ts
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number  // KEY: This is used to detect mobile interim results
}
```

## Comparison: Before vs After

### Before (Buggy Mobile Implementation)
```typescript
// Incorrect: Appends all results, duplicates on mobile
for (var i = event.resultIndex; i < event.results.length; ++i) {
  if (event.results[i].isFinal) {
    final_transcript += event.results[i][0].transcript;  // Always appends
  } else {
    interim_transcript += event.results[i][0].transcript;
  }
}
```

### After (Fixed Mobile Implementation)
```typescript
// Correct: Checks confidence and uses different strategies
for (let i = event.resultIndex; i < event.results.length; i++) {
  const result = event.results[i]
  const confidence = result[0].confidence
  
  // Check confidence, not just isFinal
  const isTrulyFinal = result.isFinal && confidence !== 0
  
  if (isTrulyFinal) {
    if (isMobileOrTablet.value) {
      finalTranscript.value = transcript  // Replace on mobile
    } else {
      finalTranscript.value += ' ' + transcript  // Append on desktop
    }
  } else {
    // Similar strategy for interim
  }
}
```

## Key Takeaways

1. **Always check confidence score** on mobile - zero means interim
2. **Use replace strategy on mobile** for both final and interim
3. **Use append strategy on desktop** for better UX
4. **Detect device type properly** - user agent + touch points
5. **Handle transient errors** with auto-restart
6. **Provide debugging tools** for troubleshooting

These fixes ensure consistent behavior across desktop Chrome, mobile Chrome/Android, and other supported browsers.

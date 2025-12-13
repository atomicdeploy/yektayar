# Telegram Mini App Integration

This document explains how YektaYar mobile-app is integrated as a Telegram mini app (Web App) and how to configure and test it.

## Overview

YektaYar mobile-app can run both as a standalone web/mobile application and as a Telegram mini app. When opened inside Telegram, the app automatically detects the Telegram WebApp environment and integrates with Telegram's native features.

## Features

When running as a Telegram mini app, the application provides:

- **Seamless Integration**: Automatically detects Telegram environment and adapts UI
- **Theme Matching**: Respects Telegram's light/dark theme and color scheme
- **Native Controls**: Access to Telegram's MainButton, BackButton, and HapticFeedback
- **User Context**: Access to Telegram user data (name, username, etc.)
- **Security**: Server-side verification of Telegram initData
- **Data Exchange**: Send data back to the bot via `sendData` API

## Architecture

### Frontend (mobile-app)

1. **Type Definitions** (`src/types/telegram-webapp.d.ts`)
   - Complete TypeScript definitions for Telegram WebApp API
   - Provides type safety for all Telegram WebApp methods

2. **Plugin** (`src/plugins/telegram.ts`)
   - Initializes Telegram WebApp when app starts
   - Creates reactive state for Telegram data
   - Listens to theme and viewport changes
   - Calls `WebApp.ready()` when app is loaded

3. **Composable** (`src/composables/useTelegram.ts`)
   - Provides Vue composable `useTelegram()` for components
   - Helper methods for common Telegram operations
   - Graceful fallbacks when not running in Telegram

### Backend (backend)

1. **Verification Endpoint** (`/api/telegram/verify-init-data`)
   - Verifies Telegram initData using HMAC-SHA256
   - Critical for security - prevents forged requests
   - Uses bot token as secret key

## Setup Instructions

### 1. Configure Environment Variables

In your `.env` file, ensure you have:

```bash
# Telegram bot token from @BotFather
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here

# Optional: Admin chat ID for notifications
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id
```

### 2. Configure Telegram Bot

#### Get Your Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` to create a new bot or use an existing one
3. Follow prompts to get your bot token
4. Copy the token to your `.env` file

#### Set Up Web App
You need to configure your bot to open the mobile-app as a Web App:

**Method 1: Using Bot Menu Button**
```
/mybots
→ Select your bot
→ Bot Settings
→ Menu Button
→ Configure Menu Button
→ Enter URL: https://app.yektayar.ir
```

**Method 2: Using Inline Keyboard (in bot code)**
```javascript
bot.telegram.sendMessage(chatId, 'Open YektaYar App', {
  reply_markup: {
    inline_keyboard: [[
      {
        text: '🚀 Open App',
        web_app: { url: 'https://app.yektayar.ir' }
      }
    ]]
  }
})
```

**Method 3: Using Reply Keyboard**
```javascript
bot.telegram.sendMessage(chatId, 'Choose an option:', {
  reply_markup: {
    keyboard: [[
      {
        text: '🚀 Open App',
        web_app: { url: 'https://app.yektayar.ir' }
      }
    ]],
    resize_keyboard: true
  }
})
```

### 3. Domain Whitelisting (if required)

If BotFather prompts you to whitelist the domain:

1. Go to [@BotFather](https://t.me/BotFather)
2. Send `/mybots`
3. Select your bot
4. Go to "Bot Settings" → "Domain Whitelist"
5. Add `app.yektayar.ir`

### 4. Deploy Mobile App

Ensure your mobile-app is:
- Deployed on HTTPS (required by Telegram)
- Accessible at `https://app.yektayar.ir`
- Has the Telegram WebApp SDK script in `index.html` (already included)

## Usage in Components

### Basic Usage

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

const telegram = useTelegram()

// Check if running in Telegram
if (telegram.state.available) {
  console.log('Running inside Telegram!')
  console.log('User:', telegram.state.initDataUnsafe?.user)
}
</script>
```

### Using Main Button

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'
import { onMounted, onUnmounted } from 'vue'

const telegram = useTelegram()

onMounted(() => {
  if (telegram.state.available) {
    // Show main button at bottom of screen
    telegram.setMainButton('Continue', () => {
      // Handle button click
      console.log('Main button clicked!')
      telegram.sendData(JSON.stringify({ action: 'continue' }))
    })
  }
})

onUnmounted(() => {
  telegram.hideMainButton()
})
</script>
```

### Using Back Button

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

const telegram = useTelegram()
const router = useRouter()

onMounted(() => {
  if (telegram.state.available) {
    telegram.showBackButton(() => {
      router.back()
    })
  }
})

onUnmounted(() => {
  telegram.hideBackButton()
})
</script>
```

### Haptic Feedback

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

const telegram = useTelegram()

function handleClick() {
  // Provide impact haptic feedback
  telegram.hapticImpact('light')
}

function handleSuccess() {
  // Provide notification haptic feedback
  telegram.hapticNotification('success')
}

function handleSelectionChange() {
  // Provide selection changed feedback
  telegram.hapticSelection()
}
</script>
```

### Theme Integration

The Telegram theme is automatically available in the state:

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'
import { computed } from 'vue'

const telegram = useTelegram()

// Access theme colors
const bgColor = computed(() => telegram.state.themeParams?.bg_color)
const textColor = computed(() => telegram.state.themeParams?.text_color)
const isDark = computed(() => telegram.state.colorScheme === 'dark')
</script>
```

### Sending Data to Bot

```vue
<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

const telegram = useTelegram()

function submitOrder(orderId: string) {
  // Send data to bot (will close the Web App)
  telegram.sendData(JSON.stringify({
    action: 'order_completed',
    orderId: orderId,
    timestamp: Date.now()
  }))
}
</script>
```

## Security: Verifying initData

**Important**: Always verify initData on the server before trusting user information.

### Backend Verification

The backend provides an endpoint to verify initData:

```typescript
// In your frontend code
async function verifyTelegramUser() {
  const telegram = useTelegram()
  
  if (!telegram.state.available || !telegram.state.initData) {
    return false
  }
  
  try {
    const response = await fetch('/api/telegram/verify-init-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: telegram.state.initData })
    })
    
    const result = await response.json()
    return result.valid
  } catch (error) {
    console.error('Failed to verify initData:', error)
    return false
  }
}
```

### How Verification Works

1. Frontend sends raw `initData` string to backend
2. Backend parses the data and extracts the hash
3. Backend recalculates hash using bot token as secret
4. Compares calculated hash with received hash
5. Returns verification result

The algorithm follows Telegram's official specification:
- `secret_key = HMAC_SHA256(bot_token, "WebAppData")`
- `data_check_string = sorted key=value pairs joined by \n`
- `calculated_hash = HMAC_SHA256(secret_key, data_check_string)`

## Testing

### Local Testing

To test the Telegram integration locally:

1. **Use ngrok or similar tool** to expose your local server:
   ```bash
   ngrok http 5173
   ```

2. **Configure bot with ngrok URL**:
   - Use the HTTPS URL from ngrok
   - Example: `https://abc123.ngrok.io`

3. **Test in Telegram**:
   - Open bot in Telegram mobile app
   - Click the Web App button
   - App should open with Telegram context

### Production Testing

1. Deploy mobile-app to `https://app.yektayar.ir`
2. Configure bot to use production URL
3. Test on both Android and iOS Telegram clients
4. Verify:
   - App loads correctly
   - Theme matches Telegram theme
   - MainButton appears when used
   - Data sending works
   - initData verification succeeds

## Troubleshooting

### App doesn't detect Telegram

**Symptoms**: `telegram.state.available` is `false` inside Telegram

**Solutions**:
- Ensure Telegram WebApp SDK script is loaded in `index.html`
- Check browser console for JavaScript errors
- Verify bot is configured correctly in BotFather

### initData verification fails

**Symptoms**: Backend returns `valid: false` for initData

**Solutions**:
- Verify `TELEGRAM_BOT_TOKEN` in backend `.env` is correct
- Check that token matches the bot used to open the app
- Ensure initData hasn't been modified in transit
- Check backend logs for detailed error messages

### Theme not applying

**Symptoms**: App doesn't match Telegram theme colors

**Solutions**:
- Access theme via `telegram.state.themeParams`
- Listen for `themeChanged` events (already handled in plugin)
- Apply colors to your CSS/components manually if needed

### MainButton not showing

**Symptoms**: `setMainButton()` called but button not visible

**Solutions**:
- Verify `telegram.state.available` is `true`
- Check that `setMainButton()` is called after component mounts
- Ensure no conflicting `hide()` calls
- Test on different Telegram clients (Android/iOS)

## Best Practices

1. **Always check availability**: Before using Telegram APIs, check `telegram.state.available`

2. **Provide fallbacks**: App should work both in Telegram and regular browsers
   ```typescript
   if (telegram.state.available) {
     telegram.showAlert('Hello!')
   } else {
     alert('Hello!')
   }
   ```

3. **Verify on backend**: Never trust client-side initData without server verification

4. **Use haptic feedback**: Enhance UX with haptic feedback for button clicks

5. **Respect theme**: Use Telegram's theme colors when available

6. **Clean up**: Hide buttons and remove listeners in `onUnmounted()`

7. **Handle errors gracefully**: Telegram APIs can fail; always handle errors

## API Reference

### useTelegram Composable

```typescript
const telegram = useTelegram()

// State
telegram.state.available      // boolean: Is Telegram WebApp available
telegram.state.ready          // boolean: Is Telegram WebApp ready
telegram.state.initData       // string: Raw initData
telegram.state.initDataUnsafe // object: Parsed initData
telegram.state.themeParams    // object: Theme colors
telegram.state.colorScheme    // 'light' | 'dark'
telegram.state.platform       // string: Platform name
telegram.state.version        // string: Bot API version

// Methods
telegram.sendData(data: string)                    // Send data to bot
telegram.close()                                   // Close Web App
telegram.setMainButton(text, onClick?)             // Show main button
telegram.hideMainButton()                          // Hide main button
telegram.showBackButton(onClick?)                  // Show back button
telegram.hideBackButton()                          // Hide back button
telegram.hapticImpact(style)                       // Trigger impact haptic (light, medium, heavy, rigid, soft)
telegram.hapticNotification(type)                  // Trigger notification haptic (error, success, warning)
telegram.hapticSelection()                         // Trigger selection changed haptic
telegram.openLink(url, tryInstantView?)            // Open external link
telegram.openTelegramLink(url)                     // Open t.me link
telegram.showAlert(message, callback?)             // Show alert
telegram.showConfirm(message, callback?)           // Show confirm dialog
telegram.expand()                                  // Expand to full height
telegram.enableClosingConfirmation()               // Enable close confirmation
telegram.disableClosingConfirmation()              // Disable close confirmation
```

## Resources

- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Web Apps Examples](https://core.telegram.org/bots/webapps#examples)

## Support

For issues or questions about Telegram integration:
1. Check this documentation
2. Review Telegram's official docs
3. Check backend logs for verification errors
4. Test on multiple Telegram clients (Android/iOS)
5. Contact the development team

---

Last updated: 2025-12-09

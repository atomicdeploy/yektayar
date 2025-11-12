# Telegram Bot Integration Guide

This guide explains how to set up and use the Telegram bot integration in YektaYar platform.

## Overview

The YektaYar Telegram bot provides:
- **Admin Notifications**: Receive error logs, warnings, and critical notices
- **User Communication**: Send messages to users and channels
- **Bot Commands**: Interactive commands for status and management
- **Webhook Support**: Production-ready webhook integration

## Quick Start

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions:
   - Choose a name for your bot (e.g., "YektaYar Bot")
   - Choose a username for your bot (e.g., "yektayar_bot")
4. Copy the bot token provided by BotFather

### 2. Get Your Chat ID

1. Open Telegram and search for `@userinfobot`
2. Start a chat with the bot
3. The bot will send you your chat ID
4. Copy the chat ID number

### 3. Configure the Bot

**Using the Management Script (Recommended):**

```bash
cd /home/runner/work/yektayar/yektayar
./scripts/manage-telegram-bot.sh setup
```

Follow the interactive prompts to configure:
- Bot token from BotFather
- Admin chat ID for notifications

**Manual Configuration:**

Edit `.env` file and set:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
```

### 4. Test the Bot

```bash
# Test bot connection
./scripts/manage-telegram-bot.sh test

# Send a test message
./scripts/manage-telegram-bot.sh test-message
```

### 5. Start the Backend

```bash
npm run dev:backend
```

The bot will automatically initialize when the backend starts.

## Bot Commands

Users can interact with the bot using these commands:

- `/start` - Start the bot and see welcome message
- `/help` - Show available commands
- `/status` - Check system status
- `/chatid` - Get your chat ID

## API Endpoints

### Get Bot Status

```http
GET /api/telegram/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "status": "active"
  }
}
```

### Send Message to Specific Chat

```http
POST /api/telegram/send
Content-Type: application/json

{
  "chatId": "123456789",
  "message": "Hello from YektaYar!",
  "options": {
    "parse_mode": "Markdown"
  }
}
```

### Send Admin Notification

```http
POST /api/telegram/notify-admin
Content-Type: application/json

{
  "message": "Database backup completed successfully",
  "level": "info"
}
```

**Notification Levels:**
- `info` - 🔵 Information (default)
- `warning` - 🟡 Warning
- `error` - 🔴 Error

### Send Channel Message

```http
POST /api/telegram/channel
Content-Type: application/json

{
  "message": "New feature released! Check it out."
}
```

**Note:** Requires `TELEGRAM_CHANNEL_ID` to be configured in `.env`

## Usage in Code

### Sending Admin Notifications

```typescript
import { sendAdminNotification } from '../services/telegramService'

// Send an error notification
try {
  // Your code here
} catch (error) {
  await sendAdminNotification(
    `Error in payment processing: ${error.message}`,
    'error'
  )
}

// Send a warning
await sendAdminNotification(
  'Database connection pool is 90% full',
  'warning'
)

// Send information
await sendAdminNotification(
  'Daily backup completed successfully',
  'info'
)
```

### Sending Messages to Users

```typescript
import { sendMessage } from '../services/telegramService'

// Send a message to a specific user
const chatId = '123456789'
await sendMessage(
  chatId,
  'Your appointment has been confirmed for tomorrow at 10:00 AM'
)

// Send formatted message
await sendMessage(
  chatId,
  '*Appointment Confirmation*\n\nDate: 2024-01-15\nTime: 10:00 AM',
  { parse_mode: 'Markdown' }
)
```

### Sending Channel Broadcasts

```typescript
import { sendChannelMessage } from '../services/telegramService'

// Broadcast to channel
await sendChannelMessage(
  '🎉 New feature release!\n\nCheck out our latest updates in the app.'
)
```

## Production Deployment

### Webhook Mode (Recommended for Production)

Webhook mode is more efficient and reliable for production:

1. **Set up HTTPS domain** (Telegram requires HTTPS for webhooks)
2. **Configure webhook URL in `.env`:**

```bash
TELEGRAM_WEBHOOK_URL=https://api.yektayar.ir/api/telegram/webhook
```

3. **The bot will automatically switch to webhook mode** when the URL is configured

### Polling Mode (Development)

By default, the bot uses polling mode which is suitable for development:
- No webhook URL required
- Bot actively checks for updates
- Good for testing and development

## Management Script Commands

```bash
# Show current configuration
./scripts/manage-telegram-bot.sh config

# Interactive setup
./scripts/manage-telegram-bot.sh setup

# Test bot connection
./scripts/manage-telegram-bot.sh test

# Send test message
./scripts/manage-telegram-bot.sh test-message

# Show help
./scripts/manage-telegram-bot.sh help
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Yes | Chat ID for admin notifications |
| `TELEGRAM_CHANNEL_ID` | No | Channel ID for broadcasts |
| `TELEGRAM_WEBHOOK_URL` | No | Webhook URL for production |

## Common Use Cases

### 1. Error Monitoring

```typescript
// In error handler middleware
app.onError((error, context) => {
  sendAdminNotification(
    `Error in ${context.request.url}\n\n${error.message}\n\nStack: ${error.stack}`,
    'error'
  )
})
```

### 2. Critical System Events

```typescript
// Database connection issues
if (!dbConnection.isConnected) {
  await sendAdminNotification(
    '🔴 Database connection lost! Attempting to reconnect...',
    'error'
  )
}

// High memory usage
if (memoryUsage > 90) {
  await sendAdminNotification(
    `⚠️ Memory usage is at ${memoryUsage}%`,
    'warning'
  )
}
```

### 3. User Notifications

```typescript
// Appointment reminders
await sendMessage(
  userChatId,
  `⏰ Reminder: You have an appointment tomorrow at ${appointmentTime}`
)

// Payment confirmations
await sendMessage(
  userChatId,
  `✅ Payment received!\n\nAmount: ${amount}\nTransaction ID: ${txId}`
)
```

## Troubleshooting

### Bot Not Responding

1. **Check bot token:**
   ```bash
   ./scripts/manage-telegram-bot.sh config
   ```

2. **Test connection:**
   ```bash
   ./scripts/manage-telegram-bot.sh test
   ```

3. **Check backend logs:**
   ```bash
   npm run dev:backend
   # Look for "Telegram bot initialized" message
   ```

### Messages Not Sending

1. **Verify chat ID:**
   - Send `/chatid` to your bot to get the correct ID
   - Make sure the chat ID is correct in `.env`

2. **Check bot initialization:**
   ```bash
   curl http://localhost:3000/api/telegram/status
   ```

3. **Test with management script:**
   ```bash
   ./scripts/manage-telegram-bot.sh test-message
   ```

### Webhook Issues (Production)

1. **Ensure HTTPS:** Telegram requires HTTPS for webhooks
2. **Check webhook URL:** Must be publicly accessible
3. **Verify SSL certificate:** Must be valid (not self-signed)

## Security Considerations

1. **Keep bot token secret:** Never commit `.env` file to git
2. **Validate webhook requests:** Check `X-Telegram-Bot-Api-Secret-Token` header
3. **Rate limiting:** Implement rate limits for bot endpoints
4. **Admin authentication:** Secure admin notification endpoints with proper authentication

## API Reference

See the Swagger documentation at `http://localhost:3000/swagger` for complete API reference.

## Support

For issues or questions:
- Check the backend logs for error messages
- Use the management script for testing
- Refer to [Telegram Bot API documentation](https://core.telegram.org/bots/api)

---

**Last Updated:** 2025-11-12  
**Version:** 0.1.0

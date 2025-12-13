# Telegram Integration Quick Reference

This guide provides quick commands for setting up and managing Telegram integration in YektaYar.

## 🚀 Quick Setup

### Complete Setup (Recommended for First Time)

```bash
npm run telegram:setup-complete
```

This interactive script handles both:
- ✅ Telegram bot configuration
- ✅ Telegram mini app integration
- ✅ Connection testing
- ✅ Setup verification

---

## 📋 Available Scripts

### NPM Scripts

| Script | Description | Use When |
|--------|-------------|----------|
| `npm run telegram:setup-complete` | **Complete guided setup** | First-time setup or full reconfiguration |
| `npm run telegram:setup` | Bot token and chat ID setup | Quick bot configuration |
| `npm run telegram:config` | View current configuration | Check what's configured |
| `npm run telegram:test` | Test bot connection | Verify bot is working |
| `npm run telegram:test-message` | Send test message | Test admin notifications |
| `npm run telegram:test-bot` | Full bot profile setup | Configure bot commands and description |
| `npm run telegram:send-messages` | Send test messages to group | Test group messaging |

### Direct Script Execution

```bash
# Complete setup (interactive)
./scripts/setup-telegram.sh

# Bot management
./scripts/manage-telegram-bot.sh setup
./scripts/manage-telegram-bot.sh config
./scripts/manage-telegram-bot.sh test
./scripts/manage-telegram-bot.sh test-message

# Testing scripts
npx tsx tests/scripts/test-telegram-bot.ts
npx tsx tests/scripts/send-telegram-test-messages.ts
npx tsx tests/scripts/telegram-bot-monitor.ts
```

---

## 🔧 Configuration Files

### Environment Variables (.env)

```bash
# Required for bot functionality
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id_here

# Optional
TELEGRAM_CHANNEL_ID=your_channel_id_here
TELEGRAM_WEBHOOK_URL=https://api.yektayar.ir/api/telegram/webhook
```

---

## 📱 Setup Steps by Feature

### Bot Only Setup

1. **Get bot token from @BotFather**
   ```bash
   # In Telegram:
   # 1. Search for @BotFather
   # 2. Send: /newbot
   # 3. Follow prompts
   # 4. Copy the token
   ```

2. **Configure bot**
   ```bash
   npm run telegram:setup
   # Enter your bot token when prompted
   ```

3. **Test bot**
   ```bash
   npm run telegram:test
   ```

### Mini App Setup

1. **Ensure bot is configured** (see above)

2. **Configure menu button in @BotFather**
   ```
   /mybots
   → Select your bot
   → Bot Settings
   → Menu Button
   → Configure Menu Button
   → Enter URL: https://app.yektayar.ir
   ```

3. **For development (local testing)**
   ```bash
   # Use ngrok or similar to expose localhost:8100
   # Then use that URL in BotFather
   ```

### Full Integration Setup

```bash
# One command does it all:
npm run telegram:setup-complete

# This will guide you through:
# ✅ Bot creation
# ✅ Token configuration
# ✅ Admin chat setup
# ✅ Mini app configuration
# ✅ Testing
```

---

## 🧪 Testing

### Quick Tests

```bash
# Test bot connection
npm run telegram:test

# Send test message to admin chat
npm run telegram:test-message

# Full bot setup and testing
npm run telegram:test-bot

# Send multiple test messages to group
npm run telegram:send-messages
```

### Manual Testing

```bash
# Test bot via Telegram
# 1. Open your bot in Telegram
# 2. Send: /start
# 3. Try other commands: /help, /status, /chatid

# Test mini app
# 1. Open your bot in Telegram
# 2. Click the menu button (bottom-left)
# 3. Mobile app should open inside Telegram
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [TELEGRAM-BOT.md](../docs/TELEGRAM-BOT.md) | Complete bot integration guide |
| [TELEGRAM_MINI_APP.md](../packages/mobile-app/docs/TELEGRAM_MINI_APP.md) | Mini app integration details |
| [scripts/README.md](README.md) | Script documentation |

---

## 🆘 Troubleshooting

### Bot Not Responding

1. Check token is correct:
   ```bash
   npm run telegram:config
   ```

2. Test connection:
   ```bash
   npm run telegram:test
   ```

3. Verify backend is running:
   ```bash
   npm run dev:backend
   # Look for "Telegram bot initialized" message
   ```

### Mini App Not Loading

1. Verify menu button is configured in @BotFather
2. Check URL is accessible
3. For local dev, ensure ngrok/tunnel is active
4. Open browser console in Telegram for errors

### Can't Send Messages

1. Verify admin chat ID:
   ```bash
   npm run telegram:config
   ```

2. Ensure bot is added to the chat/group
3. Test with simple message:
   ```bash
   npm run telegram:test-message
   ```

---

## 💡 Tips

- **First time?** Use `npm run telegram:setup-complete`
- **Just bot?** Use `npm run telegram:setup`
- **Testing only?** Use `npm run telegram:test`
- **Need help?** Check `docs/TELEGRAM-BOT.md`

---

## 🔄 Quick Command Reference

```bash
# Setup
npm run telegram:setup-complete     # Complete guided setup
npm run telegram:setup              # Quick bot setup
npm run telegram:config             # View configuration

# Testing  
npm run telegram:test               # Test connection
npm run telegram:test-message       # Send test message
npm run telegram:test-bot           # Full bot test
npm run telegram:send-messages      # Send group messages

# Development
npm run dev:backend                 # Start backend (enables bot)
```

---

**For detailed information, see:**
- 📖 [Complete Bot Guide](../docs/TELEGRAM-BOT.md)
- 📱 [Mini App Guide](../packages/mobile-app/docs/TELEGRAM_MINI_APP.md)
- 🔧 [Script Documentation](README.md)

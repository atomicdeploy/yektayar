# AI Streaming Deployment Guide

## What Was Implemented

This PR implements proper Pollinations AI streaming with Persian language support:

### 1. **API Endpoint Update**
- Changed from: `https://text.pollinations.ai` (simple GET)
- Changed to: `https://text.pollinations.ai/v1/chat/completions` (OpenAI-compatible POST)

### 2. **Streaming Support**
- Implemented real Server-Sent Events (SSE) streaming from Pollinations API
- WebSocket/Socket.IO wraps SSE responses for frontend
- Streaming enabled with `stream: true` parameter

### 3. **Persian Language Support (خودمونی tone)**
- System prompts now use i18n translations
- Persian prompts use friendly, casual tone (خودمونی) not formal
- Locale automatically detected from mobile app
- Fallback responses also support Persian

### 4. **Debug Information**
- Only enabled in development mode (`NODE_ENV !== 'production'`)
- Shows API URL, request method, response status
- Includes response headers (model info, token usage)
- Helps troubleshoot API issues

## Deployment Steps

### Step 1: Pull Latest Changes

```bash
cd /path/to/yektayar
git pull origin copilot/test-pollinations-ai-functionality
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Rebuild Packages

```bash
npm run build
```

### Step 4: Test Locally First

```bash
# Test the API endpoint with curl
curl -X POST https://text.pollinations.ai/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "سلام، چطوری؟"}
    ],
    "model": "openai",
    "stream": false
  }'
```

### Step 5: Test Persian Prompt

```bash
# Test with Persian locale
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "سلام، احساس استرس میکنم",
    "locale": "fa"
  }' | python3 -m json.tool
```

Expected: Response should be in Persian with friendly tone (خودمونی)

### Step 6: Test English Prompt

```bash
# Test with English locale
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I feel stressed",
    "locale": "en"
  }' | python3 -m json.tool
```

Expected: Response should be in English with friendly tone

### Step 7: Deploy to Production

```bash
# Set environment to production
export NODE_ENV=production

# Restart the backend service
sudo systemctl restart yektayar-backend

# Or if using PM2
pm2 restart yektayar-backend
```

### Step 8: Verify Production

```bash
# Test production endpoint
curl -s -X POST https://api.yektayar.ir/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "سلام",
    "locale": "fa"
  }' | python3 -m json.tool
```

## Testing Streaming

### Test via WebSocket (using the TUI tool)

```bash
npm run ai:test http://localhost:3000

# In the menu:
# 1. Press "6" to connect to WebSocket
# 2. Press "3" to test WebSocket streaming
# 3. Enter a message in Persian: "سلام، چطوری؟"
```

### Test SSE Directly

```bash
# Test streaming with curl
curl -N -X POST https://text.pollinations.ai/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "model": "openai",
    "stream": true
  }'
```

## Troubleshooting

### Issue: API returns 502 Bad Gateway

**Solution**: Pollinations API might be temporarily down. The fallback mechanism will provide a friendly response.

### Issue: Responses are in English when locale is Persian

**Check**:
1. Verify the mobile app is sending `locale: "fa"` in the request
2. Check `packages/shared/src/i18n/translations.json` has Persian prompts
3. Verify the backend is loading the translations correctly

### Issue: Streaming not working

**Check**:
1. Verify WebSocket connection is established
2. Check backend logs for SSE parsing errors
3. Test SSE directly with curl (see above)

### Issue: Debug information showing in production

**Solution**: Ensure `NODE_ENV=production` is set in the environment

## Key Files Changed

1. **Backend**:
   - `packages/backend/src/services/aiService.ts` - Main AI service with streaming
   - `packages/backend/src/routes/ai.ts` - API route with locale support
   - `packages/backend/src/websocket/eventHandlers.ts` - WebSocket handler with locale

2. **Frontend**:
   - `packages/mobile-app/src/composables/useAIChat.ts` - AI chat composable with locale
   - `packages/mobile-app/src/views/AIChatPage.vue` - Chat page passing locale

3. **Translations**:
   - `packages/shared/src/i18n/translations.json` - Persian & English prompts

## Environment Variables

No new environment variables required. The system uses:

- `NODE_ENV` - Set to `production` to disable debug info
- Locale is automatically detected from the app's i18n

## Performance Notes

- **Average Response Time**: 8-15 seconds for complete response
- **Streaming**: Real-time chunks delivered as generated
- **Model**: gpt-5-nano-2025-08-07 (as reported by API)
- **Token Usage**: Visible in debug mode (development only)

## Security Considerations

1. **Debug Information**: Only enabled in development mode
2. **API Key**: Pollinations API doesn't require authentication
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Input Validation**: Messages limited to 2000 characters

## Next Steps

1. Monitor API performance in production
2. Consider implementing caching for common queries
3. Add analytics to track Persian vs English usage
4. Implement user feedback mechanism for AI responses

## Support

If issues persist:
1. Check backend logs: `sudo journalctl -u yektayar-backend -f`
2. Check Pollinations API status: https://pollinations.ai
3. Review debug information in development mode
4. Check this PR for implementation details: #302

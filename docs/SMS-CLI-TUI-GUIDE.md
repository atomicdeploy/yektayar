# SMS CLI/TUI Tools - User Guide

This guide covers the SMS Command Line Interface (CLI) and Text User Interface (TUI) tools for managing and testing SMS capabilities in the YektaYar platform.

## Overview

YektaYar provides two tools for SMS management:

1. **SMS TUI** (`npm run sms:tui`) - Interactive menu-driven interface
2. **SMS CLI** (`npm run sms:cli`) - Command-line tool for automation

Both tools support the full range of SMS operations using FarazSMS/IPPanel/IranPayamak providers.

---

## Prerequisites

### Required Environment Variables

Configure these in your `.env` file:

```bash
# Required for all operations
FARAZSMS_API_KEY=your_api_key_here

# Required for sending SMS
FARAZSMS_LINE_NUMBER=your_line_number_here

# Required for pattern-based OTP
FARAZSMS_PATTERN_CODE=your_pattern_code_here
```

### Setup

1. Get your credentials from:
   - IPPanel: https://ippanel.com/
   - IranPayamak: https://www.iranpayamak.com/

2. Configure environment variables:
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and add your credentials
   nano .env
   ```

---

## SMS TUI (Interactive Interface)

### Launch

```bash
npm run sms:tui
```

### Features

The TUI provides an interactive menu with the following options:

1. **Get credit balance (IPPanel)** - Check remaining SMS credits
2. **Get account balance (IranPayamak)** - Check account balance
3. **Send single SMS** - Send SMS to a single recipient
4. **Send pattern-based OTP** - Send OTP using pattern template
5. **Send Voice OTP (VOTP)** - Send OTP via voice call
6. **Fetch inbox messages** - View received messages
7. **Send sample SMS** - Send test SMS to account owner
8. **Send simple SMS** - Send SMS with bulk support

### Example Session

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        SMS Management & Testing Tool                         ║
║        YektaYar Platform                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

⚙️ Checking SMS configuration...
✅ API Key configured
✅ Line Number: +983000505
✅ Pattern Code: abc123xyz

🔧 ═══ Available Actions ═══
  1 - Get credit balance (IPPanel)
  2 - Get account balance (IranPayamak)
  3 - Send single SMS
  4 - Send pattern-based OTP
  5 - Send Voice OTP (VOTP)
  6 - Fetch inbox messages
  7 - Send sample SMS (to account owner)
  8 - Send simple SMS (bulk support)
  h - Show this menu
  q - Quit

Enter command (h for help): 1
⏳ Fetching account credit balance...
✅ Credit balance retrieved successfully!

💰 Credit: 1000 units
```

---

## SMS CLI (Command-Line Interface)

### Help

```bash
npm run sms:cli -- help
```

### Commands

#### 1. Get Credit Balance (IPPanel)

```bash
npm run sms:cli -- balance
```

**Output:**
```json
{
  "status": "success",
  "code": 200,
  "message": "OK",
  "data": {
    "credit": 1000
  }
}
```

#### 2. Get Account Balance (IranPayamak)

```bash
npm run sms:cli -- balance-iran
```

#### 3. Send Single SMS

```bash
npm run sms:cli -- send --to 09121234567 --message "Hello from YektaYar"
```

**Parameters:**
- `--to` - Recipient phone number (format: 09xxxxxxxxx)
- `--message` - Message text to send

#### 4. Send Pattern-Based OTP

```bash
# With specific OTP code
npm run sms:cli -- otp --to 09121234567 --code 123456

# With random OTP code (6-digit)
npm run sms:cli -- otp --to 09121234567
```

**Parameters:**
- `--to` - Recipient phone number (format: 09xxxxxxxxx)
- `--code` - OTP code (optional, generates random 6-digit if not provided)

**Requirements:**
- `FARAZSMS_PATTERN_CODE` must be configured
- Pattern template must use `%verification-code%` variable

#### 5. Send Voice OTP (VOTP)

```bash
# With specific OTP code
npm run sms:cli -- votp --to 09121234567 --code 654321

# With random OTP code
npm run sms:cli -- votp --to 09121234567
```

**Parameters:**
- `--to` - Recipient phone number (format: 09xxxxxxxxx)
- `--code` - OTP code (optional, generates random 6-digit if not provided)

#### 6. Fetch Inbox Messages

```bash
npm run sms:cli -- inbox
```

**Output:**
```json
{
  "status": "success",
  "data": [
    {
      "sender": "09121234567",
      "message": "Reply from customer",
      "created_at": "2024-12-13T10:30:00Z"
    }
  ]
}
```

#### 7. Send Sample SMS (to Account Owner)

```bash
npm run sms:cli -- sample --message "Test message from YektaYar"
```

**Parameters:**
- `--message` - Message text to send

**Note:** This sends SMS to the phone number registered with your account.

#### 8. Send Simple SMS (Bulk Support)

```bash
# Single recipient
npm run sms:cli -- simple --to 09121234567 --message "Bulk message"

# Multiple recipients (comma-separated)
npm run sms:cli -- simple --to 09121234567,09127654321,09191234567 --message "Bulk message to multiple recipients"
```

**Parameters:**
- `--to` - Recipient phone number(s) (comma-separated for multiple)
- `--message` - Message text to send

---

## Use Cases

### 1. Automated OTP Sending

```bash
#!/bin/bash
# generate-and-send-otp.sh

PHONE=$1
OTP=$(openssl rand -base64 6 | tr -dc '0-9' | cut -c1-6)

npm run sms:cli -- otp --to "$PHONE" --code "$OTP"

echo "OTP sent: $OTP"
```

### 2. Bulk SMS Notifications

```bash
#!/bin/bash
# send-notifications.sh

RECIPIENTS="09121234567,09127654321,09191234567"
MESSAGE="Your appointment is confirmed for tomorrow at 10 AM"

npm run sms:cli -- simple --to "$RECIPIENTS" --message "$MESSAGE"
```

### 3. Health Check Script

```bash
#!/bin/bash
# sms-health-check.sh

echo "Checking SMS service health..."

# Check balance
npm run sms:cli -- balance

# Send test message to account owner
npm run sms:cli -- sample --message "Health check: $(date)"
```

### 4. Automated Testing

```bash
#!/bin/bash
# test-sms-integration.sh

TEST_PHONE="09121234567"

echo "Testing SMS capabilities..."

# Test pattern OTP
npm run sms:cli -- otp --to "$TEST_PHONE"

# Test voice OTP
npm run sms:cli -- votp --to "$TEST_PHONE"

# Test regular SMS
npm run sms:cli -- send --to "$TEST_PHONE" --message "Integration test"

echo "All tests completed"
```

---

## Phone Number Format

All phone numbers must be in Iranian format:

- **Valid format:** `09xxxxxxxxx` (11 digits starting with 09)
- **Examples:**
  - `09121234567` ✅
  - `09351234567` ✅
  - `09191234567` ✅
- **Invalid formats:**
  - `9121234567` ❌ (missing leading 0)
  - `+989121234567` ❌ (international format not supported for input)
  - `00989121234567` ❌ (international format)

The tools will automatically convert phone numbers to the required format for each API.

---

## API Providers

The tools use three different API endpoints:

### 1. IPPanel Edge API
- Used for: Single SMS, Pattern OTP, Voice OTP
- Endpoint: `https://edge.ippanel.com/v1/api/`
- Auth: `Authorization: apikey <key>` or `Authorization: <key>`

### 2. IPPanel REST API
- Used for: Credit balance, Inbox
- Endpoint: `https://rest.ippanel.com/v1/`
- Auth: `Authorization: AccessKey <key>`

### 3. IranPayamak API
- Used for: Account balance, Sample SMS, Simple SMS
- Endpoint: `https://api.iranpayamak.com/ws/v1/`
- Auth: `Api-Key: <key>`

---

## Error Handling

### Common Errors

#### 1. Missing API Key
```
❌ ERROR: FARAZSMS_API_KEY is not configured in environment variables
```
**Solution:** Add `FARAZSMS_API_KEY` to your `.env` file

#### 2. Missing Line Number
```
❌ ERROR: FARAZSMS_LINE_NUMBER is required for sending SMS
```
**Solution:** Add `FARAZSMS_LINE_NUMBER` to your `.env` file

#### 3. Invalid Phone Number
```
❌ ERROR: Invalid phone number format: 9121234567. Expected: 09xxxxxxxxx
```
**Solution:** Use correct format (09xxxxxxxxx)

#### 4. HTTP 401 - Unauthorized
```
❌ ERROR: HTTP 401: Unauthorized
```
**Solution:** Check your API key is correct and active

#### 5. HTTP 400 - Bad Request
```
❌ ERROR: HTTP 400: Bad Request
```
**Solution:** Verify pattern code and line number are correct

---

## Integration with Backend Services

The CLI/TUI tools use the same SMS service functions as the backend, located in:
- `packages/backend/src/services/smsService.ts`

This ensures consistency between testing and production usage.

---

## Comparison: TUI vs CLI

| Feature | SMS TUI | SMS CLI |
|---------|---------|---------|
| **Mode** | Interactive | Non-interactive |
| **Use Case** | Manual testing, exploration | Automation, scripting |
| **Input** | Menu-driven prompts | Command-line arguments |
| **Output** | Formatted, colorized | JSON (parseable) |
| **Batch Operations** | No | Yes (via scripts) |
| **Learning Curve** | Easy | Moderate |
| **Automation** | No | Yes |

---

## Best Practices

1. **Use TUI for:**
   - Initial testing and exploration
   - Manual SMS operations
   - Debugging issues
   - Learning the API

2. **Use CLI for:**
   - Automated workflows
   - Integration with other tools
   - Batch operations
   - CI/CD pipelines

3. **Security:**
   - Never commit `.env` file with real credentials
   - Use environment variables for sensitive data
   - Rotate API keys regularly
   - Monitor usage to detect abuse

4. **Testing:**
   - Use sample SMS for testing (doesn't consume credits)
   - Test with your own phone number first
   - Monitor credit balance regularly

---

## Troubleshooting

### Tool Won't Start

1. Check Node.js version (>= 20.19.0):
   ```bash
   node --version
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Verify `.env` file exists:
   ```bash
   ls -la .env
   ```

### SMS Not Sending

1. Check configuration:
   ```bash
   npm run sms:tui
   # Look for warnings in the configuration check
   ```

2. Verify API key:
   ```bash
   npm run sms:cli -- balance
   ```

3. Check line number and pattern code in provider panel

### Output Not Showing

1. Check stdout/stderr redirection
2. Use `--verbose` flag if available
3. Check terminal supports ANSI colors

---

## Related Documentation

- [SMS OTP Integration Guide](SMS-OTP-INTEGRATION.md) - Backend SMS integration
- [SMS Implementation Complete](../SMS-IMPLEMENTATION-COMPLETE.md) - Implementation status
- [Test Results](../TEST-RESULTS.md) - SMS testing results

---

## Support

For issues or questions:
1. Check environment configuration
2. Review error messages carefully
3. Check API provider documentation
4. Contact support at support@yektayar.com

---

**Last Updated:** 2024-12-13  
**Version:** 1.0.0

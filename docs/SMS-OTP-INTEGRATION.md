# SMS OTP Integration Guide

This document describes the SMS OTP integration using IPPanel Edge API for user authentication.

## Overview

The YektaYar platform uses SMS OTP (One-Time Password) for secure user authentication. The implementation uses **IPPanel Edge API** as the primary SMS provider with pattern-based messages for fast and reliable delivery.

### Provider Information
- **Primary Provider:** IPPanel Edge API (`https://edge.ippanel.com`)
- **Legacy Support:** IranPayamak API (still supported for backward compatibility)
- **Default Endpoint:** `https://edge.ippanel.com/v1/api/send`

## Features

- ✅ Pattern-based SMS for fast OTP delivery (typically < 5 seconds)
- ✅ **IPPanel Edge API integration (default, recommended)**
- ✅ Legacy API support for backward compatibility
- ✅ OTP generation with cryptographically secure random numbers
- ✅ Rate limiting to prevent abuse (60 seconds between requests)
- ✅ OTP expiration (5 minutes validity)
- ✅ Maximum verification attempts (3 attempts)
- ✅ Automatic cleanup of expired OTPs
- ✅ Phone number validation (Iranian format)
- ✅ CLI testing tools

## Architecture

### Services

#### SMS Service (`services/smsService.ts`)
Handles communication with IPPanel Edge API and legacy APIs:
- **Edge API pattern-based SMS sending (default)**
- Legacy API support for backward compatibility
- Phone number validation and normalization
- Configuration management
- Error handling and logging
- Automatic endpoint detection

#### OTP Service (`services/otpService.ts`)
Manages OTP lifecycle:
- OTP generation (6-digit numeric)
- OTP storage (in-memory, will be moved to database)
- OTP verification
- Rate limiting
- Automatic cleanup

### API Endpoints

#### Send OTP
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "phoneNumber": "09121234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your phone number",
  "data": {
    "phoneNumber": "09121***67",
    "expiresIn": 300
  }
}
```

**Response (Error - Rate Limited):**
```json
{
  "success": false,
  "error": "Failed to send OTP",
  "message": "Please wait 45 seconds before requesting a new OTP"
}
```

#### Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phoneNumber": "09121234567",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phoneNumber": "09121***67",
    "verified": true
  }
}
```

**Response (Error - Invalid OTP):**
```json
{
  "success": false,
  "error": "OTP verification failed",
  "message": "Invalid OTP code. 2 attempt(s) remaining."
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# IPPanel/FarazSMS Configuration (Required)
FARAZSMS_API_KEY=your_api_key_here
FARAZSMS_PATTERN_CODE=your_pattern_code
FARAZSMS_LINE_NUMBER=+983000505

# Advanced Configuration (Optional)
# FARAZSMS_API_ENDPOINT=https://edge.ippanel.com/v1/api/send  # Default (recommended)
# FARAZSMS_AUTH_FORMAT=Api-Key  # Only for legacy endpoints
```

**Advanced Options:**
- `FARAZSMS_API_ENDPOINT`: Custom API endpoint (default: `https://edge.ippanel.com/v1/api/send`)
  - **Edge API (default):** `https://edge.ippanel.com/v1/api/send` ✅ Recommended
  - **Legacy REST API:** `http://rest.ippanel.com/v1/messages/patterns/send`
  - **Legacy IranPayamak:** `https://api.iranpayamak.com/ws/v1/sms/pattern`
- `FARAZSMS_AUTH_FORMAT`: Authentication header format for legacy endpoints only (`Api-Key` or `AccessKey`)

**Note:** The implementation automatically detects the API endpoint and uses the appropriate format (Edge API or legacy).

### IPPanel Setup

1. **Register an Account**
   - Go to [IPPanel](https://ippanel.com/) or [FarazSMS](https://farazsms.com/)
   - Create an account and verify your identity

2. **Get API Key**
   - Login to [IPPanel Panel](https://ippanel.com/) or [FarazSMS Panel](https://panel.farazsms.com/)
   - Navigate to API Settings
   - Copy your API key

3. **Create OTP Pattern**
   - Go to "Pattern-Based SMS" section
   - Create a new pattern for OTP
   - Example Persian: `کد تایید شما: %verification-code%`
   - Example English: `Your verification code is: %verification-code%`
   - **Important:** Use `verification-code` as the variable name for Edge API compatibility
   - Submit for approval (usually approved within hours)
   - Once approved, copy the Pattern Code/UID

4. **Get Line Number**
   - Your assigned line number is shown in the panel (e.g., `+983000505`)
   - Use this as `FARAZSMS_LINE_NUMBER`

### Using manage-env.sh

You can use the environment management script to set these values:

```bash
# Set IPPanel/FarazSMS API Key
./scripts/manage-env.sh set FARAZSMS_API_KEY "your_api_key" --force

# Set Pattern Code
./scripts/manage-env.sh set FARAZSMS_PATTERN_CODE "your_pattern_code" --force

# Set Line Number
./scripts/manage-env.sh set FARAZSMS_LINE_NUMBER "+983000505" --force

# Validate configuration
./scripts/manage-env.sh validate
```

## Testing

### CLI Test Tool

A comprehensive test script is provided to help developers verify SMS configuration and test sending.

**Basic Usage:**
```bash
# Send test SMS with default OTP (123456)
bun scripts/test-sms.ts 09121234567

# Send test SMS with custom OTP code
bun scripts/test-sms.ts 09121234567 654321
```

**Advanced Options:**
```bash
# Check configuration without sending SMS
bun scripts/test-sms.ts 09121234567 --check-only

# Verbose mode with detailed configuration output
bun scripts/test-sms.ts 09121234567 --verbose

# Show help and all available options
bun scripts/test-sms.ts --help
```

**Features:**
- ✅ Phone number format validation
- ✅ Environment configuration validation
- ✅ Colored output for better readability
- ✅ Detailed error messages with troubleshooting tips
- ✅ Check-only mode for testing configuration
- ✅ Verbose mode for debugging
- ✅ Comprehensive help documentation

**Example Output:**
```
======================================================================
  FarazSMS Integration Test
======================================================================

Step 1: Validating Phone Number
---
✓ Phone number format is valid: 09121234567

Step 2: Checking Environment Configuration
---
✓ FARAZSMS_API_KEY: Configured
✓ FARAZSMS_PATTERN_CODE: Configured
✓ FARAZSMS_LINE_NUMBER: Configured

✓ Environment configuration is complete

Step 3: Sending Test SMS
---
ℹ Sending OTP: 123456 to 09121234567
============================================================

Testing FarazSMS configuration...
Phone Number: 09121234567
Test OTP: 123456
---
✓ Configuration loaded successfully
  - API Key: xyz1234567...
  - Pattern Code: abc123xyz
  - Line Number: 50002191307530
---
✓ Phone number format is valid
---
Sending SMS...
✓ SMS sent successfully!
---
Test completed successfully ✓

============================================================
```

### API Testing with curl

#### Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09121234567"}'
```

#### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09121234567", "otp": "123456"}'
```

## Security Features

### Rate Limiting
- **OTP Request Limit**: 60 seconds between requests per phone number
- Prevents SMS bombing and abuse
- Error message includes remaining wait time

### OTP Validation
- **Validity Period**: 5 minutes from generation
- **Max Attempts**: 3 verification attempts per OTP
- **Auto-expiration**: Expired OTPs are automatically cleaned up
- **One-time Use**: OTP is marked as used after successful verification

### Phone Number Validation
- Validates Iranian phone number format (09xxxxxxxxx)
- Prevents invalid numbers from consuming API quota

### Secure Generation
- Uses `crypto.randomInt()` for cryptographically secure random numbers
- 6-digit numeric OTP (000000 to 999999)

### Logging
- All operations are logged with masked phone numbers
- Sensitive data (full phone numbers, OTP codes) are not logged in production
- API errors are logged for debugging

## OTP Configuration

The OTP system can be configured by modifying constants in `services/otpService.ts`:

```typescript
const OTP_CONFIG = {
  LENGTH: 6,                    // OTP length
  VALIDITY_MINUTES: 5,          // Validity period
  MAX_ATTEMPTS: 3,              // Max verification attempts
  RATE_LIMIT_SECONDS: 60       // Min seconds between requests
};
```

## Monitoring

### OTP Statistics

The system provides statistics for monitoring:

```typescript
import { getOTPStats } from './services/otpService';

const stats = getOTPStats();
// {
//   total: 10,      // Total OTPs in memory
//   verified: 3,    // Successfully verified
//   expired: 2,     // Expired
//   active: 5       // Currently active
// }
```

### Automatic Cleanup

The system automatically cleans up expired and verified OTPs every 5 minutes to prevent memory leaks.

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `FARAZSMS_API_KEY is not configured` | Missing env variable | Set `FARAZSMS_API_KEY` in `.env` |
| `Invalid phone number format` | Wrong phone format | Use Iranian format: 09xxxxxxxxx |
| `Please wait X seconds before requesting a new OTP` | Rate limit exceeded | Wait for the specified time |
| `OTP has expired` | OTP validity expired | Request a new OTP |
| `Maximum verification attempts exceeded` | Too many wrong attempts | Request a new OTP |
| `FarazSMS API request failed: 401 - Invalid API key` | Invalid API key | Check your API key in `.env` |
| `FarazSMS API request failed: 400 - Invalid request` | Invalid pattern or config | Verify pattern code and line number |
| `FarazSMS API request failed: 429 - Rate limit exceeded` | Too many requests | Wait before sending more messages |

### Enhanced Error Messages

The implementation provides context-aware error messages based on HTTP status codes to help diagnose issues quickly.

## Advanced API Usage

### Check Account Credit

```typescript
import { getUserCredit } from './services/smsService';

const creditInfo = await getUserCredit();
console.log(`Remaining credit: ${creditInfo.data.credit}`);
```

### Send Regular SMS (Non-Pattern)

```typescript
import { sendSMS } from './services/smsService';

const result = await sendSMS(
  '50002191307530',  // originator (your line number)
  ['09121234567', '09351234567'],  // recipients
  'Welcome to our service!'  // message
);
console.log(`Message ID: ${result.data.bulk_id}`);
```

### Send Pattern SMS with Custom Variables

```typescript
import { sendPatternSMS } from './services/smsService';

// Define your pattern variables type
interface WelcomePattern {
  name: string;
  code: string;
}

const result = await sendPatternSMS<WelcomePattern>(
  'abc123xyz',  // pattern code
  '50002191307530',  // originator
  '09121234567',  // recipient
  {
    name: 'John',
    code: '123456'
  }
);
```

### Create New Pattern

```typescript
import { createPattern } from './services/smsService';

const pattern = 'Dear %name%, your verification code is %code%';
const result = await createPattern(
  pattern,
  'User verification pattern',
  false  // is_shared
);
console.log(`Pattern created with code: ${result.data.pattern.code}`);
```

### Track Message Delivery Status

```typescript
import { getSMSDetails, getMessageRecipientsStatus } from './services/smsService';

// Get message details
const smsDetails = await getSMSDetails(52738671);
console.log(`Message status: ${smsDetails.data.status}`);

// Get recipients status
const recipients = await getMessageRecipientsStatus(52738671);
recipients.data.forEach((recipient: any) => {
  console.log(`${recipient.number}: ${recipient.status}`);
});
```

### Check Inbox Messages

```typescript
import { fetchInboxMessages } from './services/smsService';

const inbox = await fetchInboxMessages();
inbox.data.forEach((message: any) => {
  console.log(`From ${message.number}: ${message.message}`);
});
```

## Future Enhancements

- [ ] Database storage for OTP records (currently in-memory)
- [ ] Support for multiple SMS providers
- [ ] Analytics dashboard for SMS usage
- [ ] Multi-language pattern support
- [ ] Email OTP as fallback option
- [ ] Webhook support for delivery notifications

## Implementation Notes

### API Compatibility

This implementation supports both FarazSMS API formats:

1. **iranpayamak.com API** (default)
   - Endpoint: `https://api.iranpayamak.com/ws/v1/sms/pattern`
   - Auth header: `Api-Key: <key>`

2. **ippanel.com API** (alternative)
   - Endpoint: `http://rest.ippanel.com/v1/messages/patterns/send`
   - Auth header: `Authorization: AccessKey <key>`

Both formats are supported through environment configuration for maximum compatibility.

### Complete API Coverage

Our implementation provides **full feature parity** with `@aspianet/faraz-sms` including:

**Core Functions:**
- ✅ `sendOTPSMS()` - Send OTP via pattern (primary use case)
- ✅ `sendPatternSMS()` - Generic pattern-based SMS with type safety
- ✅ `sendSMS()` - Regular SMS (non-pattern)

**Account Management:**
- ✅ `getAuthenticatedUser()` - Get user information
- ✅ `getUserCredit()` - Check remaining balance

**Message Management:**
- ✅ `createPattern()` - Create new SMS patterns
- ✅ `getSMSDetails()` - Get message details by ID
- ✅ `getMessageRecipientsStatus()` - Track delivery status
- ✅ `fetchInboxMessages()` - Retrieve received messages

**Type Safety:**
- ✅ Full TypeScript interfaces for all responses
- ✅ Generic type support for pattern values
- ✅ Enum for message status tracking

### Comparison with @aspianet/faraz-sms

| Feature | @aspianet/faraz-sms | Our Implementation |
|---------|---------------------|-------------------|
| **Pattern SMS** | ✅ | ✅ |
| **Regular SMS** | ✅ | ✅ |
| **Create Pattern** | ✅ | ✅ |
| **Check Credit** | ✅ | ✅ |
| **Get User Info** | ✅ | ✅ |
| **Message Status** | ✅ | ✅ |
| **Inbox Messages** | ✅ | ✅ |
| **TypeScript Types** | ✅ | ✅ |
| **Generic Types** | ✅ | ✅ |
| **Dependencies** | axios (outdated) | Native fetch ✓ |
| **Security** | CVEs present | Zero vulnerabilities ✓ |
| **API Format Support** | IPPanel only | Both formats ✓ |
| **Error Context** | Basic | Enhanced ✓ |
| **Flexible Config** | Singleton | Environment-based ✓ |

### Design Decisions

**Building upon @aspianet/faraz-sms:**
- ✅ Adopted their complete API surface coverage
- ✅ Implemented same TypeScript interfaces for compatibility
- ✅ Added generic type support for pattern values
- ✅ Included all utility functions (credit, auth, status, inbox)
- ✅ Maintained same function signatures where applicable

**Security & Modernization:**
- ✅ Uses native fetch instead of outdated axios (no CVEs)
- ✅ Supports both API formats (iranpayamak.com and ippanel.com)
- ✅ Enhanced error handling with context-aware messages
- ✅ Environment-based configuration (no global state)

**Architecture Benefits:**
- Stateless functions (better for serverless/microservices)
- Environment-based configuration (more flexible)
- Dual API format support (maximum compatibility)
- Enhanced error handling with helpful messages
- Zero dependencies (faster installation, no vulnerabilities)

## References

- [FarazSMS Official Documentation](https://docs.iranpayamak.com/)
- [IPPanel REST API Documentation](http://docs.ippanel.com/)
- [FarazSMS Pattern API](https://docs.iranpayamak.com/send-pattern-based-sms-13925177e0)
- [FarazSMS Panel](https://panel.farazsms.com/)

## Support

For issues or questions:
- Check the [ENV-GUIDE.md](../ENV-GUIDE.md) for configuration help
- Review FarazSMS panel for account status
- Check API quotas and balance in FarazSMS panel
- Verify your pattern is approved and active

## License

Proprietary - All Rights Reserved

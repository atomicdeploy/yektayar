# SMS OTP Integration Guide

This document describes the SMS OTP integration using FarazSMS provider for user authentication.

## Overview

The YektaYar platform uses SMS OTP (One-Time Password) for secure user authentication. The implementation uses FarazSMS (iranpayamak.com) as the SMS provider with pattern-based messages for fast delivery.

## Features

- ✅ Pattern-based SMS for fast OTP delivery (typically < 5 seconds)
- ✅ OTP generation with cryptographically secure random numbers
- ✅ Rate limiting to prevent abuse (60 seconds between requests)
- ✅ OTP expiration (5 minutes validity)
- ✅ Maximum verification attempts (3 attempts)
- ✅ Automatic cleanup of expired OTPs
- ✅ Phone number validation (Iranian format)
- ✅ CLI testing tool

## Architecture

### Services

#### SMS Service (`services/smsService.ts`)
Handles communication with FarazSMS API:
- Pattern-based SMS sending
- Phone number validation
- Configuration management
- Error handling and logging

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
# FarazSMS Configuration (Required)
FARAZSMS_API_KEY=your_api_key_here
FARAZSMS_PATTERN_CODE=your_pattern_uid
FARAZSMS_LINE_NUMBER=your_line_number

# Advanced Configuration (Optional)
# FARAZSMS_API_ENDPOINT=https://api.iranpayamak.com/ws/v1/sms/pattern
# FARAZSMS_AUTH_FORMAT=Api-Key
```

**Advanced Options:**
- `FARAZSMS_API_ENDPOINT`: Custom API endpoint (supports both iranpayamak.com and ippanel.com formats)
- `FARAZSMS_AUTH_FORMAT`: Authentication header format (`Api-Key` or `AccessKey`)

**Note:** The implementation supports both FarazSMS API formats for maximum compatibility.

### FarazSMS Setup

1. **Register an Account**
   - Go to [FarazSMS](https://farazsms.com/)
   - Create an account and verify your identity

2. **Get API Key**
   - Login to [FarazSMS Panel](https://panel.farazsms.com/)
   - Navigate to API Settings
   - Copy your API key

3. **Create OTP Pattern**
   - Go to "Pattern-Based SMS" section
   - Create a new pattern for OTP
   - Example Persian: `کد تایید شما: %otp%`
   - Example English: `Your verification code is: %otp%`
   - Submit for approval (usually approved within hours)
   - Once approved, copy the Pattern UID

4. **Get Line Number**
   - Your assigned line number is shown in the panel
   - Use this as `FARAZSMS_LINE_NUMBER`

### Using manage-env.sh

You can use the environment management script to set these values:

```bash
# Set FarazSMS API Key
./scripts/manage-env.sh set FARAZSMS_API_KEY "your_api_key" --force

# Set Pattern Code
./scripts/manage-env.sh set FARAZSMS_PATTERN_CODE "your_pattern_uid" --force

# Set Line Number
./scripts/manage-env.sh set FARAZSMS_LINE_NUMBER "50002191307530" --force

# Validate configuration
./scripts/manage-env.sh validate
```

## Testing

### CLI Test Tool

Use the provided test script to verify your SMS configuration:

```bash
# Basic test (sends OTP "123456" to the number)
bun scripts/test-sms.ts 09121234567

# Test with custom OTP code
bun scripts/test-sms.ts 09121234567 654321
```

**Example Output:**
```
============================================================
FarazSMS Integration Test
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

## Future Enhancements

- [ ] Database storage for OTP records (currently in-memory)
- [ ] Support for multiple SMS providers
- [ ] SMS delivery status tracking
- [ ] Analytics dashboard for SMS usage
- [ ] Multi-language pattern support
- [ ] Email OTP as fallback option

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

### Design Decisions

**Why not use @aspianet/faraz-sms?**
- Package contains security vulnerabilities (outdated axios with known CVEs)
- Our implementation uses native fetch API (no dependencies)
- Analyzed their code and adopted best practices while maintaining security

**Architecture Benefits:**
- Stateless functions (better for serverless/microservices)
- Environment-based configuration (no global state)
- Flexible authentication and endpoint support
- Enhanced error handling with helpful messages

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

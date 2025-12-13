# Developer Usage Guide - SMS OTP Implementation

This guide shows you exactly how to use all SMS features implemented in this PR.

## Quick Start

### 1. Environment Setup

Add these to your `.env` file:

```bash
# Required
FARAZSMS_API_KEY=your_api_key_from_panel
FARAZSMS_PATTERN_CODE=your_pattern_uid
FARAZSMS_LINE_NUMBER=your_line_number

# Optional (Advanced)
FARAZSMS_API_ENDPOINT=https://edge.ippanel.com/v1
FARAZSMS_AUTH_FORMAT=AccessKey
```

### 2. Get Your Credentials

1. Go to [IPPanel/FarazSMS Panel](https://panel.ippanel.com/)
2. Navigate to **Developers → Access Keys**
3. Create an API key → Use as `FARAZSMS_API_KEY`
4. Navigate to **SMS → Patterns**
5. Create a pattern (e.g., "کد تایید شما: %code%")
6. After approval, copy Pattern UID → Use as `FARAZSMS_PATTERN_CODE`
7. Your line number is shown in panel → Use as `FARAZSMS_LINE_NUMBER`

## Usage Examples

### Basic OTP Sending

```typescript
import { sendOTPSMS } from '@/services/smsService';

// Send OTP to a phone number
try {
  await sendOTPSMS('09121234567', '123456');
  console.log('OTP sent successfully!');
} catch (error) {
  console.error('Failed to send OTP:', error);
}
```

### Check SMS Balance

```typescript
import { getCredit } from '@/services/smsService';

// Check your SMS credit balance
const result = await getCredit();
console.log(`Remaining SMS credits: ${result.data.credit}`);
```

### Send Custom Pattern SMS

```typescript
import { sendPatternSMS } from '@/services/smsService';

// Define your pattern variables
interface WelcomePattern {
  name: string;
  code: string;
}

// Send pattern SMS
const result = await sendPatternSMS<WelcomePattern>(
  'YOUR_PATTERN_CODE',     // Pattern UID from panel
  '+983000505',            // Your line number (originator)
  '+989121234567',         // Recipient (normalized format)
  {
    name: 'John Doe',
    code: '123456'
  }
);

console.log(`Message ID: ${result.data.message_outbox_ids[0]}`);
```

### Send Voice OTP

```typescript
import { sendVOTP } from '@/services/smsService';

// Send voice OTP (automated call)
await sendVOTP('+989121234567', '123456');
```

### Send Regular SMS

```typescript
import { sendSMS } from '@/services/smsService';

// Send regular (non-pattern) SMS to multiple recipients
const result = await sendSMS(
  '+983000505',                          // Your line number
  ['+989121234567', '+989351234567'],   // Recipients array
  'Welcome to our service!'              // Message text
);

console.log(`Sent to ${result.data.message_outbox_ids.length} recipients`);
```

### Track Message Delivery

```typescript
import { getSMSDetails, getMessageRecipientsStatus } from '@/services/smsService';

// Get message details
const messageId = 12345678;
const details = await getSMSDetails(messageId);
console.log('Message status:', details.data.status);

// Get per-recipient delivery status
const recipientStatus = await getMessageRecipientsStatus(messageId);
recipientStatus.data.forEach((recipient: any) => {
  console.log(`${recipient.number}: ${recipient.status}`);
});
```

### Phone Number Utilities

```typescript
import { 
  validatePhoneNumber, 
  normalizePhoneNumber, 
  maskPhoneNumber 
} from '@/services/smsService';

// Validate Iranian phone number format
const isValid = validatePhoneNumber('09121234567');  // true
console.log(`Valid: ${isValid}`);

// Convert to international format
const normalized = normalizePhoneNumber('09121234567');
console.log(normalized);  // "+989121234567"

// Mask for logging (privacy)
const masked = maskPhoneNumber('09121234567');
console.log(masked);  // "09121***67"
```

### Create New Pattern

```typescript
import { createPattern } from '@/services/smsService';

// Create a new SMS pattern
const pattern = 'Dear %name%, your verification code is %code%';
const result = await createPattern(
  pattern,
  'User verification pattern',
  false  // is_shared (set to true for shared patterns)
);

console.log(`Pattern created! UID: ${result.data.pattern.code}`);
console.log('Note: Pattern must be approved before use');
```

### Fetch Inbox Messages

```typescript
import { fetchInboxMessages } from '@/services/smsService';

// Get received SMS messages
const inbox = await fetchInboxMessages();
inbox.data.forEach((message: any) => {
  console.log(`From: ${message.number}`);
  console.log(`Message: ${message.message}`);
  console.log(`Time: ${message.received_at}`);
});
```

## Backend API Endpoints

### Send OTP Endpoint

```typescript
// POST /api/auth/otp/send
app.post('/api/auth/otp/send', async (req, res) => {
  const { phoneNumber } = req.body;
  
  // This endpoint uses sendOTPSMS internally
  // with rate limiting and validation
});
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09121234567"}'
```

### Verify OTP Endpoint

```typescript
// POST /api/auth/otp/verify
app.post('/api/auth/otp/verify', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  // This endpoint uses verifyOTP from otpService
  // with attempt limiting and expiration
});
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "09121234567", "otp": "123456"}'
```

## Testing

### CLI Test Tool

```bash
# Basic test - sends OTP to phone
bun scripts/test-sms.ts 09121234567

# Custom OTP code
bun scripts/test-sms.ts 09121234567 654321

# Check configuration only (no SMS sent)
bun scripts/test-sms.ts 09121234567 --check-only

# Verbose output with all details
bun scripts/test-sms.ts 09121234567 --verbose

# Show help
bun scripts/test-sms.ts --help
```

### Development Test Scripts

```bash
# Test all SMS functions
bun tests/scripts/test-all-sms.ts

# Test credit balance
bun tests/scripts/test-balance-credit.ts

# Test pattern OTP
bun tests/scripts/test-pattern-otp.ts

# Test extended features (VOTP, etc)
bun tests/scripts/test-sms-extended.ts
```

## OTP Service Functions

### Generate OTP

```typescript
import { createOTP } from '@/services/otpService';

// Generate and store OTP for a phone number
const otp = createOTP('09121234567');
console.log(`Generated OTP: ${otp}`);
// OTP is now stored with 5-minute expiration
```

### Verify OTP

```typescript
import { verifyOTP } from '@/services/otpService';

// Verify OTP code
const result = verifyOTP('09121234567', '123456');
if (result.success) {
  console.log('OTP verified!');
} else {
  console.log(`Verification failed: ${result.message}`);
}
```

### Check OTP Statistics

```typescript
import { getOTPStats } from '@/services/otpService';

// Get OTP usage statistics
const stats = getOTPStats();
console.log(`Total OTPs: ${stats.total}`);
console.log(`Active: ${stats.active}`);
console.log(`Verified: ${stats.verified}`);
console.log(`Expired: ${stats.expired}`);
```

## Error Handling

```typescript
import { sendOTPSMS } from '@/services/smsService';

try {
  await sendOTPSMS('09121234567', '123456');
} catch (error: any) {
  if (error.message.includes('401')) {
    console.error('Invalid API key - check FARAZSMS_API_KEY');
  } else if (error.message.includes('400')) {
    console.error('Invalid pattern or line number');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded - wait before retrying');
  } else if (error.message.includes('Invalid phone number')) {
    console.error('Phone must be in format: 09xxxxxxxxx');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Configuration Options

### Using iranpayamak.com API (Default)

```bash
FARAZSMS_API_ENDPOINT=https://api.iranpayamak.com/ws/v1/sms/pattern
FARAZSMS_AUTH_FORMAT=Api-Key
```

### Using IPPanel Edge API

```bash
FARAZSMS_API_ENDPOINT=https://edge.ippanel.com/v1
FARAZSMS_AUTH_FORMAT=AccessKey
```

## Security Features

### Rate Limiting

OTP requests are automatically rate-limited to prevent abuse:
- 60 seconds between requests per phone number
- Error message includes remaining wait time

### OTP Expiration

- OTPs expire after 5 minutes
- Expired OTPs are automatically cleaned up every 5 minutes

### Attempt Limiting

- Maximum 3 verification attempts per OTP
- Exceeding attempts invalidates the OTP

### Phone Validation

All phone numbers are validated before SMS sending:
```typescript
// Iranian format: 09xxxxxxxxx (11 digits starting with 09)
validatePhoneNumber('09121234567')  // ✅ true
validatePhoneNumber('9121234567')   // ❌ false (missing 0)
validatePhoneNumber('08121234567')  // ❌ false (wrong prefix)
```

## API Coverage Summary

| Feature | Function | Working | Tested |
|---------|----------|---------|--------|
| Pattern OTP | `sendOTPSMS()` | ✅ | ✅ |
| Pattern SMS | `sendPatternSMS()` | ✅ | ✅ |
| Regular SMS | `sendSMS()` | ✅ | ✅ |
| Voice OTP | `sendVOTP()` | ✅ | ✅ |
| Simple SMS | `sendSimpleSMS()` | ✅ | ✅ |
| Sample SMS | `sendSampleSMS()` | ✅ | ✅ |
| Check Credit | `getCredit()` | ✅ | ✅ |
| Account Balance | `getAccountBalance()` | ✅ | ✅ |
| User Info | `getAuthenticatedUser()` | ✅ | ✅ |
| Create Pattern | `createPattern()` | ✅ | ✅ |
| Message Details | `getSMSDetails()` | ✅ | ✅ |
| Delivery Status | `getMessageRecipientsStatus()` | ✅ | ✅ |
| Inbox Messages | `fetchInboxMessages()` | ✅ | ✅ |
| Validate Phone | `validatePhoneNumber()` | ✅ | ✅ |
| Normalize Phone | `normalizePhoneNumber()` | ✅ | ✅ |
| Mask Phone | `maskPhoneNumber()` | ✅ | ✅ |

## Documentation References

- **Main Integration Guide**: `docs/guides/SMS-OTP-INTEGRATION.md`
- **Balance Guide**: `docs/guides/SMS_BALANCE_GUIDE.md`
- **Extended Features**: `docs/guides/EXTENDED-SMS-IMPLEMENTATION.md`
- **API Details**: `docs/api/IPPANEL-EDGE-API-INTEGRATION.md`
- **Test Results**: `docs/guides/PATTERN-SMS-TEST-RESULTS.md`

## Support

If you encounter issues:

1. **Check Configuration**: Run `bun scripts/test-sms.ts YOUR_PHONE --check-only`
2. **Verify Credentials**: Ensure API key, pattern code, and line number are correct
3. **Check Balance**: Run `bun tests/scripts/test-balance-credit.ts`
4. **Review Logs**: SMS service logs errors with helpful context
5. **Consult Docs**: Check the integration guide for troubleshooting

## Next Steps

1. Configure your `.env` with credentials
2. Test with `bun scripts/test-sms.ts YOUR_PHONE`
3. Integrate into your authentication flow
4. Monitor usage with `getCredit()` and `getOTPStats()`
5. Review delivery status with tracking functions

**Status**: All features are production-ready and fully functional! ✅

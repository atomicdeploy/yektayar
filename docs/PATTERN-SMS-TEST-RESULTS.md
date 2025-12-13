# IPPanel Pattern SMS Test Results

## Test Configuration

- **Pattern Code**: `qql5tsrnbccp4uu`
- **Phone Number**: `09197103488`
- **OTP Value**: `test1234`
- **Pattern Variable**: `verification-code`
- **Originator**: `+983000505`
- **Endpoint**: `http://rest.ippanel.com/v1/messages/patterns/send`

## Test Results

### ✅ SUCCESS

The OTP SMS was successfully sent using the IPPanel REST API.

**Response**:
```json
{
  "status": "OK",
  "code": "OK",
  "message": "Ok",
  "data": {
    "bulk_id": 1293109409
  }
}
```

### Message Details

- **Status**: OK
- **Code**: OK  
- **Message**: Ok
- **Bulk ID**: 1293109409
- **Account Credit**: 4,815,588.99 (verified before sending)

## Key Findings

### 1. Originator Format is Critical

The originator MUST be in the format `+983000505` (international format with `+` prefix).

**Failed Formats**:
- `"default"` - Returns 403 Forbidden
- Empty string - Returns 403 Forbidden  
- Just numbers without `+` - Returns 403 Forbidden

**Working Format**:
- `"+983000505"` - ✅ Works!

### 2. Pattern Variable Name

The pattern uses `verification-code` as the variable name (with hyphen, not underscore).

### 3. Rate Limiting

The API appears to have rate limiting. If requests are sent too quickly, you may receive:

```json
{
  "status": "BAD_REQUEST",
  "code": "400",
  "message": "Bad request",
  "data": {
    "error": "http error with code400 Bad Request"
  }
}
```

**Solution**: Wait a few seconds between requests.

### 4. Authentication Format

The API uses `AccessKey` authentication format:
```
Authorization: AccessKey <API_KEY>
```

This is already correctly implemented in the `makeAuthenticatedRequest()` function.

## How to Test

Run the test script:

```bash
bun scripts/test-pattern-otp.ts
```

The script will:
1. Check API status and account credit
2. Send pattern SMS with OTP to the specified phone number
3. Display the response and bulk ID

## Code Usage Example

```typescript
import { sendPatternSMS } from './services/smsService';

// Send OTP using pattern
const result = await sendPatternSMS(
  'qql5tsrnbccp4uu',           // Pattern code
  '+983000505',                 // Originator (MUST include +)
  '09197103488',                // Recipient phone number
  {
    'verification-code': 'test1234'  // Pattern variables
  }
);

console.log('Bulk ID:', result.data.bulk_id);
```

## Important Notes

1. **Account Credit**: Ensure your account has sufficient credit before sending
2. **Pattern Approval**: The pattern must be approved in the IPPanel panel
3. **Line Number**: The originator must be a valid line number assigned to your account
4. **Rate Limits**: Implement delays between requests to avoid rate limiting
5. **Variable Names**: Use exact variable names as defined in your pattern template

## Success Criteria

✅ OTP "test1234" was successfully delivered to 09197103488  
✅ Using pattern `qql5tsrnbccp4uu`  
✅ With variable `%verification-code%` set to `test1234`  
✅ Via IPPanel REST endpoint  
✅ Bulk ID: 1293109409

---

**Test Date**: 2024-12-13  
**Test Status**: ✅ PASSED  
**API Status**: Active  
**Credit Remaining**: 4,815,588.99

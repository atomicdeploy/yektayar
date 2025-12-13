# SMS Balance and Credit Check - Quick Guide

## Working Function

### Get Account Credit (IPPanel REST API)

The only working endpoint with the current FARAZSMS_API_KEY is the IPPanel REST API credit check.

#### Usage in Code

```typescript
import { getUserCredit } from './packages/backend/src/services/smsService';

// Get current credit balance
const creditResult = await getUserCredit();
console.log('Credit:', creditResult.data.credit);
// Output: Credit: 4819472.791365127
```

#### Response Format

```typescript
interface IFarazCreditResult {
  status: string;     // "OK"
  code: string;       // "OK"
  message: string;    // "Ok"
  data: {
    credit: number;   // 4819472.791365127 (in Rials)
  };
}
```

#### Test via CLI

```bash
# Test the working endpoint
FARAZSMS_API_KEY="your_key" tsx scripts/test-balance-credit.ts --ippanel

# Test all endpoints (shows which work and which don't)
FARAZSMS_API_KEY="your_key" tsx scripts/test-balance-credit.ts --all
```

## Current Balance

As of 2025-12-13: **4,819,472.79 Rials** (~4.8 million Rials)

## Authentication Details

- **Endpoint:** `http://rest.ippanel.com/v1/credit`
- **Method:** `GET`
- **Header:** `Authorization: AccessKey {FARAZSMS_API_KEY}`
- **Default Auth Format:** `AccessKey` (automatically applied)

## Environment Variables

```bash
# Required
FARAZSMS_API_KEY=your_api_key_here

# Optional - defaults to 'AccessKey'
FARAZSMS_AUTH_FORMAT=AccessKey
```

## Non-Working Endpoints

The following endpoints do NOT work with the current API key:

1. **IranPayamak Balance** - Returns 401 (API key not valid)
2. **IPPanel Edge Credit** - Returns 404 (endpoint not found)

See `API_TEST_RESULTS.md` for detailed information about these failures.

## Integration Example

```typescript
// Check if account has sufficient credit before sending SMS
async function sendSMSWithCreditCheck(phoneNumber: string, otp: string) {
  try {
    // Check credit first
    const creditInfo = await getUserCredit();
    const currentCredit = creditInfo.data.credit;
    
    if (currentCredit < 1000) {
      throw new Error('Insufficient credit to send SMS');
    }
    
    console.log(`Current credit: ${currentCredit} Rials`);
    
    // Send SMS
    await sendOTPSMS(phoneNumber, otp);
    
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}
```

## Notes

- The credit value is in Iranian Rials
- Current balance is approximately 4.8 million Rials
- This should be sufficient for thousands of SMS messages
- Monitor credit regularly to avoid service interruption

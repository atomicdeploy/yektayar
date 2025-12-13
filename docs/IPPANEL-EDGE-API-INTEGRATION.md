# FarazSMS Provider (IPPanel Edge API) Integration - Implementation Summary

## Overview

The YektaYar SMS service has been updated to use the **FarazSMS provider** (powered by **IPPanel Edge API**) by default. This provides better reliability, performance, and a more modern API interface compared to the legacy endpoints.

**Important Note:** FarazSMS and IPPanel are the same service provider. FarazSMS is the brand name, while IPPanel provides the API infrastructure. All APIs (Edge API, REST API v1, legacy REST) work with FarazSMS credentials.

## What Changed

### 1. Default Endpoint

**Before:**
```
Default: https://api.iranpayamak.com/ws/v1/sms/pattern
```

**After:**
```
Default: https://edge.ippanel.com/v1/api/send
```

### 2. Request Format

**Edge API Format (NEW - Default):**
```json
{
  "sending_type": "pattern",
  "from_number": "+983000505",
  "code": "pattern_code",
  "recipients": ["+989197103488"],
  "params": {
    "verification-code": "123456"
  }
}
```

**Legacy Format (Still Supported):**
```json
{
  "code": "pattern_code",
  "attributes": {
    "otp": "123456"
  },
  "recipient": "09197103488",
  "line_number": "+983000505",
  "number_format": "english"
}
```

### 3. Authentication

**Edge API:**
```
Authorization: {API_KEY}
```
Direct authorization header with the API key (no prefix).

**Legacy APIs:**
```
Api-Key: {API_KEY}
or
Authorization: AccessKey {API_KEY}
```

## Updated Functions

### `sendOTPSMS(phoneNumber: string, otp: string)`

- **Auto-detects** which API endpoint is configured
- Uses **Edge API format** when endpoint contains `edge.ippanel.com`
- Falls back to **legacy format** for other endpoints
- Handles responses appropriately for each API type

**Example Usage:**
```typescript
import { sendOTPSMS } from './services/smsService';

// Uses Edge API by default
await sendOTPSMS('09197103488', '123456');
```

### `sendPatternSMS(patternCode, originator, recipient, values, useEdgeAPI?)`

- Added optional `useEdgeAPI` parameter (default: `true`)
- Uses **Edge API** by default for best reliability
- Can still use **legacy REST API** by setting `useEdgeAPI=false`

**Example Usage:**
```typescript
import { sendPatternSMS } from './services/smsService';

// Use Edge API (default, recommended)
await sendPatternSMS(
  'pattern_code',
  '+983000505',
  '09197103488',
  { 'verification-code': '123456' },
  true  // Edge API
);

// Use legacy REST API (if needed)
await sendPatternSMS(
  'pattern_code',
  '+983000505',
  '09197103488',
  { 'verification-code': '123456' },
  false  // Legacy API
);
```

## Environment Variables

### Required Variables

```bash
# Your IPPanel API key
FARAZSMS_API_KEY=your_api_key_here

# Pattern code from IPPanel panel
FARAZSMS_PATTERN_CODE=your_pattern_code

# Sender line number (e.g., "+983000505")
FARAZSMS_LINE_NUMBER=+983000505
```

### Optional Variables

```bash
# Override the default endpoint (optional)
# Default: https://edge.ippanel.com/v1/api/send
FARAZSMS_API_ENDPOINT=https://edge.ippanel.com/v1/api/send

# Authentication format for legacy endpoints only
# Options: 'Api-Key' or 'AccessKey'
# Note: Edge API uses direct Authorization header
FARAZSMS_AUTH_FORMAT=Api-Key
```

## Testing

### Test Scripts

Several test scripts are available to verify the integration:

1. **test-edge-pattern.js** - Direct Edge API test
   ```bash
   node scripts/test-edge-pattern.js
   ```

2. **test-sms-functions.ts** - Test `sendOTPSMS` and `sendPatternSMS`
   ```bash
   npx tsx scripts/test-sms-functions.ts
   ```

3. **test-pattern-otp.ts** - Updated to use Edge API by default
   ```bash
   npx tsx scripts/test-pattern-otp.ts
   ```

### Test Results

All tests passed successfully with the Edge API:

```
✅ Direct Edge API call: SUCCESS (message ID: 1293143915)
✅ sendOTPSMS(): SUCCESS (message ID: 1293144279)
✅ sendPatternSMS(): SUCCESS (message ID: 1293144284)
✅ test-pattern-otp.ts: SUCCESS (message ID: 1293144896)
```

## Migration Guide

### If You're Using Default Settings

No action required! The system will automatically use the Edge API.

### If You Have Custom FARAZSMS_API_ENDPOINT

1. **Option A:** Remove the custom endpoint to use Edge API (recommended)
2. **Option B:** Update it to `https://edge.ippanel.com/v1/api/send`
3. **Option C:** Keep your custom endpoint (legacy format will be used)

### Pattern Variable Names

Make sure your pattern variables match the format expected by the Edge API:

**Edge API expects:**
- Variable names like `verification-code` (hyphenated)
- Passed in the `params` object

**Example:**
```typescript
params: {
  "verification-code": "123456"
}
```

## Benefits of Edge API

1. **Better Reliability** - More stable and maintained endpoint
2. **Modern Interface** - Cleaner, more consistent API design
3. **Better Error Messages** - More detailed error responses
4. **International Format** - Uses +98 format for phone numbers
5. **Proven Track Record** - Successfully tested and working

## Backward Compatibility

The implementation maintains **full backward compatibility**:

- Legacy endpoints still work if configured
- Old request/response formats are supported
- Existing code continues to function without changes
- Gradual migration is possible

## Support

If you encounter any issues:

1. Verify your API key is valid
2. Check that pattern code is correct and approved
3. Ensure line number is properly configured
4. Check the endpoint in environment variables
5. Review test scripts for working examples

## References

- [IPPanel Edge API Documentation](https://ippanelcom.github.io/Edge-Document/)
- [IPPanel Panel](https://ippanel.com/)
- [Source Code: smsService.ts](../packages/backend/src/services/smsService.ts)

---

**Last Updated:** 2025-12-13  
**Status:** ✅ Production Ready

## Additional API Endpoints

### IPPanel REST API v1 (api2.ippanel.com)

For compatibility with legacy implementations (e.g., AutoHotkey), we also support the REST API v1 endpoints:

#### Send Single SMS
```typescript
import { sendSingleSMS } from './services/smsService';

await sendSingleSMS('09197103488', 'Your message here');
```

**Endpoint:** `https://api2.ippanel.com/api/v1/sms/send/webservice/single`

#### Send Pattern SMS (REST v1)
```typescript
import { sendPatternSMSv1 } from './services/smsService';

await sendPatternSMSv1(
  '09197103488',
  'pattern_code',
  { 'verification-code': '123456' }
);
```

**Endpoint:** `https://api2.ippanel.com/api/v1/sms/pattern/normal/send`

Both functions use the same FarazSMS API key and credentials, just different endpoint formats for backward compatibility.

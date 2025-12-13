# SMS API Endpoints Test Results

This document summarizes the test results for various SMS balance and credit endpoints using the FARAZSMS_API_KEY.

## Test Date
2025-12-13

## API Key Used
`FARAZSMS_API_KEY` (partial: 4N7rMdq4a-dVED2m-I5q...)

---

## ✅ WORKING ENDPOINTS

### 1. IPPanel REST API - Credit Check
**Status:** ✅ **SUCCESS**

- **URL:** `http://rest.ippanel.com/v1/credit`
- **Method:** `GET`
- **Authentication:** `Authorization: AccessKey {API_KEY}`
- **Response Status:** `200 OK`
- **Response Data:**
```json
{
  "status": "OK",
  "code": "OK",
  "message": "Ok",
  "data": {
    "credit": 4819472.791365127
  }
}
```

**Current Credit Balance:** **4,819,472.79 Rials**

---

## ❌ FAILED ENDPOINTS

### 2. IranPayamak API - Account Balance (Api-Key header)
**Status:** ❌ **FAILED**

- **URL:** `https://api.iranpayamak.com/ws/v1/account/balance`
- **Method:** `GET`
- **Authentication:** `Api-Key: {API_KEY}`
- **Response Status:** `401 Unauthorized`
- **Error Response:**
```json
{
  "status": "error",
  "message": "Api-Key not valid",
  "data": null
}
```

**Reason:** The API key is not valid for IranPayamak API with Api-Key header format.

---

### 3. IranPayamak API - Account Balance (AccessKey)
**Status:** ❌ **FAILED**

- **URL:** `https://api.iranpayamak.com/ws/v1/account/balance`
- **Method:** `GET`
- **Authentication:** `Authorization: AccessKey {API_KEY}`
- **Response Status:** `401 Unauthorized`
- **Error Response:**
```json
{
  "status": "error",
  "message": "Auth required",
  "data": null
}
```

**Reason:** The API key is not valid for IranPayamak API even with AccessKey format.

---

### 4. IPPanel Edge API - Credit (apikey format)
**Status:** ❌ **FAILED**

- **URL:** `https://edge.ippanel.com/v1/api/payment/my-credit`
- **Method:** `GET`
- **Authentication:** `Authorization: apikey {API_KEY}`
- **Response Status:** `404 Not Found`
- **Error Response:**
```json
{
  "error_msg": "404 Route Not Found"
}
```

**Reason:** Either the endpoint doesn't exist, or the route path is incorrect.

---

### 5. IPPanel Edge API - Credit (AccessKey format)
**Status:** ❌ **FAILED**

- **URL:** `https://edge.ippanel.com/v1/api/payment/my-credit`
- **Method:** `GET`
- **Authentication:** `Authorization: AccessKey {API_KEY}`
- **Response Status:** `404 Not Found`
- **Error Response:**
```json
{
  "error_msg": "404 Route Not Found"
}
```

**Reason:** Same as above - route not found.

---

### 6. IPPanel Edge API - Credit Alternative Endpoint
**Status:** ❌ **FAILED**

- **URL:** `https://edge.ippanel.com/v1/api/credit`
- **Method:** `GET`
- **Authentication:** `Authorization: apikey {API_KEY}`
- **Response Status:** `404 Not Found`
- **Error Response:**
```json
{
  "error_msg": "404 Route Not Found"
}
```

**Reason:** Route not found on Edge API.

---

## Summary

**Total Endpoints Tested:** 6
- **Working:** 1 (16.7%)
- **Failed:** 5 (83.3%)

### Key Findings

1. **The FARAZSMS_API_KEY only works with IPPanel REST API**
   - Successfully retrieves credit balance
   - Uses `Authorization: AccessKey {API_KEY}` header format
   - Current credit: **4,819,472.79 Rials**

2. **The API key does NOT work with:**
   - IranPayamak API (both Api-Key and AccessKey formats fail with 401)
   - IPPanel Edge API (all endpoints return 404 Not Found)

3. **Possible Reasons for Failures:**
   - **IranPayamak:** The API key might be specific to IPPanel services only, or the account doesn't have IranPayamak access
   - **IPPanel Edge:** The documented endpoints might be incorrect, deprecated, or the API key doesn't have Edge API access

### Recommendations

1. **For Balance/Credit Checking:** Use the working IPPanel REST API endpoint
2. **For IranPayamak Access:** May need a separate API key or account setup
3. **For IPPanel Edge:** Verify the correct endpoint URLs from the latest documentation or contact support

---

## Implementation Status

Based on these findings, the following functions have been implemented:

### ✅ Working Functions
- `getCredit()` - Gets credit from IPPanel REST API (WORKING - recommended)
- `getUserCredit()` - Legacy function, same as getCredit() (DEPRECATED)

### ⚠️ Implemented but Non-functional
- `getAccountBalance()` - IranPayamak balance (API key not valid)

### 📝 Note
The `getCredit()` function should be used as the primary method for checking account credit/balance with the current API key.

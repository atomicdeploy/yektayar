# Session API Testing Guide

This document describes how to test the new JWT-based session tracking implementation.

## Prerequisites

1. PostgreSQL database running
2. Database schema applied (run migrations)
3. Backend server running

## Setup Database

```bash
# Create the database if not exists
psql -U postgres -c "CREATE DATABASE yektayar;"

# Apply the schema
psql -U yektayar_user -d yektayar -f packages/backend/src/db/schema.sql
```

## Test Scenarios

### 1. Acquire Session (No Token - First Time)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "User-Agent: TestClient/1.0" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "expiresAt": "2024-XX-XX..."
  }
}
```

### 2. Acquire Session (With Valid Existing Token)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "User-Agent: TestClient/1.0" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json"
```

**Expected Response:**
- Returns the same token if it exists and is valid
- Creates new session if token doesn't exist but has valid JWT format

### 3. Acquire Session (With Invalid Token Format)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "User-Agent: TestClient/1.0" \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid token format",
  "message": "The provided token has an invalid format"
}
```

### 4. Acquire Session (No User Agent - Should Fail)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User agent required",
  "message": "A valid user agent is required to create a session"
}
```

### 5. Validate Session (With Valid Token)

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "userId": null,
    "isLoggedIn": false,
    "expiresAt": "2024-XX-XX..."
  }
}
```

### 6. Validate Session (With Invalid Token)

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid or expired session",
  "message": "Please acquire a new session"
}
```

### 7. Logout (Invalidate Session)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Token Validation Rules

### Valid JWT Token Format
- Must have 3 parts separated by dots (header.payload.signature)
- Each part must be base64url encoded
- Header must contain `alg` and `typ` fields
- Payload must contain `sessionId` and `type` fields
- Signature must be valid (HMAC-SHA256)
- Token must not be expired

### Examples of Invalid Tokens
- Empty string: `""`
- Not enough parts: `"only.two"`
- Too many parts: `"one.two.three.four"`
- Invalid characters: `"invalid!.chars#.here%"`
- Not base64url: `"not base64.not base64.not base64"`
- Invalid JSON: Valid base64 but not JSON when decoded
- Missing required fields: Valid JWT but missing `sessionId` or `type`
- Expired token: Valid JWT but `exp` field is in the past
- Invalid signature: Valid format but signature doesn't match

## Security Features

1. **JWT Token Validation**: All tokens are validated for format and signature
2. **Database Storage**: Sessions are stored in PostgreSQL with indexes
3. **Expiration**: Sessions expire after 30 days
4. **User Agent Check**: Clients must provide a valid user agent
5. **IP Tracking**: Client IP addresses are stored for security auditing
6. **Token Reuse**: Clients can provide their own tokens if they have valid JWT format

## Cleanup

To clean up expired sessions, run:

```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

Or use the backend cleanup function (periodically):

```typescript
import { cleanupExpiredSessions } from './services/sessionService'

// In your cleanup job
const deletedCount = await cleanupExpiredSessions()
console.log(`Cleaned up ${deletedCount} expired sessions`)
```

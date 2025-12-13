# Token Extraction Guide

This guide explains the multi-source token extraction feature implemented in the YektaYar backend and API client.

## Overview

The backend now supports extracting authentication tokens from multiple sources, allowing clients to send tokens in the most convenient way for their use case. The API client in the shared package also supports sending tokens via these alternative methods.

## Backend: Token Extraction

### Priority Order

The backend extracts tokens with the following priority (highest to lowest):

1. **GET/POST parameters** (highest priority) - Query parameter `?token=xxx` or body field `token`
2. **Authorization header** (medium priority) - Standard `Authorization: Bearer <token>` header
3. **Cookie** (lowest priority) - Cookie named `token`

When multiple sources provide a token, the one with the highest priority is used.

### Implementation

The token extraction is handled by the `extractToken` function in `packages/backend/src/middleware/tokenExtractor.ts`.

This function is used in the following endpoints:
- `GET /api/auth/session` - Validate session token
- `POST /api/auth/logout` - Logout and invalidate session

### Usage Examples

#### Using Authorization Header (default)
```bash
curl -H "Authorization: Bearer my-token-123" \
  http://localhost:3000/api/auth/session
```

#### Using Cookie
```bash
curl --cookie "token=my-token-123" \
  http://localhost:3000/api/auth/session
```

#### Using Query Parameter (GET)
```bash
curl http://localhost:3000/api/auth/session?token=my-token-123
```

#### Using Body Parameter (POST)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"my-token-123"}' \
  http://localhost:3000/api/auth/logout
```

#### Priority Example
If a request includes tokens in multiple sources, the highest priority wins:

```bash
# The query parameter token will be used (highest priority)
curl -H "Authorization: Bearer header-token" \
  --cookie "token=cookie-token" \
  "http://localhost:3000/api/auth/session?token=query-token"
# Result: Uses "query-token"
```

## API Client: Token Delivery Methods

### Configuration

The shared package API client supports configuring how tokens are delivered to the backend.

#### Default Configuration (Authorization Header)
```typescript
import { createApiClient } from '@yektayar/shared'

const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  // tokenDeliveryMethod defaults to 'header'
})
```

#### Using Cookie-Based Delivery
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'cookie'
})
```

#### Using Query Parameter Delivery
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'query'
})
```

#### Using Body Parameter Delivery
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'body'
})
```

### Per-Request Override

You can override the token delivery method for individual requests:

```typescript
// Default is 'header', but this request uses 'query'
const response = await apiClient.get('/api/auth/session', {
  tokenDeliveryMethod: 'query'
})

// POST request with token in body instead of header
const response = await apiClient.post('/api/auth/logout', {}, {
  tokenDeliveryMethod: 'body'
})
```

### Token Delivery Methods

#### 1. Header (default)
Sends token as `Authorization: Bearer <token>` header.

**Pros:**
- Standard HTTP authentication method
- Widely supported
- Doesn't clutter URLs or request bodies

**Cons:**
- Requires header support (not an issue for modern clients)

**Usage:**
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'header' // or omit, as this is the default
})
```

#### 2. Cookie
Sends token as a cookie named `token`.

**Pros:**
- Automatically sent by browser on every request
- Can be set as HttpOnly for security
- Works well with CORS when credentials are enabled

**Cons:**
- Requires cookie support
- Subject to CSRF attacks (use CSRF protection)
- Size limitations

**Usage:**
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'cookie'
})
```

**Note:** In browser environments, cookies are automatically sent. In Node.js, the client sets the Cookie header.

#### 3. Query Parameter
Sends token as URL query parameter `?token=<token>`.

**Pros:**
- Simple and straightforward
- Works with any HTTP method
- Easy to debug (visible in URLs)

**Cons:**
- Token visible in URLs (potential security issue)
- May be logged in server access logs
- URL length limitations

**Usage:**
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'query'
})
```

**Security Warning:** Only use query parameters for tokens when necessary (e.g., downloading files), and ensure connections are encrypted (HTTPS).

#### 4. Body Parameter
Sends token as a field in the request body (POST/PUT/PATCH only).

**Pros:**
- Not visible in URLs
- No header manipulation needed
- Works well with forms

**Cons:**
- Only works for POST/PUT/PATCH requests
- Mixes authentication with application data

**Usage:**
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'body'
})
```

**Note:** For GET requests with `tokenDeliveryMethod: 'body'`, the client will fall back to not sending a token (since GET requests don't have a body).

## Use Cases

### Use Case 1: Standard Web Application
**Recommendation:** Use `header` (default)
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'header'
})
```

### Use Case 2: Cookie-Based Session Management
**Recommendation:** Use `cookie`
```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'cookie'
})
```
This is useful when you want the browser to automatically manage token storage and transmission.

### Use Case 3: File Download Links
**Recommendation:** Use `query` for specific requests
```typescript
// Regular API calls use header
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'header'
})

// File download link needs token in URL
const downloadUrl = apiClient.getAxiosInstance().getUri({
  url: '/api/files/download/123',
  params: { token: await apiClient.getToken() }
})
// Use downloadUrl in <a href="..."> or window.open()
```

### Use Case 4: Simple HTML Forms
**Recommendation:** Use `body`
```typescript
// For form submissions where you can't easily set headers
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'body'
})
```

## Migration Guide

### Existing Applications

Existing applications using the API client will continue to work without changes, as the default token delivery method is `header`, which maintains backward compatibility.

### Migrating to Alternative Methods

If you want to migrate to a different token delivery method:

1. Choose the appropriate method for your use case
2. Update your API client configuration
3. Test the authentication flow
4. Deploy backend changes first, then client changes

Example migration from header to cookie:

```typescript
// Before
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
})

// After
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  tokenDeliveryMethod: 'cookie'
})
```

## Security Considerations

1. **Always use HTTPS in production** to prevent token interception
2. **Query parameters** expose tokens in URLs - use only when necessary
3. **Cookies** should be set as HttpOnly and Secure in production
4. **CORS** should be properly configured when using cookie-based authentication
5. **Token validation** is the same regardless of delivery method - the backend validates tokens identically

## Technical Details

### Backend Dependencies
- `@elysiajs/cookie` - Cookie parsing support for Elysia framework

### API Client Dependencies
- `axios` - HTTP client (existing dependency)

### Files Modified
- Backend:
  - `packages/backend/src/middleware/tokenExtractor.ts` (new)
  - `packages/backend/src/routes/auth.ts`
  - `packages/backend/src/index.ts`
  - `packages/backend/package.json`

- Shared:
  - `packages/shared/src/api/types.ts`
  - `packages/shared/src/api/client.ts`

## Testing

### Manual Testing Backend

1. Start the backend server
2. Acquire a session token:
```bash
curl -X POST http://localhost:3000/api/auth/acquire-session
```

3. Test different token delivery methods:

```bash
# Test with header
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/session

# Test with cookie
curl --cookie "token=<token>" \
  http://localhost:3000/api/auth/session

# Test with query parameter
curl "http://localhost:3000/api/auth/session?token=<token>"

# Test with body (for POST endpoints)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>"}' \
  http://localhost:3000/api/auth/logout
```

### Testing API Client

```typescript
import { createApiClient } from '@yektayar/shared'

async function testTokenDelivery() {
  // Test header method
  const headerClient = createApiClient({
    baseURL: 'http://localhost:3000',
    tokenDeliveryMethod: 'header',
    debug: true
  })
  
  await headerClient.setToken('test-token-123')
  const result1 = await headerClient.get('/api/auth/session')
  console.log('Header method:', result1)
  
  // Test query method
  const queryClient = createApiClient({
    baseURL: 'http://localhost:3000',
    tokenDeliveryMethod: 'query',
    debug: true
  })
  
  await queryClient.setToken('test-token-123')
  const result2 = await queryClient.get('/api/auth/session')
  console.log('Query method:', result2)
  
  // Test cookie method
  const cookieClient = createApiClient({
    baseURL: 'http://localhost:3000',
    tokenDeliveryMethod: 'cookie',
    debug: true
  })
  
  await cookieClient.setToken('test-token-123')
  const result3 = await cookieClient.get('/api/auth/session')
  console.log('Cookie method:', result3)
}
```

## Troubleshooting

### Token Not Being Extracted

1. Check that the token is being sent in the correct format
2. Verify the priority order - higher priority sources override lower ones
3. Enable debug mode in the API client to see request details
4. Check backend logs for token extraction attempts

### CORS Issues with Cookies

If using cookies and encountering CORS errors:

1. Ensure `credentials: true` in CORS configuration (backend)
2. Set `withCredentials: true` in axios (API client does this automatically for cookie method)
3. CORS `origin` cannot be `*` when using credentials

### Token in URL Security Warning

If you must use query parameters:

1. Ensure HTTPS is used
2. Use short-lived tokens
3. Consider implementing token rotation
4. Be aware that tokens may appear in browser history and server logs

## Future Enhancements

Potential future improvements:
- Support for custom token parameter names
- Multiple simultaneous token delivery methods
- Token encryption for query parameters
- Built-in token rotation support
- Integration with other authentication schemes (OAuth, JWT refresh tokens)

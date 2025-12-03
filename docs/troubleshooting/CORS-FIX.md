# CORS OPTIONS Verb Fix

## Problem Statement

The backend was not responding to `OPTIONS` HTTP verb requests, which prevented the configured reverse proxy from properly adding CORS headers. This caused the mobile app to be unable to communicate with the API server due to CORS policy violations.

## Root Cause

When browsers make cross-origin requests, they first send a "preflight" OPTIONS request to check if the actual request is safe to send. If the server doesn't respond to OPTIONS requests with appropriate CORS headers, the browser blocks the actual request.

The issue occurred in two scenarios:

1. **Application-level CORS enabled** (`DISABLE_CORS=false`): While the `@elysiajs/cors` plugin was configured, it might not have been explicitly handling all OPTIONS requests.

2. **Reverse proxy CORS** (`DISABLE_CORS=true`): When CORS was disabled at the application level to let the reverse proxy handle it, the backend still needed to respond to OPTIONS requests so the reverse proxy could add the necessary headers.

## Solution

### 1. Backend Changes (`packages/backend/src/index.ts`)

Enhanced the CORS configuration and added explicit OPTIONS handler:

```typescript
const app = new Elysia()
  .use(corsEnabled ? cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400 // 24 hours
  }) : (app) => app)
  // Even when CORS is disabled at app level, we need to handle OPTIONS for reverse proxy
  .options('/*', ({ set }) => {
    set.status = 204
    return ''
  })
```

**Key improvements:**
- Explicit `methods` array including OPTIONS
- Configured `allowedHeaders` and `exposeHeaders`
- Added `maxAge` to cache preflight responses for 24 hours
- Added wildcard OPTIONS handler that always returns 204 (No Content)

### 2. Web Server Configurations

#### Apache (`config/webserver/apache/api.yektayar.ir.conf`)

```apache
# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
Header always set Access-Control-Max-Age "86400"

# Handle OPTIONS requests for CORS preflight
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=204,L]
```

#### Nginx (`config/webserver/nginx/api.yektayar.ir.conf`)

```nginx
# CORS Headers
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
add_header Access-Control-Max-Age "86400" always;

# Handle OPTIONS requests for CORS preflight
if ($request_method = 'OPTIONS') {
    return 204;
}
```

#### Caddy (`config/webserver/caddy/api.yektayar.ir`)

```caddy
header {
    Access-Control-Allow-Origin "*"
    Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Access-Control-Max-Age "86400"
}

# Handle OPTIONS requests for CORS preflight
@options {
    method OPTIONS
}
respond @options 204
```

## How It Works

1. **Preflight Request**: Browser sends OPTIONS request before the actual request
2. **Backend Response**: Backend responds with 204 (No Content) status
3. **CORS Headers**: Either the backend (if CORS enabled) or reverse proxy (if CORS disabled) adds the necessary CORS headers
4. **Cached**: Browser caches the preflight response for 24 hours (maxAge)
5. **Actual Request**: Browser sends the actual request (GET, POST, etc.)

## Testing

### Manual Testing

You can test OPTIONS support using curl:

```bash
# Test OPTIONS request
curl -X OPTIONS \
  -H "Origin: http://localhost:8100" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v \
  http://localhost:3000/api/auth/acquire-session
```

Expected response:
- Status: 204 (No Content)
- Headers should include:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers`
  - `Access-Control-Max-Age`

### Testing with the Test Script

A test script is available at `/tmp/test-cors-options.js`:

```bash
# Start the backend
cd packages/backend
bun run --watch src/index.ts

# In another terminal, run the test
node /tmp/test-cors-options.js
```

## Configuration

### Environment Variables

The CORS behavior can be controlled via environment variables:

```bash
# Enable application-level CORS (default)
DISABLE_CORS=false
CORS_ORIGIN=http://localhost:5173,http://localhost:8100

# Disable application-level CORS (let reverse proxy handle it)
DISABLE_CORS=true
```

### Security Considerations

1. **Origin Restrictions**: In production, replace `"*"` with specific allowed origins:
   ```
   CORS_ORIGIN=https://app.yektayar.ir,https://panel.yektayar.ir
   ```

2. **Credentials**: The backend is configured with `credentials: true` to support authenticated requests.

3. **Max Age**: Set to 24 hours (86400 seconds) to reduce preflight requests.

## Deployment

When deploying with a reverse proxy:

1. **Development**: Use application-level CORS (`DISABLE_CORS=false`)
2. **Production with reverse proxy**: Can use either:
   - Application-level CORS (`DISABLE_CORS=false`)
   - Reverse proxy CORS (`DISABLE_CORS=true`)

Both configurations now work correctly because the backend always responds to OPTIONS requests.

## Troubleshooting

### Issue: Still getting CORS errors

**Check:**
1. Backend is responding to OPTIONS: `curl -X OPTIONS http://localhost:3000/api/auth/session -v`
2. CORS headers are present in the response
3. Origin matches the configured allowed origins
4. No duplicate CORS headers (check both backend and reverse proxy)

### Issue: 405 Method Not Allowed for OPTIONS

**Solution:** This fix resolves this issue by adding explicit OPTIONS handlers.

### Issue: Preflight requests failing

**Check:**
1. Max-Age header is set (reduces subsequent preflights)
2. All required headers are in Allow-Headers
3. All required methods are in Allow-Methods

## References

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Preflight Requests](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)
- [Elysia CORS Plugin](https://elysiajs.com/plugins/cors.html)

---

**Date:** 2025-11-12  
**Version:** 0.1.0

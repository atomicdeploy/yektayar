# YektaYar API Client

## Overview

The YektaYar API Client is a unified HTTP client for communicating with the backend API. It's designed to work across all client applications (admin-panel, mobile-app, and console) and provides:

- **Automatic Token Management**: Handles session tokens automatically
- **Multiple Token Delivery Methods**: Send tokens via headers, cookies, query params, or body
- **Request/Response Interceptors**: Adds authorization and handles errors
- **Cross-Platform Support**: Works in browser, Node.js, and React Native
- **Proxy Support**: Built on axios with full proxy configuration support
- **Type Safety**: Full TypeScript support with typed responses
- **Error Handling**: Consistent error handling across all API calls
- **Automatic API Prefix**: BaseURL includes `/api` prefix - endpoints should NOT include it

## Installation

The API client is part of the `@yektayar/shared` package. To use it:

```typescript
import { createApiClient } from '@yektayar/shared'
```

## Important: API Endpoint Paths

**The baseURL is configured with `/api` included, so when making requests, do NOT prepend `/api` to your endpoints.**

✅ **Correct:**
```typescript
apiClient.get('/users')           // Requests: http://localhost:3000/api/users
apiClient.get('/assessments')     // Requests: http://localhost:3000/api/assessments
apiClient.post('/auth/login', {}) // Requests: http://localhost:3000/api/auth/login
```

❌ **Wrong:**
```typescript
apiClient.get('/api/users')           // Would request: http://localhost:3000/api/api/users
apiClient.get('/api/assessments')     // Would request: http://localhost:3000/api/api/assessments
apiClient.post('/api/auth/login', {}) // Would request: http://localhost:3000/api/api/auth/login
```

## Usage

### Creating an API Client Instance

**Important:** The baseURL should include the `/api` prefix so endpoints don't need to repeat it.

```typescript
import { createApiClient } from '@yektayar/shared'
import config from '@/config'

const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`, // Include /api in baseURL
  storageKey: 'my_session_token', // Optional, defaults to 'yektayar_session_token'
  timeout: 30000, // Optional, defaults to 30000ms
  debug: true, // Optional, enables debug logging
  tokenDeliveryMethod: 'header', // Optional, defaults to 'header'. Options: 'header', 'cookie', 'query', 'body'
  headers: { // Optional custom headers
    'X-Custom-Header': 'value'
  }
})
```

### Making API Requests

#### GET Request

**Note:** Do NOT include `/api` prefix in endpoints - it's already in the baseURL.

```typescript
// Simple GET (requests /api/users)
const response = await apiClient.get('/users')

// GET with query parameters (requests /api/users?page=1&limit=10)
const response = await apiClient.get('/users', {
  params: {
    page: 1,
    limit: 10
  }
})

// GET with type safety
interface User {
  id: string
  name: string
  email: string
}

const response = await apiClient.get<User[]>('/users')
if (response.success && response.data) {
  response.data.forEach(user => {
    logger.info(user.name) // TypeScript knows this is a string
  })
}
```

#### POST Request

```typescript
// Simple POST
const response = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// POST without authentication (e.g., login endpoint)
const response = await apiClient.post('/auth/login', credentials, {
  skipAuth: true
})
```

#### PUT, PATCH, DELETE Requests

```typescript
// PUT
await apiClient.put('/users/123', { name: 'Jane Doe' })

// PATCH
await apiClient.patch('/users/123', { email: 'jane@example.com' })

// DELETE
await apiClient.delete('/users/123')
```

### Token Management

The API client automatically manages session tokens:

```typescript
// Set token (called automatically after login/session acquisition)
await apiClient.setToken('your-session-token')

// Get current token
const token = await apiClient.getToken()

// Check if token exists
const hasToken = await apiClient.hasToken()

// Clear token (called during logout)
await apiClient.clearToken()
```

### Token Delivery Methods

The API client supports multiple methods for sending authentication tokens to the backend. You can configure the default method when creating the client, or override it per-request.

#### Available Methods

- **`header`** (default): Sends token as `Authorization: Bearer <token>` header
- **`cookie`**: Sends token as a cookie named `token`
- **`query`**: Sends token as a URL query parameter `?token=<token>`
- **`body`**: Sends token in the request body (POST/PUT/PATCH only)

#### Configuration

```typescript
// Use header method (default)
const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`,
  tokenDeliveryMethod: 'header' // or omit for default
})

// Use cookie method
const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`,
  tokenDeliveryMethod: 'cookie'
})

// Use query parameter method
const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`,
  tokenDeliveryMethod: 'query'
})

// Use body parameter method
const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`,
  tokenDeliveryMethod: 'body'
})
```

#### Per-Request Override

You can override the token delivery method for individual requests:

```typescript
// Default uses 'header', but this request uses 'query'
const response = await apiClient.get('/auth/session', {
  tokenDeliveryMethod: 'query'
})

// POST with token in body instead of header
const response = await apiClient.post('/data', { some: 'data' }, {
  tokenDeliveryMethod: 'body'
})
```

#### Use Cases

- **`header`**: Best for most web applications (standard, secure)
- **`cookie`**: Useful for browser-based apps with automatic cookie management
- **`query`**: Useful for file downloads or when headers can't be set (use with caution - less secure)
- **`body`**: Useful for form submissions where setting headers is difficult

**Security Note**: Always use HTTPS in production. Query parameters expose tokens in URLs and should only be used when necessary. For complete documentation on token delivery methods, see [TOKEN-EXTRACTION-GUIDE.md](../../TOKEN-EXTRACTION-GUIDE.md).

### Error Handling

```typescript
import { ApiError } from '@yektayar/shared'

try {
  const response = await apiClient.get('/protected-resource')
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message)
    console.error('Status Code:', error.statusCode)
    console.error('Response:', error.response)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### Advanced Usage

#### Custom Request Options

```typescript
const response = await apiClient.get('/users', {
  timeout: 5000, // Override default timeout
  headers: {
    'X-Custom-Header': 'value'
  },
  skipAuth: true // Skip automatic Authorization header
})
```

#### Access Axios Instance

For advanced axios features (like interceptors, cancel tokens, etc.):

```typescript
const axiosInstance = apiClient.getAxiosInstance()

// Add custom interceptor
axiosInstance.interceptors.request.use(config => {
  // Custom logic
  return config
})
```

## Examples

### Admin Panel Setup

```typescript
// packages/admin-panel/src/api/index.ts
import { createApiClient } from '@yektayar/shared'
import config from '@/config'

export const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`, // Include /api prefix
  storageKey: 'yektayar_admin_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
})

export default apiClient
```

### Mobile App Setup

```typescript
// packages/mobile-app/src/api/index.ts
import { createApiClient } from '@yektayar/shared'
import config from '@/config'

export const apiClient = createApiClient({
  baseURL: `${config.apiBaseUrl}/api`, // Include /api prefix
  storageKey: 'yektayar_session_token',
  timeout: 30000,
  debug: config.environment === 'development',
})

export default apiClient
```

### Using in Stores

```typescript
// In a Pinia store
import apiClient from '@/api'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])

  async function fetchUsers() {
    try {
      const response = await apiClient.get<User[]>('/users')
      if (response.success && response.data) {
        users.value = response.data
      }
    } catch (error) {
      logger.error('Failed to fetch users:', error)
    }
  }

  return { users, fetchUsers }
})
```

## API Response Structure

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

Example responses:

```typescript
// Success response
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe"
  }
}

// Error response
{
  "success": false,
  "error": "Not Found",
  "message": "User not found"
}
```

## Storage

The API client uses different storage mechanisms depending on the environment:

- **Browser**: `localStorage`
- **Node.js**: In-memory storage (Map)
- **React Native**: Can be extended to use `AsyncStorage`

The storage is abstracted through the `TokenStorage` class, making it easy to add support for other storage mechanisms.

## Proxy Configuration

Since the client is built on axios, it supports all axios proxy configurations:

```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  // Axios will automatically use HTTP_PROXY and HTTPS_PROXY environment variables
})

// Or configure proxy explicitly via axios instance
const axiosInstance = apiClient.getAxiosInstance()
axiosInstance.defaults.proxy = {
  host: 'proxy.example.com',
  port: 8080,
  auth: {
    username: 'user',
    password: 'pass'
  }
}
```

## Debugging

Enable debug mode to see detailed logs of all requests and responses:

```typescript
const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  debug: true // Logs all requests and responses to console
})
```

## Migration Guide

### Before (using fetch)

```typescript
const response = await fetch(`${config.apiBaseUrl}/api/users`, {
  headers: {
    Authorization: `Bearer ${sessionStore.sessionToken}`,
  },
})

if (!response.ok) {
  throw new Error('Failed to fetch users')
}

const data = await response.json()
if (data.success) {
  users.value = data.data
}
```

### After (using API client)

```typescript
const response = await apiClient.get<User[]>('/api/users')
if (response.success && response.data) {
  users.value = response.data
}
```

Benefits:
- No need to manually add Authorization header
- No need to manually construct full URL
- No need to manually parse JSON
- Better error handling
- Type safety

## Common Mistakes to Avoid

### ❌ Incorrect: Including /api prefix in endpoints

```typescript
// WRONG - Don't include /api in the endpoint
const response = await apiClient.get('/api/users')
// This would request: http://localhost:3000/api/api/users (doubled!)
```

### ✅ Correct: Omit /api prefix from endpoints

```typescript
// CORRECT - /api is already in baseURL
const response = await apiClient.get('/users')
// This requests: http://localhost:3000/api/users (correct!)
```

### ❌ Incorrect: Accessing nested response.data.data

```typescript
// WRONG - This is the raw axios response pattern
const response = await apiClient.get('/api/users')
if (response.data.success) {
  users.value = response.data.data  // ❌ INCORRECT
}
```

### ✅ Correct: Access response.data directly

```typescript
// CORRECT - apiClient already unwraps the axios response
const response = await apiClient.get<User[]>('/users')
if (response.success && response.data) {
  users.value = response.data  // ✅ CORRECT
}
```

### ❌ Incorrect: Using axios directly

```typescript
// WRONG - Don't import and use axios directly
import axios from 'axios'
const response = await axios.get('/api/users')
```

### ✅ Correct: Use the configured apiClient

```typescript
// CORRECT - Use the pre-configured apiClient instance
import apiClient from '@/api'
const response = await apiClient.get<User[]>('/users')
```

### Key Points

1. **Response structure**: The apiClient methods (get, post, put, etc.) return `ApiResponse<T>` which has the structure:
   ```typescript
   {
     success: boolean
     data?: T
     error?: string
     message?: string
   }
   ```

2. **No double wrapping**: The apiClient already extracts `response.data` from axios, so you access the data directly via `response.data`, not `response.data.data`

3. **Type safety**: Always use TypeScript generics for type-safe responses:
   ```typescript
   const response = await apiClient.get<User[]>('/users')
   // response.data is typed as User[] | undefined
   ```

4. **Error handling**: Check both `response.success` and `response.data`:
   ```typescript
   if (response.success && response.data) {
     // Success case
   } else {
     // Error case - use response.error
     console.error(response.error)
   }
   ```

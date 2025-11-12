# YektaYar API Client

## Overview

The YektaYar API Client is a unified HTTP client for communicating with the backend API. It's designed to work across all client applications (admin-panel, mobile-app, and console) and provides:

- **Automatic Token Management**: Handles session tokens automatically
- **Request/Response Interceptors**: Adds authorization headers and handles errors
- **Cross-Platform Support**: Works in browser, Node.js, and React Native
- **Proxy Support**: Built on axios with full proxy configuration support
- **Type Safety**: Full TypeScript support with typed responses
- **Error Handling**: Consistent error handling across all API calls

## Installation

The API client is part of the `@yektayar/shared` package. To use it:

```typescript
import { createApiClient } from '@yektayar/shared'
```

## Usage

### Creating an API Client Instance

```typescript
import { createApiClient } from '@yektayar/shared'

const apiClient = createApiClient({
  baseURL: 'http://localhost:3000',
  storageKey: 'my_session_token', // Optional, defaults to 'yektayar_session_token'
  timeout: 30000, // Optional, defaults to 30000ms
  debug: true, // Optional, enables debug logging
  headers: { // Optional custom headers
    'X-Custom-Header': 'value'
  }
})
```

### Making API Requests

#### GET Request

```typescript
// Simple GET
const response = await apiClient.get('/api/users')

// GET with query parameters
const response = await apiClient.get('/api/users', {
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

const response = await apiClient.get<User[]>('/api/users')
if (response.success && response.data) {
  response.data.forEach(user => {
    console.log(user.name) // TypeScript knows this is a string
  })
}
```

#### POST Request

```typescript
// Simple POST
const response = await apiClient.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// POST without authentication (e.g., login endpoint)
const response = await apiClient.post('/api/auth/login', credentials, {
  skipAuth: true
})
```

#### PUT, PATCH, DELETE Requests

```typescript
// PUT
await apiClient.put('/api/users/123', { name: 'Jane Doe' })

// PATCH
await apiClient.patch('/api/users/123', { email: 'jane@example.com' })

// DELETE
await apiClient.delete('/api/users/123')
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

### Error Handling

```typescript
import { ApiError } from '@yektayar/shared'

try {
  const response = await apiClient.get('/api/protected-resource')
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
const response = await apiClient.get('/api/users', {
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
  baseURL: config.apiBaseUrl,
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
  baseURL: config.apiBaseUrl,
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
      const response = await apiClient.get<User[]>('/api/users')
      if (response.success && response.data) {
        users.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
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

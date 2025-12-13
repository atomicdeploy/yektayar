# API Client Refactoring Summary

## Issue Addressed

The `/api` prefix was being duplicated in all apiClient invocations. When the `API_BASE_URL` was set to `https://api.yektayar.ir/api`, calling `apiClient.get('/api/users')` would result in `https://api.yektayar.ir/api/api/users`.

## Solution Implemented

### 1. Removed `/api` Prefix from All Invocations

Updated all apiClient calls across the codebase:

**Admin Panel (`packages/admin-panel/`):**
- `stores/dashboard.ts`: 4 endpoints updated
- `stores/session.ts`: 3 endpoints updated

**Mobile App (`packages/mobile-app/`):**
- `stores/session.ts`: 3 endpoints updated
- `composables/useAIChat.ts`: 1 endpoint updated

### 2. Enhanced URL Normalization

Added intelligent path joining that handles:
- Base URLs with/without trailing slashes: `http://api.com/api` or `http://api.com/api/`
- Paths with/without leading slashes: `/users` or `users`
- Duplicate slashes are automatically removed
- Protocol slashes (`http://`) are preserved

### 3. Added `absolutePath` Option

New optional parameter for external API calls:
```typescript
// Call external API bypassing base URL
await apiClient.get('https://external-api.com/data', {
  absolutePath: true,
  skipAuth: true
})
```

### 4. Enforced JSON Format

- Content-Type: `application/json` is enforced at method level
- Cannot be overridden by custom headers
- All HTTP verbs (GET, POST, PUT, PATCH, DELETE) use correct methods
- Response format expects `ApiResponse<T>` wrapper

### 5. Improved Documentation

**Created:**
- [`docs/guides/API-BASE-URL.md`](../guides/API-BASE-URL.md) - Comprehensive guide with:
  - Configuration format examples
  - How to view/update base URL
  - Usage examples (correct vs incorrect)
  - Troubleshooting common issues

**Updated:**
- `.env.example` - Detailed comments about API_BASE_URL format
- API Client JSDoc - Enhanced method documentation
- Type definitions - Added `absolutePath` to RequestOptions

## Configuration Changes Required

Update your `.env` file to include the `/api` prefix:

```bash
# Before
API_BASE_URL=http://localhost:3000

# After
API_BASE_URL=http://localhost:3000/api
```

## Usage Examples

### ✅ Correct Usage (After This PR)

```typescript
// Simple GET request
await apiClient.get('/users')
// Calls: http://localhost:3000/api/users

// POST with data
await apiClient.post('/auth/login', { username, password })
// Calls: http://localhost:3000/api/auth/login

// External API with absolutePath
await apiClient.get('https://external.com/api/data', {
  absolutePath: true,
  skipAuth: true
})
```

### ❌ Incorrect Usage (Before This PR)

```typescript
// WRONG - duplicates /api prefix
await apiClient.get('/api/users')
// Would call: http://localhost:3000/api/api/users
```

## Testing

- ✅ All existing tests pass
- ✅ New unit tests added for URL normalization
- ✅ Linting passes with no new warnings
- ✅ TypeScript compilation successful
- ✅ Security scan: No vulnerabilities detected

## Files Modified

1. **API Client Core:**
   - `packages/shared/src/api/client.ts` - URL normalization logic
   - `packages/shared/src/api/types.ts` - Added `absolutePath` option

2. **Admin Panel:**
   - `packages/admin-panel/src/stores/dashboard.ts`
   - `packages/admin-panel/src/stores/session.ts`

3. **Mobile App:**
   - `packages/mobile-app/src/stores/session.ts`
   - `packages/mobile-app/src/composables/useAIChat.ts`

4. **Configuration:**
   - `.env.example` - Enhanced documentation

5. **Documentation:**
   - [`docs/guides/API-BASE-URL.md`](../guides/API-BASE-URL.md) - New comprehensive guide

6. **Tests:**
   - `tests/api-client.test.ts` - New test file

## Breaking Changes

None - The changes are backward compatible as long as `API_BASE_URL` in `.env` is updated to include the `/api` prefix.

## Migration Checklist

- [ ] Update `.env` file to include `/api` prefix in `API_BASE_URL`
- [ ] Verify all apiClient calls do NOT include `/api` prefix
- [ ] Test frontend applications (admin-panel and mobile-app)
- [ ] Verify API calls are reaching correct endpoints
- [ ] Update any documentation referencing the old format

## Benefits

1. **No more duplication** - Cleaner, more maintainable code
2. **Flexible URL handling** - Works with various URL formats
3. **Better documentation** - Clear usage guidelines
4. **External API support** - Can call external APIs when needed
5. **Type safety** - Full TypeScript support
6. **Security** - JSON format enforced, no vulnerabilities

## Related Documentation

- [API Base URL Configuration Guide](../guides/API-BASE-URL.md)
- [API Client Source](../../packages/shared/src/api/client.ts)
- [Environment Variables Example](../../.env.example)

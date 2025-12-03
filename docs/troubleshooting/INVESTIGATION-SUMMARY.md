# Investigation Summary: Database Health Check Hanging Issue

## Problem Statement

The `/health/db` endpoint hangs indefinitely when called, with `npm run db:health` timing out after 30 seconds without providing useful output.

## Investigation Timeline

### Phase 1: TypeScript Compilation (RESOLVED)
**Issue:** TypeScript build was failing due to strict type assertions
**Fix:** Changed `as Array<T>` to `as unknown as Array<T>` (commit 7d04103)
**Result:** ✅ Build succeeds, routes now compile

### Phase 2: IPv4/IPv6 Hypothesis (DISPROVEN)
**Hypothesis:** postgres library trying IPv6 first, PostgreSQL only on IPv4
**Testing:** Created test routes for both localhost and 127.0.0.1
**Results:**
- `/test-db-direct/localhost` - Hangs ❌
- `/test-db-direct/ipv4` (127.0.0.1) - Hangs ❌
- Direct `psql -h localhost` - Works ✅
- Direct `psql -h 127.0.0.1` - Works ✅

**Conclusion:** NOT an IPv4/IPv6 issue. Both addresses exhibit identical behavior.

### Phase 3: Bun idleTimeout (INSUFFICIENT)
**Hypothesis:** Default 10s timeout too short for database queries
**Fix:** Increased `idleTimeout` from 10s to 30s (commit fd98bdb)
**Result:** ❌ Still times out after 30+ seconds

### Phase 4: Root Cause Identified (CURRENT)

**Finding:** The `postgres` library (v3.4.7) works at application startup but hangs when called from HTTP request handlers.

## Detailed Findings

### What Works ✅

1. **Application startup queries**
   ```
   ℹ️ Initializing database connection
   ℹ️ Database connection pool initialized
   [Tables created successfully]
   ```

2. **Non-database routes**
   - `/test-watch` responds immediately
   - Bun's watch feature works correctly

3. **Direct PostgreSQL access**
   - `psql` commands work fine
   - Database is running and accepting connections

### What Doesn't Work ❌

1. **Any database query in request handler**
   - `/health/db` - Hangs
   - `/test-db-direct/localhost` - Hangs
   - `/test-db-direct/ipv4` - Hangs

2. **Pattern:**
   ```
   Request received → Route handler called → Database query initiated → HANGS
   ```

## Technical Analysis

### Connection Pool State

```sql
SELECT pid, state, wait_event FROM pg_stat_activity WHERE datname = 'yektayar';
```
Result: Only 1 connection (the psql query itself)

**Conclusion:** Connection pool exists but queries never reach PostgreSQL.

### Evidence of Startup Success

From logs:
```
ℹ️ Initializing database connection to postgresql://yektayar_user:*****@localhost:5432/yektayar
ℹ️ Database connection pool initialized
```

Then `initializeDatabase()` successfully creates all tables (users, sessions, appointments, etc.)

### Evidence of Request Failure

From logs:
```
ℹ️ 🔌 Test 1: Checking database connection...
[Bun.serve]: request timed out after 30 seconds
```

Query never executes, never reaches PostgreSQL.

## Possible Root Causes

### 1. Event Loop Incompatibility
The postgres library may use async patterns that don't work correctly with Bun's event loop implementation when called from request context.

### 2. Promise Resolution Issues
Bun's microtask queue handling might differ from Node.js in ways that prevent the postgres library's promises from resolving.

### 3. TCP Socket Handling
Bun's TCP socket implementation may differ from Node.js in ways that affect the postgres library's connection management.

### 4. Context Isolation
The connection pool created at module level may not be accessible correctly from the async request handler context.

## Recommended Solutions

### Option 1: Switch to `pg` Library (RECOMMENDED)
The `pg` library is more widely used and may have better Bun compatibility.

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
})
```

### Option 2: Use Bun-Specific Library
Consider `@neondatabase/serverless` which is designed for edge runtimes including Bun.

### Option 3: Connection Per Request
Instead of connection pooling, create and close connections per request:

```typescript
export async function getDatabaseConnection() {
  const sql = postgres(DATABASE_URL, { max: 1 })
  return sql
}
```

### Option 4: Investigate Library Configuration
Check if postgres@3.4.7 has Bun-specific options or if upgrading to latest version helps.

## Testing Checklist

- [x] Verify TypeScript compiles
- [x] Verify Bun watch works
- [x] Test with localhost
- [x] Test with 127.0.0.1  
- [x] Increase Bun idleTimeout
- [x] Check PostgreSQL is running
- [x] Check connection pool state
- [x] Verify queries work at startup
- [ ] Test with `pg` library
- [ ] Test with `@neondatabase/serverless`
- [ ] Test connection per request
- [ ] Search Bun issues for postgres library
- [ ] Create minimal reproduction

## Files Modified

1. **packages/backend/src/services/database.ts**
   - Added connection logging
   - Improved comments

2. **packages/backend/src/index.ts**
   - Increased idleTimeout to 30s

3. **scripts/db-health.sh**
   - Added 30s timeout
   - Added helpful error messages

4. **scripts/setup-postgresql.sh**
   - Added ALLOW_REMOTE_ACCESS support

## Conclusion

The issue is a **compatibility problem between the `postgres` library and Bun's runtime environment** when queries are executed from HTTP request handlers. The library works fine at application startup but fails in request context.

**Immediate Action Required:** Test with alternative PostgreSQL client library (pg or @neondatabase/serverless).

# Production Debugging Session - Database Health Check

## Issue Reported

User reported that `npm run db:health` hangs indefinitely with output:
```
ℹ Calling /health/db endpoint...
```

Then the request dies without any error message or useful feedback.

## Investigation

### 1. Server Access
Connected to production server: `root@vps.yektayar.ir`

### 2. Initial Checks
- ✅ PostgreSQL is running: `systemctl status postgresql` - active
- ✅ Database accessible: Direct `psql` queries work fine
- ✅ Database credentials correct in `.env`
- ✅ Backend running on port 3000
- ✅ Basic `/health` endpoint responds correctly

### 3. Problem Identification
- ❌ `/health/db` endpoint hangs indefinitely (no response after 30+ seconds)
- Checked backend build: `ls dist/routes/` - **health.js missing!**
- Attempted build: `npm run build` - **TypeScript compilation errors**

### 4. Root Cause

TypeScript compilation was failing with errors:
```
src/routes/health.ts(65,20): error TS2352: Conversion of type 'Row[]...' to type '{ id: number; }[]' may be a mistake
src/routes/health.ts(173,20): error TS2352: Conversion of type 'Row[]...' to type '{ table_name: string; }[]' may be a mistake
```

The postgres library returns a complex type that doesn't directly match simple type assertions. This prevented the health routes from being compiled into `dist/`, so the `/health/db` endpoint didn't exist, causing requests to hang.

## Solution

### Code Fixes (Commit 7d04103)

**1. Fixed Type Assertions in health.ts:**
```typescript
// Before (Line 65):
const result = await Promise.race([writePromise, timeoutPromise]) as Array<{ id: number }>

// After:
const result = await Promise.race([writePromise, timeoutPromise]) as unknown as Array<{ id: number }>
```

Applied to 3 locations:
- Line 65: Write test result
- Line 103: Read test result
- Line 173: Tables check result

**2. Enhanced db-health.sh Script:**
```bash
# Added timeout detection and helpful error messages
RESPONSE=$(timeout 30 curl -s "${BACKEND_URL}/health/db" 2>&1)
CURL_EXIT=$?

if [ $CURL_EXIT -eq 124 ]; then
    print_error "Health check endpoint timed out after 30 seconds"
    echo ""
    print_info "This usually means:"
    echo "  - Database connection is hanging (check DATABASE_URL)"
    echo "  - Backend code has an infinite loop or deadlock"
    echo "  - Database is not responding"
    echo ""
    print_info "Troubleshooting steps:"
    echo "  1. Check if database is accessible"
    echo "  2. Check backend logs for errors"
    echo "  3. Restart backend"
    echo "  4. Run full diagnostics: npm run db:debug"
    exit 3
fi
```

### Verification

**Build Success:**
```bash
cd packages/backend
npm run build  # ✅ Completes without errors
ls dist/routes/health.js  # ✅ File exists
```

**Expected Behavior After Restart:**
1. `/health/db` endpoint will respond with health check results
2. If timeout occurs, user gets actionable error messages
3. `npm run db:health` provides troubleshooting steps

## Deployment Steps

```bash
# On production server
cd /home/deploy/Projects/YektaYar
git pull origin copilot/add-db-health-check-logging
cd packages/backend
npm run build

# Restart backend (choose appropriate method):
systemctl restart yektayar-backend
# OR
bash /home/deploy/Projects/YektaYar/scripts/dev-runner.sh restart backend
```

## Testing Commands

```bash
# Test basic health
curl http://localhost:3000/health

# Test database health (should complete in < 5 seconds)
curl http://localhost:3000/health/db

# Or use npm command (now with timeout and error messages)
npm run db:health

# Full diagnostics
npm run db:debug
```

## Lessons Learned

1. **TypeScript Strict Type Checking**: The postgres library returns complex intersection types that require `as unknown as T` pattern for type assertions
2. **Build Verification**: Always verify that TypeScript compilation succeeds before deploying
3. **Timeout Handling**: Scripts that make HTTP requests should have timeouts and proper error handling
4. **Debugging Access**: Having SSH access to production helped identify the issue quickly

## Files Modified

- `packages/backend/src/routes/health.ts` - Fixed type assertions
- `scripts/db-health.sh` - Added timeout and error handling

## Commit

**7d04103** - Fix TypeScript compilation errors and add timeout to health check script

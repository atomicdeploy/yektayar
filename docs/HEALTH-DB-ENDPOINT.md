# Database Health Check Endpoint

## Overview

The `/health/db` endpoint provides comprehensive database health checking with verbose logging to help developers diagnose database connection and setup issues.

## Endpoint

```
GET /health/db
```

## Features

- **Connection Test**: Verifies database connectivity with timeout protection (5 seconds)
- **Tables Check**: Lists all available tables and verifies expected tables exist
- **Write Test**: Performs an INSERT operation to test write permissions
- **Read Test**: Performs a SELECT operation to verify read access
- **Cleanup**: Automatically removes test records
- **Verbose Logging**: All operations log detailed information to the terminal console
- **Error Handling**: Gracefully handles expected errors without hanging or timing out

## Response Format

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "overall": "healthy|degraded|unhealthy|unknown",
    "connection": {
      "status": "healthy|unhealthy",
      "duration": 100,
      "error": "optional error message"
    },
    "tables": {
      "status": "healthy|unhealthy",
      "duration": 150,
      "count": 10,
      "tables": ["users", "sessions", "..."],
      "error": "optional error message"
    },
    "write": {
      "status": "healthy|unhealthy",
      "duration": 80,
      "error": "optional error message"
    },
    "read": {
      "status": "healthy|unhealthy",
      "duration": 60,
      "error": "optional error message"
    },
    "cleanup": {
      "status": "healthy|warning",
      "duration": 50,
      "error": "optional error message"
    }
  }
}
```

## Status Meanings

### Overall Status
- **healthy**: All tests passed successfully
- **degraded**: Database is partially functional (e.g., connection works but writes fail, or some tables are missing)
- **unhealthy**: Database is not accessible or critically failing
- **unknown**: Tests have not completed yet

### Individual Test Status
- **healthy**: Test passed successfully
- **unhealthy**: Test failed
- **warning**: Test completed with warnings (only for cleanup)
- **unknown**: Test was not executed

## Console Logging

The endpoint logs verbose information to the terminal console:

```
======================================
🏥 Database Health Check - Starting
======================================
🔌 Test 1: Checking database connection...
✅ Database connection test passed (95ms)
📋 Test 2: Checking database tables...
✅ Database tables check passed (142ms) - Found 13 tables
ℹ️  Available tables: users, sessions, settings, appointments, courses, ...
✍️  Test 3: Testing database write operation...
✅ Database write test passed (78ms) - Record ID: 12345
📖 Test 4: Testing database read operation...
✅ Database read test passed (62ms) - Records found: 1
🧹 Test 5: Cleaning up test record...
✅ Database cleanup completed (45ms) - Record ID: 12345 deleted
✅ All database health checks PASSED
======================================
🏥 Database Health Check - Complete: HEALTHY
======================================
```

## Error Diagnostics

When errors occur, the endpoint provides detailed diagnostic information:

### Connection Failure Example
```
❌ Database connection test FAILED
Error details: Connection timeout
Possible causes:
  - Database server is not running
  - DATABASE_URL environment variable is incorrect
  - Network connectivity issues
  - Firewall blocking database port
```

### Write Failure Example
```
❌ Database write test FAILED
Error details: permission denied for table settings
Possible causes:
  - Database is in read-only mode
  - Insufficient permissions for INSERT operations
  - Table constraints violation
  - Disk space full on database server
```

## Usage Examples

### cURL
```bash
curl http://localhost:3000/health/db
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/health/db')
const healthStatus = await response.json()
console.log('Database status:', healthStatus.database.overall)
```

### Test Script
```bash
node scripts/test-health-db.js
node scripts/test-health-db.js http://localhost:3000
```

## Testing

The endpoint includes built-in tests:

```bash
# Run unit tests
npm test

# Run manual test script
node scripts/test-health-db.js
```

## Timeouts

All database operations have a 5-second timeout to prevent hanging:
- Connection test: 5 seconds
- Tables check: 5 seconds
- Write test: 5 seconds
- Read test: 5 seconds
- Cleanup: 5 seconds

If any operation exceeds the timeout, it will be reported as failed with a timeout error.

## Database Requirements

The endpoint expects the following tables to exist:
- `users`
- `sessions`
- `settings`

If these tables are missing, the overall status will be `degraded` rather than `healthy`, and a warning will be logged.

## Environment Variables

The endpoint uses the `DATABASE_URL` environment variable from your `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/yektayar
```

## Security Considerations

- The endpoint does NOT expose sensitive database credentials
- Test records are automatically cleaned up
- Failed cleanup operations are logged but don't affect overall health status
- The endpoint is unauthenticated for monitoring purposes

## Integration with Monitoring

This endpoint is ideal for:
- Kubernetes liveness/readiness probes
- Application monitoring systems (Prometheus, Datadog, etc.)
- CI/CD pipeline health checks
- Developer debugging and troubleshooting

Example Kubernetes probe:
```yaml
livenessProbe:
  httpGet:
    path: /health/db
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 60
  timeoutSeconds: 10
```

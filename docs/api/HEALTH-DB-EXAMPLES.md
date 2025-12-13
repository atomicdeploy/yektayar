# Example Output from /health/db Endpoint

## Terminal Console Output (Server Side)

When the endpoint is called, the server logs the following to the terminal:

```
======================================
🏥 Database Health Check - Starting
======================================
🔌 Test 1: Checking database connection...
✅ Database connection test passed (95ms)
📋 Test 2: Checking database tables...
✅ Database tables check passed (142ms) - Found 13 tables
ℹ️  Available tables: users, sessions, settings, appointments, courses, course_enrollments, assessments, assessment_results, message_threads, messages, pages, support_tickets, support_messages, user_preferences
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

## HTTP Response (Client Side)

```json
{
  "timestamp": "2024-12-02T02:46:30.123Z",
  "database": {
    "overall": "healthy",
    "connection": {
      "status": "healthy",
      "duration": 95,
      "error": undefined
    },
    "tables": {
      "status": "healthy",
      "duration": 142,
      "count": 13,
      "tables": [
        "users",
        "sessions",
        "settings",
        "appointments",
        "courses",
        "course_enrollments",
        "assessments",
        "assessment_results",
        "message_threads",
        "messages",
        "pages",
        "support_tickets",
        "support_messages",
        "user_preferences"
      ],
      "error": undefined
    },
    "write": {
      "status": "healthy",
      "duration": 78,
      "error": undefined
    },
    "read": {
      "status": "healthy",
      "duration": 62,
      "error": undefined
    },
    "cleanup": {
      "status": "healthy",
      "duration": 45,
      "error": undefined
    }
  }
}
```

## Example: Connection Failure

### Terminal Console Output
```
======================================
🏥 Database Health Check - Starting
======================================
🔌 Test 1: Checking database connection...
❌ Database connection test failed (5002ms): Database connection timeout
❌ Database connection test FAILED
Error details: Database connection timeout
Possible causes:
  - Database server is not running
  - DATABASE_URL environment variable is incorrect
  - Network connectivity issues
  - Firewall blocking database port
======================================
```

### HTTP Response
```json
{
  "timestamp": "2024-12-02T02:46:30.123Z",
  "database": {
    "overall": "unhealthy",
    "connection": {
      "status": "unhealthy",
      "duration": 5002,
      "error": "Database connection timeout"
    },
    "tables": {
      "status": "unknown",
      "duration": 0,
      "count": 0,
      "tables": [],
      "error": undefined
    },
    "write": {
      "status": "unknown",
      "duration": 0,
      "error": undefined
    },
    "read": {
      "status": "unknown",
      "duration": 0,
      "error": undefined
    },
    "cleanup": {
      "status": "unknown",
      "duration": 0,
      "error": undefined
    }
  },
  "message": "Database connection failed - see logs for details"
}
```

## Example: Write Failure (Read-only Mode)

### Terminal Console Output
```
======================================
🏥 Database Health Check - Starting
======================================
🔌 Test 1: Checking database connection...
✅ Database connection test passed (95ms)
📋 Test 2: Checking database tables...
✅ Database tables check passed (142ms) - Found 13 tables
ℹ️  Available tables: users, sessions, settings, ...
✍️  Test 3: Testing database write operation...
❌ Database write test failed (85ms): permission denied for table settings
❌ Database write test FAILED
Error details: permission denied for table settings
Possible causes:
  - Database is in read-only mode
  - Insufficient permissions for INSERT operations
  - Table constraints violation
  - Disk space full on database server
======================================
```

### HTTP Response
```json
{
  "timestamp": "2024-12-02T02:46:30.123Z",
  "database": {
    "overall": "degraded",
    "connection": {
      "status": "healthy",
      "duration": 95,
      "error": undefined
    },
    "tables": {
      "status": "healthy",
      "duration": 142,
      "count": 13,
      "tables": ["users", "sessions", "..."],
      "error": undefined
    },
    "write": {
      "status": "unhealthy",
      "duration": 85,
      "error": "permission denied for table settings"
    },
    "read": {
      "status": "unknown",
      "duration": 0,
      "error": undefined
    },
    "cleanup": {
      "status": "unknown",
      "duration": 0,
      "error": undefined
    }
  },
  "message": "Database write test failed - database may be read-only"
}
```

## Test Script Output

Running `node tests/scripts/test-health-db.cjs`:

```
🏥 Testing Database Health Check Endpoint
==================================================
Base URL: http://localhost:3000
Endpoint: /health/db
==================================================

📡 Sending request to /health/db...

📥 Response Status: 200 OK

📊 Health Check Results:
==================================================
{
  "timestamp": "2024-12-02T02:46:30.123Z",
  "database": {
    "overall": "healthy",
    "connection": { ... },
    "tables": { ... },
    "write": { ... },
    "read": { ... },
    "cleanup": { ... }
  }
}
==================================================

✅ Overall Status: HEALTHY

📋 Test Results:
  Connection: ✅ healthy (95ms)
  Tables:     ✅ healthy (13 tables, 142ms)
  Write:      ✅ healthy (78ms)
  Read:       ✅ healthy (62ms)
  Cleanup:    ✅ healthy (45ms)

📚 Database Tables:
  - users
  - sessions
  - settings
  - appointments
  - courses
  - course_enrollments
  - assessments
  - assessment_results
  - message_threads
  - messages
  - pages
  - support_tickets
  - support_messages
  - user_preferences

✅ Test completed successfully

💡 Tip: Check the server console for verbose logs
```

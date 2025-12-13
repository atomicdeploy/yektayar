# Database Health Check & Troubleshooting Guide

## Overview

YektaYar includes comprehensive database health check and troubleshooting tools to help developers diagnose and fix database connection and setup issues.

## Quick Start

### 1. Setup PostgreSQL Database

If you haven't set up PostgreSQL yet, run:

```bash
npm run db:setup
```

This will:
- Install PostgreSQL (if not already installed)
- Create the database and user
- Configure access permissions
- Update your `.env` file with credentials

### 2. Initialize Database Tables

After setup, initialize the database schema:

```bash
npm run db:init
```

This will:
- Create all required tables
- Insert default data
- Verify the setup

### 3. Check Database Health

To check if your database is working correctly:

```bash
npm run db:health
```

This will:
- Call the `/health/db` API endpoint
- Show health status and any issues
- Display the JSON response

### 4. Debug Database Issues

If you're experiencing issues, run comprehensive diagnostics:

```bash
npm run db:debug
```

This will show:
- Environment configuration (with masked passwords)
- PostgreSQL service status
- Direct connection test
- Network connectivity check
- Backend startup diagnostics
- Complete health check results

## Available Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:setup` | Install and configure PostgreSQL | First time setup or after system reinstall |
| `npm run db:init` | Initialize database tables and default data | After setup or to reset schema |
| `npm run db:health` | Check database health via API | Regular health checks, CI/CD |
| `npm run db:debug` | Run comprehensive diagnostics | Troubleshooting connection issues |
| `npm run db:cli` | Open interactive database CLI | Manual database queries |

## Health Check Endpoint

### Endpoint: `/health/db`

The health check endpoint performs 5 sequential tests:

1. **Connection Test** - Verifies database connectivity (5s timeout)
2. **Tables Check** - Lists all tables and verifies required ones exist
3. **Write Test** - Tests INSERT permissions
4. **Read Test** - Tests SELECT permissions
5. **Cleanup** - Removes test record

### Response Format

```json
{
  "timestamp": "2024-12-02T02:51:25.967Z",
  "database": {
    "overall": "healthy|degraded|unhealthy|unknown",
    "connection": {
      "status": "healthy",
      "duration": 95,
      "error": undefined
    },
    "tables": {
      "status": "healthy",
      "count": 13,
      "tables": ["users", "sessions", "..."],
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
  },
  "config": {
    "databaseUrl": "postgresql://user:*****@localhost:5432/yektayar",
    "host": "localhost",
    "port": "5432",
    "database": "yektayar",
    "user": "yektayar_user"
  }
}
```

## Troubleshooting Common Issues

### Issue: "Database connection timeout"

**Console Output:**
```
❌ Database connection test failed (5002ms): Database connection timeout
Error details: Database connection timeout

Troubleshooting Steps:
  1. Check if PostgreSQL is installed and running:
     sudo systemctl status postgresql

  2. Verify DATABASE_URL is correct:
     Current: postgresql://user:*****@localhost:5432/yektayar

  3. Test direct database connection:
     psql -h localhost -U yektayar_user -d yektayar

  4. Run database setup if not done:
     npm run db:setup

  5. Initialize database tables:
     npm run db:init

  6. Run comprehensive diagnostics:
     npm run db:debug
```

**Solution:**
1. Run `npm run db:debug` to see detailed diagnostics
2. Check if PostgreSQL is running: `sudo systemctl status postgresql`
3. If not installed, run: `npm run db:setup`
4. Verify your `.env` file has correct credentials

### Issue: "Missing required tables"

**Console Output:**
```
⚠️  Missing required tables: users, sessions, settings
The database may not be fully initialized

Run database initialization:
  npm run db:init
```

**Solution:**
1. Run `npm run db:init` to create tables
2. Check the logs to verify table creation
3. Verify with: `npm run db:health`

### Issue: "Database write test failed"

**Console Output:**
```
❌ Database write test FAILED
Error details: permission denied for table settings
Possible causes:
  - Database is in read-only mode
  - Insufficient permissions for INSERT operations
```

**Solution:**
1. Check database user permissions
2. Re-run setup with proper privileges: `npm run db:setup`
3. Verify user has write access to the database

## Development Workflow

### Daily Development

```bash
# Start the backend (which checks database health on startup)
npm run dev:backend
```

The backend automatically logs database status on startup.

### After Pulling Changes

If database schema has changed:

```bash
npm run db:init
```

### Debugging Connection Issues

```bash
# Step 1: Run comprehensive diagnostics
npm run db:debug

# Step 2: Based on output, run appropriate fix:
npm run db:setup  # If PostgreSQL not configured
npm run db:init   # If tables missing

# Step 3: Verify fix
npm run db:health
```

## Console Logging Examples

### Successful Health Check

```
======================================
🏥 Database Health Check - Starting
======================================
Database Configuration:
  DATABASE_URL: postgresql://yektayar_user:*****@localhost:5432/yektayar
  DB_HOST: localhost
  DB_PORT: 5432
  DB_NAME: yektayar
  DB_USER: yektayar_user
  DB_PASSWORD: *****
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

### Failed Connection

```
======================================
🏥 Database Health Check - Starting
======================================
Database Configuration:
  DATABASE_URL: postgresql://yektayar_user:*****@localhost:5432/yektayar
  DB_HOST: localhost
  DB_PORT: 5432
  DB_NAME: yektayar
  DB_USER: yektayar_user
  DB_PASSWORD: *****
======================================
🔌 Test 1: Checking database connection...
❌ Database connection test failed (5002ms): Connection timeout
❌ Database connection test FAILED
Error details: Connection timeout

Troubleshooting Steps:
  1. Check if PostgreSQL is installed and running:
     sudo systemctl status postgresql

  2. Verify DATABASE_URL is correct:
     Current: postgresql://yektayar_user:*****@localhost:5432/yektayar

  3. Test direct database connection:
     psql -h localhost -U yektayar_user -d yektayar

  4. Run database setup if not done:
     npm run db:setup

  5. Initialize database tables:
     npm run db:init

  6. Run comprehensive diagnostics:
     npm run db:debug
======================================
```

## Using Shell Scripts Directly

All npm commands wrap shell scripts located in `scripts/`:

```bash
# Database setup
bash scripts/setup-postgresql.sh

# Health check with options
bash scripts/db-health.sh check    # API health check
bash scripts/db-health.sh debug    # Comprehensive diagnostics
bash scripts/db-health.sh init     # Initialize tables
bash scripts/db-health.sh setup    # Full PostgreSQL setup

# Database CLI
bash scripts/db-cli.sh
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Setup Database
  run: npm run db:setup

- name: Initialize Database
  run: npm run db:init

- name: Check Database Health
  run: npm run db:health
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health/db || exit 1
```

## Related Documentation

- [Database Setup Script](../scripts/setup-postgresql.sh) - PostgreSQL installation and configuration
- [Database CLI Script](../scripts/db-cli.sh) - Interactive database access
- [Health Check Implementation](../packages/backend/src/routes/health.ts) - API endpoint code
- [API Documentation](./HEALTH-DB-ENDPOINT.md) - Full API reference

## Support

If you continue to experience issues after following this guide:

1. Run `npm run db:debug` and save the output
2. Check the server logs for error details
3. Review the [database setup script](../scripts/setup-postgresql.sh) for manual configuration
4. Open an issue with the diagnostic output

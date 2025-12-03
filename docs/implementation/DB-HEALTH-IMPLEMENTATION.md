# Database Health Check - Implementation Summary

## What Was Done

In response to feedback, I've integrated the existing shell scripts and created comprehensive npm commands for database health checking and troubleshooting.

## Changes Made

### 1. New NPM Commands (package.json)

```json
{
  "db:setup": "bash scripts/setup-postgresql.sh",
  "db:init": "bash scripts/db-health.sh init",
  "db:health": "bash scripts/db-health.sh check",
  "db:debug": "bash scripts/db-health.sh debug"
}
```

### 2. New Shell Script (scripts/db-health.sh)

A comprehensive database health check script with 4 modes:

- **setup** - Runs the existing `setup-postgresql.sh` script
- **init** - Initializes database tables by starting backend briefly
- **check** - Calls the `/health/db` API endpoint
- **debug** - Runs comprehensive diagnostics:
  - Environment configuration (with masked passwords)
  - PostgreSQL service status
  - Direct database connection test
  - Network connectivity check
  - Backend startup diagnostics

### 3. Enhanced Health Endpoint (packages/backend/src/routes/health.ts)

Added detailed logging at the start of health check:

```typescript
// Log environment configuration (masked)
const dbUrl = process.env.DATABASE_URL || 'not set'
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':*****@')
logger.info('Database Configuration:')
logger.info(`  DATABASE_URL: ${maskedUrl}`)
logger.info(`  DB_HOST: ${process.env.DB_HOST || 'not set'}`)
logger.info(`  DB_PORT: ${process.env.DB_PORT || 'not set'}`)
logger.info(`  DB_NAME: ${process.env.DB_NAME || 'not set'}`)
logger.info(`  DB_USER: ${process.env.DB_USER || 'not set'}`)
logger.info(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : 'not set'}`)
```

Enhanced error messages to suggest npm commands:

```typescript
logger.error('Troubleshooting Steps:')
logger.error('  1. Check if PostgreSQL is installed and running:')
logger.error('     sudo systemctl status postgresql')
logger.error('')
logger.error('  2. Verify DATABASE_URL is correct:')
logger.error(`     Current: ${maskedUrl}`)
logger.error('')
logger.error('  3. Test direct database connection:')
logger.error(`     psql -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'user'} -d ${process.env.DB_NAME || 'database'}`)
logger.error('')
logger.error('  4. Run database setup if not done:')
logger.error('     npm run db:setup')
logger.error('')
logger.error('  5. Initialize database tables:')
logger.error('     npm run db:init')
logger.error('')
logger.error('  6. Run comprehensive diagnostics:')
logger.error('     npm run db:debug')
```

Added configuration to API response:

```json
{
  "config": {
    "databaseUrl": "postgresql://user:*****@localhost:5432/yektayar",
    "host": "localhost",
    "port": "5432",
    "database": "yektayar",
    "user": "yektayar_user"
  }
}
```

### 4. Documentation

- `docs/DATABASE-HEALTH-TROUBLESHOOTING.md` - Complete guide with all commands and workflows
- `scripts/db-health-demo.sh` - Interactive demonstration script

## Usage

### First Time Setup

```bash
npm run db:setup    # Install and configure PostgreSQL
npm run db:init     # Create database tables
npm run db:health   # Verify everything works
```

### Troubleshooting Connection Issues

```bash
npm run db:debug    # Run comprehensive diagnostics
```

This shows:
- Environment variables (masked passwords)
- PostgreSQL service status
- Direct connection test results
- Network connectivity
- Backend startup test
- Full health check via API

### Regular Health Check

```bash
npm run db:health   # Quick health check via API
```

### View All Available Commands

```bash
bash scripts/db-health-demo.sh
```

## Example Output

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
✍️  Test 3: Testing database write operation...
✅ Database write test passed (78ms)
📖 Test 4: Testing database read operation...
✅ Database read test passed (62ms)
🧹 Test 5: Cleaning up test record...
✅ Database cleanup completed (45ms)
✅ All database health checks PASSED
======================================
```

### Connection Timeout with Troubleshooting

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

## Integration with Existing Scripts

✅ **Uses setup-postgresql.sh** - The `npm run db:setup` command directly calls the existing script
✅ **Uses db-cli.sh** - The `npm run db:cli` command (already existed) uses the existing script  
✅ **Extended functionality** - New `db-health.sh` script adds health checking and debugging on top of existing infrastructure

## Files Changed

- `package.json` - Added db:setup, db:init, db:health, db:debug commands
- `packages/backend/src/routes/health.ts` - Enhanced logging and error messages
- `scripts/db-health.sh` - New comprehensive health check script (executable)
- `scripts/db-health-demo.sh` - New demonstration script (executable)
- `docs/DATABASE-HEALTH-TROUBLESHOOTING.md` - New comprehensive documentation

## Testing

The enhanced logging provides:
1. Configuration visibility (with masked passwords)
2. Step-by-step troubleshooting commands
3. Direct suggestions for npm commands to run
4. Complete diagnostic information via `npm run db:debug`

This makes it easy for developers to identify and fix database connection issues on their machine.

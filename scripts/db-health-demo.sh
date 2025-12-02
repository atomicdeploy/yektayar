#!/bin/bash

# ==============================================================================
# Database Health Check Demonstration
# ==============================================================================
# This script demonstrates the new database health check commands
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   YektaYar Database Health Check - Usage Demo             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${MAGENTA}Available Database Commands:${NC}"
echo ""
echo -e "${GREEN}1. npm run db:setup${NC}"
echo "   Install and configure PostgreSQL"
echo "   - Installs PostgreSQL 15+"
echo "   - Creates database and user"
echo "   - Configures permissions"
echo "   - Updates .env file"
echo ""

echo -e "${GREEN}2. npm run db:init${NC}"
echo "   Initialize database schema"
echo "   - Creates all tables"
echo "   - Inserts default data"
echo "   - Verifies setup"
echo ""

echo -e "${GREEN}3. npm run db:health${NC}"
echo "   Check database health"
echo "   - Calls /health/db API endpoint"
echo "   - Shows connection status"
echo "   - Displays test results"
echo "   - Returns exit code (0=healthy, 1=degraded, 2=unhealthy)"
echo ""

echo -e "${GREEN}4. npm run db:debug${NC}"
echo "   Comprehensive diagnostics"
echo "   - Environment configuration"
echo "   - PostgreSQL service status"
echo "   - Direct connection test"
echo "   - Network connectivity"
echo "   - Backend startup test"
echo "   - Full health check"
echo ""

echo -e "${GREEN}5. npm run db:cli${NC}"
echo "   Interactive database CLI"
echo "   - Opens pgcli or psql"
echo "   - Uses credentials from .env"
echo "   - Direct database access"
echo ""

echo -e "${MAGENTA}Common Workflows:${NC}"
echo ""

echo -e "${CYAN}First Time Setup:${NC}"
echo "  $ npm run db:setup    # Install PostgreSQL"
echo "  $ npm run db:init     # Create tables"
echo "  $ npm run db:health   # Verify setup"
echo ""

echo -e "${CYAN}Troubleshooting Connection Issues:${NC}"
echo "  $ npm run db:debug    # See detailed diagnostics"
echo "  $ npm run db:health   # Quick health check"
echo ""

echo -e "${CYAN}After Schema Changes:${NC}"
echo "  $ npm run db:init     # Recreate tables"
echo "  $ npm run db:health   # Verify"
echo ""

echo -e "${CYAN}Manual Database Access:${NC}"
echo "  $ npm run db:cli      # Open interactive shell"
echo ""

echo -e "${MAGENTA}Example Output - Successful Health Check:${NC}"
echo ""
cat << 'EOF'
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
ℹ️  Available tables: users, sessions, settings, ...
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
EOF
echo ""

echo -e "${MAGENTA}Example Output - Connection Timeout:${NC}"
echo ""
cat << 'EOF'
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
EOF
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   For more information, see:                               ║${NC}"
echo -e "${BLUE}║   docs/DATABASE-HEALTH-TROUBLESHOOTING.md                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

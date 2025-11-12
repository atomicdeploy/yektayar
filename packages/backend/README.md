# YektaYar Backend API

## Overview

The YektaYar Backend API is built with Elysia.js and provides REST and WebSocket endpoints for the mental health care platform.

## Features

- RESTful API endpoints
- WebSocket support for real-time features
- PostgreSQL database integration
- Automatic database connection verification
- Table existence validation on startup
- Session management
- Authentication and authorization

## Prerequisites

- Node.js 20.x or Bun runtime
- PostgreSQL 15+
- Environment variables configured (see `.env.example`)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Individual database parameters (fallback if DATABASE_URL not set)
- `PORT` - Server port (default: 3000)
- `HOST` - Server hostname (default: localhost)

### 3. Verify Database Connection

Before starting the server, you can verify your database connection and check which tables exist:

```bash
npm run verify-db
```

This will:
- Connect to the database using your `.env` configuration
- Check for required tables (users, sessions, permissions, roles, etc.)
- List missing tables
- Provide a detailed report

### 4. Start the Server

**For development (with Bun):**
```bash
npm run dev
```

**For production (with Node.js):**
```bash
npm run build
npm start
```

## Database Connection Verification

### Automatic Verification on Startup

When the backend server starts, it automatically:

1. **Connects to the database** - Verifies the connection using environment variables
2. **Verifies required tables** - Checks that all critical tables exist
3. **Reports status** - Displays connection status and missing tables

#### Example Startup Output (No Database):

```
🔄 Initializing YektaYar API Server...

❌ Failed to connect to database: ECONNREFUSED
❌ Failed to initialize database: Error: Database connection failed
⚠️  Server will start but database features will be unavailable.
   Please check your database configuration in .env file

🚀 YektaYar API Server running at http://localhost:3000
```

#### Example Startup Output (Database Connected):

```
🔄 Initializing YektaYar API Server...

✅ Database connection established successfully
✅ All 6 required tables exist (17/17 total tables found)
📊 Found 17 existing tables

🚀 YektaYar API Server running at http://localhost:3000
```

#### Example Startup Output (Missing Tables):

```
🔄 Initializing YektaYar API Server...

✅ Database connection established successfully
⚠️  Missing 3 required table(s): users, sessions, permissions
⚠️  Some features may not work correctly until all required tables are created.
📊 Found 3 existing tables
⚠️  Missing 3 required tables: users, sessions, permissions

🚀 YektaYar API Server running at http://localhost:3000
```

### Manual Verification Script

You can manually verify database tables at any time:

```bash
npm run verify-db
```

This script provides a detailed report including:
- Connection status
- List of existing tables with descriptions
- List of missing required tables
- List of missing optional tables

#### Example Output:

```
🔍 Starting database verification...

✅ Database connection established successfully

============================================================
📊 DATABASE TABLE VERIFICATION REPORT
============================================================

✅ All 6 required tables exist (6/17 total tables found)

✅ Existing Tables:
   - users (User accounts and profile information)
   - sessions (User sessions and authentication tokens)
   - user_identifiers (User identification methods)
   - user_groups (User role groups)
   - permissions (System permissions)
   - roles (User roles and their permissions)

⚠️  Missing Optional Tables:
   - messages (Direct messages between users)
   - appointments (Scheduled appointments)
   - courses (Educational courses)
   ... (and more)

Note: These tables are optional but some features may be unavailable.

============================================================
```

## Database Schema

### Required Tables

The following tables are **required** for the application to function:

1. **users** - User accounts and profile information
2. **sessions** - User sessions and authentication tokens
3. **user_identifiers** - User identification methods (phone, email)
4. **user_groups** - User role groups (admin, therapist, client)
5. **permissions** - System permissions
6. **roles** - User roles and their permissions

### Optional Tables

The following tables are **optional** but enable additional features:

- **messages** - Direct messages between users
- **message_threads** - Message conversation threads
- **participants** - Thread participants
- **appointments** - Scheduled appointments
- **courses** - Educational courses
- **enrollments** - User course enrollments
- **progress** - User course progress tracking
- **assessments** - Mental health assessments
- **assessment_results** - Assessment results and scores
- **payments** - Payment records
- **transactions** - Financial transactions

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### API Documentation

```
GET /swagger
```

Interactive API documentation using Swagger UI.

### Authentication

- `POST /api/auth/acquire-session` - Get an anonymous session token
- `GET /api/auth/session` - Validate a session token
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout and invalidate session

## Development

### Project Structure

```
packages/backend/
├── src/
│   ├── db/                    # Database connection and utilities
│   │   ├── connection.ts      # Database connection module
│   │   ├── schema.ts          # Table definitions
│   │   ├── verify-tables.ts   # Table verification logic
│   │   └── index.ts           # Module exports
│   ├── routes/                # API route handlers
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── messages.ts
│   │   └── ...
│   ├── services/              # Business logic
│   │   └── sessionService.ts
│   ├── websocket/             # WebSocket handlers
│   │   └── socketServer.ts
│   ├── scripts/               # Utility scripts
│   │   └── verify-database.ts # Database verification script
│   └── index.ts               # Main entry point
├── dist/                      # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env                       # Environment variables (not in git)
```

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Running Tests

```bash
npm test
```

(Note: Tests not yet implemented)

### Linting

```bash
npm run lint
```

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U postgres -c "\l"`
4. Check firewall/network settings

**Problem:** Missing required tables

**Solution:**
1. Run `npm run verify-db` to see which tables are missing
2. Create the missing tables using migrations (when implemented)
3. Or manually create them using SQL scripts in `src/db/schema.ts`

### Runtime Issues

**Problem:** `Bun is not defined` error when using Node.js

**Solution:**
The application is designed to run with Bun runtime. If using Node.js, some features may need adaptation.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](../../LICENSE) for details.

# Database Setup

This directory contains the database schema and migrations for the YektaYar backend.

## Prerequisites

- PostgreSQL 15+
- Database connection configured in `.env` file

## Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE yektayar;

# Create user (optional)
CREATE USER yektayar_user WITH PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE yektayar TO yektayar_user;
```

### 2. Configure Environment

Update your `.env` file with the database connection details:

```env
DATABASE_URL=postgresql://yektayar_user:your_secure_password_here@localhost:5432/yektayar
```

### 3. Run Migrations

```bash
# Run all migrations
psql -U yektayar_user -d yektayar -f src/db/schema.sql

# Or run individual migrations
psql -U yektayar_user -d yektayar -f src/db/migrations/001_create_sessions_table.sql
```

## Schema

### Sessions Table

Stores session information for both anonymous and authenticated users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| token | TEXT | JWT token (unique) |
| user_id | UUID | User ID (NULL for anonymous sessions) |
| is_logged_in | BOOLEAN | Authentication status |
| metadata | JSONB | Additional session metadata |
| created_at | TIMESTAMP | Session creation time |
| expires_at | TIMESTAMP | Session expiration time |
| last_activity_at | TIMESTAMP | Last activity timestamp |
| ip_address | TEXT | Client IP address |
| user_agent | TEXT | Client user agent |

### Indexes

- `idx_sessions_token`: Fast token lookups
- `idx_sessions_user_id`: User session queries
- `idx_sessions_expires_at`: Cleanup of expired sessions
- `idx_sessions_created_at`: Session history queries

## Maintenance

### Clean Up Expired Sessions

```sql
DELETE FROM sessions WHERE expires_at < NOW();
```

Or use the backend API endpoint (TODO: implement cleanup endpoint).

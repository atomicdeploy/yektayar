# Environment Configuration Guide

This document explains how environment variables are managed in the YektaYar platform.

## Unified .env File

YektaYar uses a **unified `.env` file** at the project root instead of separate `.env` files for each package. This simplifies configuration management and ensures consistency across all services.

### Location

```
yektayar/
├── .env                    # Main environment file (created from .env.example)
├── .env.example            # Template with all required variables
└── packages/
    ├── backend/            # Uses root .env automatically
    ├── admin-panel/        # Uses root .env automatically
    └── mobile-app/         # Uses root .env automatically
```

## Quick Start

### Initial Setup

Use the environment management script to create your `.env` file:

```bash
# Create .env from template
./scripts/manage-env.sh init

# Edit in interactive mode (TUI)
./scripts/manage-env.sh edit

# Or edit manually
nano .env
```

### Validate Configuration

Check that all required variables are properly set:

```bash
# Validate all variables
./scripts/manage-env.sh validate

# Test configuration including database
./scripts/manage-env.sh test
```

### View Configuration

Display current configuration with sensitive values masked:

```bash
./scripts/manage-env.sh show
```

## How It Works

### Backend (Bun Runtime)

Bun automatically loads `.env` files from:
1. Current directory (`packages/backend/.env`)
2. Parent directories (up to project root)

Since we place `.env` at the root, it's automatically loaded when running the backend.

**Example:**
```bash
cd packages/backend
bun run dev  # Automatically loads ../../.env
```

### Frontend (Vite - Admin Panel & Mobile App)

Vite automatically loads `.env` files from the project root. Only variables prefixed with `VITE_` are exposed to the frontend code.

**Example:**
```bash
cd packages/admin-panel
npm run dev  # Automatically loads ../../.env
```

**Frontend Variables:**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_ENVIRONMENT` - Environment name (development/production)

### Environment-Specific Files

While not currently used, you can create environment-specific overrides:

- `.env` - Default values (used in development)
- `.env.local` - Local overrides (git-ignored)
- `.env.production` - Production values (can be committed)

Priority order: `.env.local` > `.env.production` > `.env`

## Environment Variables

### Backend Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `3000` | Backend API server port |
| `HOST` | Yes | `localhost` | Server hostname/interface |
| `NODE_ENV` | Yes | `development` | Node environment |

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Full PostgreSQL connection URL |
| `DB_HOST` | Yes | `localhost` | Database host |
| `DB_PORT` | Yes | `5432` | Database port |
| `DB_NAME` | Yes | `yektayar` | Database name |
| `DB_USER` | Yes | - | Database user |
| `DB_PASSWORD` | Yes | - | Database password (must be secure) |

### Security Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | Yes | - | Session secret key (must be secure) |
| `JWT_SECRET` | Yes | - | JWT signing key (must be secure) |
| `JWT_EXPIRY` | Yes | `7d` | JWT expiration time |

**Generate secure secrets:**
```bash
./scripts/manage-env.sh generate-secret
```

### CORS & Networking

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | Yes | - | Allowed CORS origins (comma-separated) |
| `WEBSOCKET_PORT` | Yes | `3001` | WebSocket server port |

### Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RATE_LIMIT_WINDOW` | Yes | `15` | Rate limit window (minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Yes | `100` | Max requests per window |

### Frontend Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | `http://localhost:3000` | Backend API base URL |
| `VITE_ENVIRONMENT` | Yes | `development` | Environment name |

### Optional API Keys

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_API_KEY` | No | - | AI service API key (future use) |
| `SMS_GATEWAY_API_KEY` | No | - | SMS gateway key (future use) |
| `EMAIL_API_KEY` | No | - | Email service key (future use) |

## Management Script

The `manage-env.sh` script provides comprehensive environment management:

### Commands

```bash
# Create .env from template
./scripts/manage-env.sh init

# Show current configuration (with masked secrets)
./scripts/manage-env.sh show

# Validate all required variables
./scripts/manage-env.sh validate

# Test configuration + database connectivity
./scripts/manage-env.sh test

# Interactive TUI mode
./scripts/manage-env.sh edit

# Generate secure random secret
./scripts/manage-env.sh generate-secret

# Show help
./scripts/manage-env.sh help
```

### Features

- ✅ Creates `.env` from template
- ✅ Validates required variables
- ✅ Checks for placeholder values
- ✅ Tests database connectivity
- ✅ Interactive TUI (requires `whiptail` or `dialog`)
- ✅ Secure secret generation
- ✅ Masks sensitive values in output

## Best Practices

### Development

1. **Never commit** `.env` file to git
2. **Always use** `.env.example` as template
3. **Generate secure secrets** for SESSION_SECRET and JWT_SECRET
4. **Use strong passwords** for database credentials
5. **Validate configuration** before running services

### Production

1. **Use different secrets** than development
2. **Set production URLs** for frontend (`VITE_API_BASE_URL`)
3. **Use production database** with strong password
4. **Enable HTTPS** and update CORS origins
5. **Review all settings** before deployment

### Security

1. **Never share** your `.env` file
2. **Rotate secrets** periodically
3. **Use strong passwords** (minimum 32 characters)
4. **Limit CORS origins** to trusted domains only
5. **Keep backups** of production `.env` securely

## Troubleshooting

### .env Not Found

```bash
# Create from template
./scripts/manage-env.sh init
```

### Variables Not Loading

Check that:
1. `.env` exists in project root
2. Variable names are correct
3. No syntax errors in `.env`
4. Running from correct directory

### Validation Errors

```bash
# Show which variables are missing/incorrect
./scripts/manage-env.sh validate

# Fix issues in .env
nano .env

# Validate again
./scripts/manage-env.sh validate
```

### Database Connection Failed

```bash
# Test database connectivity
./scripts/manage-env.sh test

# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials
./scripts/manage-env.sh show
```

## Migration from Old Setup

If you have existing `.env` files in package directories:

```bash
# Backup existing files
cp packages/backend/.env packages/backend/.env.backup
cp packages/mobile-app/.env packages/mobile-app/.env.backup

# Create unified .env at root
./scripts/manage-env.sh init

# Manually merge your settings into root .env
nano .env

# Validate
./scripts/manage-env.sh validate

# Test
./scripts/manage-env.sh test

# Remove old .env files (optional)
rm packages/backend/.env
rm packages/mobile-app/.env
```

## Additional Resources

- [Scripts Documentation](scripts/README.md)
- [Quick Start Guide](QUICK-START.md)
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](docs/UBUNTU-24-DEPLOYMENT.md)

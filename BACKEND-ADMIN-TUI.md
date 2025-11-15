# Backend Administration TUI

A comprehensive Text User Interface (TUI) for managing and administering the YektaYar backend, including session management, user administration, and system monitoring.

## Overview

The Backend Administration TUI provides a command-line interface for backend administration tasks without requiring web API access. It directly connects to the database and provides an interactive menu system for common administrative operations.

## Features

### Session Management
- **List Sessions**: View all sessions with filtering options (all, active, expired, logged-in)
- **View Session Details**: Detailed information about a specific session including user info and metadata
- **Delete Sessions**: Remove individual sessions
- **Cleanup Expired Sessions**: Batch removal of all expired sessions
- **Session Statistics**: Overview of session counts, activity, and trends

### User Management
- **List Users**: View all registered users with their status
- **View User Details**: Detailed user information including profile data and active sessions

### System Administration
- **Database Connection Status**: Check database connectivity and view server information
- **System Health Check**: Monitor database tables, record counts, and identify issues

## Usage

### Running from Root Directory
```bash
npm run admin:tui
```

### Running from Backend Directory
```bash
cd packages/backend
npm run admin:tui
```

### Direct Execution
```bash
npx tsx packages/backend/src/cli/admin-tui.ts
```

## Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL database configured and accessible
- Valid `DATABASE_URL` environment variable in `.env` file

## Environment Configuration

Ensure your `.env` file contains the database connection string:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/yektayar
```

## Interactive Menu

Once launched, the TUI presents an interactive menu with the following options:

### Session Management Commands
- **1** - List all sessions
- **2** - List active sessions
- **3** - List expired sessions
- **4** - List logged-in sessions
- **5** - View session details
- **6** - Delete session
- **7** - Cleanup expired sessions
- **8** - Session statistics

### User Management Commands
- **9** - List users
- **10** - View user details

### System Commands
- **11** - Database connection status
- **12** - System health check

### Utility Commands
- **h** - Show help menu
- **q** - Quit the application

## Example Workflows

### Viewing Active Sessions
1. Run the TUI: `npm run admin:tui`
2. Enter command: `2` (List active sessions)
3. Review the list of active sessions with their details
4. Optionally view details of a specific session: `5`, then enter session ID

### Cleaning Up Expired Sessions
1. Run the TUI: `npm run admin:tui`
2. Enter command: `7` (Cleanup expired sessions)
3. Confirm the cleanup operation
4. View statistics: `8` to verify cleanup

### Managing Users
1. Run the TUI: `npm run admin:tui`
2. Enter command: `9` (List users)
3. Note the user ID you want to view
4. Enter command: `10`, then enter the user ID
5. Review detailed user information

### System Health Monitoring
1. Run the TUI: `npm run admin:tui`
2. Enter command: `12` (System health check)
3. Review database tables, record counts, and warnings
4. Address any issues identified

## Features in Detail

### Session List Display
The session list shows:
- Session ID
- Token (truncated for security)
- Associated User ID
- Login status
- Creation time (relative)
- Current status (Active/Expired)

### Session Details
Detailed session view includes:
- Full token
- Current status
- Login state
- User information (if logged in)
  - User ID, name, email, type
- Timestamps
  - Creation time
  - Expiration time
  - Last activity
- Metadata (device info, IP, user agent)

### User Details
User view includes:
- User ID and name
- Email and phone
- Account type (patient, psychologist, admin)
- Active status
- Biography and specialization (if applicable)
- Creation and update timestamps
- Count of active sessions

### Session Statistics
Statistics dashboard shows:
- Total session count
- Active vs expired sessions
- Logged-in vs anonymous sessions
- Sessions created today
- Sessions created this week

### System Health
Health check displays:
- Number of database tables
- List of all tables
- Record counts for main tables (users, sessions, appointments, courses)
- Warnings for issues requiring attention

## Technical Details

### Architecture
- **Direct Database Access**: Bypasses REST API for administrative tasks
- **TypeScript**: Written in TypeScript for type safety
- **tsx Runtime**: Uses tsx for direct TypeScript execution
- **postgres Library**: Direct PostgreSQL access using the `postgres` library
- **Colored Output**: ANSI color codes and emojis for better UX

### Database Queries
The TUI uses optimized SQL queries including:
- Filtered session queries with date comparisons
- JOIN operations for user-session relationships
- Aggregate functions for statistics
- System catalog queries for metadata

### Security Considerations
- **No Web Exposure**: Runs locally, no HTTP server required
- **Direct Database Access**: Requires database credentials
- **Token Truncation**: Sensitive tokens are truncated in list views
- **Confirmation Prompts**: Destructive operations require confirmation

## Error Handling

The TUI handles common errors gracefully:
- **Database Connection Failures**: Clear error messages with troubleshooting tips
- **Invalid Input**: Validation and friendly error messages
- **Missing Records**: Informative messages when resources aren't found
- **Query Errors**: Database error messages with context

## Comparison with Web API

### TUI Advantages
- ✅ No authentication required (uses direct DB access)
- ✅ No network overhead
- ✅ Batch operations (cleanup)
- ✅ System-level statistics
- ✅ Raw database access for troubleshooting

### Web API Advantages
- ✅ Remote access possible
- ✅ Built-in authentication and authorization
- ✅ Rate limiting and access control
- ✅ Audit logging
- ✅ Suitable for automated scripts

## Best Practices

1. **Regular Cleanup**: Run session cleanup periodically to maintain database health
2. **Monitor Statistics**: Check session statistics to understand usage patterns
3. **Verify Health**: Run health checks before and after major operations
4. **Review Sessions**: Periodically review active sessions for anomalies
5. **Backup First**: Consider database backups before bulk operations

## Troubleshooting

### "Failed to connect to database"
- Verify `DATABASE_URL` in `.env` file
- Check if PostgreSQL is running
- Ensure database credentials are correct
- Check network connectivity to database server

### "Cannot find module"
- Run `npm install` in the backend directory
- Ensure `tsx` is installed as a dev dependency
- Check Node.js version (18+ required)

### "Permission denied"
- Ensure the script is executable: `chmod +x packages/backend/src/cli/admin-tui.ts`
- Check database user permissions

### Session Operations Not Working
- Verify sessions table exists in database
- Check if database was properly initialized
- Run system health check (command 12) for diagnostics

## Relationship to Elysia.js

**Note**: Elysia.js is a web framework and does not natively support CLI commands like some frameworks (e.g., Laravel Artisan, Django management commands). This TUI is implemented as a standalone TypeScript script that:

- Uses the same database service modules as the web backend
- Shares code with the Elysia.js application (database, services)
- Runs independently without starting the web server
- Can be executed alongside the running backend server

This approach provides CLI functionality while maintaining code reuse with the main Elysia.js application.

## Future Enhancements

Potential future additions:
- Bulk user operations (activate/deactivate multiple users)
- Session search and filtering by metadata
- Export session/user data to CSV/JSON
- Scheduled session cleanup (cron-like)
- User password reset functionality
- Advanced analytics and reporting
- Database backup/restore commands
- Configuration management

## See Also

- [Backend Development Guide](DEVELOPMENT.md)
- [Database Structure](DATABASE-STRUCTURE.md)
- [Session Management](FIX-ACQUIRE-SESSION-404.md)
- [Socket.IO TUI](scripts/socketio-tui.js) - Similar TUI for WebSocket testing
- [AI TUI](scripts/pollination-ai-tui.js) - Similar TUI for AI testing

## Contributing

When adding new features to the TUI:
1. Follow the existing code structure and patterns
2. Add appropriate error handling
3. Include help text in the menu
4. Update this documentation
5. Test with various database states (empty, populated, with errors)
6. Ensure graceful handling of Ctrl+C interruption

## License

This tool is part of the YektaYar platform and follows the same license as the main project.

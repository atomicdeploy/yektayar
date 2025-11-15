# Backend CLI Tools

This directory contains command-line interface (CLI) tools for backend administration and management.

## Available Tools

### 1. Administration TUI (`admin-tui.ts`)

An interactive Text User Interface for backend administration, including session management, user management, and system monitoring.

**Usage:**
```bash
# From root directory
npm run admin:tui

# From backend directory
npm run admin:tui

# Direct execution
npx tsx src/cli/admin-tui.ts
```

**Features:**
- Session management (list, view, delete, cleanup)
- User management (list, view details)
- Database health checks
- System statistics
- Interactive menu interface

**Documentation:** See [BACKEND-ADMIN-TUI.md](../../../BACKEND-ADMIN-TUI.md) for detailed usage guide.

## Adding New CLI Tools

To add a new CLI tool:

1. Create a new TypeScript file in this directory
2. Add the shebang at the top: `#!/usr/bin/env -S npx tsx`
3. Make it executable: `chmod +x src/cli/your-tool.ts`
4. Add a script entry in `package.json`:
   ```json
   "scripts": {
     "your-tool": "npx tsx src/cli/your-tool.ts"
   }
   ```
5. Document the tool in this README

## CLI Tool Guidelines

When creating CLI tools:

1. **Use shared services**: Import and use existing service modules (database, session, etc.)
2. **Error handling**: Provide clear error messages and graceful failure
3. **User feedback**: Use colored output and emojis for better UX (see admin-tui.ts for examples)
4. **Interactive prompts**: Use readline for user input when appropriate
5. **Cleanup**: Handle SIGINT/SIGTERM for graceful shutdown
6. **Documentation**: Add usage examples and feature descriptions
7. **Environment**: Load environment variables from `.env`

## Technical Notes

### Elysia.js and CLI

Elysia.js is a web framework and does not natively support CLI commands like some frameworks (e.g., Laravel Artisan, Django management commands). Our CLI tools are implemented as:

- Standalone TypeScript scripts
- Share code with the main Elysia.js application
- Run independently without starting the web server
- Can execute alongside the running server

### Runtime Support

CLI tools use `tsx` for TypeScript execution, which works with both:
- Node.js runtime
- Bun runtime

### Direct Database Access

CLI tools bypass the REST API and connect directly to the database using:
- The same database service (`services/database.ts`)
- Environment variables from `.env`
- PostgreSQL connection via the `postgres` library

## Examples

### Simple CLI Tool Template

```typescript
#!/usr/bin/env -S npx tsx

import { config } from 'dotenv'
import { getDatabase, closeDatabase } from '../services/database.js'

// Load environment variables
config({ path: '../../../../.env' })

async function main() {
  try {
    const db = getDatabase()
    
    // Your CLI logic here
    console.log('✅ Success!')
    
    await closeDatabase()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
```

### Interactive Menu Template

See `admin-tui.ts` for a comprehensive example of:
- Interactive menu system
- Colored output with ANSI codes
- User input handling
- Multiple command processing
- Graceful shutdown

## See Also

- [Backend Administration TUI Guide](../../../BACKEND-ADMIN-TUI.md)
- [Development Guide](../../../DEVELOPMENT.md)
- [Backend Development](../../../DEVELOPMENT.md#backend-development)

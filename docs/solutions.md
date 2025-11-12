# Error Solutions

This file contains solutions for various errors that may occur in the YektaYar application.
These solutions are only included in development builds.

## API_BASE_URL

### Problem
The application cannot start because the API_BASE_URL or VITE_API_BASE_URL environment variable is not configured.

### Solution

You can fix this by running the environment setup script:

```bash
./scripts/manage-env.sh
```

Or manually create/update your `.env` file with:

```bash
API_BASE_URL=http://localhost:3000
```

**Note:** After updating the environment variables, you need to restart the development server for changes to take effect.

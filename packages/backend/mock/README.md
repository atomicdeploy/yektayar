# Mock Data Directory

This directory contains mock/seed data for the YektaYar backend database.

## Files

- **users.json**: Mock user data for initial database seeding and testing purposes

## Usage

The mock data in this directory is used by:

1. **Database Seeding**: When running `npm run db:init` or when the server starts for the first time, the data from `users.json` will be automatically loaded into the database if the users table is empty.

2. **Testing**: This data can be used as fixtures for automated tests.

3. **Development**: Provides consistent test data for development purposes.

## Format

### users.json

Contains an array of user objects with the following structure:

```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "admin | psychologist | user | moderator",
  "status": "active | inactive | blocked",
  "createdAt": "ISO 8601 timestamp"
}
```

## Adding New Mock Data

When adding new mock data files:

1. Create a new JSON file in this directory
2. Update the seeding logic in `/src/db/migrate.ts` to load the new data
3. Document the file format in this README

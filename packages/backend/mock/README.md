# Mock Data Directory

This directory contains mock/seed data for the YektaYar backend database.

## Files

- **users.json**: Mock user data for initial database seeding and testing purposes

## Usage

The mock data in this directory can be used for:

1. **Database Seeding**: When running the server for the first time, data from `users.json` can be loaded into the database if the users table is empty.

2. **Testing**: This data can be used as fixtures for automated tests.

3. **Development**: Provides consistent test data for development purposes.

## Format

### users.json

Contains an array of user objects with the following structure:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "type": "admin | psychologist | patient",
  "bio": "string | null",
  "specialization": "string | null (psychologist only)",
  "passwordHash": "string (bcrypt hash)"
}
```

## Adding Seed Data

To add seed data functionality:

1. Import the JSON file in your database initialization
2. Check if the table is empty before seeding
3. Insert records using the appropriate service methods

Example:
```typescript
import mockUsers from './mock/users.json'
import { createUser } from './services/userService'

if (userCount === 0) {
  for (const userData of mockUsers) {
    await createUser(userData)
  }
}
```

## Note

The password hashes in this file are example bcrypt hashes and should be regenerated for production use.

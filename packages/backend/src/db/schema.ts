/**
 * Database schema definitions
 * Based on the architecture documentation in docs/ARCHITECTURE.md
 */

export interface TableDefinition {
  name: string
  description: string
  required: boolean // Whether this table must exist for the app to function
}

/**
 * Core tables required for the application to function
 */
export const REQUIRED_TABLES: TableDefinition[] = [
  {
    name: 'users',
    description: 'User accounts and profile information',
    required: true,
  },
  {
    name: 'sessions',
    description: 'User sessions and authentication tokens',
    required: true,
  },
  {
    name: 'user_identifiers',
    description: 'User identification methods (phone, email)',
    required: true,
  },
  {
    name: 'user_groups',
    description: 'User role groups (admin, therapist, client)',
    required: true,
  },
  {
    name: 'permissions',
    description: 'System permissions',
    required: true,
  },
  {
    name: 'roles',
    description: 'User roles and their permissions',
    required: true,
  },
]

/**
 * Optional tables that enhance functionality but aren't critical for startup
 */
export const OPTIONAL_TABLES: TableDefinition[] = [
  {
    name: 'messages',
    description: 'Direct messages between users',
    required: false,
  },
  {
    name: 'message_threads',
    description: 'Message conversation threads',
    required: false,
  },
  {
    name: 'participants',
    description: 'Thread participants',
    required: false,
  },
  {
    name: 'appointments',
    description: 'Scheduled appointments',
    required: false,
  },
  {
    name: 'courses',
    description: 'Educational courses',
    required: false,
  },
  {
    name: 'enrollments',
    description: 'User course enrollments',
    required: false,
  },
  {
    name: 'progress',
    description: 'User course progress tracking',
    required: false,
  },
  {
    name: 'assessments',
    description: 'Mental health assessments',
    required: false,
  },
  {
    name: 'assessment_results',
    description: 'Assessment results and scores',
    required: false,
  },
  {
    name: 'payments',
    description: 'Payment records',
    required: false,
  },
  {
    name: 'transactions',
    description: 'Financial transactions',
    required: false,
  },
]

/**
 * All tables in the system
 */
export const ALL_TABLES: TableDefinition[] = [
  ...REQUIRED_TABLES,
  ...OPTIONAL_TABLES,
]

/**
 * SQL to create the sessions table (most critical for current functionality)
 */
export const CREATE_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER,
  is_logged_in BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`

/**
 * SQL to create the users table
 */
export const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  profile_picture TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`

/**
 * SQL to create basic permission tables
 */
export const CREATE_PERMISSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

export const CREATE_ROLES_TABLE = `
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

export const CREATE_USER_GROUPS_TABLE = `
CREATE TABLE IF NOT EXISTS user_groups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE (user_id, role_id)
);
`

export const CREATE_USER_IDENTIFIERS_TABLE = `
CREATE TABLE IF NOT EXISTS user_identifiers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  identifier_type VARCHAR(20) NOT NULL, -- 'email', 'phone', 'username'
  identifier_value VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (identifier_type, identifier_value)
);
`

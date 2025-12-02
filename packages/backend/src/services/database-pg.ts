/**
 * PostgreSQL Database Service using pg library
 * Using pg library instead of postgres for better Bun compatibility
 * 
 * Note: The postgres library (postgres-js) has a known bug in Bun 1.1.35+ where
 * queries hang indefinitely in HTTP request handlers while working at startup.
 * See: https://github.com/oven-sh/bun/issues/15438
 */

import { Pool, PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import { logger } from '@yektayar/shared'

// Initialize PostgreSQL connection using pg library
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar'

let pool: Pool | null = null

/**
 * Get database connection pool
 * Using pg library for better Bun compatibility
 */
export function getPool() {
  if (!pool) {
    logger.info(`Initializing PostgreSQL pool (pg library) to ${DATABASE_URL.replace(/:([^:@]+)@/, ':*****@')}`)
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 20000, // 20 seconds before idle connection is closed
      connectionTimeoutMillis: 10000, // 10 seconds to wait for connection
    })
    
    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', err)
    })
    
    logger.info('PostgreSQL connection pool initialized (pg library)')
  }
  return pool
}

/**
 * Execute a query with automatic client management
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

/**
 * Tagged template SQL function for backward compatibility with postgres library syntax
 * Converts tagged template calls to parameterized queries
 */
export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> & { unsafe?: (query: string, params: any[]) => Promise<any[]> } {
  // For immediate execution, return a thenable with the query
  const queryText = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : '')
  }, '')
  
  return query(queryText, values)
}

// Make sql callable with unsafe for dynamic queries
sql.unsafe = (queryText: string, params: any[]) => {
  return query(queryText, params)
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool()
  return await pool.connect()
}

/**
 * Initialize database tables
 */
export async function initializeDatabase() {
  const pool = getPool()

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255),
        type VARCHAR(50) NOT NULL DEFAULT 'patient',
        avatar VARCHAR(500),
        bio TEXT,
        specialization VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_logged_in BOOLEAN DEFAULT false,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        psychologist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create settings table  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        type VARCHAR(50) NOT NULL DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    logger.success('Database tables initialized successfully')

    // Check if admin user exists
    const adminResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@yektayar.ir']
    )

    if (adminResult.rows.length === 0) {
      // Create default admin user
      const password = process.env.ADMIN_PASSWORD || 'admin123'
      const passwordHash = await bcrypt.hash(password, 10)

      await pool.query(
        `INSERT INTO users (email, name, password_hash, type, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin@yektayar.ir', 'Admin User', passwordHash, 'admin', true]
      )

      logger.success('Default admin user created: admin@yektayar.ir')
      logger.warn(`Default admin password: ${password} - PLEASE CHANGE THIS!`)
    }
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Close the database pool
 */
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
    logger.info('PostgreSQL connection pool closed')
  }
}

// For backward compatibility with existing code using getDatabase()
// Returns sql tagged template function
export function getDatabase() {
  getPool() // Ensure pool is initialized
  return sql
}

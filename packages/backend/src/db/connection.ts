import postgres from 'postgres'

let sql: postgres.Sql | null = null

/**
 * Get database connection configuration from environment variables
 */
function getDatabaseConfig(): string | postgres.Options<{}> {
  const databaseUrl = process.env.DATABASE_URL
  
  if (databaseUrl) {
    return databaseUrl
  }

  // Fallback to individual connection parameters
  const host = process.env.DB_HOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || '5432', 10)
  const database = process.env.DB_NAME || 'yektayar'
  const username = process.env.DB_USER || 'yektayar_user'
  const password = process.env.DB_PASSWORD || ''

  return {
    host,
    port,
    database,
    username,
    password,
    // Connection pool settings
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  } as postgres.Options<{}>
}

/**
 * Initialize database connection
 * @throws Error if connection cannot be established
 */
export async function initializeDatabase(): Promise<postgres.Sql> {
  if (sql) {
    return sql
  }

  try {
    const config = getDatabaseConfig()
    
    // Handle both string URL and options object
    if (typeof config === 'string') {
      sql = postgres(config)
    } else {
      sql = postgres(config)
    }

    // Test the connection
    await sql`SELECT 1 as test`
    
    console.log('✅ Database connection established successfully')
    return sql
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get the current database connection
 * @throws Error if database is not initialized
 */
export function getDatabase(): postgres.Sql {
  if (!sql) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return sql
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end()
    sql = null
    console.log('Database connection closed')
  }
}

/**
 * Verify database connection is active
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    if (!sql) {
      return false
    }
    await sql`SELECT 1 as health_check`
    return true
  } catch (error) {
    console.error('Database connection verification failed:', error)
    return false
  }
}

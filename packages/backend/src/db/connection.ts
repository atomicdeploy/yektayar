import postgres from 'postgres'

let sql: ReturnType<typeof postgres> | null = null

/**
 * Get or create database connection
 */
export function getDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/yektayar'
    
    sql = postgres(connectionString, {
      // Connection pool settings
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      // Automatically convert snake_case to camelCase
      transform: {
        column: {
          to: postgres.toCamel,
          from: postgres.fromCamel
        }
      }
    })
  }
  
  return sql
}

/**
 * Close database connection
 */
export async function closeDb() {
  if (sql) {
    await sql.end()
    sql = null
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const db = getDb()
    await db`SELECT 1 as test`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}

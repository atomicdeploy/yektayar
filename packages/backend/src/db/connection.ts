import postgres from 'postgres'

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar'

// Create a connection pool
export const sql = postgres(DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
})

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`
    console.log('✅ Database connection established')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  await sql.end()
}

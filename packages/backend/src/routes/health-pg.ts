/**
 * Health Check Routes
 * Tests database connectivity with comprehensive diagnostics
 * Using pg library for better Bun compatibility
 */
import { Elysia } from 'elysia'
import { getPool, query } from '../services/database'
import { logger } from '@yektayar/shared'

/**
 * Test database connection with timeout
 */
async function testDatabaseConnection(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number }> {
  const startTime = Date.now()
  
  try {
    const pool = getPool()
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs)
    })
    
    // Test connection with a simple query using pg library
    const testPromise = pool.query('SELECT 1 as test')
    
    await Promise.race([testPromise, timeoutPromise])
    
    const duration = Date.now() - startTime
    logger.success(`Database connection test passed (${duration}ms)`)
    
    return { success: true, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Database connection test failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

/**
 * Test database write operations
 */
async function testDatabaseWrite(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; recordId?: number }> {
  const startTime = Date.now()
  
  try {
    const pool = getPool()
    const testKey = `health_check_${Date.now()}`
    const testValue = 'test_value'
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database write timeout')), timeoutMs)
    })
    
    const writePromise = pool.query(
      `INSERT INTO settings (key, value, type) VALUES ($1, $2, $3) RETURNING id`,
      [testKey, testValue, 'string']
    )
    
    const result = await Promise.race([writePromise, timeoutPromise])
    const recordId = result.rows[0]?.id
    
    const duration = Date.now() - startTime
    logger.success(`Database write test passed (${duration}ms) - Record ID: ${recordId}`)
    
    return { success: true, duration, recordId }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Database write test failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

/**
 * Test database read operations
 */
async function testDatabaseRead(recordId?: number, timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; recordsFound?: number }> {
  const startTime = Date.now()
  
  try {
    const pool = getPool()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database read timeout')), timeoutMs)
    })
    
    let readPromise
    if (recordId) {
      readPromise = pool.query('SELECT * FROM settings WHERE id = $1', [recordId])
    } else {
      readPromise = pool.query('SELECT COUNT(*) as count FROM settings LIMIT 1')
    }
    
    const result = await Promise.race([readPromise, timeoutPromise])
    const recordsFound = recordId ? result.rows.length : (result.rows[0]?.count || 0)
    
    const duration = Date.now() - startTime
    logger.success(`Database read test passed (${duration}ms) - Records found: ${recordsFound}`)
    
    return { success: true, duration, recordsFound }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Database read test failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

/**
 * Check if database tables exist
 */
async function testDatabaseTables(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; tables?: string[] }> {
  const startTime = Date.now()
  
  try {
    const pool = getPool()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database tables check timeout')), timeoutMs)
    })
    
    const tablesPromise = pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    const result = await Promise.race([tablesPromise, timeoutPromise])
    const tables = result.rows.map(row => row.table_name)
    
    const duration = Date.now() - startTime
    logger.success(`Database tables check passed (${duration}ms) - Found ${tables.length} tables`)
    logger.info('Available tables:', tables.join(', '))
    
    return { success: true, duration, tables }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Database tables check failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

/**
 * Clean up test records
 */
async function cleanupTestRecord(recordId: number, timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number }> {
  const startTime = Date.now()
  
  try {
    const pool = getPool()
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database cleanup timeout')), timeoutMs)
    })
    
    const cleanupPromise = pool.query('DELETE FROM settings WHERE id = $1', [recordId])
    
    await Promise.race([cleanupPromise, timeoutPromise])
    
    const duration = Date.now() - startTime
    logger.success(`Test record cleanup completed (${duration}ms)`)
    
    return { success: true, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn(`Test record cleanup failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get('/', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }), {
    detail: {
      tags: ['Health'],
      summary: 'Basic health check',
      description: 'Returns basic health status'
    }
  })
  .get('/db', async () => {
    logger.info('======================================')
    logger.info('🏥 Database Health Check - Starting')
    logger.info('======================================')
    
    // Log database configuration (masked)
    const maskedUrl = (process.env.DATABASE_URL || '').replace(/:([^:@]+)@/, ':*****@')
    logger.info('Database Configuration:')
    logger.info(`  DATABASE_URL: ${maskedUrl}`)
    logger.info(`  DB_HOST: ${process.env.DB_HOST || 'not set'}`)
    logger.info(`  DB_PORT: ${process.env.DB_PORT || 'not set'}`)
    logger.info(`  DB_NAME: ${process.env.DB_NAME || 'not set'}`)
    logger.info(`  DB_USER: ${process.env.DB_USER || 'not set'}`)
    logger.info(`  DB_PASSWORD: ${'*'.repeat(5)}`)
    logger.info('======================================')
    
    const results = {
      database: {
        overall: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
        connection: {} as any,
        tables: {} as any,
        write: {} as any,
        read: {} as any,
        cleanup: {} as any
      },
      config: {
        databaseUrl: maskedUrl,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'yektayar',
        user: process.env.DB_USER || 'yektayar_user',
        library: 'pg' // Using pg library instead of postgres
      }
    }
    
    try {
      // Test 1: Connection
      logger.info('🔌 Test 1: Checking database connection...')
      const connectionTest = await testDatabaseConnection()
      results.database.connection = { 
        status: connectionTest.success ? 'healthy' : 'unhealthy', 
        duration: connectionTest.duration,
        error: connectionTest.error
      }
      
      if (!connectionTest.success) {
        results.database.overall = 'unhealthy'
        logger.error('❌ Database connection test FAILED')
        logger.error('Error details:', connectionTest.error)
        logger.error('')
        logger.error('Troubleshooting Steps:')
        logger.error('  1. Check if PostgreSQL is installed and running:')
        logger.error('     sudo systemctl status postgresql')
        logger.error('')
        logger.error('  2. Verify DATABASE_URL is correct:')
        logger.error(`     Current: ${maskedUrl}`)
        logger.error('')
        logger.error('  3. Test direct database connection:')
        logger.error('     psql -h ${DB_HOST:-localhost} -U ${DB_USER} -d ${DB_NAME}')
        logger.error('')
        logger.error('  4. Run database setup if not done:')
        logger.error('     npm run db:setup')
        logger.error('')
        logger.error('  5. Initialize database tables:')
        logger.error('     npm run db:init')
        logger.error('')
        logger.error('  6. Run comprehensive diagnostics:')
        logger.error('     npm run db:debug')
        
        return results
      }
      
      // Test 2: Tables exist
      logger.info('📋 Test 2: Checking database tables...')
      const tablesTest = await testDatabaseTables()
      results.database.tables = {
        status: tablesTest.success ? 'healthy' : 'unhealthy',
        duration: tablesTest.duration,
        count: tablesTest.tables?.length || 0,
        tables: tablesTest.tables || [],
        error: tablesTest.error
      }
      
      if (!tablesTest.success || !tablesTest.tables || tablesTest.tables.length === 0) {
        results.database.overall = 'degraded'
        logger.warn('⚠️  No database tables found')
        logger.warn('  Run: npm run db:init')
        return results
      }
      
      // Test 3: Write operation
      logger.info('✍️  Test 3: Testing database write...')
      const writeTest = await testDatabaseWrite()
      results.database.write = {
        status: writeTest.success ? 'healthy' : 'degraded',
        duration: writeTest.duration,
        recordId: writeTest.recordId,
        error: writeTest.error
      }
      
      if (!writeTest.success) {
        results.database.overall = 'degraded'
        logger.warn('⚠️  Database write test failed')
      }
      
      // Test 4: Read operation
      logger.info('📖 Test 4: Testing database read...')
      const readTest = await testDatabaseRead(writeTest.recordId)
      results.database.read = {
        status: readTest.success ? 'healthy' : 'degraded',
        duration: readTest.duration,
        recordsFound: readTest.recordsFound,
        error: readTest.error
      }
      
      if (!readTest.success) {
        results.database.overall = 'degraded'
        logger.warn('⚠️  Database read test failed')
      }
      
      // Test 5: Cleanup
      if (writeTest.recordId) {
        logger.info('🧹 Test 5: Cleaning up test record...')
        const cleanupTest = await cleanupTestRecord(writeTest.recordId)
        results.database.cleanup = {
          status: cleanupTest.success ? 'healthy' : 'degraded',
          duration: cleanupTest.duration,
          error: cleanupTest.error
        }
      }
      
      logger.info('======================================')
      logger.success(`✅ Database Health Check Complete: ${results.database.overall.toUpperCase()}`)
      logger.info('======================================')
      
      return results
    } catch (error) {
      logger.error('❌ Unexpected error during health check:', error)
      results.database.overall = 'unhealthy'
      return results
    }
  }, {
    detail: {
      tags: ['Health'],
      summary: 'Database health check',
      description: 'Performs comprehensive database health check including connection, tables, write, read, and cleanup tests'
    }
  })

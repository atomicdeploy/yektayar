/**
 * Health Check Routes
 * Provides comprehensive health check endpoints for monitoring
 */

import { Elysia } from 'elysia'
import { query } from '../services/database-pg'
import { logger } from '@yektayar/shared'

/**
 * Test database connection with timeout
 */
async function testDatabaseConnection(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number }> {
  const startTime = Date.now()
  
  try {
    const db = getDatabase()
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs)
    })
    
    // Test connection with a simple query
    const testPromise = db`SELECT 1 as test`
    
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
 * Test database write operation
 */
async function testDatabaseWrite(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; recordId?: number }> {
  const startTime = Date.now()
  
  try {
    const db = getDatabase()
    const testKey = `health_check_${Date.now()}`
    const testValue = `test_${Math.random().toString(36).substring(7)}`
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database write timeout')), timeoutMs)
    })
    
    // Insert a test record into settings table
    const writePromise = db`
      INSERT INTO settings (key, value, type)
      VALUES (${testKey}, ${testValue}, 'string')
      RETURNING id
    `
    
    const result = await Promise.race([writePromise, timeoutPromise]) as unknown as Array<{ id: number }>
    const recordId = result[0]?.id
    
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
 * Test database read operation
 */
async function testDatabaseRead(recordId?: number, timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; recordsFound?: number }> {
  const startTime = Date.now()
  
  try {
    const db = getDatabase()
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database read timeout')), timeoutMs)
    })
    
    // Read the test record or check for existing records
    let readPromise
    if (recordId) {
      readPromise = db`SELECT * FROM settings WHERE id = ${recordId}`
    } else {
      readPromise = db`SELECT COUNT(*) as count FROM settings LIMIT 1`
    }
    
    const result = await Promise.race([readPromise, timeoutPromise]) as unknown as Array<{ count?: number }>
    const recordsFound = recordId ? result.length : (result[0]?.count || 0)
    
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
 * Cleanup test record
 */
async function cleanupTestRecord(recordId: number, timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number }> {
  const startTime = Date.now()
  
  try {
    const db = getDatabase()
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database cleanup timeout')), timeoutMs)
    })
    
    // Delete the test record
    const deletePromise = db`DELETE FROM settings WHERE id = ${recordId}`
    
    await Promise.race([deletePromise, timeoutPromise])
    
    const duration = Date.now() - startTime
    logger.success(`Database cleanup completed (${duration}ms) - Record ID: ${recordId} deleted`)
    
    return { success: true, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.warn(`Database cleanup failed (${duration}ms):`, errorMessage)
    
    return { success: false, error: errorMessage, duration }
  }
}

/**
 * Check database tables existence
 */
async function checkDatabaseTables(timeoutMs: number = 5000): Promise<{ success: boolean; error?: string; duration: number; tables?: string[] }> {
  const startTime = Date.now()
  
  try {
    const db = getDatabase()
    
    // Create a promise that will timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database tables check timeout')), timeoutMs)
    })
    
    // Check for expected tables
    const tablesPromise = db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const result = await Promise.race([tablesPromise, timeoutPromise]) as unknown as Array<{ table_name: string }>
    const tables = result.map(row => row.table_name)
    
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

export const healthRoutes = new Elysia({ prefix: '/health' })
  .get('/db', async () => {
    logger.info('======================================')
    logger.info('🏥 Database Health Check - Starting')
    logger.info('======================================')
    
    // Log environment configuration (masked)
    const dbUrl = process.env.DATABASE_URL || 'not set'
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':*****@')
    logger.info('Database Configuration:')
    logger.info(`  DATABASE_URL: ${maskedUrl}`)
    logger.info(`  DB_HOST: ${process.env.DB_HOST || 'not set'}`)
    logger.info(`  DB_PORT: ${process.env.DB_PORT || 'not set'}`)
    logger.info(`  DB_NAME: ${process.env.DB_NAME || 'not set'}`)
    logger.info(`  DB_USER: ${process.env.DB_USER || 'not set'}`)
    logger.info(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : 'not set'}`)
    logger.info('======================================')
    
    const healthCheck = {
      timestamp: new Date().toISOString(),
      database: {
        overall: 'unknown' as 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
        connection: { status: 'unknown', duration: 0, error: undefined as string | undefined },
        tables: { status: 'unknown', duration: 0, count: 0, tables: [] as string[], error: undefined as string | undefined },
        write: { status: 'unknown', duration: 0, error: undefined as string | undefined },
        read: { status: 'unknown', duration: 0, error: undefined as string | undefined },
        cleanup: { status: 'unknown', duration: 0, error: undefined as string | undefined }
      },
      config: {
        databaseUrl: maskedUrl,
        host: process.env.DB_HOST || 'not set',
        port: process.env.DB_PORT || 'not set',
        database: process.env.DB_NAME || 'not set',
        user: process.env.DB_USER || 'not set'
      }
    }
    
    // Test 1: Database Connection
    logger.info('🔌 Test 1: Checking database connection...')
    const connectionTest = await testDatabaseConnection()
    healthCheck.database.connection = {
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      duration: connectionTest.duration,
      error: connectionTest.error
    }
    
    if (!connectionTest.success) {
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
      logger.error(`     psql -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'user'} -d ${process.env.DB_NAME || 'database'}`)
      logger.error('')
      logger.error('  4. Run database setup if not done:')
      logger.error('     npm run db:setup')
      logger.error('')
      logger.error('  5. Initialize database tables:')
      logger.error('     npm run db:init')
      logger.error('')
      logger.error('  6. Run comprehensive diagnostics:')
      logger.error('     npm run db:debug')
      logger.info('======================================')
      
      healthCheck.database.overall = 'unhealthy'
      return {
        ...healthCheck,
        message: 'Database connection failed - see logs for troubleshooting steps'
      }
    }
    
    // Test 2: Check Database Tables
    logger.info('📋 Test 2: Checking database tables...')
    const tablesTest = await checkDatabaseTables()
    healthCheck.database.tables = {
      status: tablesTest.success ? 'healthy' : 'unhealthy',
      duration: tablesTest.duration,
      count: tablesTest.tables?.length || 0,
      tables: tablesTest.tables || [],
      error: tablesTest.error
    }
    
    if (!tablesTest.success) {
      logger.error('❌ Database tables check FAILED')
      logger.error('Error details:', tablesTest.error)
      logger.error('')
      logger.error('Troubleshooting Steps:')
      logger.error('  1. Initialize database tables:')
      logger.error('     npm run db:init')
      logger.error('')
      logger.error('  2. Check permissions:')
      logger.error(`     psql -h ${process.env.DB_HOST || 'localhost'} -U ${process.env.DB_USER || 'user'} -d ${process.env.DB_NAME || 'database'} -c "\\dt"`)
      logger.info('======================================')
      
      healthCheck.database.overall = 'unhealthy'
      return {
        ...healthCheck,
        message: 'Database tables check failed - run npm run db:init'
      }
    }
    
    // Check if required tables exist
    const requiredTables = ['users', 'sessions', 'settings']
    const missingTables = requiredTables.filter(table => !tablesTest.tables?.includes(table))
    
    if (missingTables.length > 0) {
      logger.warn('⚠️  Missing required tables:', missingTables.join(', '))
      logger.warn('The database may not be fully initialized')
      logger.warn('')
      logger.warn('Run database initialization:')
      logger.warn('  npm run db:init')
      healthCheck.database.overall = 'degraded'
    }
    
    // Test 3: Database Write
    logger.info('✍️  Test 3: Testing database write operation...')
    const writeTest = await testDatabaseWrite()
    healthCheck.database.write = {
      status: writeTest.success ? 'healthy' : 'unhealthy',
      duration: writeTest.duration,
      error: writeTest.error
    }
    
    if (!writeTest.success) {
      logger.error('❌ Database write test FAILED')
      logger.error('Error details:', writeTest.error)
      logger.error('Possible causes:')
      logger.error('  - Database is in read-only mode')
      logger.error('  - Insufficient permissions for INSERT operations')
      logger.error('  - Table constraints violation')
      logger.error('  - Disk space full on database server')
      logger.info('======================================')
      
      healthCheck.database.overall = 'degraded'
      return {
        ...healthCheck,
        message: 'Database write test failed - database may be read-only'
      }
    }
    
    const testRecordId = writeTest.recordId
    
    // Test 4: Database Read
    logger.info('📖 Test 4: Testing database read operation...')
    const readTest = await testDatabaseRead(testRecordId)
    healthCheck.database.read = {
      status: readTest.success ? 'healthy' : 'unhealthy',
      duration: readTest.duration,
      error: readTest.error
    }
    
    if (!readTest.success) {
      logger.error('❌ Database read test FAILED')
      logger.error('Error details:', readTest.error)
      logger.error('Possible causes:')
      logger.error('  - Database connection lost')
      logger.error('  - Insufficient permissions for SELECT operations')
      logger.info('======================================')
      
      healthCheck.database.overall = 'degraded'
    }
    
    // Test 5: Cleanup Test Record
    if (testRecordId) {
      logger.info('🧹 Test 5: Cleaning up test record...')
      const cleanupTest = await cleanupTestRecord(testRecordId)
      healthCheck.database.cleanup = {
        status: cleanupTest.success ? 'healthy' : 'warning',
        duration: cleanupTest.duration,
        error: cleanupTest.error
      }
      
      if (!cleanupTest.success) {
        logger.warn('⚠️  Database cleanup warning - test record may remain')
        logger.warn('Error details:', cleanupTest.error)
        logger.warn('This does not affect database health, but may leave test data')
      }
    }
    
    // Determine overall health status
    if (healthCheck.database.overall === 'unknown') {
      if (healthCheck.database.connection.status === 'healthy' &&
          healthCheck.database.tables.status === 'healthy' &&
          healthCheck.database.write.status === 'healthy' &&
          healthCheck.database.read.status === 'healthy') {
        healthCheck.database.overall = 'healthy'
        logger.success('✅ All database health checks PASSED')
      } else {
        healthCheck.database.overall = 'degraded'
        logger.warn('⚠️  Some database health checks failed or degraded')
      }
    }
    
    logger.info('======================================')
    logger.info(`🏥 Database Health Check - Complete: ${healthCheck.database.overall.toUpperCase()}`)
    logger.info('======================================')
    
    return healthCheck
  }, {
    detail: {
      tags: ['Health'],
      summary: 'Comprehensive database health check',
      description: 'Performs comprehensive health checks including connection test, tables verification, write test, read test, and cleanup. Provides verbose logging to help diagnose database issues.'
    }
  })

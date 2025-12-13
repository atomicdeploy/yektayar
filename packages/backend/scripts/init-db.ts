/**
 * Quick script to initialize database tables
 */

import { initializeDatabase } from '../src/services/database'
import { logger } from '@yektayar/shared'

async function run() {
  try {
    logger.info('Initializing database...')
    await initializeDatabase()
    logger.success('Database initialized successfully!')
    process.exit(0)
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

run()

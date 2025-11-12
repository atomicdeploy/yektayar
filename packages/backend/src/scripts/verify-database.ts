#!/usr/bin/env node
/**
 * Standalone script to verify database tables
 * Usage: npm run verify-db
 */

import { initializeDatabase, closeDatabase, printTableVerificationReport } from '../db/index.js'

async function main() {
  console.log('🔍 Starting database verification...\n')
  
  try {
    // Initialize database connection
    await initializeDatabase()
    
    // Print detailed verification report
    await printTableVerificationReport()
    
    // Close connection
    await closeDatabase()
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database verification failed:', error)
    process.exit(1)
  }
}

main()

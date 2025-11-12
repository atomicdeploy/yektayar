#!/usr/bin/env bun
/**
 * Database initialization script
 * Run this to create tables and seed initial data
 */

import { testConnection, closeConnection } from '../src/db/connection'
import { initializeDatabase } from '../src/db/migrate'

async function main() {
  console.log('🚀 Starting database initialization...\n')
  
  try {
    // Test connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      console.error('\n❌ Could not connect to database')
      console.error('Please ensure PostgreSQL is running and DATABASE_URL is correct')
      process.exit(1)
    }
    
    console.log('')
    
    // Run migrations and seed
    await initializeDatabase()
    
    console.log('\n✅ Database initialization completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await closeConnection()
    process.exit(0)
  }
}

main()

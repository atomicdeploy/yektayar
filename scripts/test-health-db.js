#!/usr/bin/env node

/**
 * Manual Test Script for /health/db Endpoint
 * 
 * This script demonstrates how to test the database health check endpoint.
 * 
 * Usage:
 *   node scripts/test-health-db.js [base-url]
 * 
 * Examples:
 *   node scripts/test-health-db.js
 *   node scripts/test-health-db.js http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000'

console.log('🏥 Testing Database Health Check Endpoint')
console.log('=' .repeat(50))
console.log(`Base URL: ${baseUrl}`)
console.log('Endpoint: /health/db')
console.log('=' .repeat(50))
console.log()

async function testHealthEndpoint() {
  try {
    console.log('📡 Sending request to /health/db...')
    console.log()
    
    const response = await fetch(`${baseUrl}/health/db`)
    
    console.log(`📥 Response Status: ${response.status} ${response.statusText}`)
    console.log()
    
    if (!response.ok) {
      console.error('❌ Request failed')
      const text = await response.text()
      console.error('Response:', text)
      process.exit(1)
    }
    
    const data = await response.json()
    
    console.log('📊 Health Check Results:')
    console.log('=' .repeat(50))
    console.log(JSON.stringify(data, null, 2))
    console.log('=' .repeat(50))
    console.log()
    
    // Summary
    const overall = data.database?.overall || 'unknown'
    const emoji = overall === 'healthy' ? '✅' : overall === 'degraded' ? '⚠️' : '❌'
    
    console.log(`${emoji} Overall Status: ${overall.toUpperCase()}`)
    console.log()
    
    // Details
    if (data.database) {
      const db = data.database
      
      console.log('📋 Test Results:')
      console.log(`  Connection: ${getStatusEmoji(db.connection?.status)} ${db.connection?.status || 'unknown'} (${db.connection?.duration || 0}ms)`)
      console.log(`  Tables:     ${getStatusEmoji(db.tables?.status)} ${db.tables?.status || 'unknown'} (${db.tables?.count || 0} tables, ${db.tables?.duration || 0}ms)`)
      console.log(`  Write:      ${getStatusEmoji(db.write?.status)} ${db.write?.status || 'unknown'} (${db.write?.duration || 0}ms)`)
      console.log(`  Read:       ${getStatusEmoji(db.read?.status)} ${db.read?.status || 'unknown'} (${db.read?.duration || 0}ms)`)
      console.log(`  Cleanup:    ${getStatusEmoji(db.cleanup?.status)} ${db.cleanup?.status || 'unknown'} (${db.cleanup?.duration || 0}ms)`)
      console.log()
      
      // Show errors if any
      const errors = []
      if (db.connection?.error) errors.push(`Connection: ${db.connection.error}`)
      if (db.tables?.error) errors.push(`Tables: ${db.tables.error}`)
      if (db.write?.error) errors.push(`Write: ${db.write.error}`)
      if (db.read?.error) errors.push(`Read: ${db.read.error}`)
      if (db.cleanup?.error) errors.push(`Cleanup: ${db.cleanup.error}`)
      
      if (errors.length > 0) {
        console.log('⚠️  Errors Detected:')
        errors.forEach(err => console.log(`  - ${err}`))
        console.log()
      }
      
      // Show tables if available
      if (db.tables?.tables && db.tables.tables.length > 0) {
        console.log('📚 Database Tables:')
        db.tables.tables.forEach(table => console.log(`  - ${table}`))
        console.log()
      }
    }
    
    console.log('✅ Test completed successfully')
    console.log()
    console.log('💡 Tip: Check the server console for verbose logs')
    
  } catch (error) {
    console.error('❌ Test failed with error:')
    console.error(error.message)
    console.error()
    console.error('Possible causes:')
    console.error('  - Server is not running')
    console.error('  - Wrong URL or port')
    console.error('  - Network connectivity issues')
    process.exit(1)
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'healthy': return '✅'
    case 'unhealthy': return '❌'
    case 'degraded': return '⚠️'
    case 'warning': return '⚠️'
    default: return '❓'
  }
}

// Run the test
testHealthEndpoint()

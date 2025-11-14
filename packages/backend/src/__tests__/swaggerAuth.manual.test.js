/**
 * Manual test script for Swagger Authentication
 * Run this with: node src/__tests__/swaggerAuth.manual.test.js
 * 
 * This script tests:
 * 1. Authentication works in development mode
 * 2. Authentication is bypassed in production mode
 * 3. Correct HTTP status codes and headers
 */

import { Elysia } from 'elysia'
import { swaggerAuth } from '../middleware/swaggerAuth.js'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
}

let passedTests = 0
let failedTests = 0

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function assert(condition, testName) {
  if (condition) {
    passedTests++
    log(`✓ ${testName}`, colors.green)
  } else {
    failedTests++
    log(`✗ ${testName}`, colors.red)
  }
}

async function runTests() {
  log('\n=== Swagger Authentication Middleware Tests ===\n', colors.blue)
  
  const originalEnv = { ...process.env }
  
  // Test 1: Development mode - no auth header
  log('Testing Development Mode:', colors.yellow)
  process.env.NODE_ENV = 'development'
  process.env.SWAGGER_USERNAME = 'admin'
  process.env.SWAGGER_PASSWORD = 'testpass123'
  
  const app1 = new Elysia()
    .use(swaggerAuth)
    .get('/api-docs', () => ({ success: true }))
  
  const response1 = await app1.handle(new Request('http://localhost/api-docs'))
  assert(response1.status === 401, 'Should return 401 when no auth header in development')
  const body1 = await response1.json()
  assert(body1.error === 'Unauthorized', 'Should return Unauthorized error message')
  assert(
    response1.headers.get('WWW-Authenticate')?.includes('Basic realm'),
    'Should include WWW-Authenticate header'
  )
  
  // Test 2: Development mode - invalid credentials
  const invalidCreds = Buffer.from('admin:wrongpass').toString('base64')
  const response2 = await app1.handle(
    new Request('http://localhost/api-docs', {
      headers: { 'Authorization': `Basic ${invalidCreds}` }
    })
  )
  assert(response2.status === 401, 'Should return 401 with invalid credentials in development')
  const body2 = await response2.json()
  assert(body2.error === 'Unauthorized', 'Should return Unauthorized error with invalid creds')
  
  // Test 3: Development mode - valid credentials
  const validCreds = Buffer.from('admin:testpass123').toString('base64')
  const response3 = await app1.handle(
    new Request('http://localhost/api-docs', {
      headers: { 'Authorization': `Basic ${validCreds}` }
    })
  )
  assert(response3.status === 200, 'Should return 200 with valid credentials in development')
  const body3 = await response3.json()
  assert(body3.success === true, 'Should return success response with valid credentials')
  
  // Test 4: Development mode - non-protected route
  const app1WithHealth = new Elysia()
    .use(swaggerAuth)
    .get('/health', () => ({ status: 'ok' }))
  
  const response4 = await app1WithHealth.handle(new Request('http://localhost/health'))
  assert(response4.status === 200, 'Non-api-docs routes should not be affected by auth middleware')
  const body4 = await response4.json()
  assert(body4.status === 'ok', 'Health endpoint should return ok')
  
  // Test 5: Production mode - no auth required
  log('\nTesting Production Mode:', colors.yellow)
  process.env.NODE_ENV = 'production'
  
  const app2 = new Elysia()
    .use(swaggerAuth)
    .get('/api-docs', () => ({ success: true }))
  
  const response5 = await app2.handle(new Request('http://localhost/api-docs'))
  assert(response5.status === 200, 'Should return 200 without auth in production')
  const body5 = await response5.json()
  assert(body5.success === true, 'Should return success response in production without auth')
  
  // Test 6: Production mode - with invalid credentials (should still work)
  const response6 = await app2.handle(
    new Request('http://localhost/api-docs', {
      headers: { 'Authorization': `Basic ${invalidCreds}` }
    })
  )
  assert(response6.status === 200, 'Should return 200 even with invalid credentials in production')
  const body6 = await response6.json()
  assert(body6.success === true, 'Should return success even with invalid creds in production')
  
  // Test 7: Production mode - with valid credentials (should work)
  const response7 = await app2.handle(
    new Request('http://localhost/api-docs', {
      headers: { 'Authorization': `Basic ${validCreds}` }
    })
  )
  assert(response7.status === 200, 'Should return 200 with valid credentials in production')
  const body7 = await response7.json()
  assert(body7.success === true, 'Should return success with valid creds in production')
  
  // Restore environment
  process.env = originalEnv
  
  // Summary
  log('\n=== Test Summary ===', colors.blue)
  log(`Passed: ${passedTests}`, colors.green)
  log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green)
  log(`Total: ${passedTests + failedTests}\n`)
  
  if (failedTests > 0) {
    process.exit(1)
  }
}

runTests().catch(err => {
  log(`\nTest execution error: ${err.message}`, colors.red)
  console.error(err)
  process.exit(1)
})

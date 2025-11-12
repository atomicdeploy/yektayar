/**
 * Manual test script for JWT and session service
 * Run with: bun run src/test-jwt.ts
 */

import { generateJWT, verifyJWT, isValidJWTFormat, decodeJWT } from './services/jwtService'

async function testJWT() {
  console.log('=== JWT Service Tests ===\n')
  
  // Test 1: Generate JWT
  console.log('Test 1: Generate JWT token')
  const sessionId = 'test-session-123'
  const token = await generateJWT(sessionId)
  console.log('✓ Generated token:', token)
  console.log('  Length:', token.length)
  console.log('  Parts:', token.split('.').length)
  console.log()
  
  // Test 2: Validate JWT format
  console.log('Test 2: Validate JWT format')
  const isValid = isValidJWTFormat(token)
  console.log('✓ Token format valid:', isValid)
  console.log()
  
  // Test 3: Decode JWT (without verification)
  console.log('Test 3: Decode JWT')
  const decoded = decodeJWT(token)
  console.log('✓ Decoded payload:', JSON.stringify(decoded, null, 2))
  console.log()
  
  // Test 4: Verify JWT
  console.log('Test 4: Verify JWT signature')
  const verified = await verifyJWT(token)
  console.log('✓ Verified payload:', JSON.stringify(verified, null, 2))
  console.log()
  
  // Test 5: Invalid JWT format
  console.log('Test 5: Invalid JWT formats')
  const invalidTokens = [
    '',
    'not.a.jwt',
    'invalid',
    'only.two',
    'has.four.parts.here',
    'invalid-chars!.invalid-chars!.invalid-chars!'
  ]
  
  for (const invalidToken of invalidTokens) {
    const result = isValidJWTFormat(invalidToken)
    console.log(`  "${invalidToken}" -> ${result ? '✗ FAIL' : '✓ PASS (correctly rejected)'}`)
  }
  console.log()
  
  // Test 6: Verify invalid token
  console.log('Test 6: Verify tampered token')
  const tamperedToken = token.slice(0, -5) + 'AAAAA'
  const verifiedTampered = await verifyJWT(tamperedToken)
  console.log('✓ Tampered token verification:', verifiedTampered === null ? 'PASS (correctly rejected)' : 'FAIL')
  console.log()
  
  // Test 7: Verify token with wrong secret
  console.log('Test 7: Generate token and verify with current secret')
  const token2 = await generateJWT('another-session')
  const verified2 = await verifyJWT(token2)
  console.log('✓ Token verified:', verified2 !== null ? 'PASS' : 'FAIL')
  console.log()
  
  console.log('=== All JWT Tests Complete ===')
}

// Run tests
testJWT().catch(console.error)

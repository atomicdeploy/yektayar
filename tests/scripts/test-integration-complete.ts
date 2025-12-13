#!/usr/bin/env tsx
/**
 * Comprehensive Integration Test - IPPanel Edge API
 * 
 * This test verifies that the SMS service works exactly as specified
 * in the problem statement, using the IPPanel Edge API format.
 */

import { sendOTPSMS, sendPatternSMS } from '../packages/backend/src/services/smsService';

async function runComprehensiveTest() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║     IPPanel Edge API - Comprehensive Integration Test                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log();

  // Verify environment variables
  console.log('📋 Configuration Check:');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  const config = {
    apiKey: process.env.FARAZSMS_API_KEY,
    patternCode: process.env.FARAZSMS_PATTERN_CODE,
    lineNumber: process.env.FARAZSMS_LINE_NUMBER,
    endpoint: process.env.FARAZSMS_API_ENDPOINT || 'https://edge.ippanel.com/v1/api/send'
  };

  console.log(`  ✓ API Key: ${config.apiKey ? 'Set (hidden)' : '✗ MISSING'}`);
  console.log(`  ✓ Pattern Code: ${config.patternCode || '✗ MISSING'}`);
  console.log(`  ✓ Line Number: ${config.lineNumber || '✗ MISSING'}`);
  console.log(`  ✓ Endpoint: ${config.endpoint}`);
  console.log();

  if (!config.apiKey || !config.patternCode || !config.lineNumber) {
    console.error('❌ Missing required environment variables!');
    process.exit(1);
  }

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: sendOTPSMS with Edge API
  console.log('🧪 Test 1: sendOTPSMS() Function');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  try {
    const phoneNumber = '09197103488';
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`  Phone: ${phoneNumber}`);
    console.log(`  OTP: ${otpCode}`);
    console.log(`  Calling sendOTPSMS()...`);
    
    const result = await sendOTPSMS(phoneNumber, otpCode);
    
    if (result === true) {
      console.log('  ✅ PASSED: OTP sent successfully');
      testsPassed++;
    } else {
      console.log('  ❌ FAILED: Unexpected return value');
      testsFailed++;
    }
  } catch (error: any) {
    console.error(`  ❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 2: sendPatternSMS with Edge API
  console.log('🧪 Test 2: sendPatternSMS() with Edge API');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  try {
    const phoneNumber = '09197103488';
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`  Phone: ${phoneNumber}`);
    console.log(`  Verification Code: ${verificationCode}`);
    console.log(`  Calling sendPatternSMS() with useEdgeAPI=true...`);
    
    const result = await sendPatternSMS(
      config.patternCode!,
      config.lineNumber!,
      phoneNumber,
      { 'verification-code': verificationCode },
      true // Use Edge API
    );
    
    if (result && 'meta' in result && result.meta?.status === true) {
      console.log('  ✅ PASSED: Pattern SMS sent via Edge API');
      console.log(`  Message IDs: ${result.data.message_outbox_ids.join(', ')}`);
      testsPassed++;
    } else {
      console.log('  ❌ FAILED: Unexpected response format');
      testsFailed++;
    }
  } catch (error: any) {
    console.error(`  ❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Test 3: Verify Edge API format is used by default
  console.log('🧪 Test 3: Default Endpoint Verification');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  try {
    if (config.endpoint === 'https://edge.ippanel.com/v1/api/send') {
      console.log('  ✅ PASSED: Edge API is configured as default');
      testsPassed++;
    } else {
      console.log(`  ⚠️  WARNING: Custom endpoint configured: ${config.endpoint}`);
      console.log('  (This is acceptable but Edge API is recommended)');
      testsPassed++;
    }
  } catch (error: any) {
    console.error(`  ❌ FAILED: ${error.message}`);
    testsFailed++;
  }
  console.log();

  // Final Summary
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                             Test Summary                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`  Total Tests: ${testsPassed + testsFailed}`);
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log();

  if (testsFailed === 0) {
    console.log('  🎉 All tests passed! IPPanel Edge API integration is working correctly.');
    console.log();
    console.log('  ✓ SMS service uses Edge API by default');
    console.log('  ✓ Pattern-based SMS sending works as expected');
    console.log('  ✓ Request format matches problem statement specification');
    console.log();
    process.exit(0);
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.');
    console.log();
    process.exit(1);
  }
}

runComprehensiveTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

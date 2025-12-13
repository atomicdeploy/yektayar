#!/usr/bin/env tsx
/**
 * Final comprehensive test - All APIs
 */

import { 
  sendOTPSMS, 
  sendPatternSMS, 
  RestAPI
} from '../packages/backend/src/services/smsService';

async function finalTest() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              Final Comprehensive API Test - All Endpoints                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log();

  const recipient = '09197103488';
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER || '+983000505';

  if (!patternCode) {
    console.error('❌ FARAZSMS_PATTERN_CODE required');
    process.exit(1);
  }

  let passed = 0, failed = 0;

  // Test 1: Edge API - sendOTPSMS
  console.log('🧪 Test 1: Edge API - sendOTPSMS()');
  console.log('─'.repeat(79));
  try {
    await sendOTPSMS(recipient, '111111');
    console.log('✅ PASSED\n');
    passed++;
  } catch (error: any) {
    console.error('❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 2: Edge API - sendPatternSMS
  console.log('🧪 Test 2: Edge API - sendPatternSMS()');
  console.log('─'.repeat(79));
  try {
    await sendPatternSMS(patternCode, lineNumber, recipient, { 'verification-code': '222222' }, true);
    console.log('✅ PASSED\n');
    passed++;
  } catch (error: any) {
    console.error('❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 3: REST API - sendSingle
  console.log('🧪 Test 3: REST API - RestAPI.sendSingle() (Legacy AHK compat)');
  console.log('─'.repeat(79));
  try {
    await RestAPI.sendSingle(recipient, 'Test from REST API v1');
    console.log('✅ PASSED\n');
    passed++;
  } catch (error: any) {
    console.error('❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Test 4: REST API - sendPattern
  console.log('🧪 Test 4: REST API - RestAPI.sendPattern() (Legacy AHK compat)');
  console.log('─'.repeat(79));
  try {
    await RestAPI.sendPattern(recipient, patternCode, { 'verification-code': '333333' });
    console.log('✅ PASSED\n');
    passed++;
  } catch (error: any) {
    console.error('❌ FAILED:', error.message, '\n');
    failed++;
  }

  // Summary
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                             Final Summary                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`  Total Tests: ${passed + failed}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log();

  if (failed === 0) {
    console.log('  🎉 All APIs working correctly!');
    console.log();
    console.log('  ✓ Edge API (edge.ippanel.com) - Working');
    console.log('  ✓ REST API (api2.ippanel.com) - Working');
    console.log('  ✓ Legacy AutoHotkey compatibility - Verified');
    console.log('  ✓ FarazSMS provider integration - Complete');
    console.log();
    process.exit(0);
  } else {
    console.log('  ⚠️  Some tests failed');
    process.exit(1);
  }
}

finalTest().catch(console.error);

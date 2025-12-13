#!/usr/bin/env tsx
/**
 * Test IPPanel REST API v1 functions (api2.ippanel.com)
 * Matches legacy AutoHotkey implementation
 */

import { sendSingleSMS, sendPatternSMSv1 } from '../packages/backend/src/services/smsService';

async function testRESTAPIv1() {
  console.log('='.repeat(80));
  console.log('Testing IPPanel REST API v1 Functions (api2.ippanel.com)');
  console.log('='.repeat(80));
  console.log();

  const recipient = '09197103488';
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;

  if (!patternCode) {
    console.error('❌ FARAZSMS_PATTERN_CODE not set');
    process.exit(1);
  }

  // Test 1: Send Single SMS
  console.log('Test 1: Send Single SMS');
  console.log('-'.repeat(80));
  try {
    const message = 'Test message from YektaYar REST API v1';
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Message: ${message}`);
    console.log();

    const result = await sendSingleSMS(recipient, message);
    
    console.log('✅ SUCCESS!');
    console.log(`  Status: ${result.status}`);
    console.log(`  Code: ${result.code}`);
    console.log(`  Message ID: ${result.data.message_id}`);
    console.log();
  } catch (error: any) {
    console.error('❌ FAILED:', error.message);
  }

  // Test 2: Send Pattern SMS
  console.log('Test 2: Send Pattern SMS');
  console.log('-'.repeat(80));
  try {
    const variable = {
      'verification-code': '98765'
    };
    
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Pattern Code: ${patternCode}`);
    console.log(`  Variables:`, variable);
    console.log();

    const result = await sendPatternSMSv1(recipient, patternCode, variable);
    
    console.log('✅ SUCCESS!');
    console.log(`  Status: ${result.status}`);
    console.log(`  Code: ${result.code}`);
    console.log(`  Message ID: ${result.data.message_id}`);
    console.log();
  } catch (error: any) {
    console.error('❌ FAILED:', error.message);
  }

  console.log('='.repeat(80));
  console.log('Testing Complete');
  console.log('='.repeat(80));
}

testRESTAPIv1().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

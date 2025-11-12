#!/usr/bin/env bun
/**
 * SMS Testing Script
 * 
 * Test FarazSMS integration for sending OTP messages
 * 
 * Usage:
 *   bun scripts/test-sms.ts <phone_number> [otp_code]
 * 
 * Example:
 *   bun scripts/test-sms.ts 09121234567
 *   bun scripts/test-sms.ts 09121234567 654321
 */

import { testSMSConfiguration } from '../packages/backend/src/services/smsService';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Error: Phone number is required\n');
  console.log('Usage: bun scripts/test-sms.ts <phone_number> [otp_code]');
  console.log('\nExamples:');
  console.log('  bun scripts/test-sms.ts 09121234567');
  console.log('  bun scripts/test-sms.ts 09121234567 654321');
  console.log('\nNote: Make sure to configure the following environment variables:');
  console.log('  - FARAZSMS_API_KEY');
  console.log('  - FARAZSMS_PATTERN_CODE');
  console.log('  - FARAZSMS_LINE_NUMBER');
  process.exit(1);
}

const phoneNumber = args[0];
const testOTP = args[1] || '123456';

// Run test
console.log('='.repeat(60));
console.log('FarazSMS Integration Test');
console.log('='.repeat(60));
console.log();

testSMSConfiguration(phoneNumber, testOTP)
  .then(() => {
    console.log();
    console.log('='.repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error();
    console.error('='.repeat(60));
    console.error('Test failed with error:', error.message);
    console.error('='.repeat(60));
    process.exit(1);
  });

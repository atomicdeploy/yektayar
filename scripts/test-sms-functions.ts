#!/usr/bin/env tsx
/**
 * Test sendOTPSMS function with Edge API
 */

import { sendOTPSMS, sendPatternSMS } from '../packages/backend/src/services/smsService';

async function testSendOTPSMS() {
  console.log('='.repeat(80));
  console.log('Testing sendOTPSMS with IPPanel Edge API');
  console.log('='.repeat(80));
  console.log();

  // NOTE: This is hardcoded for testing only. In production, use env var or pass as argument.
  const phoneNumber = '09197103488';
  const otpCode = '999888';

  console.log('Test Configuration:');
  console.log(`  Phone Number: ${phoneNumber}`);
  console.log(`  OTP Code: ${otpCode}`);
  console.log(`  Expected Endpoint: ${process.env.FARAZSMS_API_ENDPOINT || 'https://edge.ippanel.com/v1/api/send'}`);
  console.log();

  try {
    console.log('Calling sendOTPSMS...');
    const result = await sendOTPSMS(phoneNumber, otpCode);
    
    console.log('\n✅ SUCCESS! sendOTPSMS returned:', result);
    console.log();
    console.log('The function is working correctly with Edge API!');
  } catch (error: any) {
    console.error('\n❌ FAILED! sendOTPSMS threw error:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

async function testSendPatternSMS() {
  console.log();
  console.log('='.repeat(80));
  console.log('Testing sendPatternSMS with Edge API');
  console.log('='.repeat(80));
  console.log();

  const patternCode = process.env.FARAZSMS_PATTERN_CODE!;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER!;
  // NOTE: This is hardcoded for testing only. In production, use env var or pass as argument.
  const phoneNumber = '09197103488';
  const verificationCode = '777666';

  console.log('Test Configuration:');
  console.log(`  Pattern Code: ${patternCode}`);
  console.log(`  Line Number: ${lineNumber}`);
  console.log(`  Phone Number: ${phoneNumber}`);
  console.log(`  Verification Code: ${verificationCode}`);
  console.log();

  try {
    console.log('Calling sendPatternSMS with Edge API (useEdgeAPI=true)...');
    const result = await sendPatternSMS(
      patternCode,
      lineNumber,
      phoneNumber,
      { 'verification-code': verificationCode },
      true // Use Edge API
    );
    
    console.log('\n✅ SUCCESS! sendPatternSMS returned:');
    console.log(JSON.stringify(result, null, 2));
    console.log();
    console.log('The function is working correctly with Edge API!');
  } catch (error: any) {
    console.error('\n❌ FAILED! sendPatternSMS threw error:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

async function runTests() {
  await testSendOTPSMS();
  await testSendPatternSMS();
  
  console.log();
  console.log('='.repeat(80));
  console.log('All tests completed!');
  console.log('='.repeat(80));
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

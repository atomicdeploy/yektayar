#!/usr/bin/env bun
/**
 * Test sending OTP using IPPanel REST endpoint
 * Pattern: qql5tsrnbccp4uu
 * Variable: verification-code
 * Phone: 09197103488
 * 
 * Usage:
 *   bun scripts/test-pattern-otp.ts
 */

import { sendPatternSMS, getUserCredit } from '../packages/backend/src/services/smsService';

async function testPatternOTP() {
  console.log('='.repeat(70));
  console.log('Testing IPPanel REST Pattern SMS - OTP Delivery');
  console.log('='.repeat(70));
  console.log();
  
  const patternCode = 'qql5tsrnbccp4uu';
  const phoneNumber = '09197103488';
  const verificationCode = 'test1234';
  const originator = '+983000505'; // IPPanel line number format
  
  console.log('Configuration:');
  console.log(`  Pattern Code: ${patternCode}`);
  console.log(`  Phone Number: ${phoneNumber}`);
  console.log(`  Verification Code: ${verificationCode}`);
  console.log(`  Originator: ${originator}`);
  console.log();
  
  try {
    // First check API status and credit
    console.log('Checking API status and account credit...');
    const creditInfo = await getUserCredit();
    console.log(`✓ API is active. Current credit: ${creditInfo.data.credit.toFixed(2)}`);
    console.log();
    
    // Send pattern SMS
    console.log('Sending pattern SMS via IPPanel REST API...');
    console.log(`  Endpoint: http://rest.ippanel.com/v1/messages/patterns/send`);
    console.log(`  Pattern variable: verification-code = ${verificationCode}`);
    console.log();
    
    const result = await sendPatternSMS(
      patternCode,
      originator,
      phoneNumber,
      {
        'verification-code': verificationCode
      }
    );
    
    console.log('✓ SMS sent successfully!');
    console.log();
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log();
    console.log('Message Details:');
    console.log(`  Status: ${result.status}`);
    console.log(`  Code: ${result.code}`);
    console.log(`  Message: ${result.message}`);
    console.log(`  Bulk ID: ${result.data.bulk_id}`);
    console.log();
    console.log('='.repeat(70));
    console.log(`✓ OTP "${verificationCode}" delivered successfully to ${phoneNumber}!`);
    console.log('='.repeat(70));
    
  } catch (error: any) {
    console.error('✗ Error sending SMS:');
    console.error(error.message);
    if (error.stack) {
      console.error();
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.log();
    console.log('='.repeat(70));
    console.log('✗ Test failed!');
    console.log('='.repeat(70));
    console.log();
    console.log('Troubleshooting tips:');
    console.log('  - Verify API key is set in .env: FARAZSMS_API_KEY');
    console.log('  - Check pattern code is correct and approved');
    console.log('  - Ensure originator line number is valid');
    console.log('  - Wait a moment and try again if rate limited');
    console.log();
    process.exit(1);
  }
}

testPatternOTP();

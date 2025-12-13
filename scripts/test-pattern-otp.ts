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
  console.log('Testing IPPanel Edge Pattern SMS - OTP Delivery');
  console.log('='.repeat(70));
  console.log();
  
  const patternCode = process.env.FARAZSMS_PATTERN_CODE || 'qql5tsrnbccp4uu';
  const phoneNumber = '09197103488';
  const verificationCode = 'test1234';
  const originator = process.env.FARAZSMS_LINE_NUMBER || '+983000505'; // IPPanel line number format
  
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
    console.log('Sending pattern SMS via IPPanel Edge API (default)...');
    console.log(`  Endpoint: https://edge.ippanel.com/v1/api/send`);
    console.log(`  Pattern variable: verification-code = ${verificationCode}`);
    console.log();
    
    const result = await sendPatternSMS(
      patternCode,
      originator,
      phoneNumber,
      {
        'verification-code': verificationCode
      },
      true // Use Edge API (default)
    );
    
    console.log('✓ SMS sent successfully!');
    console.log();
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log();
    console.log('Message Details:');
    // Handle both Edge API and REST API response formats
    if ('meta' in result && result.meta) {
      // Edge API response format
      console.log(`  Status: ${result.meta.status}`);
      console.log(`  Message Code: ${result.meta.message_code}`);
      console.log(`  Message: ${result.meta.message}`);
      console.log(`  Message IDs: ${result.data.message_outbox_ids.join(', ')}`);
    } else {
      // REST API response format (legacy)
      console.log(`  Status: ${result.status}`);
      console.log(`  Code: ${result.code}`);
      console.log(`  Message: ${result.message}`);
      console.log(`  Bulk ID: ${result.data.bulk_id}`);
    }
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

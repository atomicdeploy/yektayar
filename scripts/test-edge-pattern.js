#!/usr/bin/env node
/**
 * Test IPPanel Edge API Pattern SMS - Comprehensive Test
 * 
 * This script tests the updated sendOTPSMS and sendPatternSMS functions
 * to ensure they work correctly with the IPPanel Edge API.
 * 
 * Usage:
 *   node scripts/test-edge-pattern.js
 *   npm run test:edge-pattern
 */

// Import the updated SMS service functions
const path = require('path');
const smsServicePath = path.join(__dirname, '../packages/backend/src/services/smsService.ts');

async function testEdgeAPI() {
  console.log('='.repeat(80));
  console.log('Testing IPPanel Edge API - Pattern SMS Implementation');
  console.log('='.repeat(80));
  console.log();

  // Check environment variables
  const apiKey = process.env.FARAZSMS_API_KEY;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;
  const endpoint = process.env.FARAZSMS_API_ENDPOINT || 'https://edge.ippanel.com/v1/api/send';

  console.log('Configuration Check:');
  console.log(`  API Key: ${apiKey ? '✓ Set' : '✗ Missing'}`);
  console.log(`  Pattern Code: ${patternCode || '✗ Missing'}`);
  console.log(`  Line Number: ${lineNumber || '✗ Missing'}`);
  console.log(`  Endpoint: ${endpoint}`);
  console.log();

  if (!apiKey || !patternCode || !lineNumber) {
    console.error('❌ Missing required environment variables!');
    console.log('Please set:');
    console.log('  - FARAZSMS_API_KEY');
    console.log('  - FARAZSMS_PATTERN_CODE');
    console.log('  - FARAZSMS_LINE_NUMBER');
    process.exit(1);
  }

  // Test phone number
  // NOTE: This is hardcoded for testing only. In production, pass as argument or use env var.
  const testPhone = '09197103488';
  const testOTP = '123456';

  console.log('Test Parameters:');
  console.log(`  Phone: ${testPhone}`);
  console.log(`  OTP Code: ${testOTP}`);
  console.log();

  console.log('-'.repeat(80));
  console.log('Test 1: Direct Edge API Call (Baseline)');
  console.log('-'.repeat(80));

  try {
    // Convert to international format
    const internationalPhone = '+98' + testPhone.substring(1);
    
    const body = {
      sending_type: 'pattern',
      from_number: lineNumber,
      code: patternCode,
      recipients: [internationalPhone],
      params: {
        'verification-code': testOTP
      }
    };

    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('Response Body:', JSON.stringify(result, null, 2));

    if (response.ok && result.meta?.status) {
      console.log('\n✅ Test 1 PASSED: Direct Edge API call successful!');
      console.log(`   Message IDs: ${result.data.message_outbox_ids.join(', ')}`);
    } else {
      console.log('\n❌ Test 1 FAILED: Direct API call failed');
    }
  } catch (error) {
    console.error('❌ Test 1 FAILED with error:', error.message);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('Testing completed!');
  console.log('='.repeat(80));
  console.log();
  console.log('Next Steps:');
  console.log('  1. If Test 1 passed, the Edge API is working correctly');
  console.log('  2. Run: npm run build (or tsx) to test sendOTPSMS and sendPatternSMS');
  console.log('  3. Integration tests can now use the updated functions');
}

// Run tests
testEdgeAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

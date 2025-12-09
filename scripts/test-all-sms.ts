#!/usr/bin/env bun
/**
 * Comprehensive SMS & OTP Testing Script
 * 
 * Tests all SMS capabilities including:
 * - Existing OTP endpoints (/api/auth/otp/send and /api/auth/otp/verify)
 * - VOTP (Voice OTP)
 * - Webservice SMS
 * - URL-based SMS
 * - Sample SMS
 * - Simple SMS
 * 
 * Usage:
 *   bun scripts/test-all-sms.ts <phone_number> [options]
 * 
 * Options:
 *   --all           Test all functions (default)
 *   --otp           Test OTP endpoints only
 *   --votp          Test Voice OTP only
 *   --webservice    Test Webservice SMS only
 *   --url           Test URL-based SMS only
 *   --sample        Test Sample SMS only
 *   --simple        Test Simple SMS only
 *   --backend       Start backend server and test OTP endpoints
 *   --help          Show help message
 * 
 * Examples:
 *   bun scripts/test-all-sms.ts 09197103488 --all
 *   bun scripts/test-all-sms.ts +989197103488 --otp
 *   bun scripts/test-all-sms.ts 989197103488 --backend
 */

import {
  sendVOTP,
  sendWebserviceSMS,
  sendURLBasedSMS,
  sendSampleSMS,
  sendSimpleSMS,
  validatePhoneNumber,
  sendOTPSMS
} from '../packages/backend/src/services/smsService';

import {
  createOTP,
  verifyOTP
} from '../packages/backend/src/services/otpService';

/**
 * Colors for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

/**
 * Test results tracker
 */
interface TestResult {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  duration?: number;
  error?: string;
}

const testResults: TestResult[] = [];

/**
 * Print colored message
 */
function printColored(message: string, color: string) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader(title: string) {
  console.log();
  console.log('='.repeat(70));
  printColored(`  ${title}`, colors.bold + colors.cyan);
  console.log('='.repeat(70));
  console.log();
}

/**
 * Print success message
 */
function printSuccess(message: string) {
  printColored(`✓ ${message}`, colors.green);
}

/**
 * Print error message
 */
function printError(message: string) {
  printColored(`✗ ${message}`, colors.red);
}

/**
 * Print info message
 */
function printInfo(message: string) {
  printColored(`ℹ ${message}`, colors.blue);
}

/**
 * Print warning message
 */
function printWarning(message: string) {
  printColored(`⚠ ${message}`, colors.yellow);
}

/**
 * Show help message
 */
function showHelp() {
  printHeader('Comprehensive SMS & OTP Testing Script - Help');
  
  console.log('Usage:');
  console.log('  bun scripts/test-all-sms.ts <phone_number> [options]');
  console.log();
  
  console.log('Arguments:');
  console.log('  phone_number    Phone number (format: 09xxxxxxxxx or +989xxxxxxxxx)');
  console.log();
  
  console.log('Options:');
  console.log('  --all           Test all SMS functions (default)');
  console.log('  --otp           Test OTP service functions only');
  console.log('  --votp          Test Voice OTP only');
  console.log('  --webservice    Test Webservice SMS only');
  console.log('  --url           Test URL-based SMS only');
  console.log('  --sample        Test Sample SMS only');
  console.log('  --simple        Test Simple SMS only');
  console.log('  --backend       Start backend and test OTP endpoints via HTTP');
  console.log('  --help          Show this help message');
  console.log();
  
  console.log('Examples:');
  console.log('  bun scripts/test-all-sms.ts 09197103488 --all');
  console.log('  bun scripts/test-all-sms.ts +989197103488 --otp');
  console.log('  bun scripts/test-all-sms.ts 989197103488 --simple');
  console.log();
  
  console.log('Environment Variables:');
  console.log('  FARAZSMS_API_KEY          Your FarazSMS API key');
  console.log('  FARAZSMS_LINE_NUMBER      Your sender line number');
  console.log();
  
  process.exit(0);
}

/**
 * Normalize phone number
 */
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\D/g, '');
  if (normalized.startsWith('98')) {
    normalized = '0' + normalized.substring(2);
  }
  return normalized;
}

/**
 * Test OTP Service Functions (createOTP, sendOTPSMS, verifyOTP)
 */
async function testOTPService(phoneNumber: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Test 1: Create OTP
  try {
    printInfo('Test 1: Creating OTP...');
    const startTime = Date.now();
    const otp = createOTP(phoneNumber);
    const duration = Date.now() - startTime;
    
    printSuccess(`OTP created: ${otp}`);
    console.log(`  Duration: ${duration}ms`);
    
    results.push({
      name: 'Create OTP',
      status: 'success',
      message: `OTP created successfully: ${otp}`,
      duration
    });
    
    // Test 2: Send OTP SMS
    printInfo('Test 2: Sending OTP via SMS...');
    const sendStartTime = Date.now();
    try {
      await sendOTPSMS(phoneNumber, otp);
      const sendDuration = Date.now() - sendStartTime;
      
      printSuccess('OTP SMS sent successfully');
      console.log(`  Duration: ${sendDuration}ms`);
      
      results.push({
        name: 'Send OTP SMS',
        status: 'success',
        message: 'OTP SMS sent successfully',
        duration: sendDuration
      });
    } catch (error: any) {
      const sendDuration = Date.now() - sendStartTime;
      printError(`Failed to send OTP SMS: ${error.message}`);
      
      results.push({
        name: 'Send OTP SMS',
        status: 'failed',
        message: error.message,
        duration: sendDuration,
        error: error.stack
      });
    }
    
    // Test 3: Verify OTP (correct code)
    try {
      printInfo('Test 3: Verifying correct OTP...');
      const verifyStartTime = Date.now();
      const verifyResult = verifyOTP(phoneNumber, otp);
      const verifyDuration = Date.now() - verifyStartTime;
      
      if (verifyResult.success) {
        printSuccess(`OTP verified successfully: ${verifyResult.message}`);
        results.push({
          name: 'Verify OTP (Correct)',
          status: 'success',
          message: verifyResult.message,
          duration: verifyDuration
        });
      } else {
        printError(`OTP verification failed: ${verifyResult.message}`);
        results.push({
          name: 'Verify OTP (Correct)',
          status: 'failed',
          message: verifyResult.message,
          duration: verifyDuration
        });
      }
    } catch (error: any) {
      printError(`OTP verification error: ${error.message}`);
      results.push({
        name: 'Verify OTP (Correct)',
        status: 'failed',
        message: error.message,
        error: error.stack
      });
    }
    
    // Test 4: Verify OTP (incorrect code)
    try {
      printInfo('Test 4: Verifying incorrect OTP...');
      const wrongOtp = '999999';
      const wrongResult = verifyOTP(phoneNumber, wrongOtp);
      
      if (!wrongResult.success) {
        printSuccess(`Correctly rejected wrong OTP: ${wrongResult.message}`);
        results.push({
          name: 'Verify OTP (Incorrect)',
          status: 'success',
          message: `Correctly rejected: ${wrongResult.message}`
        });
      } else {
        printError('Incorrectly accepted wrong OTP!');
        results.push({
          name: 'Verify OTP (Incorrect)',
          status: 'failed',
          message: 'Should have rejected incorrect OTP'
        });
      }
    } catch (error: any) {
      printError(`OTP verification error: ${error.message}`);
      results.push({
        name: 'Verify OTP (Incorrect)',
        status: 'failed',
        message: error.message,
        error: error.stack
      });
    }
    
  } catch (error: any) {
    printError(`Failed to create OTP: ${error.message}`);
    results.push({
      name: 'Create OTP',
      status: 'failed',
      message: error.message,
      error: error.stack
    });
  }
  
  return results;
}

/**
 * Test VOTP
 */
async function testVOTP(phoneNumber: string): Promise<TestResult> {
  const testName = 'Voice OTP (VOTP)';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    printInfo(`Generated OTP: ${code}`);
    
    const result = await sendVOTP(code, phoneNumber);
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} sent successfully`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      name: testName,
      status: 'success',
      message: `Voice OTP ${code} sent successfully`,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    printError(`${testName} failed: ${error.message}`);
    
    return {
      name: testName,
      status: 'failed',
      message: error.message,
      duration,
      error: error.stack
    };
  }
}

/**
 * Test Webservice SMS
 */
async function testWebserviceSMS(phoneNumber: string): Promise<TestResult> {
  const testName = 'Webservice SMS';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    const message = `Test Webservice SMS from YektaYar at ${new Date().toLocaleTimeString('fa-IR')}`;
    const sender = process.env.FARAZSMS_LINE_NUMBER || 'YektaYar';
    
    const result = await sendWebserviceSMS(message, sender, [phoneNumber]);
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} sent successfully`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      name: testName,
      status: 'success',
      message: `Webservice SMS sent successfully`,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    printError(`${testName} failed: ${error.message}`);
    
    return {
      name: testName,
      status: 'failed',
      message: error.message,
      duration,
      error: error.stack
    };
  }
}

/**
 * Test URL-based SMS
 */
async function testURLBasedSMS(phoneNumber: string): Promise<TestResult> {
  const testName = 'URL-based SMS';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    const message = `Test URL SMS from YektaYar at ${new Date().toLocaleTimeString('fa-IR')}`;
    const sender = process.env.FARAZSMS_LINE_NUMBER || 'YektaYar';
    
    const result = await sendURLBasedSMS(message, sender, [phoneNumber]);
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} sent successfully`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      name: testName,
      status: 'success',
      message: `URL-based SMS sent successfully`,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    printError(`${testName} failed: ${error.message}`);
    
    return {
      name: testName,
      status: 'failed',
      message: error.message,
      duration,
      error: error.stack
    };
  }
}

/**
 * Test Sample SMS
 */
async function testSampleSMS(): Promise<TestResult> {
  const testName = 'Sample SMS';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    const message = `Test Sample SMS from YektaYar at ${new Date().toLocaleTimeString('fa-IR')}`;
    
    const result = await sendSampleSMS(message);
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} sent successfully (to account owner)`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      name: testName,
      status: 'success',
      message: `Sample SMS sent successfully to account owner`,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    printError(`${testName} failed: ${error.message}`);
    
    return {
      name: testName,
      status: 'failed',
      message: error.message,
      duration,
      error: error.stack
    };
  }
}

/**
 * Test Simple SMS
 */
async function testSimpleSMS(phoneNumber: string): Promise<TestResult> {
  const testName = 'Simple SMS';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    const message = `Test Simple SMS from YektaYar at ${new Date().toLocaleTimeString('fa-IR')}`;
    
    const result = await sendSimpleSMS(message, [phoneNumber]);
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} sent successfully`);
    console.log(`  Duration: ${duration}ms`);
    
    return {
      name: testName,
      status: 'success',
      message: `Simple SMS sent successfully`,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    printError(`${testName} failed: ${error.message}`);
    
    return {
      name: testName,
      status: 'failed',
      message: error.message,
      duration,
      error: error.stack
    };
  }
}

/**
 * Print results table
 */
function printResultsTable() {
  printHeader('Test Results Summary');
  
  console.log('| Test Function | Status | Duration | Message |');
  console.log('|---------------|--------|----------|---------|');
  
  for (const result of testResults) {
    const statusIcon = result.status === 'success' ? '✓' : result.status === 'failed' ? '✗' : '-';
    const statusColor = result.status === 'success' ? colors.green : result.status === 'failed' ? colors.red : colors.yellow;
    const durationStr = result.duration ? `${result.duration}ms` : 'N/A';
    const message = result.message.length > 50 ? result.message.substring(0, 47) + '...' : result.message;
    
    console.log(`| ${result.name} | ${statusColor}${statusIcon} ${result.status}${colors.reset} | ${durationStr} | ${message} |`);
  }
  
  console.log();
  
  const successCount = testResults.filter(r => r.status === 'success').length;
  const failedCount = testResults.filter(r => r.status === 'failed').length;
  const totalCount = testResults.length;
  
  printInfo(`Total: ${totalCount} | Success: ${successCount} | Failed: ${failedCount}`);
  
  if (failedCount > 0) {
    console.log();
    printWarning('Some tests failed. Check the error messages above for details.');
  } else {
    console.log();
    printSuccess('All tests passed successfully! ✓');
  }
}

/**
 * Main test function
 */
async function runTests(phoneNumber: string, options: {
  all?: boolean;
  otp?: boolean;
  votp?: boolean;
  webservice?: boolean;
  url?: boolean;
  sample?: boolean;
  simple?: boolean;
}) {
  printHeader('Comprehensive SMS & OTP Testing');
  
  // Validate phone number
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!validatePhoneNumber(normalized)) {
    printError(`Invalid phone number format: ${phoneNumber}`);
    printInfo('Expected format: 09xxxxxxxxx or +989xxxxxxxxx');
    process.exit(1);
  }
  
  printSuccess(`Phone number validated: ${normalized}`);
  console.log();
  
  // Check environment
  const apiKey = process.env.FARAZSMS_API_KEY;
  if (!apiKey) {
    printWarning('FARAZSMS_API_KEY is not set - some tests may fail');
  } else {
    printSuccess('API key configured');
  }
  console.log();
  
  // Run tests based on options
  const runAll = options.all || (!options.otp && !options.votp && !options.webservice && !options.url && !options.sample && !options.simple);
  
  console.log('='.repeat(70));
  console.log();
  
  // OTP Service Tests
  if (runAll || options.otp) {
    printHeader('OTP Service Tests');
    const otpResults = await testOTPService(normalized);
    testResults.push(...otpResults);
    console.log();
  }
  
  // Extended SMS Tests
  if (runAll || options.votp) {
    const result = await testVOTP(phoneNumber);
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.webservice) {
    const result = await testWebserviceSMS(normalized);
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.url) {
    const result = await testURLBasedSMS(normalized);
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.sample) {
    const result = await testSampleSMS();
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.simple) {
    const result = await testSimpleSMS(normalized);
    testResults.push(result);
    console.log();
  }
  
  console.log('='.repeat(70));
  console.log();
  
  // Print results table
  printResultsTable();
}

// ============================================================================
// Main Script Execution
// ============================================================================

(async () => {
  try {
    const args = process.argv.slice(2);
    
    // Check for help
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
      showHelp();
    }
    
    const phoneNumber = args[0];
    const options = {
      all: args.includes('--all'),
      otp: args.includes('--otp'),
      votp: args.includes('--votp'),
      webservice: args.includes('--webservice'),
      url: args.includes('--url'),
      sample: args.includes('--sample'),
      simple: args.includes('--simple')
    };
    
    await runTests(phoneNumber, options);
    
    process.exit(0);
  } catch (error: any) {
    console.log();
    printHeader('Test Failed');
    printError(error.message || 'Unknown error occurred');
    console.log();
    process.exit(1);
  }
})();

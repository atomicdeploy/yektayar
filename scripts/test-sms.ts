#!/usr/bin/env bun
/**
 * SMS Testing Script for FarazSMS Integration
 * 
 * This script helps developers test FarazSMS configuration and send test OTP messages.
 * It provides comprehensive validation, error handling, and helpful feedback.
 * 
 * Usage:
 *   bun scripts/test-sms.ts <phone_number> [otp_code] [options]
 * 
 * Options:
 *   --check-only    Only validate configuration without sending SMS
 *   --verbose       Show detailed output including API configuration
 *   --help          Show this help message
 * 
 * Examples:
 *   bun scripts/test-sms.ts 09121234567
 *   bun scripts/test-sms.ts 09121234567 654321
 *   bun scripts/test-sms.ts 09121234567 --check-only
 *   bun scripts/test-sms.ts 09121234567 --verbose
 * 
 * @see {@link https://docs.iranpayamak.com/ | FarazSMS Documentation}
 */

import { testSMSConfiguration, validatePhoneNumber } from '../packages/backend/src/services/smsService';

/**
 * Colors for terminal output (ANSI escape codes)
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Print colored message to console
 */
function printColored(message: string, color: string) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Print header section
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
 * Print warning message
 */
function printWarning(message: string) {
  printColored(`⚠ ${message}`, colors.yellow);
}

/**
 * Print info message
 */
function printInfo(message: string) {
  printColored(`ℹ ${message}`, colors.blue);
}

/**
 * Show help message
 */
function showHelp() {
  printHeader('FarazSMS Integration Test - Help');
  
  console.log('Usage:');
  console.log('  bun scripts/test-sms.ts <phone_number> [otp_code] [options]');
  console.log();
  
  console.log('Arguments:');
  console.log('  phone_number    Iranian phone number (format: 09xxxxxxxxx)');
  console.log('  otp_code        OTP code to send (default: 123456)');
  console.log();
  
  console.log('Options:');
  console.log('  --check-only    Only validate configuration without sending SMS');
  console.log('  --verbose       Show detailed output including API configuration');
  console.log('  --help          Show this help message');
  console.log();
  
  console.log('Examples:');
  console.log('  bun scripts/test-sms.ts 09121234567');
  console.log('  bun scripts/test-sms.ts 09121234567 654321');
  console.log('  bun scripts/test-sms.ts 09121234567 --check-only');
  console.log('  bun scripts/test-sms.ts 09121234567 --verbose');
  console.log();
  
  console.log('Environment Variables Required:');
  console.log('  FARAZSMS_API_KEY          Your FarazSMS API key');
  console.log('  FARAZSMS_PATTERN_CODE     Pattern UID for OTP template');
  console.log('  FARAZSMS_LINE_NUMBER      Your sender line number');
  console.log();
  
  console.log('Optional Environment Variables:');
  console.log('  FARAZSMS_API_ENDPOINT     Custom API endpoint (default: iranpayamak.com)');
  console.log('  FARAZSMS_AUTH_FORMAT      Auth format: Api-Key or AccessKey (default: Api-Key)');
  console.log();
  
  console.log('Setup Instructions:');
  console.log('  1. Get API key from https://panel.farazsms.com/');
  console.log('  2. Create OTP pattern in FarazSMS panel');
  console.log('  3. Configure .env file with credentials');
  console.log('  4. Run this script to test');
  console.log();
  
  console.log('Documentation:');
  console.log('  See docs/SMS-OTP-INTEGRATION.md for detailed setup guide');
  console.log();
  
  process.exit(0);
}

/**
 * Validate environment configuration
 */
function validateEnvironment(verbose: boolean = false): boolean {
  const requiredVars = [
    'FARAZSMS_API_KEY',
    'FARAZSMS_PATTERN_CODE',
    'FARAZSMS_LINE_NUMBER'
  ];
  
  const optionalVars = [
    'FARAZSMS_API_ENDPOINT',
    'FARAZSMS_AUTH_FORMAT'
  ];
  
  let allPresent = true;
  
  console.log('Environment Configuration:');
  console.log();
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      printError(`${varName}: Not configured`);
      allPresent = false;
    } else {
      printSuccess(`${varName}: Configured`);
      if (verbose && !varName.includes('KEY')) {
        console.log(`  Value: ${value}`);
      }
    }
  }
  
  // Check optional variables
  if (verbose) {
    console.log();
    console.log('Optional Configuration:');
    for (const varName of optionalVars) {
      const value = process.env[varName];
      if (value) {
        printInfo(`${varName}: ${value}`);
      } else {
        console.log(`  ${varName}: Using default`);
      }
    }
  }
  
  return allPresent;
}

/**
 * Main test function
 */
async function runTest(phoneNumber: string, otp: string, checkOnly: boolean, verbose: boolean) {
  printHeader('FarazSMS Integration Test');
  
  // Step 1: Validate phone number format
  console.log('Step 1: Validating Phone Number');
  console.log('---');
  if (!validatePhoneNumber(phoneNumber)) {
    printError(`Invalid phone number format: ${phoneNumber}`);
    printInfo('Expected format: 09xxxxxxxxx (11 digits starting with 09)');
    console.log();
    console.log('Examples of valid phone numbers:');
    console.log('  09121234567');
    console.log('  09351234567');
    console.log('  09191234567');
    console.log();
    throw new Error('Invalid phone number format');
  }
  printSuccess(`Phone number format is valid: ${phoneNumber}`);
  console.log();
  
  // Step 2: Validate environment configuration
  console.log('Step 2: Checking Environment Configuration');
  console.log('---');
  const envValid = validateEnvironment(verbose);
  console.log();
  
  if (!envValid) {
    printError('Environment configuration is incomplete');
    console.log();
    console.log('To configure environment variables:');
    console.log('  1. Copy .env.example to .env');
    console.log('  2. Edit .env and add your FarazSMS credentials');
    console.log('  3. Or use: ./scripts/manage-env.sh set FARAZSMS_API_KEY "your_key"');
    console.log();
    throw new Error('Missing required environment variables');
  }
  printSuccess('Environment configuration is complete');
  console.log();
  
  // Step 3: Test SMS sending (if not check-only mode)
  if (checkOnly) {
    printWarning('Skipping SMS sending (--check-only mode)');
    printInfo('Configuration is valid. Remove --check-only to send actual SMS.');
    console.log();
    return;
  }
  
  console.log('Step 3: Sending Test SMS');
  console.log('---');
  printInfo(`Sending OTP: ${otp} to ${phoneNumber}`);
  console.log();
  
  try {
    await testSMSConfiguration(phoneNumber, otp);
    console.log();
    printSuccess('SMS sent successfully!');
    console.log();
    printInfo('Check your phone for the SMS message.');
    printInfo('SMS should arrive within 5 seconds (pattern-based delivery).');
  } catch (error: any) {
    console.log();
    printError('SMS sending failed');
    console.log();
    console.log('Error Details:');
    console.log(`  ${error.message}`);
    console.log();
    
    // Provide helpful troubleshooting tips
    console.log('Troubleshooting Tips:');
    if (error.message.includes('401')) {
      console.log('  • Verify your API key is correct');
      console.log('  • Check if API key is active in FarazSMS panel');
      console.log('  • Try regenerating API key if needed');
    } else if (error.message.includes('400')) {
      console.log('  • Verify pattern code is correct and approved');
      console.log('  • Check if line number is correct');
      console.log('  • Ensure pattern variables match (e.g., %otp%)');
    } else if (error.message.includes('429')) {
      console.log('  • Wait a few minutes before trying again');
      console.log('  • Check your SMS quota in FarazSMS panel');
    } else {
      console.log('  • Check your internet connection');
      console.log('  • Verify FarazSMS service is operational');
      console.log('  • Check FarazSMS panel for account status');
    }
    console.log();
    
    throw error;
  }
}

// ============================================================================
// Main Script Execution
// ============================================================================

(async () => {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
    }
    
    // Check if phone number is provided
    if (args.length === 0 || args[0].startsWith('--')) {
      printError('Error: Phone number is required');
      console.log();
      console.log('Usage: bun scripts/test-sms.ts <phone_number> [otp_code] [options]');
      console.log();
      console.log('Run with --help for more information:');
      console.log('  bun scripts/test-sms.ts --help');
      console.log();
      process.exit(1);
    }
    
    // Parse arguments
    const phoneNumber = args[0];
    let otp = '123456';
    let checkOnly = false;
    let verbose = false;
    
    // Parse remaining arguments
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--check-only') {
        checkOnly = true;
      } else if (arg === '--verbose') {
        verbose = true;
      } else if (!arg.startsWith('--')) {
        otp = arg;
      }
    }
    
    // Run the test
    await runTest(phoneNumber, otp, checkOnly, verbose);
    
    // Success
    printHeader('Test Completed Successfully ✓');
    process.exit(0);
    
  } catch (error: any) {
    // Error handling
    console.log();
    printHeader('Test Failed ✗');
    console.log();
    printError(error.message || 'Unknown error occurred');
    console.log();
    console.log('For help, run: bun scripts/test-sms.ts --help');
    console.log();
    process.exit(1);
  }
})();

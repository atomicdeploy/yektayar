#!/usr/bin/env bun
/**
 * Balance and Credit Testing Script
 * 
 * Tests SMS account balance and credit retrieval from:
 * - IranPayamak API (legacy account balance)
 * - IPPanel REST API (legacy user credit)
 * - Default API (current account credit)
 * 
 * Usage:
 *   bun scripts/test-balance-credit.ts [options]
 * 
 * Options:
 *   --all              Test all endpoints (default)
 *   --iranpayamak      Test IranPayamak balance only
 *   --ippanel          Test IPPanel REST credit only
 *   --edge             Test default credit API only
 *   --help             Show help message
 * 
 * Examples:
 *   bun scripts/test-balance-credit.ts
 *   bun scripts/test-balance-credit.ts --all
 *   bun scripts/test-balance-credit.ts --iranpayamak
 *   bun scripts/test-balance-credit.ts --edge
 * 
 * @see {@link https://docs.iranpayamak.com/account-balance-13717911e0 | IranPayamak Account Balance}
 * @see {@link https://ippanelcom.github.io/Edge-Document/docs/payment/my-credit | IPPanel Edge Credit}
 */

import {
  getAccountBalance,
  getUserCredit,
  getCredit
} from '../packages/backend/src/services/smsService';

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
  data?: any;
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
  printHeader('Balance and Credit Testing Script - Help');
  
  console.log('Usage:');
  console.log('  bun scripts/test-balance-credit.ts [options]');
  console.log();
  
  console.log('Options:');
  console.log('  --all              Test all endpoints (default)');
  console.log('  --iranpayamak      Test IranPayamak balance only');
  console.log('  --ippanel          Test IPPanel REST credit only');
  console.log('  --edge             Test default credit API only');
  console.log('  --help             Show this help message');
  console.log();
  
  console.log('Examples:');
  console.log('  bun scripts/test-balance-credit.ts');
  console.log('  bun scripts/test-balance-credit.ts --all');
  console.log('  bun scripts/test-balance-credit.ts --iranpayamak');
  console.log('  bun scripts/test-balance-credit.ts --edge');
  console.log();
  
  console.log('Environment Variables Required:');
  console.log('  FARAZSMS_API_KEY    Your FarazSMS/IPPanel API key');
  console.log();
  
  console.log('Documentation:');
  console.log('  - IranPayamak Balance: https://docs.iranpayamak.com/account-balance-13717911e0');
  console.log('  - IPPanel Credit: http://docs.ippanel.com/#operation/GetCredit');
  console.log('  - Default Credit API: https://ippanelcom.github.io/Edge-Document/docs/payment/my-credit');
  console.log();
  
  process.exit(0);
}

/**
 * Test IranPayamak Account Balance
 */
async function testIranPayamakBalance(): Promise<TestResult> {
  const testName = 'IranPayamak Account Balance';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    
    const result = await getAccountBalance();
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} retrieved successfully`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    return {
      name: testName,
      status: 'success',
      message: 'Balance retrieved successfully',
      duration,
      data: result
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
 * Test IPPanel REST API Credit
 */
async function testIPPanelCredit(): Promise<TestResult> {
  const testName = 'IPPanel REST API Credit';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    
    const result = await getUserCredit();
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} retrieved successfully`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    return {
      name: testName,
      status: 'success',
      message: 'Credit retrieved successfully',
      duration,
      data: result
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
 * Test account credit (default API)
 */
async function testEdgeCredit(): Promise<TestResult> {
  const testName = 'Account Credit (Default API)';
  const startTime = Date.now();
  
  try {
    printInfo(`Testing ${testName}...`);
    
    const result = await getCredit();
    const duration = Date.now() - startTime;
    
    printSuccess(`${testName} retrieved successfully`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`  Response:`, JSON.stringify(result, null, 2));
    
    return {
      name: testName,
      status: 'success',
      message: 'Credit retrieved successfully',
      duration,
      data: result
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
  
  console.log('| Endpoint | Status | Duration | Message |');
  console.log('|----------|--------|----------|---------|');
  
  for (const result of testResults) {
    const statusIcon = result.status === 'success' ? '✓' : result.status === 'failed' ? '✗' : '-';
    const statusColor = result.status === 'success' ? colors.green : result.status === 'failed' ? colors.red : colors.yellow;
    const durationStr = result.duration ? `${result.duration}ms` : 'N/A';
    const message = result.message.length > 40 ? result.message.substring(0, 37) + '...' : result.message;
    
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
    console.log();
    
    // Provide troubleshooting tips
    console.log('Troubleshooting Tips:');
    console.log('  • Verify your FARAZSMS_API_KEY is correct and active');
    console.log('  • Check if your account has sufficient permissions');
    console.log('  • Ensure the API key works for both IranPayamak and IPPanel');
    console.log('  • Check your internet connection');
    console.log('  • Verify the SMS provider services are operational');
  } else {
    console.log();
    printSuccess('All tests passed successfully! ✓');
  }
  
  console.log();
}

/**
 * Print balance/credit summary
 */
function printBalanceSummary() {
  printHeader('Balance & Credit Summary');
  
  const successResults = testResults.filter(r => r.status === 'success' && r.data);
  
  if (successResults.length === 0) {
    printWarning('No balance/credit data available');
    return;
  }
  
  for (const result of successResults) {
    console.log(`${colors.bold}${result.name}:${colors.reset}`);
    
    if (result.data) {
      // Try to extract credit/balance from different response formats
      if (result.data.data && typeof result.data.data.credit !== 'undefined') {
        printSuccess(`  Credit: ${result.data.data.credit}`);
      } else if (result.data.data && typeof result.data.data.balance !== 'undefined') {
        printSuccess(`  Balance: ${result.data.data.balance}`);
      } else if (typeof result.data.credit !== 'undefined') {
        printSuccess(`  Credit: ${result.data.credit}`);
      } else if (typeof result.data.balance !== 'undefined') {
        printSuccess(`  Balance: ${result.data.balance}`);
      } else {
        printInfo('  Data format: ' + JSON.stringify(result.data).substring(0, 100) + '...');
      }
    }
    
    console.log();
  }
}

/**
 * Main test function
 */
async function runTests(options: {
  all?: boolean;
  iranpayamak?: boolean;
  ippanel?: boolean;
  edge?: boolean;
}) {
  printHeader('Balance and Credit Testing');
  
  // Check environment
  const apiKey = process.env.FARAZSMS_API_KEY;
  if (!apiKey) {
    printError('FARAZSMS_API_KEY is not set in environment');
    printInfo('Please set FARAZSMS_API_KEY before running tests');
    console.log();
    console.log('Example:');
    console.log('  export FARAZSMS_API_KEY="your_api_key_here"');
    console.log('  bun scripts/test-balance-credit.ts');
    console.log();
    process.exit(1);
  }
  
  printSuccess('API key configured');
  printInfo(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log();
  
  // Run tests based on options
  const runAll = options.all || (!options.iranpayamak && !options.ippanel && !options.edge);
  
  console.log('='.repeat(70));
  console.log();
  
  if (runAll || options.iranpayamak) {
    const result = await testIranPayamakBalance();
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.ippanel) {
    const result = await testIPPanelCredit();
    testResults.push(result);
    console.log();
  }
  
  if (runAll || options.edge) {
    const result = await testEdgeCredit();
    testResults.push(result);
    console.log();
  }
  
  console.log('='.repeat(70));
  console.log();
  
  // Print results table
  printResultsTable();
  
  // Print balance summary
  printBalanceSummary();
}

// ============================================================================
// Main Script Execution
// ============================================================================

(async () => {
  try {
    const args = process.argv.slice(2);
    
    // Check for help
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
    }
    
    const options = {
      all: args.includes('--all'),
      iranpayamak: args.includes('--iranpayamak'),
      ippanel: args.includes('--ippanel'),
      edge: args.includes('--edge')
    };
    
    await runTests(options);
    
    // Exit with error code if any tests failed
    const failedCount = testResults.filter(r => r.status === 'failed').length;
    process.exit(failedCount > 0 ? 1 : 0);
    
  } catch (error: any) {
    console.log();
    printHeader('Test Failed');
    printError(error.message || 'Unknown error occurred');
    console.log();
    process.exit(1);
  }
})();

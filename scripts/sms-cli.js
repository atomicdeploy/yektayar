#!/usr/bin/env node

/**
 * SMS CLI (Command Line Interface) Tool
 * 
 * A command-line interface for SMS operations that can be used for automation and scripting.
 * 
 * Features:
 * - Get credit balance
 * - Send single SMS
 * - Send pattern-based OTP
 * - Send Voice OTP (VOTP)
 * - Fetch inbox messages
 * - Send sample SMS
 * - Send simple SMS (bulk)
 * - Non-interactive mode for automation
 * 
 * Usage:
 *   npm run sms:cli -- <command> [options]
 *   node scripts/sms-cli.js <command> [options]
 * 
 * Commands:
 *   balance              Get credit balance
 *   balance-iran         Get account balance (IranPayamak)
 *   send                 Send single SMS
 *   otp                  Send pattern-based OTP
 *   votp                 Send Voice OTP
 *   inbox                Fetch inbox messages
 *   sample               Send sample SMS to account owner
 *   simple               Send simple SMS (bulk)
 * 
 * Examples:
 *   npm run sms:cli -- balance
 *   npm run sms:cli -- send --to 09121234567 --message "Hello"
 *   npm run sms:cli -- otp --to 09121234567 --code 123456
 *   npm run sms:cli -- votp --to 09121234567 --code 654321
 *   npm run sms:cli -- inbox
 *   npm run sms:cli -- sample --message "Test message"
 *   npm run sms:cli -- simple --to 09121234567,09127654321 --message "Bulk SMS"
 */

import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env
config({ path: join(__dirname, '..', '.env') });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

// Emojis
const emojis = {
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  money: '💰',
  send: '📤',
  inbox: '📥',
};

/**
 * Print colored message
 */
function print(message, color = 'reset', emoji = '') {
  const colorCode = colors[color] || colors.reset;
  const emojiStr = emoji ? `${emoji} ` : '';
  console.log(`${colorCode}${emojiStr}${message}${colors.reset}`);
}

/**
 * Print error and exit
 */
function printError(message, exitCode = 1) {
  print(message, 'red', emojis.cross);
  process.exit(exitCode);
}

/**
 * Print success
 */
function printSuccess(message) {
  print(message, 'green', emojis.check);
}

/**
 * Print info
 */
function printInfo(message) {
  print(message, 'cyan', emojis.info);
}

/**
 * Print warning
 */
function printWarning(message) {
  print(message, 'yellow', emojis.warning);
}

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Get API configuration
 */
function getAPIConfig() {
  const apiKey = process.env.FARAZSMS_API_KEY;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  
  if (!apiKey) {
    printError('FARAZSMS_API_KEY is not configured in environment variables');
  }
  
  return { apiKey, lineNumber, patternCode };
}

/**
 * Validate phone number
 */
function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Normalize phone number
 */
function normalizePhoneNumber(phoneNumber) {
  let normalized = phoneNumber;
  
  if (phoneNumber.startsWith('0')) {
    normalized = '98' + phoneNumber.substring(1);
  } else if (phoneNumber.startsWith('+98')) {
    normalized = phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith('98')) {
    normalized = '98' + phoneNumber;
  }
  
  return normalized;
}

/**
 * Get credit balance (IPPanel)
 */
async function getCreditBalance() {
  const { apiKey } = getAPIConfig();
  const endpoint = 'http://rest.ippanel.com/v1/credit';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `AccessKey ${apiKey}`
  };
  
  const result = await makeRequest(endpoint, {
    method: 'GET',
    headers
  });
  
  printSuccess('Credit balance retrieved successfully');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Get account balance (IranPayamak)
 */
async function getAccountBalance() {
  const { apiKey } = getAPIConfig();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/account/balance';
  
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey
  };
  
  const result = await makeRequest(endpoint, {
    method: 'GET',
    headers
  });
  
  printSuccess('Account balance retrieved successfully');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Send single SMS
 */
async function sendSingleSMS(recipient, message) {
  if (!validatePhoneNumber(recipient)) {
    printError(`Invalid phone number format: ${recipient}. Expected: 09xxxxxxxxx`);
  }
  
  const { apiKey, lineNumber } = getAPIConfig();
  
  if (!lineNumber) {
    printError('FARAZSMS_LINE_NUMBER is required for sending SMS');
  }
  
  const endpoint = 'https://edge.ippanel.com/v1/api/send';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}`
  };
  
  const body = {
    originator: lineNumber,
    recipients: [recipient],
    message: message
  };
  
  const result = await makeRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  printSuccess(`SMS sent to ${recipient}`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Send pattern OTP
 */
async function sendPatternOTP(recipient, otpCode) {
  if (!validatePhoneNumber(recipient)) {
    printError(`Invalid phone number format: ${recipient}. Expected: 09xxxxxxxxx`);
  }
  
  const { apiKey, lineNumber, patternCode } = getAPIConfig();
  
  if (!lineNumber) {
    printError('FARAZSMS_LINE_NUMBER is required');
  }
  if (!patternCode) {
    printError('FARAZSMS_PATTERN_CODE is required');
  }
  
  const internationalPhone = '+' + normalizePhoneNumber(recipient);
  
  const endpoint = 'https://edge.ippanel.com/v1/api/send';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': apiKey
  };
  
  const body = {
    sending_type: 'pattern',
    from_number: lineNumber,
    code: patternCode,
    recipients: [internationalPhone],
    params: {
      'verification-code': otpCode
    }
  };
  
  const result = await makeRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  printSuccess(`Pattern OTP sent to ${recipient} (Code: ${otpCode})`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Send Voice OTP
 */
async function sendVoiceOTP(recipient, otpCode) {
  if (!validatePhoneNumber(recipient)) {
    printError(`Invalid phone number format: ${recipient}. Expected: 09xxxxxxxxx`);
  }
  
  const { apiKey } = getAPIConfig();
  
  const normalizedRecipient = normalizePhoneNumber(recipient);
  
  const endpoint = 'https://edge.ippanel.com/v1/api/votp/send';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}`
  };
  
  const body = {
    code: otpCode.toString(),
    recipient: normalizedRecipient
  };
  
  const result = await makeRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  printSuccess(`Voice OTP sent to ${recipient} (Code: ${otpCode})`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Fetch inbox messages
 */
async function fetchInbox() {
  const { apiKey } = getAPIConfig();
  const endpoint = 'http://rest.ippanel.com/v1/messages/inbox';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `AccessKey ${apiKey}`
  };
  
  const result = await makeRequest(endpoint, {
    method: 'GET',
    headers
  });
  
  printSuccess('Inbox messages retrieved');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Send sample SMS
 */
async function sendSampleSMS(message) {
  const { apiKey, lineNumber } = getAPIConfig();
  
  if (!lineNumber) {
    printError('FARAZSMS_LINE_NUMBER is required');
  }
  
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/sample';
  
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey
  };
  
  const body = {
    text: message,
    line_number: lineNumber,
    number_format: 'english'
  };
  
  const result = await makeRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  printSuccess('Sample SMS sent to account owner');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Send simple SMS (bulk)
 */
async function sendSimpleSMS(recipients, message) {
  const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);
  
  if (recipientList.length === 0) {
    printError('At least one recipient is required');
  }
  
  // Validate all phone numbers
  const invalidNumbers = recipientList.filter(r => !validatePhoneNumber(r));
  if (invalidNumbers.length > 0) {
    printError(`Invalid phone numbers: ${invalidNumbers.join(', ')}`);
  }
  
  const { apiKey, lineNumber } = getAPIConfig();
  
  if (!lineNumber) {
    printError('FARAZSMS_LINE_NUMBER is required');
  }
  
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/simple';
  
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey
  };
  
  const body = {
    text: message,
    line_number: lineNumber,
    recipients: recipientList,
    number_format: 'english'
  };
  
  const result = await makeRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  printSuccess(`Simple SMS sent to ${recipientList.length} recipient(s)`);
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
SMS CLI Tool - YektaYar Platform

Usage:
  npm run sms:cli -- <command> [options]
  node scripts/sms-cli.js <command> [options]

Commands:
  balance              Get credit balance (IPPanel)
  balance-iran         Get account balance (IranPayamak)
  send                 Send single SMS
  otp                  Send pattern-based OTP
  votp                 Send Voice OTP
  inbox                Fetch inbox messages
  sample               Send sample SMS to account owner
  simple               Send simple SMS (bulk support)
  help                 Show this help message

Options:
  --to <phone>         Recipient phone number (09xxxxxxxxx)
  --message <text>     Message text
  --code <otp>         OTP code (default: random 6-digit)

Examples:
  npm run sms:cli -- balance
  npm run sms:cli -- balance-iran
  npm run sms:cli -- send --to 09121234567 --message "Hello World"
  npm run sms:cli -- otp --to 09121234567 --code 123456
  npm run sms:cli -- otp --to 09121234567
  npm run sms:cli -- votp --to 09121234567 --code 654321
  npm run sms:cli -- inbox
  npm run sms:cli -- sample --message "Test message"
  npm run sms:cli -- simple --to 09121234567,09127654321 --message "Bulk SMS"

Environment Variables:
  FARAZSMS_API_KEY          Your FarazSMS API key (required)
  FARAZSMS_LINE_NUMBER      Your sender line number (required for sending)
  FARAZSMS_PATTERN_CODE     Pattern code (required for pattern OTP)
`);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = { command: null, options: {} };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (!arg.startsWith('--')) {
      if (!result.command) {
        result.command = arg;
      }
    } else {
      const key = arg.substring(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        result.options[key] = value;
        i++;
      } else {
        result.options[key] = true;
      }
    }
  }
  
  return result;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  const { command, options } = parseArgs(args);
  
  if (!command) {
    printError('No command specified. Use --help for usage information.');
  }
  
  try {
    switch (command) {
      case 'balance':
        await getCreditBalance();
        break;
        
      case 'balance-iran':
        await getAccountBalance();
        break;
        
      case 'send':
        if (!options.to) {
          printError('--to option is required');
        }
        if (!options.message) {
          printError('--message option is required');
        }
        await sendSingleSMS(options.to, options.message);
        break;
        
      case 'otp':
        if (!options.to) {
          printError('--to option is required');
        }
        const otpCode = options.code || Math.floor(100000 + Math.random() * 900000).toString();
        await sendPatternOTP(options.to, otpCode);
        break;
        
      case 'votp':
        if (!options.to) {
          printError('--to option is required');
        }
        const votpCode = options.code || Math.floor(100000 + Math.random() * 900000).toString();
        await sendVoiceOTP(options.to, votpCode);
        break;
        
      case 'inbox':
        await fetchInbox();
        break;
        
      case 'sample':
        if (!options.message) {
          printError('--message option is required');
        }
        await sendSampleSMS(options.message);
        break;
        
      case 'simple':
        if (!options.to) {
          printError('--to option is required (comma-separated for multiple)');
        }
        if (!options.message) {
          printError('--message option is required');
        }
        await sendSimpleSMS(options.to, options.message);
        break;
        
      case 'help':
        showHelp();
        break;
        
      default:
        printError(`Unknown command: ${command}. Use --help for usage information.`);
    }
    
    process.exit(0);
  } catch (error) {
    printError(`Error: ${error.message}`);
  }
}

// Run the application
main().catch((error) => {
  printError(`Fatal error: ${error.message}`);
});

#!/usr/bin/env node

/**
 * SMS TUI (Text User Interface) Management and Testing Tool
 * 
 * A feature-rich console application for managing and testing SMS capabilities
 * using the FarazSMS/IPPanel/IranPayamak provider.
 * 
 * Features:
 * - Check credit balance
 * - Send single SMS
 * - Send pattern-based OTP
 * - Send Voice OTP (VOTP)
 * - Fetch inbox messages
 * - Send sample SMS (to account owner)
 * - Send simple SMS (with bulk support)
 * - View message status
 * - Interactive menu with colorized output
 * - Support for environment variables
 * 
 * Usage:
 *   npm run sms:tui
 *   node scripts/sms-tui.js
 */

import { createInterface } from 'readline';
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env
config({ path: join(__dirname, '..', '.env') });

// ANSI color codes and emojis for rich console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

const emojis = {
  rocket: '🚀',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  hourglass: '⏳',
  sparkles: '✨',
  fire: '🔥',
  heart: '❤️',
  lightning: '⚡',
  tools: '🔧',
  chart: '📊',
  envelope: '✉️',
  phone: '📱',
  credit: '💳',
  inbox: '📥',
  send: '📤',
  voice: '🔊',
  pattern: '🔑',
  money: '💰',
  message: '💬',
  list: '📋',
  gear: '⚙️'
};

/**
 * Display styled header
 */
function displayHeader() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        SMS Management & Testing Tool                         ║');
  console.log('║        YektaYar Platform                                      ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

/**
 * Print colored and styled message
 */
function print(message, color = 'white', emoji = '') {
  const colorCode = colors[color] || colors.white;
  const emojiStr = emoji ? `${emoji} ` : '';
  console.log(`${colorCode}${emojiStr}${message}${colors.reset}`);
}

/**
 * Print error message
 */
function printError(message, details = null) {
  print(`ERROR: ${message}`, 'red', emojis.cross);
  if (details) {
    console.log(`${colors.dim}${details}${colors.reset}`);
  }
}

/**
 * Print success message
 */
function printSuccess(message) {
  print(message, 'green', emojis.check);
}

/**
 * Print info message
 */
function printInfo(message) {
  print(message, 'cyan', emojis.info);
}

/**
 * Print warning message
 */
function printWarning(message) {
  print(message, 'yellow', emojis.warning);
}

/**
 * Make HTTP/HTTPS request helper
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
 * Get API configuration from environment
 */
function getAPIConfig() {
  const apiKey = process.env.FARAZSMS_API_KEY;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  
  if (!apiKey) {
    throw new Error('FARAZSMS_API_KEY is not configured in environment variables');
  }
  
  return { apiKey, lineNumber, patternCode };
}

/**
 * Validate Iranian phone number format
 */
function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Normalize phone number to international format (989xxxxxxxxx)
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
 * Get credit balance (IPPanel REST API)
 */
async function getCreditBalance() {
  try {
    print('Fetching account credit balance...', 'cyan', emojis.hourglass);
    
    const { apiKey } = getAPIConfig();
    const endpoint = 'https://rest.ippanel.com/v1/credit';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `AccessKey ${apiKey}`
    };
    
    const result = await makeRequest(endpoint, {
      method: 'GET',
      headers
    });
    
    printSuccess('Credit balance retrieved successfully!');
    console.log('');
    print(`Credit: ${result.data.credit} units`, 'green', emojis.money);
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to get credit balance', error.message);
    throw error;
  }
}

/**
 * Get account balance (IranPayamak API)
 */
async function getAccountBalance() {
  try {
    print('Fetching account balance...', 'cyan', emojis.hourglass);
    
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
    
    printSuccess('Account balance retrieved successfully!');
    console.log('');
    print(`Balance: ${JSON.stringify(result, null, 2)}`, 'green', emojis.money);
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to get account balance', error.message);
    throw error;
  }
}

/**
 * Send single SMS (IPPanel Edge API)
 */
async function sendSingleSMS(recipient, message) {
  try {
    print(`Sending SMS to ${recipient}...`, 'cyan', emojis.send);
    
    const { apiKey, lineNumber } = getAPIConfig();
    
    if (!lineNumber) {
      throw new Error('FARAZSMS_LINE_NUMBER is required for sending SMS');
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
    
    printSuccess('SMS sent successfully!');
    console.log('');
    print(`Response: ${JSON.stringify(result, null, 2)}`, 'dim');
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to send SMS', error.message);
    throw error;
  }
}

/**
 * Send pattern-based OTP (IPPanel Edge API)
 */
async function sendPatternOTP(recipient, otpCode) {
  try {
    print(`Sending pattern OTP to ${recipient}...`, 'cyan', emojis.pattern);
    
    const { apiKey, lineNumber, patternCode } = getAPIConfig();
    
    if (!lineNumber) {
      throw new Error('FARAZSMS_LINE_NUMBER is required');
    }
    if (!patternCode) {
      throw new Error('FARAZSMS_PATTERN_CODE is required');
    }
    
    // Convert phone number to international format
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
    
    printSuccess('Pattern OTP sent successfully!');
    console.log('');
    print(`OTP Code: ${otpCode}`, 'green', emojis.check);
    print(`Response: ${JSON.stringify(result, null, 2)}`, 'dim');
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to send pattern OTP', error.message);
    throw error;
  }
}

/**
 * Send Voice OTP (VOTP)
 */
async function sendVoiceOTP(recipient, otpCode) {
  try {
    print(`Sending Voice OTP to ${recipient}...`, 'cyan', emojis.voice);
    
    const { apiKey } = getAPIConfig();
    
    // Normalize phone number to international format (989xxxxxxxxx)
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
    
    printSuccess('Voice OTP sent successfully!');
    console.log('');
    print(`OTP Code: ${otpCode}`, 'green', emojis.check);
    print(`Response: ${JSON.stringify(result, null, 2)}`, 'dim');
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to send Voice OTP', error.message);
    throw error;
  }
}

/**
 * Fetch inbox messages (IPPanel REST API)
 */
async function fetchInbox() {
  try {
    print('Fetching inbox messages...', 'cyan', emojis.inbox);
    
    const { apiKey } = getAPIConfig();
    const endpoint = 'https://rest.ippanel.com/v1/messages/inbox';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `AccessKey ${apiKey}`
    };
    
    const result = await makeRequest(endpoint, {
      method: 'GET',
      headers
    });
    
    printSuccess('Inbox messages retrieved successfully!');
    console.log('');
    
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      print(`Total Messages: ${result.data.length}`, 'cyan', emojis.list);
      console.log('');
      
      result.data.forEach((msg, index) => {
        console.log(`${colors.bright}Message ${index + 1}:${colors.reset}`);
        console.log(`  From: ${msg.sender || 'N/A'}`);
        console.log(`  Message: ${msg.message || 'N/A'}`);
        console.log(`  Time: ${msg.created_at || 'N/A'}`);
        console.log('');
      });
    } else {
      printInfo('No messages in inbox');
    }
    
    return result;
  } catch (error) {
    printError('Failed to fetch inbox', error.message);
    throw error;
  }
}

/**
 * Send sample SMS (to account owner)
 */
async function sendSampleSMS(message) {
  try {
    print('Sending sample SMS to account owner...', 'cyan', emojis.send);
    
    const { apiKey, lineNumber } = getAPIConfig();
    
    if (!lineNumber) {
      throw new Error('FARAZSMS_LINE_NUMBER is required');
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
    
    printSuccess('Sample SMS sent successfully to account owner!');
    console.log('');
    print(`Response: ${JSON.stringify(result, null, 2)}`, 'dim');
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to send sample SMS', error.message);
    throw error;
  }
}

/**
 * Send simple SMS (bulk support)
 */
async function sendSimpleSMS(recipients, message) {
  try {
    print(`Sending simple SMS to ${recipients.length} recipient(s)...`, 'cyan', emojis.send);
    
    const { apiKey, lineNumber } = getAPIConfig();
    
    if (!lineNumber) {
      throw new Error('FARAZSMS_LINE_NUMBER is required');
    }
    
    const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/simple';
    
    const headers = {
      'Content-Type': 'application/json',
      'Api-Key': apiKey
    };
    
    const body = {
      text: message,
      line_number: lineNumber,
      recipients: recipients,
      number_format: 'english'
    };
    
    const result = await makeRequest(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    printSuccess('Simple SMS sent successfully!');
    console.log('');
    print(`Recipients: ${recipients.join(', ')}`, 'green');
    print(`Response: ${JSON.stringify(result, null, 2)}`, 'dim');
    console.log('');
    
    return result;
  } catch (error) {
    printError('Failed to send simple SMS', error.message);
    throw error;
  }
}

/**
 * Display main menu
 */
function displayMenu() {
  console.log('');
  print('═══ Available Actions ═══', 'cyan', emojis.tools);
  console.log(`  ${colors.bright}1${colors.reset} - Get credit balance (IPPanel)`);
  console.log(`  ${colors.bright}2${colors.reset} - Get account balance (IranPayamak)`);
  console.log(`  ${colors.bright}3${colors.reset} - Send single SMS`);
  console.log(`  ${colors.bright}4${colors.reset} - Send pattern-based OTP`);
  console.log(`  ${colors.bright}5${colors.reset} - Send Voice OTP (VOTP)`);
  console.log(`  ${colors.bright}6${colors.reset} - Fetch inbox messages`);
  console.log(`  ${colors.bright}7${colors.reset} - Send sample SMS (to account owner)`);
  console.log(`  ${colors.bright}8${colors.reset} - Send simple SMS (bulk support)`);
  console.log(`  ${colors.bright}h${colors.reset} - Show this menu`);
  console.log(`  ${colors.bright}q${colors.reset} - Quit`);
  console.log('');
}

/**
 * Get user input
 */
function getUserInput(prompt) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Process user command
 */
async function processCommand(command) {
  try {
    switch (command) {
      case '1':
        await getCreditBalance();
        break;
        
      case '2':
        await getAccountBalance();
        break;
        
      case '3': {
        const recipient = await getUserInput('Enter recipient phone number (09xxxxxxxxx): ');
        if (!recipient) {
          printWarning('Recipient is required');
          break;
        }
        if (!validatePhoneNumber(recipient)) {
          printError('Invalid phone number format. Expected: 09xxxxxxxxx');
          break;
        }
        const message = await getUserInput('Enter message text: ');
        if (!message) {
          printWarning('Message is required');
          break;
        }
        await sendSingleSMS(recipient, message);
        break;
      }
        
      case '4': {
        const recipient = await getUserInput('Enter recipient phone number (09xxxxxxxxx): ');
        if (!recipient) {
          printWarning('Recipient is required');
          break;
        }
        if (!validatePhoneNumber(recipient)) {
          printError('Invalid phone number format. Expected: 09xxxxxxxxx');
          break;
        }
        const otpCode = await getUserInput('Enter OTP code (default: random 6-digit): ');
        const finalOTP = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
        await sendPatternOTP(recipient, finalOTP);
        break;
      }
        
      case '5': {
        const recipient = await getUserInput('Enter recipient phone number (09xxxxxxxxx): ');
        if (!recipient) {
          printWarning('Recipient is required');
          break;
        }
        if (!validatePhoneNumber(recipient)) {
          printError('Invalid phone number format. Expected: 09xxxxxxxxx');
          break;
        }
        const otpCode = await getUserInput('Enter OTP code (default: random 6-digit): ');
        const finalOTP = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
        await sendVoiceOTP(recipient, finalOTP);
        break;
      }
        
      case '6':
        await fetchInbox();
        break;
        
      case '7': {
        const message = await getUserInput('Enter message text: ');
        if (!message) {
          printWarning('Message is required');
          break;
        }
        await sendSampleSMS(message);
        break;
      }
        
      case '8': {
        const recipientsStr = await getUserInput('Enter recipient(s) (comma-separated, 09xxxxxxxxx): ');
        if (!recipientsStr) {
          printWarning('Recipients are required');
          break;
        }
        const recipients = recipientsStr.split(',').map(r => r.trim()).filter(r => r);
        if (recipients.length === 0) {
          printWarning('At least one recipient is required');
          break;
        }
        // Validate all phone numbers
        const invalidNumbers = recipients.filter(r => !validatePhoneNumber(r));
        if (invalidNumbers.length > 0) {
          printError(`Invalid phone numbers: ${invalidNumbers.join(', ')}`);
          break;
        }
        const message = await getUserInput('Enter message text: ');
        if (!message) {
          printWarning('Message is required');
          break;
        }
        await sendSimpleSMS(recipients, message);
        break;
      }
        
      case 'h':
        displayMenu();
        break;
        
      case 'q':
        return false;
        
      default:
        printWarning('Unknown command. Type "h" for help.');
    }
  } catch (error) {
    printError('Operation failed', error.message);
  }
  
  return true;
}

/**
 * Main interactive loop
 */
async function interactiveLoop() {
  displayMenu();
  
  let running = true;
  while (running) {
    const command = await getUserInput('Enter command (h for help):');
    running = await processCommand(command);
  }
}

/**
 * Cleanup and exit
 */
function cleanup() {
  print('Cleaning up...', 'yellow', emojis.tools);
  printSuccess('Goodbye!');
  process.exit(0);
}

/**
 * Main function
 */
async function main() {
  // Handle graceful shutdown
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  displayHeader();
  
  // Check environment configuration
  print('Checking SMS configuration...', 'cyan', emojis.gear);
  try {
    const config = getAPIConfig();
    printSuccess('API Key configured');
    if (config.lineNumber) {
      printSuccess(`Line Number: ${config.lineNumber}`);
    } else {
      printWarning('Line Number not configured (required for some operations)');
    }
    if (config.patternCode) {
      printSuccess(`Pattern Code: ${config.patternCode}`);
    } else {
      printWarning('Pattern Code not configured (required for pattern OTP)');
    }
  } catch (error) {
    printError('Configuration error', error.message);
    console.log('');
    printInfo('Please configure the following environment variables:');
    console.log('  - FARAZSMS_API_KEY (required)');
    console.log('  - FARAZSMS_LINE_NUMBER (optional, for sending SMS)');
    console.log('  - FARAZSMS_PATTERN_CODE (optional, for pattern OTP)');
    console.log('');
    printInfo('You can configure these in your .env file');
    process.exit(1);
  }
  
  console.log('');
  
  // Enter interactive mode
  await interactiveLoop();
  
  // Cleanup
  cleanup();
}

// Run the application
main().catch((error) => {
  printError('Fatal error', error.message);
  console.error(error);
  process.exit(1);
});

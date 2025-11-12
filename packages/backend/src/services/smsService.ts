/**
 * SMS Service - FarazSMS Provider
 * 
 * Handles sending SMS messages through FarazSMS (iranpayamak.com) provider
 * Uses pattern-based SMS API for fast OTP delivery
 */

/**
 * FarazSMS pattern-based SMS request body
 */
interface FarazSMSPatternRequest {
  /** Pattern UID from FarazSMS panel */
  code: string;
  /** Variables to fill in the pattern template */
  attributes: Record<string, string>;
  /** Recipient phone number (Iranian format: 09xxxxxxxxx) */
  recipient: string;
  /** Sender line number assigned by FarazSMS */
  line_number: string;
  /** Number format: 'english' or 'persian' */
  number_format?: 'english' | 'persian';
}

/**
 * FarazSMS API response
 */
interface FarazSMSResponse {
  status: string;
  data?: any;
  messages?: string;
}

/**
 * Configuration for FarazSMS service
 */
interface SMSConfig {
  apiKey: string;
  patternCode: string;
  lineNumber: string;
}

/**
 * Get SMS configuration from environment variables
 */
function getSMSConfig(): SMSConfig {
  const apiKey = process.env.FARAZSMS_API_KEY;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;

  if (!apiKey) {
    throw new Error('FARAZSMS_API_KEY is not configured in environment variables');
  }
  if (!patternCode) {
    throw new Error('FARAZSMS_PATTERN_CODE is not configured in environment variables');
  }
  if (!lineNumber) {
    throw new Error('FARAZSMS_LINE_NUMBER is not configured in environment variables');
  }

  return { apiKey, patternCode, lineNumber };
}

/**
 * Validate Iranian phone number format
 * @param phoneNumber Phone number to validate
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Iranian phone numbers: 09xxxxxxxxx (11 digits starting with 09)
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Send OTP SMS using FarazSMS pattern-based API
 * 
 * @param phoneNumber Recipient phone number (09xxxxxxxxx format)
 * @param otp OTP code to send
 * @returns Promise<boolean> Success status
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Expected format: 09xxxxxxxxx`);
    }

    // Get configuration
    const config = getSMSConfig();

    // Prepare request body
    const requestBody: FarazSMSPatternRequest = {
      code: config.patternCode,
      attributes: {
        otp: otp
      },
      recipient: phoneNumber,
      line_number: config.lineNumber,
      number_format: 'english'
    };

    // Make API request
    const response = await fetch('https://api.iranpayamak.com/ws/v1/sms/pattern', {
      method: 'POST',
      headers: {
        'Api-Key': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FarazSMS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`FarazSMS API request failed: ${response.status} ${response.statusText}`);
    }

    // Parse response
    const result = await response.json() as FarazSMSResponse;

    // Check response status
    if (result.status !== 'success') {
      console.error('FarazSMS API returned non-success status:', result);
      throw new Error(`FarazSMS API returned error: ${result.messages || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', {
      phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2),
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

/**
 * Test SMS configuration (for CLI testing)
 * 
 * @param phoneNumber Test phone number
 * @param testOTP Test OTP code (default: '123456')
 * @returns Promise<void>
 */
export async function testSMSConfiguration(phoneNumber: string, testOTP: string = '123456'): Promise<void> {
  console.log('Testing FarazSMS configuration...');
  console.log(`Phone Number: ${phoneNumber}`);
  console.log(`Test OTP: ${testOTP}`);
  console.log('---');

  try {
    // Check configuration
    const config = getSMSConfig();
    console.log('✓ Configuration loaded successfully');
    console.log(`  - API Key: ${config.apiKey.substring(0, 10)}...`);
    console.log(`  - Pattern Code: ${config.patternCode}`);
    console.log(`  - Line Number: ${config.lineNumber}`);
    console.log('---');

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }
    console.log('✓ Phone number format is valid');
    console.log('---');

    // Send SMS
    console.log('Sending SMS...');
    await sendOTPSMS(phoneNumber, testOTP);
    console.log('✓ SMS sent successfully!');
    console.log('---');
    console.log('Test completed successfully ✓');
  } catch (error) {
    console.error('✗ Test failed:', error);
    throw error;
  }
}

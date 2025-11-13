/**
 * SMS Service - FarazSMS Provider
 * 
 * Handles sending SMS messages through FarazSMS (iranpayamak.com) provider
 * Uses pattern-based SMS API for fast OTP delivery
 * 
 * @see {@link https://docs.iranpayamak.com/ | FarazSMS Official Documentation}
 * @see {@link http://docs.ippanel.com/ | IPPanel REST API Documentation}
 */

/**
 * FarazSMS pattern-based SMS request body
 * Supports both iranpayamak.com and ippanel.com API formats
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
  /** API endpoint to use (defaults to iranpayamak.com) */
  apiEndpoint?: string;
  /** Authentication header format (defaults to 'Api-Key') */
  authFormat?: 'Api-Key' | 'AccessKey';
}

/**
 * Get SMS configuration from environment variables
 * Supports both iranpayamak.com and ippanel.com API formats
 */
function getSMSConfig(): SMSConfig {
  const apiKey = process.env.FARAZSMS_API_KEY;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;
  const apiEndpoint = process.env.FARAZSMS_API_ENDPOINT || 'https://api.iranpayamak.com/ws/v1/sms/pattern';
  const authFormat = (process.env.FARAZSMS_AUTH_FORMAT as 'Api-Key' | 'AccessKey') || 'Api-Key';

  if (!apiKey) {
    throw new Error('FARAZSMS_API_KEY is not configured in environment variables');
  }
  if (!patternCode) {
    throw new Error('FARAZSMS_PATTERN_CODE is not configured in environment variables');
  }
  if (!lineNumber) {
    throw new Error('FARAZSMS_LINE_NUMBER is not configured in environment variables');
  }

  return { apiKey, patternCode, lineNumber, apiEndpoint, authFormat };
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

    // Prepare headers with authentication based on format
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (config.authFormat === 'AccessKey') {
      headers['Authorization'] = `AccessKey ${config.apiKey}`;
    } else {
      headers['Api-Key'] = config.apiKey;
    }

    // Make API request with configurable endpoint and auth format
    const response = await fetch(config.apiEndpoint!, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('FarazSMS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        endpoint: config.apiEndpoint
      });
      
      // Provide helpful error messages based on status code
      let errorMessage = `FarazSMS API request failed: ${response.status} ${response.statusText}`;
      if (response.status === 401) {
        errorMessage += ' - Invalid API key. Please check FARAZSMS_API_KEY in your environment variables.';
      } else if (response.status === 400) {
        errorMessage += ' - Invalid request. Please verify pattern code and line number are correct.';
      } else if (response.status === 429) {
        errorMessage += ' - Rate limit exceeded. Please wait before sending more messages.';
      }
      
      throw new Error(errorMessage);
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
    console.log(`  - API Key: [REDACTED]`);
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

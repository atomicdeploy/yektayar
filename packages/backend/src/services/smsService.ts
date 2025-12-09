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
 * FarazSMS API response (iranpayamak.com format)
 */
interface FarazSMSResponse {
  status: string;
  data?: any;
  messages?: string;
}

/**
 * FarazSMS Send Pattern Result (IPPanel format)
 * Based on @aspianet/faraz-sms interfaces
 */
export interface IFarazSendPatternResult {
  status: string;
  code: number;
  message: string;
  data: {
    bulk_id: number;
  };
}

/**
 * FarazSMS Send SMS Result (IPPanel format)
 */
export interface IFarazSendSMSResult {
  status: string;
  code: number;
  message: string;
  data: {
    bulk_id: number;
  };
}

/**
 * FarazSMS Auth Result
 */
export interface IFarazAuthResult {
  status: string;
  code: number;
  message: string;
  data: {
    username: string;
    credit: number;
  };
}

/**
 * FarazSMS Credit Result
 */
export interface IFarazCreditResult {
  status: string;
  code: number;
  message: string;
  data: {
    credit: number;
  };
}

/**
 * FarazSMS Get SMS Result
 */
export interface IFarazGetSMSResult {
  status: string;
  code: number;
  message: string;
  data: {
    bulk_id: number;
    number: string;
    message: string;
    status: number;
    type: number;
    cost: number;
  };
}

/**
 * Message Recipients Status Enum
 */
export enum FarazMessageStatusEnum {
  SEND = 'send',
  DISCARDED = 'discarded',
  PENDING = 'pending',
  FAILED = 'failed'
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
 * Normalize phone number to international format (989xxxxxxxxx)
 * @param phoneNumber Phone number in various formats
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phoneNumber: string): string {
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
 * Mask phone number for logging (shows first 5 and last 2 digits)
 * @param phoneNumber Phone number to mask
 * @returns Masked phone number
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length < 7) return phoneNumber;
  return phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2);
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
      phoneNumber: maskPhoneNumber(phoneNumber),
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

// ============================================================================
// Additional FarazSMS API Functions
// Based on @aspianet/faraz-sms package functionality
// ============================================================================

/**
 * Helper function to make authenticated API requests
 * @internal
 */
async function makeAuthenticatedRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> {
  const config = getSMSConfig();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (config.authFormat === 'AccessKey') {
    headers['Authorization'] = `AccessKey ${config.apiKey}`;
  } else {
    headers['Api-Key'] = config.apiKey;
  }

  const options: RequestInit = {
    method,
    headers
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FarazSMS API error: ${response.status} - ${errorText}`);
  }

  return await response.json() as T;
}

/**
 * Get authenticated user information
 * 
 * @returns Promise<IFarazAuthResult>
 * @see {@link http://docs.ippanel.com/#section/Authentication}
 */
export async function getAuthenticatedUser(): Promise<IFarazAuthResult> {
  const endpoint = 'http://rest.ippanel.com/v1/user';
  return makeAuthenticatedRequest<IFarazAuthResult>(endpoint, 'GET');
}

/**
 * Get user's remaining credit/balance
 * 
 * @returns Promise<IFarazCreditResult>
 * @see {@link http://docs.ippanel.com/#operation/GetCredit}
 */
export async function getUserCredit(): Promise<IFarazCreditResult> {
  const endpoint = 'http://rest.ippanel.com/v1/credit';
  return makeAuthenticatedRequest<IFarazCreditResult>(endpoint, 'GET');
}

/**
 * Send regular SMS (non-pattern based)
 * 
 * @param originator Sender line number
 * @param recipients Array of recipient phone numbers
 * @param message Message text to send
 * @returns Promise<IFarazSendSMSResult>
 * @see {@link http://docs.ippanel.com/#operation/SendSMS}
 */
export async function sendSMS(
  originator: string,
  recipients: string[],
  message: string
): Promise<IFarazSendSMSResult> {
  const endpoint = 'http://rest.ippanel.com/v1/messages';
  return makeAuthenticatedRequest<IFarazSendSMSResult>(endpoint, 'POST', {
    originator,
    recipients,
    message
  });
}

/**
 * Send pattern-based SMS with generic values type
 * This is the generic version compatible with @aspianet/faraz-sms
 * 
 * @param patternCode Pattern UID from FarazSMS panel
 * @param originator Sender line number
 * @param recipient Recipient phone number
 * @param values Pattern variables (generic type)
 * @returns Promise<IFarazSendPatternResult>
 * @see {@link http://docs.ippanel.com/#operation/SendPattern}
 */
export async function sendPatternSMS<T = Record<string, string>>(
  patternCode: string,
  originator: string,
  recipient: string,
  values: T
): Promise<IFarazSendPatternResult> {
  const endpoint = 'http://rest.ippanel.com/v1/messages/patterns/send';
  return makeAuthenticatedRequest<IFarazSendPatternResult>(endpoint, 'POST', {
    pattern_code: patternCode,
    originator,
    recipient,
    values
  });
}

/**
 * Create a new SMS pattern
 * 
 * @param pattern Pattern template text (use %variable% for placeholders)
 * @param description Pattern description
 * @param isShared Whether the pattern is shared
 * @returns Promise with created pattern details
 * @see {@link http://docs.ippanel.com/#operation/CreatePattern}
 */
export async function createPattern(
  pattern: string,
  description: string,
  isShared: boolean = false
): Promise<any> {
  const endpoint = 'http://rest.ippanel.com/v1/messages/patterns';
  return makeAuthenticatedRequest(endpoint, 'POST', {
    pattern,
    description,
    is_shared: isShared
  });
}

/**
 * Get SMS details by bulk ID
 * 
 * @param bulkId Message bulk ID
 * @returns Promise<IFarazGetSMSResult>
 * @see {@link http://docs.ippanel.com/#operation/GetSMS}
 */
export async function getSMSDetails(bulkId: number): Promise<IFarazGetSMSResult> {
  const endpoint = `http://rest.ippanel.com/v1/messages/${bulkId}`;
  return makeAuthenticatedRequest<IFarazGetSMSResult>(endpoint, 'GET');
}

/**
 * Get message recipients status
 * 
 * @param bulkId Message bulk ID
 * @returns Promise with recipients status details
 * @see {@link http://docs.ippanel.com/#operation/GetMessageRecipientsStatus}
 */
export async function getMessageRecipientsStatus(bulkId: number): Promise<any> {
  const endpoint = `http://rest.ippanel.com/v1/messages/${bulkId}/recipients`;
  return makeAuthenticatedRequest(endpoint, 'GET');
}

/**
 * Fetch inbox messages
 * 
 * @returns Promise with inbox messages
 * @see {@link http://docs.ippanel.com/#operation/FetchInboxMessages}
 */
export async function fetchInboxMessages(): Promise<any> {
  const endpoint = 'http://rest.ippanel.com/v1/messages/inbox';
  return makeAuthenticatedRequest(endpoint, 'GET');
}

// ============================================================================
// Extended SMS API Functions
// Implementation of additional FarazSMS/IPPanel capabilities
// ============================================================================

/**
 * Send Voice OTP (VOTP)
 * Sends OTP via voice call instead of SMS
 * 
 * @param code OTP code to be delivered by voice (can be string or number)
 * @param recipient Recipient phone number in format 989xxxxxxxxx (without +)
 * @returns Promise with VOTP send result
 * @see {@link https://ippanelcom.github.io/Edge-Document/docs/send/votp/ | IPPanel VOTP Documentation}
 * @note Uses 'apikey' authentication format for IPPanel Edge API
 */
export async function sendVOTP(
  code: string | number,
  recipient: string
): Promise<any> {
  const config = getSMSConfig();
  
  // Normalize phone number to international format (989xxxxxxxxx)
  const normalizedRecipient = normalizePhoneNumber(recipient);
  
  const endpoint = 'https://edge.ippanel.com/v1/api/votp/send';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${config.apiKey}` // IPPanel uses 'apikey' format
  };
  
  const body = {
    code: code.toString(),
    recipient: normalizedRecipient
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('VOTP API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`VOTP API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('VOTP sent successfully:', {
    recipient: maskPhoneNumber(normalizedRecipient),
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Send Webservice SMS
 * Sends SMS via IPPanel webservice API
 * 
 * @param message Message text to send
 * @param sender Sender line number
 * @param recipients Array of recipient phone numbers
 * @returns Promise with webservice SMS result
 * @see {@link https://ippanelcom.github.io/Edge-Document/docs/send/webservice/ | IPPanel Webservice Documentation}
 * @note Uses 'apikey' authentication format for IPPanel Edge API
 */
export async function sendWebserviceSMS(
  message: string,
  sender: string,
  recipients: string[]
): Promise<any> {
  const config = getSMSConfig();
  const endpoint = 'https://edge.ippanel.com/v1/api/send';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${config.apiKey}` // IPPanel uses 'apikey' format
  };
  
  const body = {
    originator: sender,
    recipients,
    message
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Webservice SMS API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Webservice SMS API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('Webservice SMS sent successfully:', {
    recipientCount: recipients.length,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Send URL-based SMS
 * Alternative method using URL parameters for sending SMS
 * 
 * @param message Message text to send
 * @param sender Sender line number
 * @param recipients Array of recipient phone numbers
 * @returns Promise with URL-based SMS result
 * @see {@link https://ippanelcom.github.io/Edge-Document/docs/send/url/ | IPPanel URL Documentation}
 * @note Uses 'apikey' authentication format for IPPanel Edge API
 */
export async function sendURLBasedSMS(
  message: string,
  sender: string,
  recipients: string[]
): Promise<any> {
  const config = getSMSConfig();
  
  // Build URL with query parameters
  const params = new URLSearchParams({
    originator: sender,
    recipients: recipients.join(','),
    message
  });
  
  const endpoint = `https://edge.ippanel.com/v1/api/send?${params.toString()}`;
  
  const headers: Record<string, string> = {
    'Authorization': `apikey ${config.apiKey}` // IPPanel uses 'apikey' format
  };
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('URL-based SMS API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`URL-based SMS API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('URL-based SMS sent successfully:', {
    recipientCount: recipients.length,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Send Sample SMS
 * Sends a test SMS to the account owner for testing/debugging purposes
 * Useful for CLI and admin panel troubleshooting and SMS gateway health checks
 * 
 * @param text Message text to send
 * @param lineNumber Sender line number (optional, uses config if not provided)
 * @param numberFormat Number format: 'english' or 'persian' (default: 'english')
 * @param schedule Optional schedule time (format: 'YYYY-MM-DD HH:mm:ss')
 * @returns Promise with sample SMS result
 * @see {@link https://docs.iranpayamak.com/send-sample-sms-13909966e0 | IranPayamak Sample SMS Documentation}
 * @note Uses 'Api-Key' header format for IranPayamak API
 */
export async function sendSampleSMS(
  text: string,
  lineNumber?: string,
  numberFormat: 'english' | 'persian' = 'english',
  schedule?: string
): Promise<FarazSMSResponse> {
  const config = getSMSConfig();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/sample';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': config.apiKey // IranPayamak uses 'Api-Key' header format
  };
  
  const body: any = {
    text,
    line_number: lineNumber || config.lineNumber,
    number_format: numberFormat
  };
  
  if (schedule) {
    body.schedule = schedule;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Sample SMS API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Sample SMS API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as FarazSMSResponse;
  console.log('Sample SMS sent successfully to account owner:', {
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Send Simple SMS
 * Sends a simple SMS message to one or more recipients
 * 
 * @param text Message text to send
 * @param recipients Array of recipient phone numbers (format: 09xxxxxxxxx)
 * @param lineNumber Sender line number (optional, uses config if not provided)
 * @param numberFormat Number format: 'english' or 'persian' (default: 'english')
 * @param schedule Optional schedule time (format: 'YYYY-MM-DD HH:mm:ss')
 * @returns Promise with simple SMS result
 * @see {@link https://docs.iranpayamak.com/send-simple-sms-13909967e0 | IranPayamak Simple SMS Documentation}
 * @note Uses 'Api-Key' header format for IranPayamak API
 */
export async function sendSimpleSMS(
  text: string,
  recipients: string[],
  lineNumber?: string,
  numberFormat: 'english' | 'persian' = 'english',
  schedule?: string
): Promise<FarazSMSResponse> {
  const config = getSMSConfig();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/simple';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': config.apiKey // IranPayamak uses 'Api-Key' header format
  };
  
  const body: any = {
    text,
    line_number: lineNumber || config.lineNumber,
    recipients,
    number_format: numberFormat
  };
  
  if (schedule) {
    body.schedule = schedule;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Simple SMS API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Simple SMS API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as FarazSMSResponse;
  console.log('Simple SMS sent successfully:', {
    recipientCount: recipients.length,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

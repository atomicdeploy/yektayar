/**
 * SMS Service - FarazSMS Provider (IPPanel Edge API)
 * 
 * Handles sending SMS messages through FarazSMS provider, which uses IPPanel Edge API
 * FarazSMS and IPPanel are the same service provider with different branding
 * Uses pattern-based SMS API for fast OTP delivery
 * 
 * @see {@link https://edge.ippanel.com/ | IPPanel Edge API Documentation}
 * @see {@link https://ippanel.com/ | FarazSMS/IPPanel Official Site}
 */

/**
 * IPPanel Edge API pattern-based SMS request body
 * This is the default and recommended format
 */
interface IPPanelEdgePatternRequest {
  /** Sending type - always "pattern" for pattern-based SMS */
  sending_type: 'pattern';
  /** Sender line number (e.g., "+983000505") */
  from_number: string;
  /** Pattern code/UID from IPPanel panel */
  code: string;
  /** Array of recipient phone numbers in international format */
  recipients: string[];
  /** Pattern variables to fill in the template */
  params: Record<string, string>;
}

/**
 * IPPanel Edge API response
 */
interface IPPanelEdgeResponse {
  data: {
    message_outbox_ids: number[];
  };
  meta: {
    status: boolean;
    message: string;
    message_parameters: any[];
    message_code: string;
  };
}

/**
 * FarazSMS pattern-based SMS request body (Legacy)
 * Supports iranpayamak.com API formats (for backward compatibility)
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
 * FarazSMS API response (iranpayamak.com format - Legacy)
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
 * Defaults to IPPanel Edge API (recommended)
 */
function getSMSConfig(): SMSConfig {
  const apiKey = process.env.FARAZSMS_API_KEY;
  const patternCode = process.env.FARAZSMS_PATTERN_CODE;
  const lineNumber = process.env.FARAZSMS_LINE_NUMBER;
  // Default to Edge API endpoint (recommended)
  const apiEndpoint = process.env.FARAZSMS_API_ENDPOINT || 'https://edge.ippanel.com/v1/api/send';
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
 * Get API key from environment variables (for balance/credit checks that don't need full config)
 * @internal
 */
function getAPIKey(): string {
  const apiKey = process.env.FARAZSMS_API_KEY;
  if (!apiKey) {
    throw new Error('FARAZSMS_API_KEY is not configured in environment variables');
  }
  return apiKey;
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
 * Send OTP SMS using IPPanel Edge API (pattern-based)
 * Uses Edge API by default, which is the recommended and most reliable endpoint
 * 
 * @param phoneNumber Recipient phone number (09xxxxxxxxx format)
 * @param otp OTP code to send
 * @returns Promise<boolean> Success status
 * 
 * @note This function uses 'verification-code' as the pattern parameter name.
 *       Ensure your IPPanel pattern template uses this exact variable name.
 *       For custom parameter names, use sendPatternSMS() instead.
 * 
 * @example
 * // Pattern template should contain: "Your code: %verification-code%"
 * await sendOTPSMS('09197103488', '123456');
 */
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}. Expected format: 09xxxxxxxxx`);
    }

    // Get configuration
    const config = getSMSConfig();

    // Convert phone number to international format for Edge API
    const internationalPhone = '+' + normalizePhoneNumber(phoneNumber);

    // Detect if using Edge API endpoint (secure hostname check using URL parsing)
    let isEdgeAPI = false;
    try {
      if (config.apiEndpoint) {
        const url = new URL(config.apiEndpoint);
        isEdgeAPI = url.hostname === 'edge.ippanel.com' && url.protocol === 'https:';
      }
    } catch {
      // Invalid URL format, treat as legacy
      isEdgeAPI = false;
    }

    let requestBody: IPPanelEdgePatternRequest | FarazSMSPatternRequest;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (isEdgeAPI) {
      // IPPanel Edge API format (default and recommended)
      // Note: Uses 'verification-code' as the pattern variable name.
      // This must match the variable name defined in your IPPanel pattern template.
      // For custom parameter names, use sendPatternSMS() instead.
      const edgeBody: IPPanelEdgePatternRequest = {
        sending_type: 'pattern',
        from_number: config.lineNumber,
        code: config.patternCode,
        recipients: [internationalPhone],
        params: {
          'verification-code': otp
        }
      };
      requestBody = edgeBody;
      // Edge API uses direct Authorization header with API key
      headers['Authorization'] = config.apiKey;
    } else {
      // Legacy format for backward compatibility (iranpayamak.com)
      const legacyBody: FarazSMSPatternRequest = {
        code: config.patternCode,
        attributes: {
          otp: otp
        },
        recipient: phoneNumber,
        line_number: config.lineNumber,
        number_format: 'english'
      };
      requestBody = legacyBody;
      // Legacy API uses Api-Key or AccessKey header
      if (config.authFormat === 'AccessKey') {
        headers['Authorization'] = `AccessKey ${config.apiKey}`;
      } else {
        headers['Api-Key'] = config.apiKey;
      }
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
      console.error('SMS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        endpoint: config.apiEndpoint,
        isEdgeAPI
      });
      
      // Provide helpful error messages based on status code
      let errorMessage = `SMS API request failed: ${response.status} ${response.statusText}`;
      if (response.status === 401) {
        errorMessage += ' - Invalid API key. Please check FARAZSMS_API_KEY in your environment variables.';
      } else if (response.status === 400) {
        errorMessage += ' - Invalid request. Please verify pattern code and line number are correct.';
      } else if (response.status === 429) {
        errorMessage += ' - Rate limit exceeded. Please wait before sending more messages.';
      }
      
      throw new Error(errorMessage);
    }

    // Parse response based on API type
    const result = await response.json();

    if (isEdgeAPI) {
      // IPPanel Edge API response format
      const edgeResult = result as IPPanelEdgeResponse;
      
      // Check response status
      if (!edgeResult.meta?.status) {
        console.error('IPPanel Edge API returned non-success status:', edgeResult);
        throw new Error(`IPPanel Edge API returned error: ${edgeResult.meta?.message || 'Unknown error'}`);
      }

      console.log('SMS sent successfully via Edge API:', {
        phoneNumber: maskPhoneNumber(phoneNumber),
        messageIds: edgeResult.data.message_outbox_ids,
        timestamp: new Date().toISOString()
      });
    } else {
      // Legacy API response format
      const legacyResult = result as FarazSMSResponse;
      
      // Check response status
      if (legacyResult.status !== 'success') {
        console.error('Legacy API returned non-success status:', legacyResult);
        throw new Error(`Legacy API returned error: ${legacyResult.messages || 'Unknown error'}`);
      }

      console.log('SMS sent successfully via Legacy API:', {
        phoneNumber: maskPhoneNumber(phoneNumber),
        timestamp: new Date().toISOString()
      });
    }

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
  const apiKey = getAPIKey();
  const authFormat = (process.env.FARAZSMS_AUTH_FORMAT as 'Api-Key' | 'AccessKey') || 'AccessKey';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (authFormat === 'AccessKey') {
    headers['Authorization'] = `AccessKey ${apiKey}`;
  } else {
    headers['Api-Key'] = apiKey;
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
 * Get user's remaining credit/balance (IPPanel REST API)
 * 
 * @returns Promise<IFarazCreditResult>
 * @see {@link http://docs.ippanel.com/#operation/GetCredit}
 */
export async function getUserCredit(): Promise<IFarazCreditResult> {
  const endpoint = 'http://rest.ippanel.com/v1/credit';
  return makeAuthenticatedRequest<IFarazCreditResult>(endpoint, 'GET');
}

/**
 * Get account balance from IranPayamak API
 * Returns the current credit/balance for the account
 * 
 * @returns Promise with balance information
 * @see {@link https://docs.iranpayamak.com/account-balance-13717911e0 | IranPayamak Account Balance Documentation}
 * @note Uses 'Api-Key' header format for IranPayamak API
 */
export async function getAccountBalance(): Promise<any> {
  const apiKey = getAPIKey();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/account/balance';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey
  };
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('IranPayamak balance API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`IranPayamak balance API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('Account balance retrieved successfully:', {
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Get credit from IPPanel Edge API
 * Returns the current credit for the account using the Edge API
 * 
 * @returns Promise with credit information
 * @see {@link https://ippanelcom.github.io/Edge-Document/docs/payment/my-credit | IPPanel Edge My Credit Documentation}
 * @note Uses 'apikey' authentication format for IPPanel Edge API
 */
export async function getEdgeCredit(): Promise<any> {
  const apiKey = getAPIKey();
  const endpoint = 'https://edge.ippanel.com/v1/api/payment/my-credit';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}`
  };
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('IPPanel Edge credit API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`IPPanel Edge credit API request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log('Edge credit retrieved successfully:', {
    timestamp: new Date().toISOString()
  });
  
  return result;
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
 * Uses IPPanel Edge API by default for best reliability
 * 
 * @param patternCode Pattern UID from FarazSMS panel
 * @param originator Sender line number
 * @param recipient Recipient phone number
 * @param values Pattern variables (generic type)
 * @param useEdgeAPI Use Edge API (default: true) or legacy REST API
 * @returns Promise<IFarazSendPatternResult | IPPanelEdgeResponse>
 * @see {@link https://edge.ippanel.com/ | IPPanel Edge API}
 * @see {@link http://docs.ippanel.com/#operation/SendPattern | IPPanel REST API (legacy)}
 */
export async function sendPatternSMS<T = Record<string, string>>(
  patternCode: string,
  originator: string,
  recipient: string,
  values: T,
  useEdgeAPI: boolean = true
): Promise<IFarazSendPatternResult | IPPanelEdgeResponse> {
  if (useEdgeAPI) {
    // Use Edge API (default and recommended)
    const apiKey = getAPIKey();
    const endpoint = 'https://edge.ippanel.com/v1/api/send';
    
    // Convert recipient to international format if needed
    const internationalRecipient = recipient.startsWith('+') 
      ? recipient 
      : '+' + normalizePhoneNumber(recipient);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    };
    
    const body = {
      sending_type: 'pattern',
      from_number: originator,
      code: patternCode,
      recipients: [internationalRecipient],
      params: values as Record<string, string>
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPPanel Edge API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json() as IPPanelEdgeResponse;
  } else {
    // Use legacy REST API
    const endpoint = 'http://rest.ippanel.com/v1/messages/patterns/send';
    return makeAuthenticatedRequest<IFarazSendPatternResult>(endpoint, 'POST', {
      pattern_code: patternCode,
      originator,
      recipient,
      values
    });
  }
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
  const apiKey = getAPIKey();
  
  // Normalize phone number to international format (989xxxxxxxxx)
  const normalizedRecipient = normalizePhoneNumber(recipient);
  
  const endpoint = 'https://edge.ippanel.com/v1/api/votp/send';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}` // IPPanel uses 'apikey' format
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
  const apiKey = getAPIKey();
  const endpoint = 'https://edge.ippanel.com/v1/api/send';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `apikey ${apiKey}` // IPPanel uses 'apikey' format
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
  const apiKey = getAPIKey();
  
  // Build URL with query parameters
  const params = new URLSearchParams({
    originator: sender,
    recipients: recipients.join(','),
    message
  });
  
  const endpoint = `https://edge.ippanel.com/v1/api/send?${params.toString()}`;
  
  const headers: Record<string, string> = {
    'Authorization': `apikey ${apiKey}` // IPPanel uses 'apikey' format
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
  const apiKey = getAPIKey();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/sample';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey // IranPayamak uses 'Api-Key' header format
  };
  
  // Use provided lineNumber or try to get from environment
  const senderLineNumber = lineNumber || process.env.FARAZSMS_LINE_NUMBER;
  if (!senderLineNumber) {
    throw new Error('Line number is required. Either provide it as parameter or set FARAZSMS_LINE_NUMBER environment variable.');
  }
  
  const body: any = {
    text,
    line_number: senderLineNumber,
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
  const apiKey = getAPIKey();
  const endpoint = 'https://api.iranpayamak.com/ws/v1/sms/simple';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey // IranPayamak uses 'Api-Key' header format
  };
  
  // Use provided lineNumber or try to get from environment
  const senderLineNumber = lineNumber || process.env.FARAZSMS_LINE_NUMBER;
  if (!senderLineNumber) {
    throw new Error('Line number is required. Either provide it as parameter or set FARAZSMS_LINE_NUMBER environment variable.');
  }
  
  const body: any = {
    text,
    line_number: senderLineNumber,
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

// ============================================================================
// IPPanel REST API v1 Functions (api2.ippanel.com)
// Matches legacy AutoHotkey implementation for compatibility
// ============================================================================

/**
 * IPPanel REST API v1 Response
 */
interface IPPanelRESTResponse {
  status: string;
  code: number;
  error_message: string;
  data: {
    message_id: number;
  };
}

/**
 * Send single SMS using IPPanel REST API v1 (api2.ippanel.com)
 * This matches the legacy AutoHotkey implementation
 * 
 * @param recipient Single recipient phone number
 * @param message Message text to send
 * @param sender Sender line number (optional, uses config if not provided)
 * @returns Promise with REST API response
 * @see {@link https://api2.ippanel.com | IPPanel REST API v1}
 * 
 * @note The API expects recipient as an array in the request body, but this
 *       function accepts a single recipient string for simplicity. The array
 *       wrapping is handled automatically.
 */
export async function sendSingleSMS(
  recipient: string,
  message: string,
  sender?: string
): Promise<IPPanelRESTResponse> {
  const apiKey = getAPIKey();
  const senderLineNumber = sender || process.env.FARAZSMS_LINE_NUMBER;
  
  if (!senderLineNumber) {
    throw new Error('Sender line number is required. Either provide it as parameter or set FARAZSMS_LINE_NUMBER environment variable.');
  }
  
  const endpoint = 'https://api2.ippanel.com/api/v1/sms/send/webservice/single';
  
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'apikey': apiKey,
    'Content-Type': 'application/json'
  };
  
  const body = {
    message,
    sender: senderLineNumber,
    recipient: [recipient]
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('IPPanel REST API v1 single SMS error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`IPPanel REST API v1 single SMS request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as IPPanelRESTResponse;
  console.log('Single SMS sent successfully via REST API v1:', {
    recipient: maskPhoneNumber(recipient),
    messageId: result.data.message_id,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

/**
 * Send pattern SMS using IPPanel REST API v1 (api2.ippanel.com)
 * This matches the legacy AutoHotkey implementation
 * 
 * @param recipient Recipient phone number (single recipient as string)
 * @param code Pattern code
 * @param variable Pattern variables object
 * @param sender Sender line number (optional, uses config if not provided)
 * @returns Promise with REST API response
 * @see {@link https://api2.ippanel.com | IPPanel REST API v1}
 * 
 * @note Unlike sendSingleSMS, this API expects recipient as a string (not array).
 *       This is the correct format for the pattern endpoint.
 */
export async function sendPatternSMSv1(
  recipient: string,
  code: string,
  variable: Record<string, string>,
  sender?: string
): Promise<IPPanelRESTResponse> {
  const apiKey = getAPIKey();
  const senderLineNumber = sender || process.env.FARAZSMS_LINE_NUMBER;
  
  if (!senderLineNumber) {
    throw new Error('Sender line number is required. Either provide it as parameter or set FARAZSMS_LINE_NUMBER environment variable.');
  }
  
  const endpoint = 'https://api2.ippanel.com/api/v1/sms/pattern/normal/send';
  
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'apikey': apiKey,
    'Content-Type': 'application/json'
  };
  
  const body = {
    code,
    sender: senderLineNumber,
    recipient,
    variable
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('IPPanel REST API v1 pattern SMS error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`IPPanel REST API v1 pattern SMS request failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as IPPanelRESTResponse;
  console.log('Pattern SMS sent successfully via REST API v1:', {
    recipient: maskPhoneNumber(recipient),
    messageId: result.data.message_id,
    timestamp: new Date().toISOString()
  });
  
  return result;
}

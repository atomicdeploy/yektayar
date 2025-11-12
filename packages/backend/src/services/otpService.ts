/**
 * OTP Service
 * 
 * Handles OTP generation, validation, and management
 */

import crypto from 'crypto';

/**
 * OTP record structure
 */
export interface OTPRecord {
  phoneNumber: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

/**
 * In-memory OTP storage (will be replaced with database later)
 * Key: phoneNumber, Value: OTPRecord
 */
const otpStorage = new Map<string, OTPRecord>();

/**
 * OTP configuration
 */
const OTP_CONFIG = {
  /** Length of OTP code */
  LENGTH: 6,
  /** Validity period in minutes */
  VALIDITY_MINUTES: 5,
  /** Maximum verification attempts */
  MAX_ATTEMPTS: 3,
  /** Rate limit: minimum seconds between OTP requests */
  RATE_LIMIT_SECONDS: 60
};

/**
 * Generate a random numeric OTP code
 * 
 * @param length Length of OTP (default: 6)
 * @returns OTP code as string
 */
export function generateOTP(length: number = OTP_CONFIG.LENGTH): string {
  // Generate cryptographically secure random digits
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
}

/**
 * Create and store an OTP for a phone number
 * 
 * @param phoneNumber Phone number
 * @returns OTP code
 * @throws Error if rate limit is exceeded
 */
export function createOTP(phoneNumber: string): string {
  // Check rate limiting
  const existingOTP = otpStorage.get(phoneNumber);
  if (existingOTP && !existingOTP.verified) {
    const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
    const secondsSinceCreation = Math.floor(timeSinceCreation / 1000);
    
    if (secondsSinceCreation < OTP_CONFIG.RATE_LIMIT_SECONDS) {
      const remainingSeconds = OTP_CONFIG.RATE_LIMIT_SECONDS - secondsSinceCreation;
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP`);
    }
  }

  // Generate OTP
  const otp = generateOTP();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_CONFIG.VALIDITY_MINUTES * 60 * 1000);

  // Store OTP
  const otpRecord: OTPRecord = {
    phoneNumber,
    otp,
    createdAt: now,
    expiresAt,
    attempts: 0,
    verified: false
  };

  otpStorage.set(phoneNumber, otpRecord);

  console.log('OTP created:', {
    phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2),
    expiresAt: expiresAt.toISOString(),
    validityMinutes: OTP_CONFIG.VALIDITY_MINUTES
  });

  return otp;
}

/**
 * Verify an OTP code for a phone number
 * 
 * @param phoneNumber Phone number
 * @param otp OTP code to verify
 * @returns Verification result
 */
export function verifyOTP(phoneNumber: string, otp: string): {
  success: boolean;
  message: string;
} {
  const otpRecord = otpStorage.get(phoneNumber);

  // Check if OTP exists
  if (!otpRecord) {
    return {
      success: false,
      message: 'No OTP found for this phone number. Please request a new OTP.'
    };
  }

  // Check if OTP is already verified
  if (otpRecord.verified) {
    return {
      success: false,
      message: 'This OTP has already been used. Please request a new OTP.'
    };
  }

  // Check if OTP is expired
  if (new Date() > otpRecord.expiresAt) {
    otpStorage.delete(phoneNumber);
    return {
      success: false,
      message: 'OTP has expired. Please request a new OTP.'
    };
  }

  // Check attempts limit
  if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    otpStorage.delete(phoneNumber);
    return {
      success: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }

  // Increment attempts
  otpRecord.attempts++;

  // Verify OTP
  if (otpRecord.otp !== otp) {
    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts;
    return {
      success: false,
      message: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`
    };
  }

  // Mark as verified
  otpRecord.verified = true;

  console.log('OTP verified successfully:', {
    phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2),
    timestamp: new Date().toISOString()
  });

  return {
    success: true,
    message: 'OTP verified successfully'
  };
}

/**
 * Check if a phone number has a verified OTP
 * 
 * @param phoneNumber Phone number
 * @returns true if OTP is verified, false otherwise
 */
export function isOTPVerified(phoneNumber: string): boolean {
  const otpRecord = otpStorage.get(phoneNumber);
  return otpRecord?.verified === true;
}

/**
 * Clear OTP record for a phone number
 * 
 * @param phoneNumber Phone number
 */
export function clearOTP(phoneNumber: string): void {
  otpStorage.delete(phoneNumber);
  console.log('OTP cleared:', {
    phoneNumber: phoneNumber.substring(0, 5) + '***' + phoneNumber.substring(phoneNumber.length - 2)
  });
}

/**
 * Clean up expired OTPs (should be run periodically)
 * 
 * @returns Number of OTPs cleaned up
 */
export function cleanupExpiredOTPs(): number {
  const now = new Date();
  let count = 0;

  for (const [phoneNumber, otpRecord] of otpStorage.entries()) {
    if (now > otpRecord.expiresAt || otpRecord.verified) {
      otpStorage.delete(phoneNumber);
      count++;
    }
  }

  if (count > 0) {
    console.log(`Cleaned up ${count} expired/verified OTP(s)`);
  }

  return count;
}

/**
 * Get OTP statistics (for debugging/monitoring)
 */
export function getOTPStats(): {
  total: number;
  verified: number;
  expired: number;
  active: number;
} {
  const now = new Date();
  let verified = 0;
  let expired = 0;
  let active = 0;

  for (const otpRecord of otpStorage.values()) {
    if (otpRecord.verified) {
      verified++;
    } else if (now > otpRecord.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: otpStorage.size,
    verified,
    expired,
    active
  };
}

// Set up periodic cleanup (every 5 minutes)
setInterval(() => {
  cleanupExpiredOTPs();
}, 5 * 60 * 1000);

/**
 * OTP (One-Time Password) Service
 * Handles OTP generation, storage, verification, and delivery
 */

import { getDatabase } from './database'
import crypto from 'crypto'

export interface OTPRecord {
  identifier: string
  otp: string
  expiresAt: Date
  attempts: number
}

// OTP configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 3
const RATE_LIMIT_MINUTES = 1 // Minimum time between OTP requests for same identifier

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Create OTP table if it doesn't exist
 */
export async function initializeOTPTable() {
  const db = getDatabase()
  
  try {
    await db`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP
      )
    `
    
    // Create index for faster lookups
    await db`
      CREATE INDEX IF NOT EXISTS idx_otp_identifier 
      ON otp_codes(identifier, expires_at, is_used)
    `
    
    console.log('✅ OTP table initialized')
  } catch (error) {
    console.error('❌ Failed to initialize OTP table:', error)
  }
}

/**
 * Send OTP via SMS (placeholder - integrate with your SMS provider)
 */
async function sendSMS(phone: string, otp: string): Promise<boolean> {
  // TODO: Integrate with SMS gateway (e.g., Twilio, Kavenegar, etc.)
  // For now, just log it
  console.log(`📱 SMS to ${phone}: Your YektaYar verification code is: ${otp}`)
  
  // In production, implement actual SMS sending:
  // const apiKey = process.env.SMS_GATEWAY_API_KEY
  // if (!apiKey) {
  //   console.error('SMS_GATEWAY_API_KEY not configured')
  //   return false
  // }
  // 
  // try {
  //   await fetch('https://sms-gateway.com/api/send', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${apiKey}` },
  //     body: JSON.stringify({ phone, message: `Your code: ${otp}` })
  //   })
  //   return true
  // } catch (error) {
  //   console.error('SMS sending failed:', error)
  //   return false
  // }
  
  return true // Return true for development
}

/**
 * Send OTP via Email (placeholder - integrate with your email provider)
 */
async function sendEmail(email: string, otp: string): Promise<boolean> {
  // TODO: Integrate with email service (e.g., SendGrid, AWS SES, etc.)
  // For now, just log it
  console.log(`📧 Email to ${email}: Your YektaYar verification code is: ${otp}`)
  
  // In production, implement actual email sending:
  // const apiKey = process.env.EMAIL_API_KEY
  // if (!apiKey) {
  //   console.error('EMAIL_API_KEY not configured')
  //   return false
  // }
  // 
  // try {
  //   await fetch('https://api.sendgrid.com/v3/mail/send', {
  //     method: 'POST',
  //     headers: { 
  //       'Authorization': `Bearer ${apiKey}`,
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       personalizations: [{ to: [{ email }] }],
  //       from: { email: 'noreply@yektayar.com' },
  //       subject: 'YektaYar Verification Code',
  //       content: [{ type: 'text/plain', value: `Your verification code is: ${otp}` }]
  //     })
  //   })
  //   return true
  // } catch (error) {
  //   console.error('Email sending failed:', error)
  //   return false
  // }
  
  return true // Return true for development
}

/**
 * Check if identifier is rate limited
 */
async function checkRateLimit(identifier: string): Promise<boolean> {
  const db = getDatabase()
  
  try {
    const recentOTP = await db`
      SELECT created_at 
      FROM otp_codes 
      WHERE identifier = ${identifier}
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (recentOTP.length > 0) {
      const lastRequestTime = new Date(recentOTP[0].created_at)
      const timeDiff = Date.now() - lastRequestTime.getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      if (minutesDiff < RATE_LIMIT_MINUTES) {
        return true // Rate limited
      }
    }
    
    return false // Not rate limited
  } catch (error) {
    console.error('Error checking rate limit:', error)
    return false
  }
}

/**
 * Generate and send OTP to identifier (email or phone)
 */
export async function generateAndSendOTP(identifier: string): Promise<{ success: boolean; message: string; otp?: string }> {
  const db = getDatabase()
  
  try {
    // Check rate limit
    const isRateLimited = await checkRateLimit(identifier)
    if (isRateLimited) {
      return {
        success: false,
        message: `Please wait ${RATE_LIMIT_MINUTES} minute(s) before requesting another code`
      }
    }
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
    
    // Store OTP in database
    await db`
      INSERT INTO otp_codes (identifier, otp, expires_at)
      VALUES (${identifier}, ${otp}, ${expiresAt})
    `
    
    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@')
    let sent = false
    
    if (isEmail) {
      sent = await sendEmail(identifier, otp)
    } else {
      sent = await sendSMS(identifier, otp)
    }
    
    if (!sent) {
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      }
    }
    
    // In development mode, return OTP for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'Verification code sent successfully',
        otp // Only in development!
      }
    }
    
    return {
      success: true,
      message: 'Verification code sent successfully'
    }
  } catch (error) {
    console.error('Error generating OTP:', error)
    return {
      success: false,
      message: 'Failed to generate verification code'
    }
  }
}

/**
 * Verify OTP for identifier
 */
export async function verifyOTP(identifier: string, otp: string): Promise<{ valid: boolean; message: string }> {
  const db = getDatabase()
  
  try {
    // Find the most recent unused OTP for this identifier
    const records = await db`
      SELECT id, otp, expires_at, attempts, is_used
      FROM otp_codes
      WHERE identifier = ${identifier}
      AND is_used = false
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (records.length === 0) {
      return {
        valid: false,
        message: 'No valid verification code found. Please request a new one.'
      }
    }
    
    const record = records[0]
    
    // Check if max attempts exceeded
    if (record.attempts >= MAX_ATTEMPTS) {
      await db`
        UPDATE otp_codes 
        SET is_used = true 
        WHERE id = ${record.id}
      `
      
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded. Please request a new code.'
      }
    }
    
    // Check if OTP matches
    if (record.otp !== otp) {
      // Increment attempts
      await db`
        UPDATE otp_codes 
        SET attempts = attempts + 1 
        WHERE id = ${record.id}
      `
      
      const remainingAttempts = MAX_ATTEMPTS - (record.attempts + 1)
      return {
        valid: false,
        message: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
      }
    }
    
    // OTP is valid - mark as used
    await db`
      UPDATE otp_codes 
      SET is_used = true, used_at = NOW() 
      WHERE id = ${record.id}
    `
    
    return {
      valid: true,
      message: 'Verification successful'
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return {
      valid: false,
      message: 'Failed to verify code. Please try again.'
    }
  }
}

/**
 * Clean up expired and used OTP codes (should be run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const db = getDatabase()
  
  try {
    // Delete OTPs that are either:
    // 1. Expired for more than 1 hour
    // 2. Used and older than 1 hour
    await db`
      DELETE FROM otp_codes
      WHERE (expires_at < NOW() - INTERVAL '1 hour')
      OR (is_used = true AND used_at < NOW() - INTERVAL '1 hour')
    `
    
    console.log('✅ Expired OTP codes cleaned up')
  } catch (error) {
    console.error('❌ Failed to cleanup expired OTPs:', error)
  }
}

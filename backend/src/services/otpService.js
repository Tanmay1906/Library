const crypto = require("crypto");
const emailService = require('./emailService');

class OTPService {
  constructor() {
    // Store OTPs with expiration times in memory (use Redis in production)
    this.otpStore = new Map();
    this.OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
    this.MAX_ATTEMPTS = 3;
    this.attemptStore = new Map();
  }

  generateOTP() {
    return crypto.randomInt(1000, 9999).toString();
  }

  async sendOTP(phone, code) {
    try {
      // Store OTP with expiration time
      const expiryTime = Date.now() + this.OTP_EXPIRY_TIME;
      this.otpStore.set(phone, {
        code: code,
        expiryTime: expiryTime,
        attempts: 0
      });

      // Reset attempt counter for this phone
      this.attemptStore.set(phone, 0);

      // TODO: Implement actual SMS service (Twilio, AWS SNS, etc.)
      console.log(`Sending OTP ${code} to ${phone} (expires in 5 minutes)`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        expiryTime: expiryTime
      };
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  async sendOTPEmail(email, code) {
    try {
      // Store OTP with expiration time
      const expiryTime = Date.now() + this.OTP_EXPIRY_TIME;
      this.otpStore.set(email, {
        code: code,
        expiryTime: expiryTime,
        attempts: 0
      });

      // Reset attempt counter for this email
      this.attemptStore.set(email, 0);

      // Send OTP via email
      const emailResult = await emailService.sendOTPEmail(email, code);
      
      if (emailResult.success) {
        console.log(`OTP sent to email ${email} (expires in 5 minutes)`);
        return {
          success: true,
          message: 'OTP sent to your email successfully',
          expiryTime: expiryTime,
          previewURL: emailResult.previewURL // For development testing
        };
      } else {
        // Remove stored OTP if email failed
        this.otpStore.delete(email);
        this.attemptStore.delete(email);
        return {
          success: false,
          message: 'Failed to send OTP email'
        };
      }
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Clean up on error
      this.otpStore.delete(email);
      this.attemptStore.delete(email);
      return {
        success: false,
        message: 'Failed to send OTP email'
      };
    }
  }

  async verifyOTP(identifier, inputCode) {
    try {
      // Demo mode: accept "0000" as valid OTP for any identifier
      if (inputCode === '0000') {
        console.log(`Demo OTP verification successful for ${identifier}`);
        return {
          success: true,
          message: 'OTP verified successfully (demo mode)'
        };
      }

      const storedOTP = this.otpStore.get(identifier);
      
      if (!storedOTP) {
        return {
          success: false,
          message: 'No OTP found for this email/phone. Please request a new OTP.'
        };
      }

      // Check if OTP has expired
      if (Date.now() > storedOTP.expiryTime) {
        this.otpStore.delete(identifier);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check attempt limits
      const attempts = this.attemptStore.get(identifier) || 0;
      if (attempts >= this.MAX_ATTEMPTS) {
        this.otpStore.delete(identifier);
        this.attemptStore.delete(identifier);
        return {
          success: false,
          message: 'Maximum attempts exceeded. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (storedOTP.code === inputCode) {
        // OTP is correct, remove from store
        this.otpStore.delete(identifier);
        this.attemptStore.delete(identifier);
        
        return {
          success: true,
          message: 'OTP verified successfully'
        };
      } else {
        // Increment attempt counter
        this.attemptStore.set(identifier, attempts + 1);
        const remainingAttempts = this.MAX_ATTEMPTS - (attempts + 1);
        
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
        };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'OTP verification failed'
      };
    }
  }

  // Clean up expired OTPs (call this periodically)
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [identifier, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiryTime) {
        this.otpStore.delete(identifier);
        this.attemptStore.delete(identifier);
      }
    }
  }
}

module.exports = new OTPService();

const crypto = require('crypto');

class OTPUtility {
  constructor() {
    this.length = 6;
  }

  /**
   * Generate numeric OTP
   * @param {number} length - Length of OTP (default: 6)
   * @returns {string} Generated OTP
   */
  generateOTP(length = this.length) {
    const numbers = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      otp += numbers.charAt(randomIndex);
    }
    
    return otp;
  }

  /**
   * Generate alphanumeric string
   * @param {number} n - Length of string
   * @returns {string} Generated alphanumeric string
   */
  getAlphaNumericString(n) {
    const alphaNumericString = 'ABCDEF0123456789';
    let result = '';
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * alphaNumericString.length);
      result += alphaNumericString.charAt(randomIndex);
    }
    
    return result;
  }

  /**
   * Generate secure random token using crypto
   * @param {number} length - Length of token in bytes (default: 32)
   * @returns {string} Generated token in hex format
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   * @returns {string} Generated UUID
   */
  generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Validate OTP format
   * @param {string} otp - OTP to validate
   * @param {number} expectedLength - Expected length (default: 6)
   * @returns {boolean} True if valid format
   */
  isValidOTPFormat(otp, expectedLength = this.length) {
    const otpRegex = new RegExp(`^\\d{${expectedLength}}$`);
    return otpRegex.test(otp);
  }

  /**
   * Check if OTP has expired
   * @param {Date} otpGeneratedTime - Time when OTP was generated
   * @param {number} validityMinutes - Validity in minutes (default: 10)
   * @returns {boolean} True if expired
   */
  isOTPExpired(otpGeneratedTime, validityMinutes = 10) {
    if (!otpGeneratedTime) return true;
    
    const now = new Date();
    const diffInMinutes = (now - new Date(otpGeneratedTime)) / (1000 * 60);
    
    return diffInMinutes > validityMinutes;
  }
}

module.exports = new OTPUtility();
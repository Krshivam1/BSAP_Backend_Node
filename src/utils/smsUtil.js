const axios = require('axios');
const logger = require('./logger');

class SmsUtil {
  constructor() {
    this.providers = {
      TWO_FACTOR: {
        url: 'http://2factor.in/API/V1/83bbfeee-74b5-11ea-9fa5-0200cd936042/ADDON_SERVICES/SEND/TSMS',
        from: 'DGBIHR'
      },
      MESSAGE_INDIA: {
        baseUrl: 'http://sms.messageindia.in/v2/sendSMS',
        username: 'mocsoft',
        sendername: 'MOPSAM',
        apikey: 'ff477a37-b910-43d3-8466-75d04a4a4a40',
        peid: '1701159902812755509'
      }
    };
  }

  /**
   * Send SMS using 2Factor template
   * @param {Object} dataSMS - SMS template variables
   * @param {string} mobileNo - Mobile number
   * @param {string} templateName - Template name
   */
  async sendSms2FactorTemplate(dataSMS, mobileNo, templateName) {
    try {
      logger.info(`Sending SMS to: ${mobileNo}`);

      let payload = {
        From: this.providers.TWO_FACTOR.from,
        To: mobileNo,
        TemplateName: templateName
      };

      // Add template variables
      Object.keys(dataSMS).forEach((key, index) => {
        payload[`VAR${index + 1}`] = dataSMS[key];
      });

      logger.info('SMS Payload:', JSON.stringify(payload));

      const response = await axios.post(this.providers.TWO_FACTOR.url, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logger.info('SMS Response:', response.data);
      return { success: true, response: response.data };

    } catch (error) {
      logger.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS using MessageIndia template
   * @param {Object} dataSMS - SMS data (not used in this implementation)
   * @param {string} mobileNo - Mobile number
   * @param {string} message - SMS message
   * @param {string} templateId - Template ID
   */
  async sendMessageIndiaTemplate(dataSMS, mobileNo, message, templateId) {
    try {
      logger.info(`Sending SMS to: ${mobileNo} via MessageIndia`);

      const encodedMessage = encodeURIComponent(message);
      const url = `${this.providers.MESSAGE_INDIA.baseUrl}?username=${this.providers.MESSAGE_INDIA.username}&message=${encodedMessage}&sendername=${this.providers.MESSAGE_INDIA.sendername}&smstype=TRANS&numbers=${mobileNo}&apikey=${this.providers.MESSAGE_INDIA.apikey}&peid=${this.providers.MESSAGE_INDIA.peid}&templateid=${templateId}`;

      logger.info('SMS URL:', url);

      const response = await axios.get(url, {
        timeout: 10000
      });

      logger.info('SMS Response:', response.data);
      return { success: true, response: response.data };

    } catch (error) {
      logger.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send OTP SMS
   * @param {string} mobileNo - Mobile number
   * @param {string} otp - OTP code
   * @param {string} appName - Application name
   */
  async sendOTPSMS(mobileNo, otp, appName = 'Performance Statistics') {
    const message = `Your OTP for ${appName} is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    const templateName = 'OTP_TEMPLATE';
    
    const dataSMS = {
      VAR1: otp,
      VAR2: appName,
      VAR3: '10'
    };

    // Try 2Factor first, fallback to MessageIndia
    let result = await this.sendSms2FactorTemplate(dataSMS, mobileNo, templateName);
    
    if (!result.success) {
      logger.info('2Factor failed, trying MessageIndia...');
      const templateId = '1707171593686926974'; // OTP template ID
      result = await this.sendMessageIndiaTemplate(dataSMS, mobileNo, message, templateId);
    }

    return result;
  }

  /**
   * Send password reset SMS
   * @param {string} mobileNo - Mobile number
   * @param {string} otp - OTP code
   */
  async sendPasswordResetSMS(mobileNo, otp) {
    const message = `Your password reset OTP is: ${otp}. Valid for 10 minutes. If you didn't request this, please ignore.`;
    const templateName = 'PASSWORD_RESET_TEMPLATE';
    
    const dataSMS = {
      VAR1: otp,
      VAR2: '10'
    };

    return await this.sendSms2FactorTemplate(dataSMS, mobileNo, templateName);
  }

  /**
   * Send welcome SMS
   * @param {string} mobileNo - Mobile number
   * @param {string} userName - User name
   * @param {string} appName - Application name
   */
  async sendWelcomeSMS(mobileNo, userName, appName = 'Performance Statistics') {
    const message = `Welcome ${userName}! Your account has been created successfully in ${appName}. Login to get started.`;
    const templateName = 'WELCOME_TEMPLATE';
    
    const dataSMS = {
      VAR1: userName,
      VAR2: appName
    };

    return await this.sendSms2FactorTemplate(dataSMS, mobileNo, templateName);
  }

  /**
   * Validate mobile number format
   * @param {string} mobileNo - Mobile number to validate
   * @returns {boolean} True if valid
   */
  isValidMobileNumber(mobileNo) {
    // Indian mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobileNo);
  }

  /**
   * Format mobile number for SMS
   * @param {string} mobileNo - Mobile number
   * @returns {string} Formatted mobile number
   */
  formatMobileNumber(mobileNo) {
    // Remove any non-digit characters
    let formatted = mobileNo.replace(/\D/g, '');
    
    // Add country code if not present
    if (formatted.length === 10 && formatted.startsWith('91') === false) {
      formatted = '91' + formatted;
    }
    
    return formatted;
  }
}

module.exports = new SmsUtil();
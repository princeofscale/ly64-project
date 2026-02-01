'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.EmailValidationService = void 0;
const axios_1 = __importDefault(require('axios'));
class EmailValidationService {
  constructor() {
    this.reacherApiUrl = process.env.REACHER_API_URL;
    this.useReacherApi = !!this.reacherApiUrl;
  }
  async validateEmail(email) {
    try {
      if (this.useReacherApi) {
        return await this.validateWithReacher(email);
      }
      return this.validateSimple(email);
    } catch (error) {
      console.error('Email validation error:', error);
      return true;
    }
  }
  async validateWithReacher(email) {
    try {
      const response = await axios_1.default.post(
        `${this.reacherApiUrl}/v0/check_email`,
        { to_email: email },
        { timeout: 10000 }
      );
      const result = response.data;
      return (
        result.is_reachable === 'safe' ||
        result.is_reachable === 'risky' ||
        result.is_reachable === 'unknown'
      );
    } catch (error) {
      console.error('Reacher API error:', error);
      return this.validateSimple(email);
    }
  }
  validateSimple(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    if (!isValidFormat) {
      return false;
    }
    return this.isNotDisposableEmail(email);
  }
  isNotDisposableEmail(email) {
    const disposableDomains = [
      'tempmail.com',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'throwaway.email',
      'temp-mail.org',
      'fakeinbox.com',
      'yopmail.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }
}
exports.EmailValidationService = EmailValidationService;
exports.default = new EmailValidationService();
//# sourceMappingURL=emailValidationService.js.map

import axios from 'axios';

export class EmailValidationService {
  private readonly reacherApiUrl = process.env.REACHER_API_URL;
  private readonly useReacherApi = !!this.reacherApiUrl;

  async validateEmail(email: string): Promise<boolean> {
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

  private async validateWithReacher(email: string): Promise<boolean> {
    try {
      const response = await axios.post(
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

  private validateSimple(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);

    if (!isValidFormat) {
      return false;
    }

    return this.isNotDisposableEmail(email);
  }

  isNotDisposableEmail(email: string): boolean {
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

export default new EmailValidationService();

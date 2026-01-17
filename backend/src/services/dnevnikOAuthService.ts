import axios from 'axios';
import { AppError } from '../middlewares/errorHandler';

/**
 * Интерфейс пользователя Dnevnik.ru
 */
export interface DnevnikUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  sex?: 'Male' | 'Female';
  birthDate?: string;
}

/**
 * OAuth 2.0 Service для интеграции с Dnevnik.ru
 *
 * Документация API: https://api.dnevnik.ru/partners/oauth
 * API v2: https://api.dnevnik.ru/v2/docs
 *
 * НАСТРОЙКА:
 * 1. Зарегистрируйтесь как партнер на https://login.dnevnik.ru/
 * 2. Получите Client ID и Client Secret
 * 3. Настройте Redirect URI
 * 4. Добавьте в .env:
 *    DNEVNIK_CLIENT_ID=your_client_id
 *    DNEVNIK_CLIENT_SECRET=your_client_secret
 *    DNEVNIK_REDIRECT_URI=http://localhost:3001/api/oauth/dnevnik/callback
 */
export class DnevnikOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly authUrl = 'https://login.dnevnik.ru/oauth2';
  private readonly tokenUrl = 'https://login.dnevnik.ru/oauth2/token';
  private readonly apiBaseUrl = 'https://api.dnevnik.ru/v2';

  constructor() {
    this.clientId = process.env.DNEVNIK_CLIENT_ID || '';
    this.clientSecret = process.env.DNEVNIK_CLIENT_SECRET || '';
    this.redirectUri = process.env.DNEVNIK_REDIRECT_URI || 'http://localhost:3001/api/oauth/dnevnik/callback';

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️  Dnevnik.ru OAuth credentials not configured. Please set DNEVNIK_CLIENT_ID and DNEVNIK_CLIENT_SECRET in .env');
    }
  }

  /**
   * Получить URL для авторизации пользователя
   * Scopes:
   * - CommonInfo: базовая информация о пользователе
   * - FriendsAndRelatives: информация о семье/друзьях
   * - EducationalInfo: информация об образовании
   */
  getAuthUrl(state?: string): string {
    if (!this.clientId) {
      throw new AppError('Dnevnik.ru OAuth не настроен', 500);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'CommonInfo,EducationalInfo',
      ...(state && { state }),
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Обменять authorization code на access token
   * @param code - Authorization code из callback
   * @returns Access token
   */
  async getAccessToken(code: string): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new AppError('Dnevnik.ru OAuth не настроен', 500);
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token } = response.data;

      if (!access_token) {
        throw new AppError('Не удалось получить access token от Dnevnik.ru', 500);
      }

      return access_token;
    } catch (error) {
      console.error('Dnevnik.ru OAuth token error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new AppError(
          `Ошибка авторизации Dnevnik.ru: ${error.response.data?.error_description || error.message}`,
          400
        );
      }
      throw new AppError('Ошибка при получении токена от Dnevnik.ru', 500);
    }
  }

  /**
   * Получить информацию о пользователе от Dnevnik.ru
   * @param accessToken - Access token
   * @returns Информация о пользователе
   */
  async getUserInfo(accessToken: string): Promise<DnevnikUser> {
    try {
      // Получаем ID текущего пользователя
      const contextResponse = await axios.get(`${this.apiBaseUrl}/users/me/context`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userId = contextResponse.data.userId;

      if (!userId) {
        throw new AppError('Не удалось получить ID пользователя от Dnevnik.ru', 500);
      }

      // Получаем полную информацию о пользователе
      const userResponse = await axios.get(`${this.apiBaseUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = userResponse.data;

      return {
        id: userData.id.toString(),
        email: userData.email || `${userData.id}@dnevnik.ru`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        sex: userData.sex,
        birthDate: userData.birthDate,
      };
    } catch (error) {
      console.error('Dnevnik.ru get user info error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new AppError(
          `Ошибка получения данных пользователя: ${error.response.data?.message || error.message}`,
          400
        );
      }
      throw new AppError('Ошибка при получении данных пользователя от Dnevnik.ru', 500);
    }
  }

  /**
   * Получить информацию об образовании пользователя
   * @param accessToken - Access token
   * @param userId - ID пользователя
   * @returns Информация об образовании
   */
  async getEducationInfo(accessToken: string, userId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/${userId}/education`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Dnevnik.ru get education info error:', error);
      // Не бросаем ошибку, так как эта информация опциональная
      return null;
    }
  }

  /**
   * Проверка, настроен ли OAuth
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

export default new DnevnikOAuthService();

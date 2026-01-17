import { Router, Request, Response } from 'express';
import dnevnikOAuthService from '../services/dnevnikOAuthService';
import authService from '../services/authService';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

const router = Router();

/**
 * GET /api/oauth/dnevnik
 * Перенаправление на страницу авторизации Dnevnik.ru
 */
router.get('/dnevnik', (req: Request, res: Response) => {
  try {
    if (!dnevnikOAuthService.isConfigured()) {
      throw new AppError(
        'OAuth интеграция с Dnevnik.ru не настроена. Обратитесь к администратору.',
        503
      );
    }

    // Генерируем state для защиты от CSRF
    const state = Math.random().toString(36).substring(7);

    // Сохраняем state в сессию (если используется express-session)
    // или можно сохранить в Redis/БД для stateless подхода
    (req.session as any).oauthState = state;

    const authUrl = dnevnikOAuthService.getAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth redirect error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

/**
 * GET /api/oauth/dnevnik/callback
 * Обработка callback от Dnevnik.ru после авторизации
 */
router.get('/dnevnik/callback', async (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const { code, state, error, error_description } = req.query;

    // Проверка наличия ошибки от OAuth провайдера
    if (error) {
      console.error('OAuth error from provider:', error, error_description);
      return res.redirect(`${frontendUrl}/login?error=oauth_denied`);
    }

    // Проверка наличия authorization code
    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code отсутствует', 400);
    }

    // Проверка state для защиты от CSRF (опционально)
    const savedState = (req.session as any)?.oauthState;
    if (state && savedState && state !== savedState) {
      throw new AppError('Неверный state параметр', 400);
    }

    // Получаем access token
    const accessToken = await dnevnikOAuthService.getAccessToken(code);

    // Получаем информацию о пользователе
    const dnevnikUser = await dnevnikOAuthService.getUserInfo(accessToken);

    // Проверяем, существует ли пользователь в нашей БД
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: dnevnikUser.email },
          { dnevnikId: dnevnikUser.id },
        ],
      },
    });

    if (user) {
      // Пользователь уже существует - обновляем dnevnikId если его нет
      if (!user.dnevnikId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { dnevnikId: dnevnikUser.id },
        });
      }
    } else {
      // Новый пользователь - нужно завершить регистрацию
      // Редиректим на страницу завершения регистрации с данными от Dnevnik.ru
      const userData = encodeURIComponent(
        JSON.stringify({
          email: dnevnikUser.email,
          name: `${dnevnikUser.firstName} ${dnevnikUser.lastName}`,
          dnevnikId: dnevnikUser.id,
          authProvider: 'DNEVNIK',
        })
      );

      return res.redirect(`${frontendUrl}/register?oauth=dnevnik&data=${userData}`);
    }

    // Генерируем JWT токен
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Редиректим на frontend с токеном
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

export default router;

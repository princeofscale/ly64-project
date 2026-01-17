import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { generateToken, JwtPayload } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../utils/validation';
import emailValidationService from './emailValidationService';
import achievementService from './achievementService';

const SALT_ROUNDS = 10;

export class AuthService {
  // Генерация уникального username
  async generateUsername(email: string): Promise<string> {
    // Берем часть до @ и убираем спецсимволы
    let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Генерируем случайный суффикс (6 символов)
    const generateRandomSuffix = () => {
      return Math.random().toString(36).substring(2, 8);
    };

    // Проверяем уникальность
    let username = `${baseUsername}_${generateRandomSuffix()}`;
    let attempts = 0;
    const maxAttempts = 10;

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${generateRandomSuffix()}`;
      attempts++;

      // Если не удалось сгенерировать уникальный username за 10 попыток,
      // добавляем timestamp
      if (attempts >= maxAttempts) {
        username = `${baseUsername}_${Date.now()}`;
        break;
      }
    }

    return username;
  }

  // Регистрация нового пользователя
  async register(data: RegisterInput) {
    const {
      email,
      password,
      name,
      status,
      currentGrade,
      desiredDirection,
      motivation,
      agreedToTerms,
      authProvider,
      dnevnikId,
    } = data;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 409);
    }

    // Генерируем уникальный username
    const username = await this.generateUsername(email);

    // Валидация email (только для EMAIL провайдера)
    if (authProvider === 'EMAIL') {
      const isValidEmail = await emailValidationService.validateEmail(email);
      if (!isValidEmail) {
        throw new AppError(
          'Email адрес недоступен или не существует. Проверьте правильность написания.',
          400
        );
      }
    }

    // Хеширование пароля (если есть)
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        status,
        currentGrade,
        desiredDirection,
        motivation,
        agreedToTerms,
        authProvider,
        dnevnikId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        motivation: true,
        authProvider: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Создание прогресса пользователя
    await prisma.userProgress.create({
      data: {
        userId: user.id,
        completedTests: JSON.stringify([]),
        stats: JSON.stringify([]),
      },
    });

    // Проверка и разблокировка достижений (асинхронно, не ждем результата)
    achievementService
      .checkAndUnlockAchievements(user.id)
      .catch((err) => console.error('Error unlocking achievements:', err));

    // Генерация JWT токена
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      token,
    };
  }

  // Вход пользователя
  async login(data: LoginInput) {
    const { email, password } = data;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    // Проверка что у пользователя есть пароль (не OAuth)
    if (!user.password) {
      throw new AppError('Этот аккаунт был создан через внешний сервис. Используйте соответствующий способ входа.', 401);
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401);
    }

    // Генерация JWT токена
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        status: user.status,
        currentGrade: user.currentGrade,
        desiredDirection: user.desiredDirection,
        motivation: user.motivation,
        authProvider: user.authProvider,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  // Получение текущего пользователя
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
        currentGrade: true,
        desiredDirection: true,
        motivation: true,
        authProvider: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        progress: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    return user;
  }
}

export default new AuthService();

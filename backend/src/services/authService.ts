import bcrypt from 'bcrypt';

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

import achievementService from './achievementService';
import emailValidationService from './emailValidationService';
import { tokenService } from './tokenService';

import type { RegisterInput, LoginInput } from '../utils/validation';

const SALT_ROUNDS = 10;

export class AuthService {
  async generateUsername(email: string): Promise<string> {
    const baseUsername = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const generateRandomSuffix = () => {
      return Math.random().toString(36).substring(2, 8);
    };

    let username = `${baseUsername}_${generateRandomSuffix()}`;
    let attempts = 0;
    const maxAttempts = 10;

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}_${generateRandomSuffix()}`;
      attempts++;

      if (attempts >= maxAttempts) {
        username = `${baseUsername}_${Date.now()}`;
        break;
      }
    }

    return username;
  }

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
    } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 409);
    }

    const username = await this.generateUsername(email);

    const isValidEmail = await emailValidationService.validateEmail(email);
    if (!isValidEmail) {
      throw new AppError(
        'Email адрес недоступен или не существует. Проверьте правильность написания.',
        400
      );
    }

    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

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
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.userProgress.create({
      data: {
        userId: user.id,
        completedTests: JSON.stringify([]),
        stats: JSON.stringify([]),
      },
    });

    achievementService
      .checkAndUnlockAchievements(user.id)
      .catch(err => console.error('Error unlocking achievements:', err));

    const tokens = await tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    if (!user.password) {
      throw new AppError(
        'Этот аккаунт был создан через внешний сервис. Используйте соответствующий способ входа.',
        401
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const tokens = await tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
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
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

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
        role: true,
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

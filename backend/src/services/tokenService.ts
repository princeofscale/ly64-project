/**
 * Token Service
 * Управление access и refresh токенами
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// ==========================================
// Configuration
// ==========================================

const ACCESS_TOKEN_EXPIRY = '15m';  // 15 минут
const REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 дней

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // секунды до истечения access token
}

// ==========================================
// Token Service
// ==========================================

class TokenService {
  private static instance: TokenService;
  private readonly jwtSecret: string;

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Генерация пары токенов (access + refresh)
   */
  async generateTokenPair(
    user: { id: string; email: string; role: string },
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    // Генерируем access token
    const accessToken = this.generateAccessToken(user);

    // Генерируем refresh token
    const refreshToken = await this.generateRefreshToken(user.id, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 минут в секундах
    };
  }

  /**
   * Генерация access token
   */
  generateAccessToken(user: { id: string; email: string; role: string }): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Генерация refresh token
   */
  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<string> {
    // Генерируем уникальный токен
    const token = crypto.randomBytes(64).toString('hex');

    // Вычисляем дату истечения
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Сохраняем в БД
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        deviceInfo,
        ipAddress,
      },
    });

    logger.info('[TokenService] Refresh token created', { userId });

    return token;
  }

  /**
   * Обновление токенов по refresh token
   */
  async refreshTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<TokenPair | null> {
    // Находим refresh token в БД
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      logger.warn('[TokenService] Refresh token not found');
      return null;
    }

    // Проверяем не отозван ли токен
    if (storedToken.isRevoked) {
      logger.warn('[TokenService] Refresh token is revoked', { userId: storedToken.userId });
      // Возможная атака - отзываем все токены пользователя
      await this.revokeAllUserTokens(storedToken.userId);
      return null;
    }

    // Проверяем срок действия
    if (new Date() > storedToken.expiresAt) {
      logger.warn('[TokenService] Refresh token expired', { userId: storedToken.userId });
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return null;
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      logger.warn('[TokenService] User not found for refresh token');
      return null;
    }

    // Отзываем старый refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Генерируем новую пару токенов
    const newTokens = await this.generateTokenPair(user, deviceInfo, ipAddress);

    logger.info('[TokenService] Tokens refreshed', { userId: user.id });

    return newTokens;
  }

  /**
   * Верификация access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Отзыв refresh token
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Отзыв всех токенов пользователя
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    logger.info('[TokenService] All user tokens revoked', { userId, count: result.count });

    return result.count;
  }

  /**
   * Получить активные сессии пользователя
   */
  async getUserSessions(userId: string): Promise<{
    id: string;
    deviceInfo: string | null;
    ipAddress: string | null;
    createdAt: Date;
  }[]> {
    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens;
  }

  /**
   * Очистка истекших токенов (запускать по cron)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    if (result.count > 0) {
      logger.info('[TokenService] Cleaned up expired tokens', { count: result.count });
    }

    return result.count;
  }
}

export const tokenService = TokenService.getInstance();
export default tokenService;

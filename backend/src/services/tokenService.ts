import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class TokenService {
  private static instance: TokenService;

  private constructor() {}

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async generateTokenPair(
    user: { id: string; email: string; role: string },
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);

    const refreshToken = await this.generateRefreshToken(user.id, deviceInfo, ipAddress);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }

  generateAccessToken(user: { id: string; email: string; role: string }): string {
    // Use the centralized JWT service to ensure consistency
    return generateToken({
      userId: user.id,
      email: user.email,
    });
  }

  async generateRefreshToken(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

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

  async refreshTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<TokenPair | null> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      logger.warn('[TokenService] Refresh token not found');
      return null;
    }

    if (storedToken.isRevoked) {
      logger.warn('[TokenService] Refresh token is revoked', { userId: storedToken.userId });
      await this.revokeAllUserTokens(storedToken.userId);
      return null;
    }

    if (new Date() > storedToken.expiresAt) {
      logger.warn('[TokenService] Refresh token expired', { userId: storedToken.userId });
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: storedToken.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      logger.warn('[TokenService] User not found for refresh token');
      return null;
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const newTokens = await this.generateTokenPair(user, deviceInfo, ipAddress);

    logger.info('[TokenService] Tokens refreshed', { userId: user.id });

    return newTokens;
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const { verifyToken } = require('../utils/jwt');
      const decoded = verifyToken(token);
      // Map the decoded token back to TokenPayload format
      return {
        id: decoded.userId,
        email: decoded.email,
        role: 'USER', // Default role, can be extended if needed
      };
    } catch (error) {
      return null;
    }
  }

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

  async revokeAllUserTokens(userId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    logger.info('[TokenService] All user tokens revoked', { userId, count: result.count });

    return result.count;
  }

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

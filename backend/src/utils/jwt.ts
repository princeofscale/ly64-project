import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../middlewares/errorHandler';

// Security: Enforce strong JWT secret in production
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY CRITICAL] JWT_SECRET is not set in production!');
      // Generate a random secret for this session (tokens will invalidate on restart)
      const emergencySecret = crypto.randomBytes(64).toString('hex');
      console.warn('[SECURITY] Using temporary JWT secret. Set JWT_SECRET in environment!');
      return emergencySecret;
    }
    // Development fallback with warning
    console.warn('[SECURITY WARNING] Using default JWT_SECRET. Set JWT_SECRET in .env for production!');
    return 'dev-only-secret-change-in-production';
  }

  // Validate secret strength
  if (secret.length < 32) {
    console.warn('[SECURITY WARNING] JWT_SECRET should be at least 32 characters long');
  }

  return secret;
};

const JWT_SECRET: string = getJwtSecret();
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256', // Explicitly set algorithm to prevent algorithm confusion attacks
      issuer: 'lyceum64-api', // Add issuer claim
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Only accept HS256 to prevent algorithm confusion
      issuer: 'lyceum64-api', // Verify issuer
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Токен истёк. Пожалуйста, войдите снова.', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Невалидный токен', 401);
    }
    throw new AppError('Ошибка проверки токена', 401);
  }
};

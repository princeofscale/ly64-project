import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { AppError } from '../middlewares/errorHandler';

import { logger } from './logger';

import type { SignOptions, VerifyOptions } from 'jsonwebtoken';

export interface JwtPayload {
  readonly userId: string;
  readonly email: string;
  readonly iat?: number;
  readonly exp?: number;
}

interface JwtConfiguration {
  readonly secret: string;
  readonly expiresIn: SignOptions['expiresIn'];
  readonly algorithm: jwt.Algorithm;
  readonly issuer: string;
}

interface TokenErrorMessages {
  readonly expired: string;
  readonly invalid: string;
  readonly verification: string;
}

class JwtService {
  private readonly config: JwtConfiguration;
  private readonly minSecretLength: number = 32;
  private readonly emergencySecretByteLength: number = 64;
  private readonly defaultDevSecret: string = 'dev-only-secret-change-in-production';
  private readonly defaultExpiresIn: string = '7d';
  private readonly unauthorizedStatusCode: number = 401;

  private readonly errorMessages: TokenErrorMessages = {
    expired: 'Токен истёк. Пожалуйста, войдите снова.',
    invalid: 'Невалидный токен',
    verification: 'Ошибка проверки токена',
  };

  constructor() {
    this.config = this.initializeConfiguration();
  }

  private initializeConfiguration(): JwtConfiguration {
    const secret = this.loadJwtSecret();
    const expiresIn = this.loadExpiresIn();

    return {
      secret,
      expiresIn,
      algorithm: 'HS256',
      issuer: 'lyceum64-api',
    };
  }

  private loadJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return this.handleMissingSecret();
    }

    this.validateSecretLength(secret);
    return secret;
  }

  private handleMissingSecret(): string {
    if (this.isProductionEnvironment()) {
      return this.generateEmergencySecret();
    }

    this.logSecurityWarning('Using default JWT_SECRET. Set JWT_SECRET in .env for production');
    return this.defaultDevSecret;
  }

  private isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private generateEmergencySecret(): string {
    logger.error('JWT_SECRET is not set in production environment');

    const emergencySecret = crypto.randomBytes(this.emergencySecretByteLength).toString('hex');

    logger.warn('Using temporary JWT secret. Set JWT_SECRET in environment variables immediately');

    return emergencySecret;
  }

  private validateSecretLength(secret: string): void {
    if (secret.length < this.minSecretLength) {
      this.logSecurityWarning(
        `JWT_SECRET should be at least ${this.minSecretLength} characters long`
      );
    }
  }

  private logSecurityWarning(message: string): void {
    logger.warn(`Security: ${message}`);
  }

  private loadExpiresIn(): SignOptions['expiresIn'] {
    const expiresIn = process.env.JWT_EXPIRES_IN || this.defaultExpiresIn;
    return expiresIn as SignOptions['expiresIn'];
  }

  public generateToken(payload: JwtPayload): string {
    const tokenPayload = this.createTokenPayload(payload);
    const signOptions = this.createSignOptions();

    return jwt.sign(tokenPayload, this.config.secret, signOptions);
  }

  private createTokenPayload(payload: JwtPayload): Pick<JwtPayload, 'userId' | 'email'> {
    return {
      userId: payload.userId,
      email: payload.email,
    };
  }

  private createSignOptions(): SignOptions {
    return {
      expiresIn: this.config.expiresIn,
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
    };
  }

  public verifyToken(token: string): JwtPayload {
    if (!token || typeof token !== 'string') {
      throw new AppError(this.errorMessages.invalid, this.unauthorizedStatusCode);
    }

    try {
      return this.decodeAndVerifyToken(token);
    } catch (error) {
      throw this.handleVerificationError(error);
    }
  }

  private decodeAndVerifyToken(token: string): JwtPayload {
    const verifyOptions = this.createVerifyOptions();
    const decoded = jwt.verify(token, this.config.secret, verifyOptions);

    return decoded as JwtPayload;
  }

  private createVerifyOptions(): VerifyOptions {
    return {
      algorithms: [this.config.algorithm],
      issuer: this.config.issuer,
    };
  }

  private handleVerificationError(error: unknown): AppError {
    if (error instanceof jwt.TokenExpiredError) {
      return new AppError(this.errorMessages.expired, this.unauthorizedStatusCode);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return new AppError(this.errorMessages.invalid, this.unauthorizedStatusCode);
    }

    return new AppError(this.errorMessages.verification, this.unauthorizedStatusCode);
  }
}

const jwtService = new JwtService();

export const generateToken = (payload: JwtPayload): string => {
  return jwtService.generateToken(payload);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwtService.verifyToken(token);
};

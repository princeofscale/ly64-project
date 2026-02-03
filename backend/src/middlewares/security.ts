import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { escape } from 'validator';

import type { Request, Response, NextFunction } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Слишком много запросов. Попробуйте позже.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute for development
  max: 50, // Increased for development
  message: {
    error: 'Слишком много попыток входа. Попробуйте через минуту.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const registrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute for development
  max: 100, // Increased for development
  message: {
    error: 'Слишком много попыток регистрации. Попробуйте через минуту.',
    retryAfter: 1,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: 'Слишком много запросов на сброс пароля. Попробуйте через час.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Слишком много административных запросов.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const parameterPollutionProtection = hpp({
  whitelist: ['tags', 'subjects', 'ids'],
});

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    let sanitized = value;

    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    sanitized = sanitized.replace(/javascript:/gi, '');

    sanitized = sanitized.replace(/data:text\/html/gi, '');

    sanitized = escape(sanitized);

    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};

const skipFields = ['password', 'confirmPassword', 'token', 'refreshToken', 'accessToken'];

export const xssSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (skipFields.includes(key)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeValue(value);
      }
    }
    req.body = sanitized;
  }

  next();
};

const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  /(--)|(;)/g,
  /(\/\*[\s\S]*?\*\/)/g,
  /(\bOR\b|\bAND\b).*?[=<>]/gi,
];

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkValue = (value: unknown): string | false => {
    if (typeof value === 'string') {
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          return value;
        }
      }
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = checkValue(item);
        if (result) return result;
      }
    }
    if (value && typeof value === 'object') {
      for (const val of Object.values(value)) {
        const result = checkValue(val);
        if (result) return result;
      }
    }
    return false;
  };

  const queryInjection = checkValue(req.query);
  if (queryInjection) {
    console.warn(
      `[SECURITY] SQL Injection attempt in query: ${queryInjection.substring(0, 100)} from IP: ${req.ip}`
    );
    return res.status(400).json({
      error: 'Обнаружены недопустимые символы в запросе',
    });
  }

  if (req.body && typeof req.body === 'object') {
    const bodyToCheck = { ...req.body };
    delete bodyToCheck.password;
    delete bodyToCheck.confirmPassword;

    const bodyInjection = checkValue(bodyToCheck);
    if (bodyInjection) {
      console.warn(
        `[SECURITY] SQL Injection attempt in body: ${bodyInjection.substring(0, 100)} from IP: ${req.ip}`
      );
      return res.status(400).json({
        error: 'Обнаружены недопустимые символы в запросе',
      });
    }
  }

  next();
};

export const requestSizeLimiter = (maxSizeKB: number = 100) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = maxSizeKB * 1024;

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: `Размер запроса превышает лимит в ${maxSizeKB}KB`,
      });
    }
    next();
  };
};

interface LockoutEntry {
  attempts: number;
  lockedUntil: number | null;
}

const lockoutStore = new Map<string, LockoutEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export const checkAccountLockout = (email: string): { locked: boolean; remainingTime?: number } => {
  const entry = lockoutStore.get(email.toLowerCase());

  if (!entry) {
    return { locked: false };
  }

  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    return {
      locked: true,
      remainingTime: Math.ceil((entry.lockedUntil - Date.now()) / 1000 / 60),
    };
  }

  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    lockoutStore.delete(email.toLowerCase());
    return { locked: false };
  }

  return { locked: false };
};

export const recordFailedLogin = (email: string): { locked: boolean; attempts: number } => {
  const normalizedEmail = email.toLowerCase();
  const entry = lockoutStore.get(normalizedEmail) || { attempts: 0, lockedUntil: null };

  entry.attempts++;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }

  lockoutStore.set(normalizedEmail, entry);

  return {
    locked: entry.attempts >= MAX_ATTEMPTS,
    attempts: entry.attempts,
  };
};

export const clearFailedLogins = (email: string): void => {
  lockoutStore.delete(email.toLowerCase());
};

export const securityLogger = (req: Request, _res: Response, next: NextFunction) => {
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      console.warn(
        `[SECURITY] Suspicious header detected: ${header}=${req.headers[header]} from IP: ${req.ip}`
      );
    }
  }

  if (req.path.includes('..') || req.path.includes('%2e%2e')) {
    console.warn(`[SECURITY] Path traversal attempt: ${req.path} from IP: ${req.ip}`);
  }

  next();
};

export const secureCookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const ipBlacklist = new Set<string>();

export const addToBlacklist = (ip: string): void => {
  ipBlacklist.add(ip);
  console.warn(`[SECURITY] IP added to blacklist: ${ip}`);
};

export const removeFromBlacklist = (ip: string): void => {
  ipBlacklist.delete(ip);
};

export const checkBlacklist = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || '';

  if (ipBlacklist.has(clientIp)) {
    console.warn(`[SECURITY] Blocked request from blacklisted IP: ${clientIp}`);
    return res.status(403).json({
      error: 'Доступ запрещён',
    });
  }

  next();
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface AdvancedRateLimitConfig {
  windowMs: number;
  maxRequestsPerIP: number;
  maxRequestsPerUser: number;
  maxRequestsCombined: number;
  message?: string;
}

class AdvancedRateLimiter {
  private ipStore = new Map<string, RateLimitEntry>();
  private userStore = new Map<string, RateLimitEntry>();
  private combinedStore = new Map<string, RateLimitEntry>();
  private config: AdvancedRateLimitConfig;

  constructor(config: AdvancedRateLimitConfig) {
    this.config = config;

    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private getOrCreate(store: Map<string, RateLimitEntry>, key: string): RateLimitEntry {
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
      store.set(key, entry);
    }

    return entry;
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.ipStore.entries()) {
      if (now >= entry.resetAt) this.ipStore.delete(key);
    }
    for (const [key, entry] of this.userStore.entries()) {
      if (now >= entry.resetAt) this.userStore.delete(key);
    }
    for (const [key, entry] of this.combinedStore.entries()) {
      if (now >= entry.resetAt) this.combinedStore.delete(key);
    }
  }

  public check(
    ip: string,
    userId?: string
  ): { allowed: boolean; retryAfter?: number; reason?: string } {
    const now = Date.now();

    const ipEntry = this.getOrCreate(this.ipStore, ip);
    if (ipEntry.count >= this.config.maxRequestsPerIP) {
      return {
        allowed: false,
        retryAfter: Math.ceil((ipEntry.resetAt - now) / 1000),
        reason: 'IP rate limit exceeded',
      };
    }

    if (userId) {
      const userEntry = this.getOrCreate(this.userStore, userId);
      if (userEntry.count >= this.config.maxRequestsPerUser) {
        return {
          allowed: false,
          retryAfter: Math.ceil((userEntry.resetAt - now) / 1000),
          reason: 'User rate limit exceeded',
        };
      }

      const combinedKey = `${ip}:${userId}`;
      const combinedEntry = this.getOrCreate(this.combinedStore, combinedKey);
      if (combinedEntry.count >= this.config.maxRequestsCombined) {
        return {
          allowed: false,
          retryAfter: Math.ceil((combinedEntry.resetAt - now) / 1000),
          reason: 'Combined rate limit exceeded',
        };
      }

      userEntry.count++;
      combinedEntry.count++;
    }

    ipEntry.count++;

    return { allowed: true };
  }

  public getStats(): { ipEntries: number; userEntries: number; combinedEntries: number } {
    return {
      ipEntries: this.ipStore.size,
      userEntries: this.userStore.size,
      combinedEntries: this.combinedStore.size,
    };
  }
}

export const apiRateLimiter = new AdvancedRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequestsPerIP: 300,
  maxRequestsPerUser: 500,
  maxRequestsCombined: 200,
});

export const testSubmitRateLimiter = new AdvancedRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequestsPerIP: 50,
  maxRequestsPerUser: 30,
  maxRequestsCombined: 20,
});

export const sensitiveActionsLimiter = new AdvancedRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequestsPerIP: 10,
  maxRequestsPerUser: 20,
  maxRequestsCombined: 10,
});

export const advancedRateLimitMiddleware = (
  limiter: AdvancedRateLimiter,
  customMessage?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const userId = (req as any).user?.id;

    const result = limiter.check(ip, userId);

    if (!result.allowed) {
      console.warn(
        `[RATE_LIMIT] Blocked: IP=${ip}, User=${userId || 'anonymous'}, Reason=${result.reason}`
      );

      res.setHeader('Retry-After', result.retryAfter?.toString() || '60');
      res.setHeader('X-RateLimit-Reason', result.reason || 'Rate limit exceeded');

      return res.status(429).json({
        success: false,
        message: customMessage || 'Слишком много запросов. Попробуйте позже.',
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
};

export const testSubmitRateLimitMiddleware = advancedRateLimitMiddleware(
  testSubmitRateLimiter,
  'Слишком много попыток отправки теста. Попробуйте через час.'
);

export const sensitiveActionsRateLimitMiddleware = advancedRateLimitMiddleware(
  sensitiveActionsLimiter,
  'Слишком много попыток. Попробуйте позже.'
);

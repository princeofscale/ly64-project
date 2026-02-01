import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const logDir = process.env.LOG_DIR || 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0 && meta.stack) {
      metaStr = `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
});

const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

const securityRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '90d',
  zippedArchive: true,
});

const accessRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '7d',
  zippedArchive: true,
});

errorRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`[Logger] Error log rotated: ${oldFilename} -> ${newFilename}`);
});

combinedRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`[Logger] Combined log rotated: ${oldFilename} -> ${newFilename}`);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'lyceum64-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    }),
    errorRotateTransport,
    combinedRotateTransport,
  ],
});

export const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'lyceum64-security' },
  transports: [
    securityRotateTransport,
    new winston.transports.Console({
      format: consoleFormat,
      level: 'warn',
    }),
  ],
});

export const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lyceum64-access' },
  transports: [accessRotateTransport],
});

export enum SecurityEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_BLOCKED = 'LOGIN_BLOCKED',
  REGISTRATION = 'REGISTRATION',
  REGISTRATION_BLOCKED = 'REGISTRATION_BLOCKED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  ADMIN_ACTION = 'ADMIN_ACTION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  IP_BLACKLISTED = 'IP_BLACKLISTED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_DELETE = 'DATA_DELETE',
}

interface AuditLogData {
  event: SecurityEvent;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = (data: AuditLogData): void => {
  const { event, userId, email, ip, userAgent, details, severity = 'medium' } = data;

  auditLogger.info({
    event,
    userId,
    email,
    ip,
    userAgent,
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });

  if (severity === 'critical' || severity === 'high') {
    logger.warn(`[SECURITY] ${event}`, {
      userId,
      email,
      ip,
      details,
    });
  }
};

export const getRequestInfo = (req: Request) => ({
  ip: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown',
  method: req.method,
  path: req.path,
  query: req.query,
});

export const logFailedLogin = (email: string, req: Request, reason: string): void => {
  logSecurityEvent({
    event: SecurityEvent.LOGIN_FAILED,
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: { reason },
    severity: 'medium',
  });
};

export const logSuccessfulLogin = (userId: string, email: string, req: Request): void => {
  logSecurityEvent({
    event: SecurityEvent.LOGIN_SUCCESS,
    userId,
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    severity: 'low',
  });
};

export const logBlockedLogin = (email: string, req: Request): void => {
  logSecurityEvent({
    event: SecurityEvent.LOGIN_BLOCKED,
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    severity: 'high',
  });
};

export const logRegistration = (userId: string, email: string, req: Request): void => {
  logSecurityEvent({
    event: SecurityEvent.REGISTRATION,
    userId,
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    severity: 'low',
  });
};

export const logAdminAction = (
  adminId: string,
  action: string,
  targetUserId: string | undefined,
  req: Request,
  details?: Record<string, unknown>
): void => {
  logSecurityEvent({
    event: SecurityEvent.ADMIN_ACTION,
    userId: adminId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      action,
      targetUserId,
      ...details,
    },
    severity: 'medium',
  });
};

export const logSuspiciousActivity = (
  type: string,
  req: Request,
  details?: Record<string, unknown>
): void => {
  logSecurityEvent({
    event: SecurityEvent.SUSPICIOUS_ACTIVITY,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      type,
      ...details,
      ...getRequestInfo(req),
    },
    severity: 'high',
  });
};

export const logSqlInjectionAttempt = (req: Request, pattern: string): void => {
  logSecurityEvent({
    event: SecurityEvent.SQL_INJECTION_ATTEMPT,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      pattern,
      body: req.body,
      query: req.query,
    },
    severity: 'critical',
  });
};

export const logXssAttempt = (req: Request, payload: string): void => {
  logSecurityEvent({
    event: SecurityEvent.XSS_ATTEMPT,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      payload: payload.substring(0, 200),
      path: req.path,
    },
    severity: 'critical',
  });
};

export const logRateLimitExceeded = (req: Request, endpoint: string): void => {
  logSecurityEvent({
    event: SecurityEvent.RATE_LIMIT_EXCEEDED,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: { endpoint },
    severity: 'medium',
  });
};

export const requestLogger = (req: Request, _res: any, next: any): void => {
  const start = Date.now();

  _res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: _res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (_res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (_res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export default logger;

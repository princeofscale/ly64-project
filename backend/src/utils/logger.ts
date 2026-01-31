import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// ==========================================
// Winston Logger Configuration with Daily Rotation
// ==========================================

const logDir = process.env.LOG_DIR || 'logs';

// Создаём директорию для логов если не существует
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
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

// ==========================================
// Daily Rotate File Transports
// ==========================================

// Error logs - rotate daily, keep 30 days
const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  zippedArchive: true,
});

// Combined logs - rotate daily, keep 14 days
const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// Security audit logs - rotate daily, keep 90 days
const securityRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '90d',
  zippedArchive: true,
});

// API access logs - rotate daily, keep 7 days
const accessRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '7d',
  zippedArchive: true,
});

// Event handlers for rotation
errorRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`[Logger] Error log rotated: ${oldFilename} -> ${newFilename}`);
});

combinedRotateTransport.on('rotate', (oldFilename, newFilename) => {
  console.log(`[Logger] Combined log rotated: ${oldFilename} -> ${newFilename}`);
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'lyceum64-api' },
  transports: [
    // Write all logs to console in development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    }),
    // Daily rotating error log
    errorRotateTransport,
    // Daily rotating combined log
    combinedRotateTransport,
  ],
});

// Security audit logger - separate file for security events
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

// Access logger for HTTP requests
export const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lyceum64-access' },
  transports: [accessRotateTransport],
});

// ==========================================
// Security Event Types
// ==========================================

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

// ==========================================
// Audit Logging Functions
// ==========================================

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

  // Also log critical events to main logger
  if (severity === 'critical' || severity === 'high') {
    logger.warn(`[SECURITY] ${event}`, {
      userId,
      email,
      ip,
      details,
    });
  }
};

// Helper to extract request info
export const getRequestInfo = (req: Request) => ({
  ip: req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown',
  userAgent: req.headers['user-agent'] || 'unknown',
  method: req.method,
  path: req.path,
  query: req.query,
});

// Log failed login attempt
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

// Log successful login
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

// Log blocked login (rate limit)
export const logBlockedLogin = (email: string, req: Request): void => {
  logSecurityEvent({
    event: SecurityEvent.LOGIN_BLOCKED,
    email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    severity: 'high',
  });
};

// Log registration
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

// Log admin action
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

// Log suspicious activity
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

// Log SQL injection attempt
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

// Log XSS attempt
export const logXssAttempt = (req: Request, payload: string): void => {
  logSecurityEvent({
    event: SecurityEvent.XSS_ATTEMPT,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      payload: payload.substring(0, 200), // Limit payload size in log
      path: req.path,
    },
    severity: 'critical',
  });
};

// Log rate limit exceeded
export const logRateLimitExceeded = (req: Request, endpoint: string): void => {
  logSecurityEvent({
    event: SecurityEvent.RATE_LIMIT_EXCEEDED,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: { endpoint },
    severity: 'medium',
  });
};

// ==========================================
// Request Logging Middleware
// ==========================================

export const requestLogger = (req: Request, _res: any, next: any): void => {
  const start = Date.now();

  // Log response when finished
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

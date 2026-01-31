import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import { wsService } from './services/websocketService';
import {
  securityHeaders,
  generalLimiter,
  adminLimiter,
  parameterPollutionProtection,
  xssSanitizer,
  sqlInjectionProtection,
  securityLogger,
  checkBlacklist,
} from './middlewares/security';
import { requestLogger, logger } from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import studentsRoutes from './routes/students';
import diagnosticRoutes from './routes/diagnostic';
import testsRoutes from './routes/tests';
import adminRoutes from './routes/admin';
import sdamgiaRoutes from './routes/sdamgia';
import gamificationRoutes from './routes/gamification';
import recommendationsRoutes from './routes/recommendations';
import testLoaderService from './services/testLoaderService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for correct IP detection behind reverse proxy
app.set('trust proxy', 1);

// ==========================================
// Security Middleware (ORDER MATTERS!)
// ==========================================

// 1. Security headers (Helmet)
app.use(securityHeaders);

// 2. Request logging
app.use(requestLogger);

// 3. Security logging
app.use(securityLogger);

// 4. Check IP blacklist
app.use(checkBlacklist);

// 5. CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      callback(null, true);
    }
    // Allow localhost in development
    else if (process.env.NODE_ENV !== 'production' && origin?.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    }
    // Allow configured frontend URL
    else if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    // Block all other origins
    else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours preflight cache
}));

// 6. Gzip compression for responses
app.use(compression({
  level: 6, // Compression level (1-9, 6 is default balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression's default filter
    return compression.filter(req, res);
  },
}));

// 7. Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. HTTP Parameter Pollution protection
app.use(parameterPollutionProtection);

// 8. XSS sanitization
app.use(xssSanitizer);

// 9. SQL injection pattern detection
app.use(sqlInjectionProtection);

// 10. General rate limiting for all routes
app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Lyceum 64 API is running' });
});

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/students', studentsRoutes);

app.use('/api/diagnostic', diagnosticRoutes);

app.use('/api/tests', testsRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/sdamgia', sdamgiaRoutes);

app.use('/api/gamification', gamificationRoutes);

app.use('/api/recommendations', recommendationsRoutes);

app.use(errorHandler);

// Create HTTP server for both Express and WebSocket
const server = createServer(app);

// Initialize WebSocket server
wsService.initialize(server);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  wsService.shutdown();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, async () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`📚 API documentation: http://localhost:${PORT}/api`);
  logger.info(`🔌 WebSocket server running on ws://localhost:${PORT}/ws`);
  logger.info(`🔒 Security features enabled: Helmet, Rate Limiting, XSS Protection, SQL Injection Protection`);

  // Initialize test loader - automatically loads tests from sdamgia_api if database is empty
  await testLoaderService.initialize();
});

export default app;

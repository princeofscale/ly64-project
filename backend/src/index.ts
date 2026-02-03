import { createServer } from 'http';

import compression from 'compression';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';

import { errorHandler } from './middlewares/errorHandler';
import { handleNotFound } from './middlewares/notFoundHandler';
import {
  securityHeaders,
  generalLimiter,
  parameterPollutionProtection,
  xssSanitizer,
  sqlInjectionProtection,
  securityLogger,
  checkBlacklist,
} from './middlewares/security';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import baseRouter from './routes/base';
import gamificationRoutes from './routes/gamification';
import recommendationsRoutes from './routes/recommendations';
import sdamgiaRoutes from './routes/sdamgia';
import studentsRoutes from './routes/students';
import testsRoutes from './routes/tests';
import userRoutes from './routes/user';
import testLoaderService from './services/testLoaderService';
import { wsService } from './services/websocketService';
import { requestLogger, logger } from './utils/logger';

import type { CorsOptions } from 'cors';
import type { Application, Request, Response } from 'express';
import type { Server as HttpServer } from 'http';

interface ServerConfiguration {
  readonly port: number;
  readonly frontendUrl: string | undefined;
  readonly nodeEnv: string | undefined;
}

interface HealthResponse {
  readonly status: string;
  readonly message: string;
}

interface RootResponse extends HealthResponse {
  readonly dev: string;
  readonly telegram: string;
}

class ApplicationServer {
  private readonly app: Application;
  private readonly httpServer: HttpServer;
  private readonly config: ServerConfiguration;
  private readonly localhostPattern: RegExp = /^http:\/\/localhost:\d+$/;
  private readonly allowedHttpMethods: ReadonlyArray<string> = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ];
  private readonly allowedHeaders: ReadonlyArray<string> = ['Content-Type', 'Authorization'];
  private readonly bodyLimitSize: string = '10mb';
  private readonly compressionLevel: number = 6;
  private readonly compressionThreshold: number = 1024;
  private readonly corsMaxAge: number = 86400;
  private readonly proxyTrustLevel: number = 1;

  constructor() {
    dotenv.config();

    this.config = this.loadConfiguration();
    this.app = express();
    this.httpServer = createServer(this.app);

    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupWebSocket();
    this.setupGracefulShutdown();
  }

  private loadConfiguration(): ServerConfiguration {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('Invalid PORT configuration');
    }

    return {
      port,
      frontendUrl: process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
    };
  }

  private setupMiddlewares(): void {
    this.app.set('trust proxy', this.proxyTrustLevel);

    this.setupSecurityMiddlewares();
    this.setupCorsMiddleware();
    this.setupCompressionMiddleware();
    this.setupBodyParsers();
    this.setupProtectionMiddlewares();
    this.setupRateLimiting();
  }

  private setupSecurityMiddlewares(): void {
    this.app.use(securityHeaders);
    this.app.use(requestLogger);
    this.app.use(securityLogger);
    this.app.use(checkBlacklist);
  }

  private setupCorsMiddleware(): void {
    const corsOptions: CorsOptions = {
      origin: this.createCorsOriginValidator(),
      credentials: true,
      methods: [...this.allowedHttpMethods],
      allowedHeaders: [...this.allowedHeaders],
      maxAge: this.corsMaxAge,
    };

    this.app.use(cors(corsOptions));
  }

  private createCorsOriginValidator() {
    const allowedOrigins = this.getAllowedOrigins();
    const isDevelopment = this.isDevelopmentEnvironment();

    return (
      origin: string | undefined,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ): void => {
      if (this.shouldAllowOrigin(origin, allowedOrigins, isDevelopment)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    };
  }

  private getAllowedOrigins(): ReadonlyArray<string> {
    return this.config.frontendUrl ? [this.config.frontendUrl] : [];
  }

  private isDevelopmentEnvironment(): boolean {
    return this.config.nodeEnv !== 'production';
  }

  private shouldAllowOrigin(
    origin: string | undefined,
    allowedOrigins: ReadonlyArray<string>,
    isDevelopment: boolean
  ): boolean {
    if (!origin && isDevelopment) {
      return true;
    }

    if (isDevelopment && origin && this.localhostPattern.test(origin)) {
      return true;
    }

    if (origin && allowedOrigins.includes(origin)) {
      return true;
    }

    return false;
  }

  private setupCompressionMiddleware(): void {
    this.app.use(
      compression({
        level: this.compressionLevel,
        threshold: this.compressionThreshold,
        filter: this.createCompressionFilter(),
      })
    );
  }

  private createCompressionFilter() {
    return (req: Request, res: Response): boolean => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    };
  }

  private setupBodyParsers(): void {
    this.app.use(express.json({ limit: this.bodyLimitSize }));
    this.app.use(express.urlencoded({ extended: true, limit: this.bodyLimitSize }));
  }

  private setupProtectionMiddlewares(): void {
    this.app.use(parameterPollutionProtection);
    this.app.use(xssSanitizer);
    this.app.use(sqlInjectionProtection);
  }

  private setupRateLimiting(): void {
    this.app.use(generalLimiter);
  }

  private setupRoutes(): void {
    this.setupHealthCheckRoutes();
    this.setupApiRoutes();
  }

  private setupHealthCheckRoutes(): void {
    this.app.get('/', (_req: Request, res: Response): void => {
      const response: RootResponse = {
        status: 'ok',
        message: 'API is running',
        dev: 'princeofscale',
        telegram: '@tqwit',
      };
      res.json(response);
    });

    this.app.get('/api/health', (_req: Request, res: Response): void => {
      const response: HealthResponse = {
        status: 'ok',
        message: 'Lyceum 64 API is running',
      };
      res.json(response);
    });
  }

  private setupApiRoutes(): void {
    this.app.use('/api', baseRouter);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/students', studentsRoutes);
    this.app.use('/api/tests', testsRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/sdamgia', sdamgiaRoutes);
    this.app.use('/api/gamification', gamificationRoutes);
    this.app.use('/api/recommendations', recommendationsRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(handleNotFound);
    this.app.use(errorHandler);
  }

  private setupWebSocket(): void {
    wsService.initialize(this.httpServer);
  }

  private setupGracefulShutdown(): void {
    process.on('SIGTERM', (): void => {
      this.shutdown();
    });
  }

  private shutdown(): void {
    logger.info('SIGTERM received, shutting down');

    wsService.shutdown();

    this.httpServer.close((): void => {
      logger.info('Server closed');
      process.exit(0);
    });
  }

  public async start(): Promise<void> {
    this.httpServer.listen(this.config.port, async (): Promise<void> => {
      this.logServerStartup();
      await this.initializeServices();
    });
  }

  private logServerStartup(): void {
    const baseUrl = `http://localhost:${this.config.port}`;
    const wsUrl = `ws://localhost:${this.config.port}/ws`;

    logger.info(`Server is running on ${baseUrl}`);
    logger.info(`API documentation: ${baseUrl}/api`);
    logger.info(`WebSocket server running on ${wsUrl}`);
    logger.info(
      'Security features enabled: Helmet, Rate Limiting, XSS Protection, SQL Injection Protection'
    );
  }

  private async initializeServices(): Promise<void> {
    await testLoaderService.initialize();
  }

  public getExpressApp(): Application {
    return this.app;
  }
}

const server = new ApplicationServer();
server.start();

export default server.getExpressApp();

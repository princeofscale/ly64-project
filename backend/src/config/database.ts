import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { DATABASE_CONSTANTS, DATABASE_LOG_LEVELS, LIFECYCLE_EVENTS } from '../constants/databaseConstants';

dotenv.config();

type LogLevel = 'query' | 'error' | 'warn' | 'info';

interface DatabaseConfig {
  readonly url: string;
  readonly logLevels: ReadonlyArray<LogLevel>;
}

class DatabaseConnection {
  private readonly client: PrismaClient;
  private readonly config: DatabaseConfig;
  private isConnected: boolean = false;

  constructor() {
    this.config = this.initializeConfig();
    this.client = this.createClient();
    this.setupLifecycleHandlers();
  }

  private initializeConfig(): DatabaseConfig {
    const url = this.getDatabaseUrl();
    const logLevels = this.getLogLevels();

    return {
      url,
      logLevels,
    };
  }

  private getDatabaseUrl(): string {
    return process.env.DATABASE_URL || DATABASE_CONSTANTS.DEFAULT_URL;
  }

  private getLogLevels(): ReadonlyArray<LogLevel> {
    return this.isDevelopmentEnvironment()
      ? DATABASE_LOG_LEVELS.DEVELOPMENT
      : DATABASE_LOG_LEVELS.PRODUCTION;
  }

  private isDevelopmentEnvironment(): boolean {
    return process.env.NODE_ENV === DATABASE_CONSTANTS.DEVELOPMENT_ENV;
  }

  private createClient(): PrismaClient {
    const adapter = this.createAdapter();

    return new PrismaClient({
      adapter,
      log: [...this.config.logLevels] as Prisma.LogLevel[],
    });
  }

  private createAdapter(): PrismaBetterSqlite3 {
    return new PrismaBetterSqlite3({
      url: this.config.url,
    });
  }

  private setupLifecycleHandlers(): void {
    process.on(LIFECYCLE_EVENTS.BEFORE_EXIT, () => this.handleBeforeExit());
    process.on(LIFECYCLE_EVENTS.SIGINT, () => this.handleSignal('SIGINT'));
    process.on(LIFECYCLE_EVENTS.SIGTERM, () => this.handleSignal('SIGTERM'));
  }

  private async handleBeforeExit(): Promise<void> {
    await this.disconnect();
  }

  private async handleSignal(signal: string): Promise<void> {
    await this.disconnect();
    process.exit(signal === 'SIGINT' ? 0 : 1);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.client.$disconnect();
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.$connect();
      this.isConnected = true;
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

const databaseConnection = new DatabaseConnection();

export const prismaClient = databaseConnection.getClient();
export const connectDatabase = () => databaseConnection.connect();
export const disconnectDatabase = () => databaseConnection.disconnect();
export const checkDatabaseHealth = () => databaseConnection.healthCheck();

export default prismaClient;

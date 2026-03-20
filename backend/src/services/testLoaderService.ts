import { execFile } from 'child_process';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import prisma from '../config/database';
import { logger } from '../utils/logger';

const execFileAsync = promisify(execFile);

function getPythonCommand(): string {
  const platform = os.platform();

  if (platform === 'darwin' || platform === 'linux') {
    return 'python3';
  }

  if (platform === 'win32') {
    return 'py';
  }

  return 'python';
}

class TestLoaderService {
  private isLoading = false;
  private lastLoadTime: Date | null = null;
  private pythonCommand: string;

  constructor() {
    this.pythonCommand = getPythonCommand();
    logger.info(`Using Python command: ${this.pythonCommand}`);
  }

  public getLastLoadTime(): Date | null {
    return this.lastLoadTime;
  }

  async shouldLoadTests(): Promise<boolean> {
    try {
      const testCount = await prisma.test.count({
        where: {
          isDiagnostic: false,
        },
      });

      return testCount === 0;
    } catch (error) {
      logger.error('Error checking test count:', error);
      return false;
    }
  }

  async loadTests(): Promise<void> {
    if (this.isLoading) {
      logger.info('Tests are already being loaded, skipping...');
      return;
    }

    try {
      this.isLoading = true;
      logger.info('Starting test data loading from sdamgia_api...');

      const scriptPath = path.join(__dirname, '../../scripts/fetch_sdamgia_tests.py');

      const { stdout, stderr } = await execFileAsync(this.pythonCommand, [scriptPath], {
        cwd: path.join(__dirname, '../..'),
        timeout: 300000,
      });

      if (stdout) {
        logger.info(stdout);
      }

      if (stderr && !stderr.includes('InsecureRequestWarning')) {
        logger.error('Script warnings:', stderr);
      }

      this.lastLoadTime = new Date();
      logger.info('Test data loading completed successfully!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('Error loading tests:', msg);

      if (msg.includes('sdamgia_api') || msg.includes('python')) {
        logger.warn('Python or sdamgia_api not found.');
        logger.warn('Tests will not be auto-loaded.');
        logger.warn('To load tests manually, run:');
        logger.warn(`${this.pythonCommand} backend/scripts/fetch_sdamgia_tests.py`);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async initialize(): Promise<void> {
    try {
      const shouldLoad = await this.shouldLoadTests();

      if (shouldLoad) {
        logger.info('No tests found in database, loading from sdamgia_api...');
        this.loadTests().catch(err => {
          logger.error('Background test loading failed:', err);
        });
      } else {
        logger.info('Tests already loaded in database');
      }
    } catch (error) {
      logger.error('Error initializing test loader:', error);
    }
  }
}

export default new TestLoaderService();

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import prisma from '../config/database';

const execAsync = promisify(exec);

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
    console.log(`🐍 Using Python command: ${this.pythonCommand}`);
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
      console.error('Error checking test count:', error);
      return false;
    }
  }

  async loadTests(): Promise<void> {
    if (this.isLoading) {
      console.log('⏳ Tests are already being loaded, skipping...');
      return;
    }

    try {
      this.isLoading = true;
      console.log('\n📚 Starting test data loading from sdamgia_api...');

      const scriptPath = path.join(__dirname, '../../scripts/fetch_sdamgia_tests.py');

      const { stdout, stderr } = await execAsync(`${this.pythonCommand} "${scriptPath}"`, {
        cwd: path.join(__dirname, '../..'),
        timeout: 300000,
      });

      if (stdout) {
        console.log(stdout);
      }

      if (stderr && !stderr.includes('InsecureRequestWarning')) {
        console.error('⚠️  Script warnings:', stderr);
      }

      this.lastLoadTime = new Date();
      console.log('✅ Test data loading completed successfully!');
    } catch (error: any) {
      console.error('❌ Error loading tests:', error.message);

      if (error.message.includes('sdamgia_api') || error.message.includes('python')) {
        console.warn('\n⚠️  Python or sdamgia_api not found.');
        console.warn('   Tests will not be auto-loaded.');
        console.warn('   To load tests manually, run:');
        console.warn(`   ${this.pythonCommand} backend/scripts/fetch_sdamgia_tests.py\n`);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async initialize(): Promise<void> {
    try {
      const shouldLoad = await this.shouldLoadTests();

      if (shouldLoad) {
        console.log('🔄 No tests found in database, loading from sdamgia_api...');
        this.loadTests().catch(err => {
          console.error('Background test loading failed:', err);
        });
      } else {
        console.log('✅ Tests already loaded in database');
      }
    } catch (error) {
      console.error('Error initializing test loader:', error);
    }
  }
}

export default new TestLoaderService();

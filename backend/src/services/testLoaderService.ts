import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import prisma from '../config/database';

const execAsync = promisify(exec);

class TestLoaderService {
  private isLoading = false;
  private lastLoadTime: Date | null = null;

  /**
   * Проверяет, нужно ли загружать тесты
   */
  async shouldLoadTests(): Promise<boolean> {
    try {
      // Проверяем, есть ли тесты в базе данных
      const testCount = await prisma.test.count({
        where: {
          isDiagnostic: false,
        },
      });

      // Если тестов нет, нужно загрузить
      return testCount === 0;
    } catch (error) {
      console.error('Error checking test count:', error);
      return false;
    }
  }

  /**
   * Загружает тесты из sdamgia_api
   */
  async loadTests(): Promise<void> {
    if (this.isLoading) {
      console.log('⏳ Tests are already being loaded, skipping...');
      return;
    }

    try {
      this.isLoading = true;
      console.log('\n📚 Starting test data loading from sdamgia_api...');

      const scriptPath = path.join(__dirname, '../../scripts/fetch_sdamgia_tests.py');

      // Запускаем Python скрипт
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}"`, {
        cwd: path.join(__dirname, '../..'),
        timeout: 300000, // 5 минут
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

      // Если ошибка из-за отсутствия Python/sdamgia_api, предупреждаем но не падаем
      if (error.message.includes('sdamgia_api') || error.message.includes('python')) {
        console.warn('\n⚠️  Python or sdamgia_api not found.');
        console.warn('   Tests will not be auto-loaded.');
        console.warn('   To load tests manually, run:');
        console.warn('   python3 backend/scripts/fetch_sdamgia_tests.py\n');
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Инициализация при старте сервера
   */
  async initialize(): Promise<void> {
    try {
      const shouldLoad = await this.shouldLoadTests();

      if (shouldLoad) {
        console.log('🔄 No tests found in database, loading from sdamgia_api...');
        // Запускаем загрузку в фоне, не блокируя старт сервера
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

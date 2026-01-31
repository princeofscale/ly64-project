/**
 * Scheduled Database Backup
 * Запускает бэкапы по расписанию
 *
 * Использование:
 *   npm run db:backup:scheduled    - Запустить планировщик бэкапов
 *
 * По умолчанию бэкапы создаются:
 *   - Каждые 6 часов автоматически
 *   - При запуске сервера (первый бэкап)
 */

import { createBackup, getBackupList } from './backup-db';

// Конфигурация расписания
const BACKUP_CONFIG = {
  // Интервал между бэкапами (в миллисекундах)
  intervalMs: 6 * 60 * 60 * 1000, // 6 часов

  // Создать бэкап при запуске
  backupOnStart: true,

  // Логирование
  verbose: true,
};

let backupCount = 0;
let lastBackupTime: Date | null = null;

/**
 * Выполнить бэкап с логированием
 */
function performBackup(): void {
  const startTime = Date.now();

  console.log('\n' + '='.repeat(50));
  console.log(`[${new Date().toLocaleString('ru-RU')}] Запуск планового бэкапа...`);

  const backupPath = createBackup();

  if (backupPath) {
    backupCount++;
    lastBackupTime = new Date();

    const duration = Date.now() - startTime;
    console.log(`[Backup] Завершено за ${duration}ms`);
    console.log(`[Backup] Всего бэкапов в этой сессии: ${backupCount}`);
  } else {
    console.error('[Backup] Не удалось создать бэкап!');
  }

  console.log('='.repeat(50) + '\n');
}

/**
 * Показать статус планировщика
 */
function showStatus(): void {
  const backups = getBackupList();
  const nextBackup = lastBackupTime
    ? new Date(lastBackupTime.getTime() + BACKUP_CONFIG.intervalMs)
    : new Date(Date.now() + BACKUP_CONFIG.intervalMs);

  console.log('\n📊 Статус планировщика бэкапов:');
  console.log(`   Интервал: каждые ${BACKUP_CONFIG.intervalMs / (60 * 60 * 1000)} часов`);
  console.log(`   Бэкапов в сессии: ${backupCount}`);
  console.log(`   Последний бэкап: ${lastBackupTime?.toLocaleString('ru-RU') || 'нет'}`);
  console.log(`   Следующий бэкап: ${nextBackup.toLocaleString('ru-RU')}`);
  console.log(`   Всего бэкапов: ${backups.length}`);
  console.log('');
}

/**
 * Запустить планировщик
 */
function startScheduler(): void {
  console.log('\n🚀 Запуск планировщика бэкапов базы данных');
  console.log(`   Интервал: каждые ${BACKUP_CONFIG.intervalMs / (60 * 60 * 1000)} часов`);
  console.log('   Для остановки нажмите Ctrl+C\n');

  // Бэкап при запуске
  if (BACKUP_CONFIG.backupOnStart) {
    performBackup();
  }

  // Запуск интервала
  const intervalId = setInterval(performBackup, BACKUP_CONFIG.intervalMs);

  // Показать статус каждый час
  setInterval(showStatus, 60 * 60 * 1000);

  // Обработка завершения
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Остановка планировщика...');
    clearInterval(intervalId);
    showStatus();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    clearInterval(intervalId);
    process.exit(0);
  });

  // Первичный статус
  showStatus();
}

// Запуск
startScheduler();

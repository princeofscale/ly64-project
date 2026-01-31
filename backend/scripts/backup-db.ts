/**
 * Database Backup Script
 * Создаёт резервные копии SQLite базы данных
 *
 * Использование:
 *   npm run db:backup           - Создать бэкап
 *   npm run db:backup:list      - Список бэкапов
 *   npm run db:backup:restore   - Восстановить из последнего бэкапа
 */

import * as fs from 'fs';
import * as path from 'path';

// Конфигурация
const CONFIG = {
  // Путь к базе данных
  dbPath: path.join(__dirname, '..', 'dev.db'),
  // Директория для бэкапов
  backupDir: path.join(__dirname, '..', 'backups'),
  // Максимальное количество бэкапов (старые удаляются)
  maxBackups: 10,
  // Формат имени файла бэкапа
  getBackupName: () => {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    return `backup_${timestamp}.db`;
  },
};

/**
 * Создать директорию для бэкапов если не существует
 */
function ensureBackupDir(): void {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    console.log(`📁 Создана директория для бэкапов: ${CONFIG.backupDir}`);
  }
}

/**
 * Получить список существующих бэкапов
 */
function getBackupList(): { name: string; path: string; size: number; date: Date }[] {
  ensureBackupDir();

  const files = fs.readdirSync(CONFIG.backupDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
    .map(name => {
      const filePath = path.join(CONFIG.backupDir, name);
      const stats = fs.statSync(filePath);
      return {
        name,
        path: filePath,
        size: stats.size,
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return files;
}

/**
 * Удалить старые бэкапы
 */
function cleanupOldBackups(): void {
  const backups = getBackupList();

  if (backups.length > CONFIG.maxBackups) {
    const toDelete = backups.slice(CONFIG.maxBackups);

    for (const backup of toDelete) {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Удалён старый бэкап: ${backup.name}`);
    }
  }
}

/**
 * Создать бэкап базы данных
 */
function createBackup(): string | null {
  console.log('\n🔄 Создание бэкапа базы данных...\n');

  // Проверяем существование БД
  if (!fs.existsSync(CONFIG.dbPath)) {
    console.error(`❌ База данных не найдена: ${CONFIG.dbPath}`);
    return null;
  }

  ensureBackupDir();

  const backupName = CONFIG.getBackupName();
  const backupPath = path.join(CONFIG.backupDir, backupName);

  try {
    // Копируем файл БД
    fs.copyFileSync(CONFIG.dbPath, backupPath);

    const stats = fs.statSync(backupPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Бэкап создан успешно!`);
    console.log(`   📄 Файл: ${backupName}`);
    console.log(`   📦 Размер: ${sizeKB} KB`);
    console.log(`   📂 Путь: ${backupPath}`);

    // Удаляем старые бэкапы
    cleanupOldBackups();

    return backupPath;
  } catch (error) {
    console.error(`❌ Ошибка создания бэкапа:`, error);
    return null;
  }
}

/**
 * Показать список бэкапов
 */
function listBackups(): void {
  console.log('\n📋 Список резервных копий:\n');

  const backups = getBackupList();

  if (backups.length === 0) {
    console.log('   Бэкапы не найдены.');
    console.log('   Создайте бэкап командой: npm run db:backup');
    return;
  }

  console.log('   #  | Дата                | Размер     | Имя файла');
  console.log('   ---|---------------------|------------|---------------------------');

  backups.forEach((backup, index) => {
    const date = backup.date.toLocaleString('ru-RU');
    const sizeKB = (backup.size / 1024).toFixed(2).padStart(8);
    const num = String(index + 1).padStart(2);
    console.log(`   ${num} | ${date} | ${sizeKB} KB | ${backup.name}`);
  });

  console.log(`\n   Всего: ${backups.length} бэкап(ов)`);
  console.log(`   Максимум хранится: ${CONFIG.maxBackups}`);
}

/**
 * Восстановить из последнего бэкапа
 */
function restoreFromLatest(): boolean {
  console.log('\n🔄 Восстановление из последнего бэкапа...\n');

  const backups = getBackupList();

  if (backups.length === 0) {
    console.error('❌ Бэкапы не найдены!');
    return false;
  }

  const latestBackup = backups[0];

  console.log(`   Последний бэкап: ${latestBackup.name}`);
  console.log(`   Дата: ${latestBackup.date.toLocaleString('ru-RU')}`);
  console.log('');

  try {
    // Создаём бэкап текущей БД перед восстановлением
    const currentBackupName = `pre_restore_${Date.now()}.db`;
    const currentBackupPath = path.join(CONFIG.backupDir, currentBackupName);

    if (fs.existsSync(CONFIG.dbPath)) {
      fs.copyFileSync(CONFIG.dbPath, currentBackupPath);
      console.log(`   💾 Текущая БД сохранена как: ${currentBackupName}`);
    }

    // Восстанавливаем
    fs.copyFileSync(latestBackup.path, CONFIG.dbPath);

    console.log(`✅ База данных восстановлена из: ${latestBackup.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка восстановления:`, error);
    return false;
  }
}

/**
 * Восстановить из конкретного бэкапа
 */
function restoreFromBackup(backupName: string): boolean {
  console.log(`\n🔄 Восстановление из бэкапа: ${backupName}\n`);

  const backupPath = path.join(CONFIG.backupDir, backupName);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Бэкап не найден: ${backupPath}`);
    return false;
  }

  try {
    // Создаём бэкап текущей БД перед восстановлением
    const currentBackupName = `pre_restore_${Date.now()}.db`;
    const currentBackupPath = path.join(CONFIG.backupDir, currentBackupName);

    if (fs.existsSync(CONFIG.dbPath)) {
      fs.copyFileSync(CONFIG.dbPath, currentBackupPath);
      console.log(`   💾 Текущая БД сохранена как: ${currentBackupName}`);
    }

    // Восстанавливаем
    fs.copyFileSync(backupPath, CONFIG.dbPath);

    console.log(`✅ База данных восстановлена из: ${backupName}`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка восстановления:`, error);
    return false;
  }
}

// Главная функция
function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || 'create';

  switch (command) {
    case 'create':
    case 'backup':
      createBackup();
      break;

    case 'list':
    case 'ls':
      listBackups();
      break;

    case 'restore':
      if (args[1]) {
        restoreFromBackup(args[1]);
      } else {
        restoreFromLatest();
      }
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log(`
📦 Database Backup Tool

Использование:
  npx tsx scripts/backup-db.ts [command] [options]

Команды:
  create, backup    Создать новый бэкап (по умолчанию)
  list, ls          Показать список бэкапов
  restore [name]    Восстановить из бэкапа (последний или указанный)
  help              Показать эту справку

Примеры:
  npx tsx scripts/backup-db.ts                    # Создать бэкап
  npx tsx scripts/backup-db.ts list               # Список бэкапов
  npx tsx scripts/backup-db.ts restore            # Восстановить из последнего
  npx tsx scripts/backup-db.ts restore backup_2024-01-31_12-00-00.db
      `);
      break;

    default:
      console.error(`❌ Неизвестная команда: ${command}`);
      console.log('   Используйте "help" для справки');
  }
}

// Экспорт для использования как модуля
export {
  createBackup,
  listBackups,
  restoreFromLatest,
  restoreFromBackup,
  getBackupList,
};

// Запуск
main();

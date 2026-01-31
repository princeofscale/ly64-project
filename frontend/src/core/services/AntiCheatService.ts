/**
 * AntiCheat Service
 * Отслеживание подозрительных действий во время теста
 */

export interface SuspiciousEvent {
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'right_click' | 'dev_tools' | 'blur' | 'focus_lost';
  timestamp: number;
  details?: string;
}

export interface AntiCheatReport {
  sessionId: string;
  startTime: number;
  events: SuspiciousEvent[];
  tabSwitchCount: number;
  copyAttempts: number;
  totalBlurTime: number;
  suspiciousScore: number;
}

type EventCallback = (event: SuspiciousEvent) => void;

class AntiCheatService {
  private static instance: AntiCheatService;
  private events: SuspiciousEvent[] = [];
  private sessionId: string = '';
  private startTime: number = 0;
  private isActive: boolean = false;
  private blurStartTime: number | null = null;
  private totalBlurTime: number = 0;
  private callbacks: Set<EventCallback> = new Set();

  // Лимиты для предупреждений
  private readonly LIMITS = {
    tabSwitches: 3,      // После 3 переключений - предупреждение
    copyAttempts: 2,     // После 2 попыток копирования
    maxBlurTime: 60000,  // 60 секунд вне фокуса
  };

  private constructor() {}

  public static getInstance(): AntiCheatService {
    if (!AntiCheatService.instance) {
      AntiCheatService.instance = new AntiCheatService();
    }
    return AntiCheatService.instance;
  }

  /**
   * Начать мониторинг
   */
  public startMonitoring(sessionId: string): void {
    if (this.isActive) return;

    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.events = [];
    this.totalBlurTime = 0;
    this.blurStartTime = null;
    this.isActive = true;

    this.attachListeners();
    console.log('[AntiCheat] Мониторинг запущен для сессии:', sessionId);
  }

  /**
   * Остановить мониторинг
   */
  public stopMonitoring(): AntiCheatReport {
    if (!this.isActive) {
      return this.generateReport();
    }

    this.detachListeners();
    this.isActive = false;

    const report = this.generateReport();
    console.log('[AntiCheat] Мониторинг остановлен. Отчёт:', report);

    return report;
  }

  /**
   * Подписаться на события
   */
  public onEvent(callback: EventCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Получить текущую статистику
   */
  public getStats(): { tabSwitches: number; copyAttempts: number; blurTime: number } {
    return {
      tabSwitches: this.events.filter(e => e.type === 'tab_switch').length,
      copyAttempts: this.events.filter(e => e.type === 'copy_attempt').length,
      blurTime: this.totalBlurTime + (this.blurStartTime ? Date.now() - this.blurStartTime : 0),
    };
  }

  /**
   * Проверить превышение лимитов
   */
  public checkLimits(): { exceeded: boolean; warnings: string[] } {
    const stats = this.getStats();
    const warnings: string[] = [];

    if (stats.tabSwitches >= this.LIMITS.tabSwitches) {
      warnings.push(`Вы переключили вкладку ${stats.tabSwitches} раз(а). Это может быть расценено как подозрительное поведение.`);
    }

    if (stats.copyAttempts >= this.LIMITS.copyAttempts) {
      warnings.push('Обнаружены попытки копирования текста.');
    }

    if (stats.blurTime >= this.LIMITS.maxBlurTime) {
      warnings.push('Вы слишком долго находились вне окна теста.');
    }

    return {
      exceeded: warnings.length > 0,
      warnings,
    };
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private attachListeners(): void {
    // Переключение вкладок
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Потеря фокуса окна
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);

    // Копирование
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('cut', this.handleCut);

    // Вставка
    document.addEventListener('paste', this.handlePaste);

    // Правый клик
    document.addEventListener('contextmenu', this.handleContextMenu);

    // Клавиши DevTools
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private detachListeners(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('cut', this.handleCut);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private recordEvent(event: SuspiciousEvent): void {
    this.events.push(event);
    this.callbacks.forEach(cb => cb(event));
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.recordEvent({
        type: 'tab_switch',
        timestamp: Date.now(),
        details: 'Пользователь переключил вкладку',
      });
    }
  };

  private handleWindowBlur = (): void => {
    this.blurStartTime = Date.now();
    this.recordEvent({
      type: 'blur',
      timestamp: Date.now(),
      details: 'Окно потеряло фокус',
    });
  };

  private handleWindowFocus = (): void => {
    if (this.blurStartTime) {
      this.totalBlurTime += Date.now() - this.blurStartTime;
      this.blurStartTime = null;
    }
  };

  private handleCopy = (e: ClipboardEvent): void => {
    e.preventDefault();
    this.recordEvent({
      type: 'copy_attempt',
      timestamp: Date.now(),
      details: 'Попытка копирования заблокирована',
    });
  };

  private handleCut = (e: ClipboardEvent): void => {
    e.preventDefault();
    this.recordEvent({
      type: 'copy_attempt',
      timestamp: Date.now(),
      details: 'Попытка вырезания заблокирована',
    });
  };

  private handlePaste = (e: ClipboardEvent): void => {
    // Разрешаем вставку только в поля ввода ответов
    const target = e.target as HTMLElement;
    const isAnswerInput = target.closest('[data-answer-input]');

    if (!isAnswerInput) {
      e.preventDefault();
      this.recordEvent({
        type: 'paste_attempt',
        timestamp: Date.now(),
        details: 'Попытка вставки заблокирована',
      });
    }
  };

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    this.recordEvent({
      type: 'right_click',
      timestamp: Date.now(),
      details: 'Правый клик заблокирован',
    });
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      this.recordEvent({
        type: 'dev_tools',
        timestamp: Date.now(),
        details: `Попытка открыть DevTools: ${e.key}`,
      });
    }

    // Ctrl+C, Ctrl+X
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
      const selection = window.getSelection()?.toString();
      if (selection && selection.length > 0) {
        e.preventDefault();
        this.recordEvent({
          type: 'copy_attempt',
          timestamp: Date.now(),
          details: 'Копирование через Ctrl+C/X заблокировано',
        });
      }
    }
  };

  private generateReport(): AntiCheatReport {
    const tabSwitchCount = this.events.filter(e => e.type === 'tab_switch').length;
    const copyAttempts = this.events.filter(e =>
      e.type === 'copy_attempt' || e.type === 'paste_attempt'
    ).length;

    // Расчёт подозрительности (0-100)
    let suspiciousScore = 0;
    suspiciousScore += Math.min(tabSwitchCount * 15, 45);  // Макс 45 за переключения
    suspiciousScore += Math.min(copyAttempts * 10, 30);    // Макс 30 за копирование
    suspiciousScore += Math.min(Math.floor(this.totalBlurTime / 10000) * 5, 25); // Макс 25 за время вне фокуса

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      events: [...this.events],
      tabSwitchCount,
      copyAttempts,
      totalBlurTime: this.totalBlurTime,
      suspiciousScore: Math.min(suspiciousScore, 100),
    };
  }
}

export const antiCheatService = AntiCheatService.getInstance();
export default antiCheatService;

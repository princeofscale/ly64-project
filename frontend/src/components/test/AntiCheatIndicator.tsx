import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface AntiCheatIndicatorProps {
  tabSwitches: number;
  suspiciousScore: number;
  isMonitoring: boolean;
}

export const AntiCheatIndicator: React.FC<AntiCheatIndicatorProps> = ({
  tabSwitches,
  suspiciousScore,
  isMonitoring,
}) => {
  const getStatusColor = () => {
    if (suspiciousScore >= 50) return 'text-red-400 bg-red-500/20';
    if (suspiciousScore >= 25) return 'text-amber-400 bg-amber-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  const getStatusIcon = () => {
    if (suspiciousScore >= 50) return '⚠️';
    if (suspiciousScore >= 25) return '👁️';
    return '✓';
  };

  if (!isMonitoring) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        <span>{getStatusIcon()}</span>
        <span>
          {tabSwitches > 0 ? <>Переключений: {tabSwitches}/3</> : <>Мониторинг активен</>}
        </span>

        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-current"
        />
      </motion.div>
    </AnimatePresence>
  );
};

interface AntiCheatWarningModalProps {
  warnings: string[];
  onClose: () => void;
  onContinue: () => void;
}

export const AntiCheatWarningModal: React.FC<AntiCheatWarningModalProps> = ({
  warnings,
  onClose,
  onContinue,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-2">
          Обнаружена подозрительная активность
        </h2>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <ul className="space-y-2 text-sm text-red-300">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-400 text-sm text-center mb-6">
          Пожалуйста, оставайтесь на странице теста. Повторные нарушения могут привести к
          аннулированию результата.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            Завершить тест
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors"
          >
            Продолжить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AntiCheatIndicator;

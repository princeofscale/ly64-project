/**
 * KeyboardShortcutsHelp Component
 * Панель помощи по горячим клавишам
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { testShortcutsHelp } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts?: { keys: string[]; description: string }[];
  className?: string;
}

/**
 * Floating help button with modal
 */
export function KeyboardShortcutsHelp({
  shortcuts = testShortcutsHelp,
  className = '',
}: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Горячие клавиши (?)"
      >
        <Keyboard size={18} />
        <span className="text-sm hidden sm:inline">Клавиши</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Keyboard className="text-blue-500" size={24} />
                    <h2 className="text-lg font-semibold text-white">
                      Горячие клавиши
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="p-6 space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-gray-800 rounded text-sm font-mono text-gray-200 border border-gray-700">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-600">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-800">
                  <p className="text-sm text-gray-400 text-center">
                    Нажмите <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">?</kbd> для открытия этой панели
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Inline shortcuts hint (small, non-modal)
 */
export function KeyboardShortcutsHint({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-sm text-gray-500 ${className}`}>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">←</kbd>
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">→</kbd>
        <span className="ml-1">навигация</span>
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">1-5</kbd>
        <span className="ml-1">ответы</span>
      </span>
      <span className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs">?</kbd>
        <span className="ml-1">помощь</span>
      </span>
    </div>
  );
}

export default KeyboardShortcutsHelp;

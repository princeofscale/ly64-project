/**
 * SoundSettings Component
 * Настройки звуковых эффектов
 */

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

import { useSound } from '../../hooks/useSound';

interface SoundSettingsProps {
  className?: string;
  showVolumeSlider?: boolean;
}

/**
 * Sound toggle button
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const { isEnabled, toggle, play } = useSound();

  const handleToggle = () => {
    const newState = toggle();
    if (newState) {
      // Play a sound to confirm sounds are on
      setTimeout(() => play('click'), 50);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        isEnabled
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isEnabled ? 'Выключить звук' : 'Включить звук'}
    >
      {isEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </motion.button>
  );
}

/**
 * Full sound settings panel
 */
export function SoundSettings({ className = '', showVolumeSlider = true }: SoundSettingsProps) {
  const { isEnabled, volume, setEnabled, setVolume, play } = useSound();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleVolumeChangeEnd = () => {
    if (isEnabled) {
      play('click');
    }
  };

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Volume2 className="text-blue-400" size={20} />
          ) : (
            <VolumeX className="text-gray-500" size={20} />
          )}
          <span className="text-white font-medium">Звуковые эффекты</span>
        </div>

        {/* Toggle switch */}
        <button
          onClick={() => setEnabled(!isEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-blue-500' : 'bg-gray-700'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full"
            animate={{ left: isEnabled ? '28px' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Volume slider */}
      {showVolumeSlider && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Громкость</span>
            <span className="text-gray-300">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            onMouseUp={handleVolumeChangeEnd}
            onTouchEnd={handleVolumeChangeEnd}
            disabled={!isEnabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isEnabled ? 'bg-gray-700' : 'bg-gray-800 opacity-50'
            }`}
            style={{
              background: isEnabled
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                : undefined,
            }}
          />
        </div>
      )}

      {/* Test sounds */}
      {isEnabled && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <span className="text-sm text-gray-400 block mb-2">Проверка звуков</span>
          <div className="flex flex-wrap gap-2">
            {(['click', 'success', 'error', 'achievement'] as const).map(sound => (
              <button
                key={sound}
                onClick={() => play(sound)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {sound === 'click' && 'Клик'}
                {sound === 'success' && 'Успех'}
                {sound === 'error' && 'Ошибка'}
                {sound === 'achievement' && 'Достижение'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SoundSettings;

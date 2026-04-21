import { Volume2, VolumeX } from 'lucide-react';
import { memo, useEffect, useState, type ChangeEvent } from 'react';

import { soundManager } from '../../utils/soundManager';

/** Компактный контрол: mute + ползунок громкости (иконка всегда по центру контейнера) */
export const SoundSettings = memo(function SoundSettings() {
  const [enabled, setEnabled] = useState(soundManager.isEnabled());
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const unsub = soundManager.subscribe(() => {
      setEnabled(soundManager.isEnabled());
      setVolume(soundManager.getVolume());
    });
    return unsub;
  }, []);

  const toggle = () => soundManager.setEnabled(!enabled);
  const onVol = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    soundManager.setVolume(v);
    if (!enabled && v > 0) soundManager.setEnabled(true);
  };

  return (
    <div
      className="flex items-center rounded-xl bg-slate-900/60 border border-indigo-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:border-indigo-400/40 transition-colors overflow-hidden"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <button
        onClick={toggle}
        aria-label={enabled ? 'Выключить звук' : 'Включить звук'}
        className="shrink-0 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
      >
        {enabled && volume > 0
          ? <Volume2 className="w-4 h-4" />
          : <VolumeX className="w-4 h-4 text-slate-500" />}
      </button>
      <div
        className={`transition-all duration-200 ease-out ${expanded ? 'w-24 opacity-100 pr-3' : 'w-0 opacity-0 pr-0'}`}
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={onVol}
          aria-label="Громкость"
          className="w-full accent-indigo-400 cursor-pointer"
        />
      </div>
    </div>
  );
});

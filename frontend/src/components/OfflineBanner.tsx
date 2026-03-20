import { WifiOff } from 'lucide-react';

import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span>Вы офлайн — некоторые функции могут быть недоступны</span>
    </div>
  );
}

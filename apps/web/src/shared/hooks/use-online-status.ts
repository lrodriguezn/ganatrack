// apps/web/src/shared/hooks/use-online-status.ts
/**
 * useOnlineStatus — Reports browser online/offline connectivity status.
 *
 * Listens to browser 'online' and 'offline' events to provide real-time
 * connectivity status. Handles SSR safely by defaulting to online=true.
 *
 * @returns boolean - true if online, false if offline
 *
 * @example
 * const isOnline = useOnlineStatus();
 * // Returns false when browser loses network connectivity
 */
'use client';

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

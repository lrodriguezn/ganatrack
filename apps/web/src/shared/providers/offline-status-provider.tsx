// apps/web/src/shared/providers/offline-status-provider.tsx
/**
 * OfflineStatusProvider — React context for offline/online status and queue count.
 *
 * Provides:
 * - isOnline: Browser connectivity status
 * - queueCount: Number of pending items in the offline form queue
 *
 * Used by components that need to show offline indicators or queue badges.
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getStatus } from '@/shared/lib/offline/form-queue';

export interface OfflineStatus {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Number of items in the offline form queue */
  queueCount: number;
}

const OfflineStatusContext = createContext<OfflineStatus | null>(null);

interface OfflineStatusProviderProps {
  children: ReactNode;
}

/**
 * Provider that tracks online/offline status and queue count.
 *
 * @example
 * <OfflineStatusProvider>
 *   <App />
 * </OfflineStatusProvider>
 */
export function OfflineStatusProvider({
  children,
}: OfflineStatusProviderProps): JSX.Element {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') return navigator.onLine;
    return true;
  });
  const [queueCount, setQueueCount] = useState<number>(0);

  // Subscribe to online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh queue count periodically and on visibility change
  useEffect(() => {
    const refreshQueueCount = async () => {
      const status = await getStatus();
      setQueueCount(status.count);
    };

    refreshQueueCount();

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshQueueCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic refresh every 30 seconds
    const intervalId = setInterval(refreshQueueCount, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <OfflineStatusContext.Provider value={{ isOnline, queueCount }}>
      {children}
    </OfflineStatusContext.Provider>
  );
}

/**
 * Hook to access the offline status context.
 *
 * @returns Offline status (isOnline, queueCount)
 * @throws Error if used outside of OfflineStatusProvider
 */
export function useOfflineStatus(): OfflineStatus {
  const context = useContext(OfflineStatusContext);

  if (context === null) {
    throw new Error(
      'useOfflineStatus must be used within an OfflineStatusProvider',
    );
  }

  return context;
}

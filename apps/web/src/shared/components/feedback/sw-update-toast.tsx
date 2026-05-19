// apps/web/src/shared/components/feedback/sw-update-toast.tsx
/**
 * SWUpdateToast — Service Worker update notification.
 *
 * Shows a toast when a new service worker is waiting to activate.
 * - Calls skipWaiting on reload click
 * - Max 3 dismissals before auto-silencing
 * - Persists dismissal count in localStorage
 *
 * @example
 * // Place inside AppProviders or root layout
 * <SWUpdateToast />
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const DISMISS_COUNT_KEY = 'ganatrack-sw-dismiss-count';
const MAX_DISMISSALS = 3;

/**
 * Reads the current dismissal count from localStorage.
 */
function getDismissCount(): number {
  try {
    const raw = localStorage.getItem(DISMISS_COUNT_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

/**
 * Increments the dismissal count in localStorage.
 */
function incrementDismissCount(): void {
  try {
    const current = getDismissCount();
    localStorage.setItem(DISMISS_COUNT_KEY, String(current + 1));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Sends SKIP_WAITING message to the service worker.
 */
function sendSkipWaiting(): void {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function SWUpdateToast(): null {
  const hasShownRef = useRef(false);

  const showUpdateToast = useCallback(() => {
    if (hasShownRef.current) return;
    hasShownRef.current = true;

    if (getDismissCount() >= MAX_DISMISSALS) {
      return;
    }

    toast('Nueva versión disponible. Recargar?', {
      duration: Infinity,
      action: {
        label: 'Recargar',
        onClick: () => {
          sendSkipWaiting();
        },
      },
      onDismiss: () => {
        incrementDismissCount();
      },
    });
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if there's already a waiting worker on mount
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        showUpdateToast();
      }
    });

    // Listen for new waiting workers
    const handleUpdateFound = () => {
      navigator.serviceWorker.ready.then((registration) => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New worker is waiting — show toast
            showUpdateToast();
          }
        });
      });
    };

    navigator.serviceWorker.addEventListener?.('controllerchange', handleUpdateFound);

    return () => {
      navigator.serviceWorker.removeEventListener?.('controllerchange', handleUpdateFound);
    };
  }, [showUpdateToast]);

  return null;
}

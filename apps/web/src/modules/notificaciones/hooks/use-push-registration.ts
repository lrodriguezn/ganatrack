// apps/web/src/modules/notificaciones/hooks/use-push-registration.ts
/**
 * usePushRegistration — FCM token management for push notifications.
 *
 * Features:
 * - Check Notification.permission status
 * - Request permission with user gesture
 * - Get FCM token (lazy-load firebase/messaging)
 * - Subscribe/unsubscribe via backend API
 *
 * @example
 * const { isSupported, permission, requestPermission, isSubscribed } = usePushRegistration();
 * await requestPermission();
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificacionesService } from '../services';

export function usePushRegistration() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const firebaseAppRef = useRef<ReturnType<typeof import('firebase/app')['initializeApp']> | null>(null);

  useEffect(() => {
    // Check if browser supports notifications and service workers
    const supported =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const registerToken = useCallback(async (currentPermission?: NotificationPermission) => {
    // Use passed permission or fall back to state
    const perm = currentPermission ?? permission;
    if (!isSupported || perm !== 'granted') return;

    try {
      // Lazy-load Firebase messaging only when needed
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getMessaging, getToken } = await import('firebase/messaging');

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      // Check if app already exists to avoid "Firebase App named 'gana-push' already exists"
      let app;
      const existingApps = getApps();
      const existing = existingApps.find(a => a.name === 'gana-push');
      if (existing) {
        app = existing;
      } else {
        app = initializeApp(firebaseConfig, 'gana-push');
      }
      firebaseAppRef.current = app;
      const messaging = getMessaging(app);

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('[Push] VAPID key not configured');
        return;
      }

      const token = await getToken(messaging, { vapidKey });

      if (token && token !== tokenRef.current) {
        tokenRef.current = token;

        // Register token with backend
        await notificacionesService.subscribePush({
          token,
          dispositivo: 'web',
          userAgent: navigator.userAgent,
        });

        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('[Push] Failed to register token:', error);
      // Silent — push is opt-in enhancement
    }
  }, [isSupported, permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Pass the new permission directly to avoid stale closure
        await registerToken(result);
      }
    } catch {
      // Permission denied or error
      setPermission('denied');
    }
  }, [isSupported, registerToken]);

  const unsubscribe = useCallback(async () => {
    if (tokenRef.current) {
      try {
        await notificacionesService.unsubscribePush(tokenRef.current);
        tokenRef.current = null;
        setIsSubscribed(false);
      } catch (error) {
        console.error('[Push] Failed to unsubscribe:', error);
      }
    }
  }, []);

  return {
    isSupported,
    permission,
    requestPermission,
    isSubscribed,
    unsubscribe,
  };
}

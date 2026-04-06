// apps/web/src/shared/providers/app-providers.tsx
/**
 * App Providers — client component wrapper.
 *
 * Wraps the app with:
 * - AuthProvider: rehydrates auth state on page refresh
 * - PersistQueryClientProvider: TanStack Query client with IndexedDB persistence
 *
 * Persistence configuration:
 * - maxAge: 24 hours (matches BackgroundSync retention)
 * - buster: APP_VERSION for cache invalidation on deploy
 *
 * This component wraps the root layout's children.
 * It is a 'use client' boundary.
 */

'use client';

import type { ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { AuthProvider } from './auth-provider';
import { queryClient } from '../lib/query-client';
import { createIDBPersister } from '../lib/idb-persister';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * APP_VERSION for cache busting.
 * Changes when the app is deployed to invalidate stale cached data.
 */
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * maxAge for cache persistence: 24 hours in milliseconds.
 * Matches the BackgroundSync retention time.
 */
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  const persister = createIDBPersister();

  return (
    <AuthProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: CACHE_MAX_AGE,
          buster: APP_VERSION,
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </AuthProvider>
  );
}

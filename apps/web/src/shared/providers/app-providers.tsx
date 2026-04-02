// apps/web/src/shared/providers/app-providers.tsx
/**
 * App Providers — client component wrapper.
 *
 * Wraps the app with:
 * - AuthProvider: rehydrates auth state on page refresh
 * - QueryClientProvider: TanStack Query client for data fetching
 *
 * This component wraps the root layout's children.
 * It is a 'use client' boundary.
 */

'use client';

import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth-provider';
import { queryClient } from '../lib/query-client';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );
}

// apps/web/src/shared/providers/app-providers.tsx
/**
 * App Providers — client component wrapper.
 *
 * Wraps the app with:
 * - AuthProvider: rehydrates auth state on page refresh
 * - Future: QueryClientProvider (for TanStack Query), ThemeProvider, etc.
 *
 * This component wraps the root layout's children.
 * It is a 'use client' boundary.
 */

'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

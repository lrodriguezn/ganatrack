// apps/web/src/app/(auth)/layout.tsx
/**
 * Auth layout — centered fullscreen layout for login and 2FA pages.
 *
 * Uses flexbox to center content vertically and horizontally.
 * Full viewport height with a neutral background.
 *
 * Feedback components:
 * - ErrorBoundary: catches render errors in auth pages
 */

import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/shared/components/feedback';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <ErrorBoundary>
      <main id="main-content" className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </ErrorBoundary>
  );
}

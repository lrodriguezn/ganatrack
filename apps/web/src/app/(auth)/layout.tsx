// apps/web/src/app/(auth)/layout.tsx
/**
 * Auth layout — centered fullscreen layout for login and 2FA pages.
 *
 * Uses flexbox to center content vertically and horizontally.
 * Full viewport height with a neutral background.
 */

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page — always redirects to /login.
 *
 * The middleware will handle redirecting to /dashboard if the user
 * is already authenticated (has gt-auth cookie).
 *
 * This ensures a predictable flow: / -> /login -> (middleware) /dashboard if authed
 */

export default function HomePage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Always go to /login — let middleware handle auth redirect if needed
    router.replace('/login');
    // Empty deps = run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Minimal loading state while redirecting
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    </main>
  );
}

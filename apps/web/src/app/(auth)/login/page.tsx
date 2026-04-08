// apps/web/src/app/(auth)/login/page.tsx
/**
 * Login page — thin wrapper that composes useLogin hook with LoginForm.
 *
 * This is a 'use client' page because it uses:
 * - useLogin hook (client-side auth logic)
 * - LoginForm presentational component
 */

'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/modules/auth/components/login-form';
import { useLogin } from '@/modules/auth/hooks/use-login';

function LoginContent(): JSX.Element {
  const { form, error, isLoading, onSubmit } = useLogin();

  return (
    <div className="w-full max-w-md px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          GanaTrack
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Sistema de gestión ganadera
        </p>
      </div>

      {/* Login form */}
      <LoginForm form={form} onSubmit={onSubmit} error={error} isLoading={isLoading} />
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

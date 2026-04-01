// apps/web/src/app/(auth)/verificar-2fa/page.tsx
/**
 * 2FA Verification page — thin wrapper that composes useVerify2FA hook with TwoFactorForm.
 *
 * This is a 'use client' page because it uses:
 * - useSearchParams to read ?temp= from URL
 * - useVerify2FA hook (client-side 2FA logic)
 * - TwoFactorForm presentational component
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TwoFactorForm } from '@/modules/auth/components/two-factor-form';
import { useVerify2FA } from '@/modules/auth/hooks/use-verify-2fa';

function TwoFactorContent(): JSX.Element {
  const searchParams = useSearchParams();
  const tempToken = searchParams.get('temp') || '';

  if (!tempToken) {
    return (
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Error: Token de verificación inválido o expirado.
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Volver al login
          </a>
        </div>
      </div>
    );
  }

  const { error, isLoading, secondsLeft, canResend, resendCooldown, onSubmit, onResend } =
    useVerify2FA(tempToken);

  return (
    <div className="w-full px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          GanaTrack
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Verificación de dos pasos
        </p>
      </div>

      {/* TwoFactor form */}
      <TwoFactorForm
        onSubmit={(code) => onSubmit({ code })}
        onResend={onResend}
        error={error}
        isLoading={isLoading}
        secondsLeft={secondsLeft}
        canResend={canResend}
        resendCooldown={resendCooldown}
      />
    </div>
  );
}

export default function Verificar2FAPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <TwoFactorContent />
    </Suspense>
  );
}

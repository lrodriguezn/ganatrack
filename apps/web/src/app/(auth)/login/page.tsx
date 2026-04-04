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
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/modules/auth/components/login-form';
import { useLogin } from '@/modules/auth/hooks/use-login';
import { useAuthStore } from '@/store/auth.store';
import { usePredioStore } from '@/store/predio.store';
import { Button } from '@/shared/components/ui/button';

function LoginContent(): JSX.Element {
  const router = useRouter();
  const { form, error, isLoading, onSubmit } = useLogin();

  // Quick access for testing - bypass login form
  const handleQuickAccess = () => {
    // Set mock auth state directly
    useAuthStore.getState().setAuth({
      accessToken: 'mock-token-admin',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@ganatrack.com',
        nombre: 'Administrador',
        rol: 'admin',
      },
      permissions: ['*:*', 'predios:read', 'predios:write'],
    });
    // Set sessionStorage for persistence
    sessionStorage.setItem('ganatrack-auth-permissions', JSON.stringify(['*:*', 'predios:read', 'predios:write']));
    // Set mock cookie
    document.cookie = 'ganatrack-refresh=mock-token; path=/; max-age=604800';
    // Set predios
    usePredioStore.getState().setPredios([
      { id: 1, nombre: 'Finca La Esperanza', departamento: 'Antioquia', municipio: 'Rionegro', hectares: 150.5, tipo: 'doble propósito', estado: 'activo' },
      { id: 2, nombre: 'Hacienda El Roble', departamento: 'Cundinamarca', municipio: 'Zipaquirá', hectares: 320.0, tipo: 'lechería', estado: 'activo' },
    ]);
    router.push('/dashboard');
  };

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

      {/* Quick access button for testing */}
      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleQuickAccess}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          Acceso rápido (desarrollo)
        </Button>
      </div>
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

'use client';

import { useCallback } from 'react';
import type { Metadata } from 'next';
import { WifiOff, Home, PawPrint, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleReload = useCallback(() => {
    router.refresh();
  }, [router]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-950">
            <WifiOff className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Sin conexión a internet
        </h1>
        <p className="mb-8 max-w-md text-gray-500 dark:text-gray-400">
          Esta página no está disponible sin conexión. 
          Algunas secciones funcionan offline si las visitaste anteriormente.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-white hover:bg-brand-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Link>

          <Link
            href="/dashboard/animales"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <PawPrint className="h-4 w-4" />
            Animales
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Los cambios realizados sin conexión se sincronizarán automáticamente
          cuando vuelva la conexión.
        </p>
      </div>
    </div>
  );
}

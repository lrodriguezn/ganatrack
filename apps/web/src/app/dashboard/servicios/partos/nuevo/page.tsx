// apps/web/src/app/dashboard/servicios/partos/nuevo/page.tsx
/**
 * Nuevo Parto page — formulario simple (NO wizard) para registrar un parto.
 *
 * Supports offline submission: when offline, form data is queued
 * to IndexedDB and synced when connectivity returns.
 */

'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { useCreateParto } from '@/modules/servicios';
import { PartoForm } from '@/modules/servicios/components/parto-form';
import { Button } from '@/shared/components/ui/button';
import { submitFormWithOfflineSupport } from '@/shared/lib/offline/submit-form';
import type { CreatePartoDto } from '@/modules/servicios/types/servicios.types';

export default function NuevoPartoPage(): JSX.Element | null {
  const router = useRouter();
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const { mutateAsync, isPending, error } = useCreateParto();
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  if (predioLoading || !predioActivo) return null;

  const handleSubmit = useCallback(async (data: CreatePartoDto) => {
    const isOnline = navigator.onLine;
    const predioId = predioActivo.id;

    try {
      const result = await submitFormWithOfflineSupport({
        formType: 'parto',
        payload: data as unknown as Record<string, unknown>,
        endpoint: '/api/v1/servicios/partos',
        predioId,
        submitFn: async (headers) => {
          return mutateAsync({
            ...data,
            predioId,
          }, headers);
        },
        isOnline,
      });

      if (result.mode === 'online') {
        router.push('/dashboard/servicios/partos');
      } else {
        setIsOfflineQueued(true);
      }
    } catch (err) {
      console.error('Error creating parto:', err);
    }
  }, [mutateAsync, predioActivo.id, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servicios/partos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Registrar Parto
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registre un nuevo evento de parto individual
          </p>
        </div>
      </div>

      {/* Offline queued message */}
      {isOfflineQueued && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-500/10 p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Guardado offline — se sincronizará cuando haya conexión.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && !isOfflineQueued && (
        <div className="rounded-md bg-red-50 dark:bg-red-500/10 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al registrar el parto: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <PartoForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}

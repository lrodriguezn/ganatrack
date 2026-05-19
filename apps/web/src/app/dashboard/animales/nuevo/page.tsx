// apps/web/src/app/dashboard/animales/nuevo/page.tsx
/**
 * Nuevo Animal page — create form.
 *
 * Route: /dashboard/animales/nuevo
 *
 * Supports offline submission: when offline, form data is queued
 * to IndexedDB and synced when connectivity returns.
 */

'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnimalForm } from '@/modules/animales/components/animal-form';
import { Button } from '@/shared/components/ui/button';
import { useCreateAnimal } from '@/modules/animales/hooks';
import { usePredioStore } from '@/store/predio.store';
import { submitFormWithOfflineSupport } from '@/shared/lib/offline/submit-form';
import type { CreateAnimalDto } from '@/modules/animales/types/animal.types';

export default function NuevoAnimalPage(): JSX.Element {
  const router = useRouter();
  const { predioActivo } = usePredioStore();
  const { mutateAsync, isPending, error } = useCreateAnimal();
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  const handleSubmit = useCallback(async (data: CreateAnimalDto) => {
    const isOnline = navigator.onLine;
    const predioId = predioActivo?.id ?? 0;

    try {
      const result = await submitFormWithOfflineSupport({
        formType: 'animal',
        payload: data as Record<string, unknown>,
        endpoint: '/api/v1/animales',
        predioId,
        submitFn: async (headers) => {
          return mutateAsync({
            ...data,
            predioId,
          } as Parameters<typeof mutateAsync>[0]);
        },
        isOnline,
      });

      if (result.mode === 'online') {
        router.push('/dashboard/animales');
      } else {
        // Queued for offline sync
        setIsOfflineQueued(true);
      }
    } catch (err) {
      console.error('Error creating animal:', err);
    }
  }, [mutateAsync, predioActivo?.id, router]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/animales">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Nuevo Animal
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Registra un nuevo animal en el inventario
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
            Error al crear el animal: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <AnimalForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/animales')}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
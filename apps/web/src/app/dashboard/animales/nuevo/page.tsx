// apps/web/src/app/dashboard/animales/nuevo/page.tsx
/**
 * Nuevo Animal page — create form.
 *
 * Route: /dashboard/animales/nuevo
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnimalForm } from '@/modules/animales/components/animal-form';
import { Button } from '@/shared/components/ui/button';
import { useCreateAnimal } from '@/modules/animales/hooks';

export default function NuevoAnimalPage(): JSX.Element {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useCreateAnimal();

  const handleSubmit = async (data: Parameters<typeof mutateAsync>[0]) => {
    try {
      await mutateAsync(data);
      router.push('/dashboard/animales');
    } catch (err) {
      console.error('Error creating animal:', err);
    }
  };

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

      {/* Error message */}
      {error && (
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
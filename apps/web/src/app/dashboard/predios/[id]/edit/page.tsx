// apps/web/src/app/dashboard/predios/[id]/edit/page.tsx
/**
 * Edit Predio page — pre-populated form for updating an existing Predio.
 *
 * Uses the predioToFormDefaults helper to populate form with existing data.
 * On success, redirects to the detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense } from 'react';
import { UpdatePredioSchema, type UpdatePredioDto, type CreatePredioDto } from '@ganatrack/shared-types';
import { usePredio, useUpdatePredio } from '@/modules/predios/hooks';
import { PredioForm, predioToFormDefaults } from '@/modules/predios/components/predio-form';
import { Skeleton } from '@/shared/components/ui/skeleton';

function EditPredioContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const { existingPredio: existingPredio, isLoading, error } = usePredio({ id });

  const { mutate, isLoading: isUpdating, error: updateError } = useUpdatePredio({
    onSuccess: (updatedPredio) => {
      router.push(`/dashboard/predios/${updatedPredio.id}`);
    },
  });

  const form = useForm<CreatePredioDto>({
    resolver: zodResolver(UpdatePredioSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      departamento: '',
      municipio: '',
      vereda: '',
      areaHectareas: undefined,
      capacidadMaxima: undefined,
      tipoExplotacionId: undefined,
    },
  });

  // Populate form when existingPredio loads
  if (existingPredio && form.formState.defaultValues?.nombre === '') {
    const defaults = predioToFormDefaults(existingPredio);
    form.reset(defaults);
  }

  const onSubmit = (data: UpdatePredioDto) => {
    mutate(id, data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !existingPredio) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el predio
        </p>
        {error && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {(error as Error).message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Editar Predio
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información del predio
        </p>
      </div>

      {/* Error message */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el predio: {(updateError as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <PredioForm
        form={form}
        onSubmit={onSubmit}
        isLoading={isUpdating}
        submitLabel="Guardar Cambios"
      />
    </div>
  );
}

export default function EditPredioPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditPredioContent />
    </Suspense>
  );
}

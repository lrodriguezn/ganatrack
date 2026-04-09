// apps/web/src/app/dashboard/predios/nuevo/page.tsx
/**
 * Create new Predio page — form for creating a new Predio.
 *
 * On success, redirects to the detail page of the newly created Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePredioSchema, type CreatePredioDto } from '@ganatrack/shared-types';
import { useCreatePredio } from '@/modules/predios/hooks';
import { PredioForm } from '@/modules/predios/components/predio-form';

export default function NuevoPredioPage(): JSX.Element {
  const router = useRouter();

  const { mutate, isLoading, error } = useCreatePredio({
    onSuccess: (newPredio) => {
      router.push(`/dashboard/predios/${newPredio.id}`);
    },
  });

  const form = useForm<CreatePredioDto>({
    resolver: zodResolver(CreatePredioSchema),
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

  const onSubmit = (data: CreatePredioDto) => {
    mutate(data);
  };

  const handleCancel = () => {
    router.push('/dashboard/predios');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Nuevo Predio
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Completa la información para registrar un nuevo predio
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al crear el predio: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <PredioForm
        form={form}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        submitLabel="Crear Predio"
      />
    </div>
  );
}

// apps/web/src/app/dashboard/predios/nuevo/page.tsx
/**
 * Create new Predio page — form for creating a new Predio.
 *
 * On success, redirects to the detail page of the newly created Predio.
 */

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { CreatePredioSchema, type CreatePredioDto } from '@ganatrack/shared-types';
import { useCreatePredio } from '@/modules/predios/hooks';
import { PredioForm } from '@/modules/predios/components/predio-form';
import { Button } from '@/shared/components/ui/button';

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


  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/predios">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>

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
        isLoading={isLoading}
        submitLabel="Crear Predio"
      />
    </div>
  );
}

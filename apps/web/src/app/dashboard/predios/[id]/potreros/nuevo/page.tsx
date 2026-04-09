// apps/web/src/app/dashboard/predios/[id]/potreros/nuevo/page.tsx
/**
 * Create new Potrero page — form for creating a new Potrero within a Predio.
 *
 * On success, redirects to the potrero detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense } from 'react';
import { CreatePotreroSchema, type CreatePotreroDto } from '@ganatrack/shared-types';
import { useCreatePotrero } from '@/modules/predios/hooks';
import { PotreroForm } from '@/modules/predios/components/potrero-form';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function NuevoPotreroContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse ID - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const { mutate, isLoading, error } = useCreatePotrero({
    onSuccess: (newPotrero) => {
      router.push(`/dashboard/predios/${id}/potreros/${newPotrero.id}`);
    },
  });

  const form = useForm<CreatePotreroDto>({
    resolver: zodResolver(CreatePotreroSchema),
    defaultValues: {
      nombre: '',
      areaHectareas: undefined,
      tipoPasto: '',
      capacidadMaxima: undefined,
      estado: 'activo',
    },
  });

  const onSubmit = (data: CreatePotreroDto) => {
    mutate(id, data);
  };

  const handleCancel = () => {
    router.push(`/dashboard/predios/${id}/potreros`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Nuevo Potrero
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Completa la información para registrar un nuevo potrero
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al crear el potrero: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <PotreroForm
        initialData={null}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />

      {/* Cancel button */}
      <div className="flex justify-start">
        <Link href={`/dashboard/predios/${id}/potreros`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function NuevoPotreroPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <NuevoPotreroContent />
    </Suspense>
  );
}
// apps/web/src/app/dashboard/predios/[id]/potreros/[potreroId]/edit/page.tsx
/**
 * Edit Potrero page — pre-populated form for updating an existing Potrero.
 *
 * On success, redirects to the potrero detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UpdatePotreroSchema, type UpdatePotreroDto, type CreatePotreroDto } from '@ganatrack/shared-types';
import { usePotrero, useUpdatePotrero } from '@/modules/predios/hooks';
import { PotreroForm } from '@/modules/predios/components/potrero-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

function EditPotreroContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const potreroIdParam = params.potreroId;
  const potreroIdStr = Array.isArray(potreroIdParam) ? potreroIdParam[0] : potreroIdParam;
  const potreroId = potreroIdStr ? Number(potreroIdStr) : NaN;

  const { potrero: existingPotrero, isLoading, error } = usePotrero({ id: potreroId, predioId: id });

  const { mutate, isLoading: isUpdating, error: updateError } = useUpdatePotrero({
    onSuccess: () => {
      router.push(`/dashboard/predios/${id}/potreros/${potreroId}`);
    },
  });

  const form = useForm<CreatePotreroDto>({
    resolver: zodResolver(UpdatePotreroSchema),
    defaultValues: {
      nombre: '',
      areaHectareas: undefined,
      tipoPasto: '',
      capacidadMaxima: undefined,
      estado: 'activo',
    },
  });

  // Populate form when existingPotrero loads
  useEffect(() => {
    if (existingPotrero) {
      form.reset({
        nombre: existingPotrero.nombre,
        areaHectareas: existingPotrero.areaHectareas,
        tipoPasto: existingPotrero.tipoPasto,
        capacidadMaxima: existingPotrero.capacidadMaxima,
        estado: existingPotrero.estado,
      });
    }
  }, [existingPotrero, form]);

  const onSubmit = (data: UpdatePotreroDto) => {
    mutate(id, potreroId, data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !existingPotrero) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el potrero
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
          Editar Potrero
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información del potrero
        </p>
      </div>

      {/* Error message */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el potrero: {(updateError as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <PotreroForm
        initialData={{
          nombre: existingPotrero.nombre,
          areaHectareas: existingPotrero.areaHectareas,
          tipoPasto: existingPotrero.tipoPasto,
          capacidadMaxima: existingPotrero.capacidadMaxima,
          estado: existingPotrero.estado,
        }}
        onSubmit={onSubmit}
        isLoading={isUpdating}
      />

      {/* Cancel button */}
      <div className="flex justify-start">
        <Link href={`/dashboard/predios/${id}/potreros/${potreroId}`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function EditPotreroPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditPotreroContent />
    </Suspense>
  );
}
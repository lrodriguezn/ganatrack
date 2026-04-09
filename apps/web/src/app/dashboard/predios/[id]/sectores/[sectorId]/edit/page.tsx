// apps/web/src/app/dashboard/predios/[id]/sectores/[sectorId]/edit/page.tsx
/**
 * Edit Sector page — pre-populated form for updating an existing Sector.
 *
 * On success, redirects to the sector detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UpdateSectorSchema, type UpdateSectorDto, type CreateSectorDto } from '@ganatrack/shared-types';
import { useSector, useUpdateSector } from '@/modules/predios/hooks';
import { SectorForm } from '@/modules/predios/components/sector-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

function EditSectorContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const sectorIdParam = params.sectorId;
  const sectorIdStr = Array.isArray(sectorIdParam) ? sectorIdParam[0] : sectorIdParam;
  const sectorId = sectorIdStr ? Number(sectorIdStr) : NaN;

  const { sector: existingSector, isLoading, error } = useSector({ id: sectorId, predioId: id });

  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateSector({
    onSuccess: () => {
      router.push(`/dashboard/predios/${id}/sectores/${sectorId}`);
    },
  });

  const form = useForm<CreateSectorDto>({
    resolver: zodResolver(UpdateSectorSchema),
    defaultValues: {
      nombre: '',
      areaHectareas: undefined,
      tipoPasto: '',
      capacidadMaxima: undefined,
      estado: 'activo',
    },
  });

  // Populate form when existingSector loads
  useEffect(() => {
    if (existingSector) {
      form.reset({
        nombre: existingSector.nombre,
        areaHectareas: existingSector.areaHectareas,
        tipoPasto: existingSector.tipoPasto,
        capacidadMaxima: existingSector.capacidadMaxima,
        estado: existingSector.estado,
      });
    }
  }, [existingSector, form]);

  const onSubmit = (data: UpdateSectorDto) => {
    mutate(id, sectorId, data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !existingSector) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el sector
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
          Editar Sector
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información del sector
        </p>
      </div>

      {/* Error message */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el sector: {(updateError as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <SectorForm
        initialData={{
          nombre: existingSector.nombre,
          areaHectareas: existingSector.areaHectareas,
          tipoPasto: existingSector.tipoPasto,
          capacidadMaxima: existingSector.capacidadMaxima,
          estado: existingSector.estado,
        }}
        onSubmit={onSubmit}
        isLoading={isUpdating}
      />

      {/* Cancel button */}
      <div className="flex justify-start">
        <Link href={`/dashboard/predios/${id}/sectores/${sectorId}`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function EditSectorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditSectorContent />
    </Suspense>
  );
}
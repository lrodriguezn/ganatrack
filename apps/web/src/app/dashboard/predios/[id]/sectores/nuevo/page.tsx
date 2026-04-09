// apps/web/src/app/dashboard/predios/[id]/sectores/nuevo/page.tsx
/**
 * Create new Sector page — form for creating a new Sector within a Predio.
 *
 * On success, redirects to the sector detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreateSectorSchema, type CreateSectorDto } from '@ganatrack/shared-types';
import { useCreateSector } from '@/modules/predios/hooks';
import { SectorForm } from '@/modules/predios/components/sector-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

function NuevoSectorContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse ID - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const { mutate, isLoading, error } = useCreateSector({
    onSuccess: (newSector) => {
      router.push(`/dashboard/predios/${id}/sectores/${newSector.id}`);
    },
  });

  const form = useForm<CreateSectorDto>({
    resolver: zodResolver(CreateSectorSchema),
    defaultValues: {
      nombre: '',
      areaHectareas: undefined,
      tipoPasto: '',
      capacidadMaxima: undefined,
      estado: 'activo',
    },
  });

  const onSubmit = (data: CreateSectorDto) => {
    mutate(id, data);
  };

  const handleCancel = () => {
    router.push(`/dashboard/predios/${id}/sectores`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Nuevo Sector
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Completa la información para registrar un nuevo sector
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al crear el sector: {(error as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <SectorForm
        initialData={null}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />

      {/* Cancel button */}
      <div className="flex justify-start">
        <Link href={`/dashboard/predios/${id}/sectores`}>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function NuevoSectorPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <NuevoSectorContent />
    </Suspense>
  );
}
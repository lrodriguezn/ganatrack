// apps/web/src/app/dashboard/predios/[id]/grupos/[grupoId]/edit/page.tsx
/**
 * Edit Grupo page — pre-populated form for updating an existing Grupo.
 *
 * On success, redirects to the grupo detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UpdateGrupoSchema, type UpdateGrupoDto, type CreateGrupoDto } from '@ganatrack/shared-types';
import { useGrupo, useUpdateGrupo } from '@/modules/predios/hooks';
import { GrupoForm } from '@/modules/predios/components/grupo-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

function EditGrupoContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const grupoIdParam = params.grupoId;
  const grupoIdStr = Array.isArray(grupoIdParam) ? grupoIdParam[0] : grupoIdParam;
  const grupoId = grupoIdStr ? Number(grupoIdStr) : NaN;

  const { grupo: existingGrupo, isLoading, error } = useGrupo({ id: grupoId, predioId: id });

  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateGrupo({
    onSuccess: () => {
      router.push(`/dashboard/predios/${id}/grupos/${grupoId}`);
    },
  });

  const form = useForm<CreateGrupoDto>({
    resolver: zodResolver(UpdateGrupoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  });

  // Populate form when existingGrupo loads
  useEffect(() => {
    if (existingGrupo) {
      form.reset({
        nombre: existingGrupo.nombre,
        descripcion: existingGrupo.descripcion,
      });
    }
  }, [existingGrupo, form]);

  const onSubmit = (data: UpdateGrupoDto) => {
    mutate(id, grupoId, data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !existingGrupo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el grupo
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/predios/${id}/grupos/${grupoId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Editar Grupo
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información del grupo
        </p>
      </div>

      {/* Error message */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el grupo: {(updateError as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <GrupoForm
        initialData={{
          nombre: existingGrupo.nombre,
          descripcion: existingGrupo.descripcion,
        }}
        onSubmit={onSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}

export default function EditGrupoPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditGrupoContent />
    </Suspense>
  );
}
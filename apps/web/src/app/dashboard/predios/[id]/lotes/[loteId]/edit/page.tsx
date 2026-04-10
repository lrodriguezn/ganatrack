// apps/web/src/app/dashboard/predios/[id]/lotes/[loteId]/edit/page.tsx
/**
 * Edit Lote page — pre-populated form for updating an existing Lote.
 *
 * On success, redirects to the lote detail page.
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UpdateLoteSchema, type UpdateLoteDto, type CreateLoteDto } from '@ganatrack/shared-types';
import { useLote, useUpdateLote } from '@/modules/predios/hooks';
import { LoteForm } from '@/modules/predios/components/lote-form';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

function EditLoteContent(): JSX.Element {
  const params = useParams();
  const router = useRouter();

  // Parse IDs - params can be string or string[] in Next.js 15
  const idParam = params.id;
  const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idStr ? Number(idStr) : NaN;

  const loteIdParam = params.loteId;
  const loteIdStr = Array.isArray(loteIdParam) ? loteIdParam[0] : loteIdParam;
  const loteId = loteIdStr ? Number(loteIdStr) : NaN;

  const { lote: existingLote, isLoading, error } = useLote({ id: loteId, predioId: id });

  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateLote({
    onSuccess: () => {
      router.push(`/dashboard/predios/${id}/lotes/${loteId}`);
    },
  });

  const form = useForm<CreateLoteDto>({
    resolver: zodResolver(UpdateLoteSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipo: 'producción',
    },
  });

  // Populate form when existingLote loads
  useEffect(() => {
    if (existingLote) {
      form.reset({
        nombre: existingLote.nombre,
        descripcion: existingLote.descripcion,
        tipo: existingLote.tipo,
      });
    }
  }, [existingLote, form]);

  const onSubmit = (data: UpdateLoteDto) => {
    mutate(id, loteId, data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !existingLote) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No se pudo cargar el lote
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
          <Link href={`/dashboard/predios/${id}/lotes/${loteId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Editar Lote
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Actualiza la información del lote
        </p>
      </div>

      {/* Error message */}
      {updateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error al actualizar el lote: {(updateError as Error).message}
          </p>
        </div>
      )}

      {/* Form */}
      <LoteForm
        initialData={{
          nombre: existingLote.nombre,
          descripcion: existingLote.descripcion,
          tipo: existingLote.tipo,
        }}
        onSubmit={onSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}

export default function EditLotePage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <EditLoteContent />
    </Suspense>
  );
}
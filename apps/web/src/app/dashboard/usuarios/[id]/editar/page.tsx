// apps/web/src/app/dashboard/usuarios/[id]/editar/page.tsx
/**
 * Edit usuario page — pre-filled form with concurrent edit warning.
 *
 * Route: /dashboard/usuarios/:id/editar
 */

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useUsuario } from '@/modules/usuarios/hooks/use-usuario';
import { useUpdateUsuario } from '@/modules/usuarios/hooks/use-update-usuario';
import { UsuarioForm } from '@/modules/usuarios/components/usuario-form';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { UpdateUsuarioDto } from '@/modules/usuarios/types/usuarios.types';

export default function EditarUsuarioPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: usuario, isLoading: isLoadingUsuario, error } = useUsuario(id);
  const { mutateAsync: updateUsuario, isPending } = useUpdateUsuario();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (data: UpdateUsuarioDto) => {
    try {
      setServerError(null);
      await updateUsuario({ id, data });
      router.push(`/dashboard/usuarios/${id}`);
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Error al actualizar el usuario');
      }
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/usuarios/${id}`);
  };

  if (isLoadingUsuario) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="flex flex-col items-center justify-center py-12" role="alert">
        <p className="text-gray-500 dark:text-gray-400">
          Usuario no encontrado
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/usuarios')}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Volver a la lista de usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="
            inline-flex items-center justify-center gap-1.5
            rounded-md px-2.5 py-1.5 text-sm font-medium
            text-gray-600 hover:bg-gray-50
            dark:text-gray-400 dark:hover:bg-gray-500/10
            transition-colors
          "
          aria-label="Volver a los detalles del usuario"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Editar Usuario
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Editando: {usuario.nombre}
          </p>
        </div>
      </div>

      {/* Concurrent edit warning */}
      {usuario.updatedAt && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 p-3" role="status">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Última modificación: {new Date(usuario.updatedAt).toLocaleString('es-CO')}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <UsuarioForm
          mode="edit"
          initialData={usuario}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  );
}

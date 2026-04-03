// apps/web/src/app/dashboard/usuarios/nuevo/page.tsx
/**
 * Create usuario page — form for creating a new usuario.
 *
 * Route: /dashboard/usuarios/nuevo
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { UsuarioForm } from '@/modules/usuarios/components/usuario-form';
import { useCreateUsuario } from '@/modules/usuarios/hooks/use-create-usuario';
import type { CreateUsuarioDto } from '@/modules/usuarios/types/usuarios.types';

export default function NuevoUsuarioPage(): JSX.Element {
  const router = useRouter();
  const { mutateAsync: createUsuario, isPending } = useCreateUsuario();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUsuarioDto) => {
    try {
      setServerError(null);
      await createUsuario(data);
      router.push('/dashboard/usuarios');
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Error al crear el usuario');
      }
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/usuarios');
  };

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
          aria-label="Volver a la lista de usuarios"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Crear Usuario
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Completa los datos para crear un nuevo usuario
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <UsuarioForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isPending}
          serverError={serverError}
        />
      </div>
    </div>
  );
}

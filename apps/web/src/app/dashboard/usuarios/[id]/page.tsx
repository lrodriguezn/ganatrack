// apps/web/src/app/dashboard/usuarios/[id]/page.tsx
/**
 * Usuario detail page — shows usuario info, role, permissions summary.
 *
 * Route: /dashboard/usuarios/:id
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Shield } from 'lucide-react';
import { useUsuario } from '@/modules/usuarios/hooks/use-usuario';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Can } from '@/modules/auth/components/can';

export default function UsuarioDetailPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: usuario, isLoading, error } = useUsuario(id);

  if (isLoading) {
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
      <div className="flex items-center justify-between">
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
              {usuario.nombre}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Detalles del usuario
            </p>
          </div>
        </div>

        <Can permission="usuarios:write">
          <Link href={`/dashboard/usuarios/${usuario.id}/editar`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
              Editar
            </Button>
          </Link>
        </Can>
      </div>

      {/* Detail card */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{usuario.nombre}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{usuario.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  {usuario.rolNombre ?? '-'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Predio</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{usuario.predioNombre ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</dt>
              <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">{usuario.telefono ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${
                    usuario.activo
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                  }`}
                >
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </dd>
            </div>
            {usuario.lastLoginAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Último acceso</dt>
                <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                  {new Date(usuario.lastLoginAt).toLocaleString('es-CO')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Permissions summary */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Permisos del Rol
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Los permisos se gestionan desde la sección de roles. El rol &quot;{usuario.rolNombre}&quot; tiene permisos
          configurados para los módulos del sistema.
        </p>
        <Can permission="usuarios:admin">
          <Link
            href={`/dashboard/usuarios/roles/${usuario.rolId}`}
            className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver permisos del rol →
          </Link>
        </Can>
      </div>
    </div>
  );
}

// apps/web/src/app/dashboard/servicios/veterinarios/[id]/page.tsx
/**
 * Servicio Veterinario detail page — detalle de evento con registros de tratamiento por animal.
 */

'use client';

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useServicioVeterinario } from '@/modules/servicios';
import { Button } from '@/shared/components/ui/button';

export default function ServicioVeterinarioDetailPage(): JSX.Element {
  const params = useParams();
  const id = Number(params.id);
  if (isNaN(id)) return notFound();
  const { data, isLoading, error } = useServicioVeterinario(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Cargando detalle...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500">Error al cargar el evento</p>
        <Link href="/dashboard/servicios/veterinarios">
          <Button variant="secondary" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a servicios veterinarios
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/servicios/veterinarios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.codigo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Detalle del servicio veterinario
          </p>
        </div>
      </div>

      {/* Event info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {new Date(data.fecha).toLocaleDateString('es-CO')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Veterinario</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {data.veterinarioNombre ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400"># Animales</p>
            <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
              {data.totalAnimales ?? data.animales.length}
            </p>
          </div>
          {data.observaciones && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Observaciones</p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{data.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      {/* Animal treatment records table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Registros de Tratamiento por Animal
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="px-6 py-3">Animal</th>
                <th className="px-6 py-3">Diagnóstico</th>
                <th className="px-6 py-3">Medicamentos</th>
                <th className="px-6 py-3">Dosis</th>
                <th className="px-6 py-3">Próxima Aplicación</th>
                <th className="px-6 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.animales.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {animal.animalCodigo}
                    </span>
                    {animal.animalNombre && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        {animal.animalNombre}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {animal.diagnosticoNombre ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {animal.medicamentos ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {animal.dosis ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {animal.proximaAplicacion
                      ? new Date(animal.proximaAplicacion).toLocaleDateString('es-CO')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {animal.observaciones ?? '-'}
                  </td>
                </tr>
              ))}
              {data.animales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay registros de tratamiento para este evento
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

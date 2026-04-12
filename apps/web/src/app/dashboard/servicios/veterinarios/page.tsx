// apps/web/src/app/dashboard/servicios/veterinarios/page.tsx
/**
 * Servicios Veterinarios list page — listado de eventos de servicios veterinarios.
 *
 * KPIs: total eventos
 * Table: código, fecha, veterinario, # animales, próxima aplicación, acciones
 * Button: "Nuevo Servicio" → /dashboard/servicios/veterinarios/nuevo
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { useServiciosVeterinarios } from '@/modules/servicios';
import { ServiciosVeterinariosTable } from '@/modules/servicios/components/servicios-veterinarios-table';
import { Button } from '@/shared/components/ui/button';

export default function ServiciosVeterinariosListPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useServiciosVeterinarios({
    predioId: predioActivo?.id ?? 0,
    page: pageIndex + 1,
    limit: pageSize,
  }, {
    enabled: !!predioActivo?.id,
  });

  if (predioLoading || !predioActivo) return null;

  // Calculate KPIs from visible data
  const totalEventos = data?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Servicios Veterinarios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de servicios veterinarios por animal
          </p>
        </div>
        <Link href="/dashboard/servicios/veterinarios/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Servicio
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Eventos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? '...' : totalEventos}
          </p>
        </div>
      </div>

      {/* Table */}
      <ServiciosVeterinariosTable
        data={data}
        isLoading={isLoading}
        page={pageIndex}
        limit={pageSize}
        onPaginationChange={({ pageIndex: pi, pageSize: ps }) => {
          setPageIndex(pi);
          setPageSize(ps);
        }}
      />
    </div>
  );
}

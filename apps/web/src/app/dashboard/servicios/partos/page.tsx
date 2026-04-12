// apps/web/src/app/dashboard/servicios/partos/page.tsx
/**
 * Partos list page — listado de registros de parto individuales.
 *
 * KPIs: total partos, total nacidos vivos, mortalidad neonatal
 * Table: animal, fecha, machos, hembras, muertos, tipo, acciones
 * Button: "Registrar Parto" → /dashboard/servicios/partos/nuevo
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { usePredioRequerido } from '@/shared/hooks';
import { usePartos } from '@/modules/servicios';
import { PartosTable } from '@/modules/servicios/components/partos-table';
import { Button } from '@/shared/components/ui/button';

export default function PartosListPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePartos({
    predioId: predioActivo?.id ?? 0,
    page: pageIndex + 1,
    limit: pageSize,
  });

  if (predioLoading || !predioActivo) return null;

  // Calculate KPIs from visible data
  const partos = data?.data ?? [];
  const totalMachos = partos.reduce((sum, p) => sum + p.machos, 0);
  const totalHembras = partos.reduce((sum, p) => sum + p.hembras, 0);
  const totalMuertos = partos.reduce((sum, p) => sum + p.muertos, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Partos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Registro individual de partos y nacimientos
          </p>
        </div>
        <Link href="/dashboard/servicios/partos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Parto
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Partos</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? '...' : data?.total ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Machos Nacidos</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {isLoading ? '...' : totalMachos}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Hembras Nacidas</p>
          <p className="mt-1 text-2xl font-bold text-pink-600 dark:text-pink-400">
            {isLoading ? '...' : totalHembras}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mortinatos</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {isLoading ? '...' : totalMuertos}
          </p>
        </div>
      </div>

      {/* Table */}
      <PartosTable
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

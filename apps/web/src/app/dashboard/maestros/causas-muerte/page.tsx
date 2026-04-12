// apps/web/src/app/dashboard/maestros/causas-muerte/page.tsx
/**
 * Causas de Muerte page — CRUD for causas-muerte maestro entity.
 */

'use client';

import { usePredioRequerido } from '@/shared/hooks';
import type { ColumnDef } from '@tanstack/react-table';
import { MaestroEntityPage } from '@/modules/maestros/components';
import {
  CausaMuerteSchema,
  type CausaMuerte,
  type MaestroFieldDef,
  type MaestroBase,
} from '@/modules/maestros/types/maestro.types';

const FIELDS: MaestroFieldDef[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
];

const COLUMNS: ColumnDef<CausaMuerte>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'descripcion', header: 'Descripción', cell: ({ getValue }) => getValue() ?? '—' },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ getValue }) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        getValue()
          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
      }`}>
        {getValue() ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export default function CausasMuertePage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (
    <MaestroEntityPage
      tipo="causas-muerte"
      title="Causas de Muerte"
      description="Causas registradas de muerte de animales en el hato"
      singularName="Causa"
      fields={FIELDS}
      columns={COLUMNS as ColumnDef<MaestroBase>[]}
      schema={CausaMuerteSchema}
    />
  );
}

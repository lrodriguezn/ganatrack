// apps/web/src/app/dashboard/maestros/diagnosticos/page.tsx
/**
 * Diagnósticos page — CRUD for diagnosticos maestro entity.
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MaestroEntityPage } from '@/modules/maestros/components';
import {
  DiagnosticoSchema,
  type Diagnostico,
  type MaestroFieldDef,
  type MaestroBase,
} from '@/modules/maestros/types/maestro.types';

const FIELDS: MaestroFieldDef[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'descripcion', label: 'Descripción', type: 'textarea' },
  { name: 'categoria', label: 'Categoría', type: 'text' },
];

const COLUMNS: ColumnDef<Diagnostico>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'categoria', header: 'Categoría', cell: ({ getValue }) => getValue() ?? '—' },
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

export default function DiagnosticosPage(): JSX.Element {
  return (
    <MaestroEntityPage
      tipo="diagnosticos"
      title="Diagnósticos"
      description="Catálogo de diagnósticos y enfermedades frecuentes"
      singularName="Diagnóstico"
      fields={FIELDS}
      columns={COLUMNS as ColumnDef<MaestroBase>[]}
      schema={DiagnosticoSchema}
    />
  );
}

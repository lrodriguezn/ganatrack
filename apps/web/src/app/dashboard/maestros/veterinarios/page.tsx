// apps/web/src/app/dashboard/maestros/veterinarios/page.tsx
/**
 * Veterinarios page — CRUD for veterinarios maestro entity.
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MaestroEntityPage } from '@/modules/maestros/components';
import {
  VeterinarioSchema,
  type Veterinario,
  type MaestroFieldDef,
} from '@/modules/maestros/types/maestro.types';

const FIELDS: MaestroFieldDef[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'especialidad', label: 'Especialidad', type: 'text' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email' },
];

const COLUMNS: ColumnDef<Veterinario>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'especialidad', header: 'Especialidad', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'telefono', header: 'Teléfono', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'email', header: 'Correo electrónico', cell: ({ getValue }) => getValue() ?? '—' },
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

export default function VeterinariosPage(): JSX.Element {
  return (
    <MaestroEntityPage
      tipo="veterinarios"
      title="Veterinarios"
      description="Gestiona los veterinarios que prestan servicios en tus predios"
      singularName="Veterinario"
      fields={FIELDS}
      columns={COLUMNS as ColumnDef<import('@/modules/maestros/types/maestro.types').MaestroBase>[]}
      schema={VeterinarioSchema}
    />
  );
}

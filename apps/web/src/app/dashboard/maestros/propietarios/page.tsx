// apps/web/src/app/dashboard/maestros/propietarios/page.tsx
/**
 * Propietarios page — CRUD for propietarios maestro entity.
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MaestroEntityPage } from '@/modules/maestros/components';
import {
  PropietarioSchema,
  type Propietario,
  type MaestroFieldDef,
  type MaestroBase,
} from '@/modules/maestros/types/maestro.types';

const FIELDS: MaestroFieldDef[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'tipoDocumento', label: 'Tipo de documento', type: 'text' },
  { name: 'numeroDocumento', label: 'Número de documento', type: 'text' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'email', label: 'Correo electrónico', type: 'email' },
];

const COLUMNS: ColumnDef<Propietario>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'tipoDocumento', header: 'Tipo Doc.', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'numeroDocumento', header: 'Número Doc.', cell: ({ getValue }) => getValue() ?? '—' },
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

export default function PropietariosPage(): JSX.Element {
  return (
    <MaestroEntityPage
      tipo="propietarios"
      title="Propietarios"
      description="Administra la información de los propietarios de animales"
      singularName="Propietario"
      fields={FIELDS}
      columns={COLUMNS as ColumnDef<MaestroBase>[]}
      schema={PropietarioSchema}
    />
  );
}

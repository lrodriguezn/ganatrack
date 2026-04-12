// apps/web/src/app/dashboard/maestros/lugares-compras/page.tsx
/**
 * Lugares de Compra page — CRUD for lugares-compras maestro entity.
 */

'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { usePredioRequerido } from '@/shared/hooks';
import { MaestroEntityPage } from '@/modules/maestros/components';
import {
  LugarCompraSchema,
  type LugarCompra,
  type MaestroFieldDef,
  type MaestroBase,
} from '@/modules/maestros/types/maestro.types';

const FIELDS: MaestroFieldDef[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  { name: 'tipo', label: 'Tipo', type: 'text' },
  { name: 'ubicacion', label: 'Ubicación', type: 'text' },
  { name: 'contacto', label: 'Contacto', type: 'text' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
];

const COLUMNS: ColumnDef<LugarCompra>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'tipo', header: 'Tipo', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'ubicacion', header: 'Ubicación', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'contacto', header: 'Contacto', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'telefono', header: 'Teléfono', cell: ({ getValue }) => getValue() ?? '—' },
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

export default function LugaresComprasPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;

  return (
    <MaestroEntityPage
      tipo="lugares-compras"
      title="Lugares de Compra"
      description="Ferias, subastas y proveedores donde se compra ganado"
      singularName="Lugar"
      fields={FIELDS}
      columns={COLUMNS as ColumnDef<MaestroBase>[]}
      schema={LugarCompraSchema}
    />
  );
}

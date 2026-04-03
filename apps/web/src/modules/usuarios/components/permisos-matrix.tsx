// apps/web/src/modules/usuarios/components/permisos-matrix.tsx
/**
 * PermisosMatrix — interactive grid (11 módulos × 4 acciones), optimistic
 * updates, batch save, conflict detection.
 *
 * Usage:
 *   <PermisosMatrix
 *     matrix={data}
 *     onToggle={handleToggle}
 *     onSave={handleSave}
 *     isSaving={isPending}
 *   />
 */

'use client';

import { useState, useCallback } from 'react';
import { MODULOS_PERMISOS, ACCIONES_PERMISOS } from '../types/roles.types';
import type { PermisoMatrixState, PermisoCell, ModuloKey, AccionPermiso } from '../types/roles.types';
import { Button } from '@/shared/components/ui/button';

// Conflict detection rules
const CONFLICT_RULES = [
  // If you can create, you must be able to view
  { tipo: 'dependencia' as const, accion: 'crear' as AccionPermiso, requiere: 'ver' as AccionPermiso, mensaje: 'Para crear necesitas permiso de ver' },
  // If you can edit, you must be able to view
  { tipo: 'dependencia' as const, accion: 'editar' as AccionPermiso, requiere: 'ver' as AccionPermiso, mensaje: 'Para editar necesitas permiso de ver' },
  // If you can delete, you must be able to view
  { tipo: 'dependencia' as const, accion: 'eliminar' as AccionPermiso, requiere: 'ver' as AccionPermiso, mensaje: 'Para eliminar necesitas permiso de ver' },
];

interface PermisosMatrixProps {
  matrix: PermisoMatrixState | undefined;
  onToggle: (modulo: ModuloKey, accion: AccionPermiso) => void;
  onSave: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export function PermisosMatrix({
  matrix,
  onToggle,
  onSave,
  isSaving = false,
  isDirty = false,
}: PermisosMatrixProps): JSX.Element {
  const [conflicts, setConflicts] = useState<Array<{ modulo: string; accion: string; mensaje: string }>>([]);

  // Detect conflicts when a cell changes
  const detectConflicts = useCallback(
    (cells: PermisoCell[]) => {
      const newConflicts: Array<{ modulo: string; accion: string; mensaje: string }> = [];

      for (const rule of CONFLICT_RULES) {
        for (const cell of cells) {
          if (cell.accion === rule.accion && cell.enabled) {
            const requiredCell = cells.find(
              (c) => c.modulo === cell.modulo && c.accion === rule.requiere,
            );
            if (requiredCell && !requiredCell.enabled) {
              newConflicts.push({
                modulo: MODULOS_PERMISOS.find((m) => m.key === cell.modulo)?.nombre ?? cell.modulo,
                accion: cell.accion,
                mensaje: rule.mensaje,
              });
            }
          }
        }
      }

      setConflicts(newConflicts);
    },
    [],
  );

  const handleToggle = (modulo: ModuloKey, accion: AccionPermiso) => {
    onToggle(modulo, accion);

    // Re-detect conflicts after toggle
    if (matrix) {
      const updatedCells = matrix.cells.map((cell) => {
        if (cell.modulo === modulo && cell.accion === accion) {
          return { ...cell, enabled: !cell.enabled };
        }
        return cell;
      });
      detectConflicts(updatedCells);
    }
  };

  if (!matrix) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Cargando matriz de permisos">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="sr-only">Cargando permisos...</span>
      </div>
    );
  }

  const getCell = (modulo: ModuloKey, accion: AccionPermiso): PermisoCell | undefined => {
    return matrix.cells.find((c) => c.modulo === modulo && c.accion === accion);
  };

  const hasConflict = (modulo: ModuloKey, accion: AccionPermiso): boolean => {
    return conflicts.some(
      (c) => c.modulo === MODULOS_PERMISOS.find((m) => m.key === modulo)?.nombre && c.accion === accion,
    );
  };

  return (
    <div>
      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div role="alert" className="mb-4 rounded-md bg-amber-50 dark:bg-amber-500/10 p-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Conflictos detectados:
          </p>
          <ul className="mt-1 text-xs text-amber-600 dark:text-amber-300">
            {conflicts.map((c, i) => (
              <li key={i}>
                {c.modulo} → {c.accion}: {c.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm" role="grid" aria-label="Matriz de permisos por módulo y acción">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200"
                scope="col"
              >
                Módulo
              </th>
              {ACCIONES_PERMISOS.map((accion) => (
                <th
                  key={accion}
                  className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200 capitalize"
                  scope="col"
                >
                  {accion}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {MODULOS_PERMISOS.map((modulo) => (
              <tr key={modulo.key} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {modulo.nombre}
                </td>
                {ACCIONES_PERMISOS.map((accion) => {
                  const cell = getCell(modulo.key, accion);
                  const conflicted = hasConflict(modulo.key, accion);

                  return (
                    <td key={accion} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={cell?.enabled ?? false}
                        onChange={() => handleToggle(modulo.key, accion)}
                        disabled={isSaving}
                        className={`
                          h-4 w-4 rounded border-gray-300 dark:border-gray-600
                          text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400
                          disabled:cursor-not-allowed disabled:opacity-50
                          ${conflicted ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}
                        `}
                        aria-label={`${modulo.nombre} - ${accion}`}
                        aria-invalid={conflicted}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isDirty ? 'Cambios sin guardar' : 'Todo guardado'}
        </p>
        <Button
          onClick={onSave}
          isLoading={isSaving}
          disabled={!isDirty || isSaving}
        >
          Guardar permisos
        </Button>
      </div>
    </div>
  );
}

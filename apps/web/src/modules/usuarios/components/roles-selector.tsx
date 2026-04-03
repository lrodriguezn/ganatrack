// apps/web/src/modules/usuarios/components/roles-selector.tsx
/**
 * RolesSelector — role dropdown/radio selector with role descriptions.
 *
 * Usage:
 *   <RolesSelector
 *     value={selectedRoleId}
 *     onChange={setSelectedRoleId}
 *     roles={roles}
 *     disabled={isLoading}
 *   />
 */

'use client';

import type { Rol } from '../types/usuarios.types';

interface RolesSelectorProps {
  value: number;
  onChange: (value: number) => void;
  roles: Rol[];
  disabled?: boolean;
  error?: string;
}

export function RolesSelector({
  value,
  onChange,
  roles,
  disabled = false,
  error,
}: RolesSelectorProps): JSX.Element {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 dark:focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Seleccionar rol"
        aria-invalid={!!error}
        aria-describedby={error ? 'roles-error' : undefined}
      >
        <option value={0}>Seleccionar rol...</option>
        {roles.map((rol) => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
          </option>
        ))}
      </select>

      {/* Selected role description */}
      {value > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {roles.find((r) => r.id === value)?.descripcion}
        </p>
      )}

      {error && (
        <p id="roles-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

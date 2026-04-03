// apps/web/src/modules/usuarios/types/usuarios.types.ts
/**
 * Usuario Types — TypeScript types for the Usuarios module.
 *
 * Re-exports from shared-types and adds UI-specific types.
 */

export type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  PaginatedUsuarios,
  UsuarioFilters,
  Rol,
  Permiso,
  RolPermiso,
  RolDetail,
  ModuloPermiso,
  PermisoMatrix,
  RolConflict,
} from '@ganatrack/shared-types';

/**
 * Status badge configuration for usuarios.
 */
export interface UsuarioStatusBadge {
  label: string;
  color: string;
}

/**
 * Usuario table row selection.
 */
export type UsuarioRowSelection = Record<string, boolean>;

/**
 * Usuario form mode.
 */
export type UsuarioFormMode = 'create' | 'edit';

/**
 * Concurrent edit warning data.
 */
export interface ConcurrentEditWarning {
  lastModifiedBy: string;
  lastModifiedAt: string;
  currentVersion: number;
}

// apps/web/src/modules/usuarios/index.ts
/**
 * Usuarios Module — barrel export.
 *
 * Re-exports all public interfaces, hooks, services, and components.
 */

// Types
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
  UsuarioStatusBadge,
  UsuarioRowSelection,
  UsuarioFormMode,
  ConcurrentEditWarning,
} from './types/usuarios.types';

export type {
  ModuloKey,
  AccionPermiso,
  PermisoCell,
  PermisoMatrixState,
  RolConflictDetail,
  BatchSavePermisosPayload,
  RolSummary,
} from './types/roles.types';

export { MODULOS_PERMISOS, ACCIONES_PERMISOS } from './types/roles.types';

// Services
export { usuariosService } from './services';
export type { UsuariosService } from './services';

// Hooks
export { useUsuarios } from './hooks/use-usuarios';
export { useUsuario } from './hooks/use-usuario';
export { useCreateUsuario } from './hooks/use-create-usuario';
export { useUpdateUsuario } from './hooks/use-update-usuario';
export { useRoles } from './hooks/use-roles';
export { useRolesPermisos } from './hooks/use-roles-permisos';

// Components
export { UsuarioTable } from './components/usuario-table';
export { UsuarioForm } from './components/usuario-form';
export { RolesSelector } from './components/roles-selector';
export { PermisosMatrix } from './components/permisos-matrix';

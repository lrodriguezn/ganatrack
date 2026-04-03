// apps/web/src/modules/usuarios/types/roles.types.ts
/**
 * Roles Types — TypeScript types for role and permission management.
 *
 * Covers the 11 modules × 4 actions permission matrix.
 */

/**
 * Available modules in GanaTrack for permission scoping.
 */
export const MODULOS_PERMISOS = [
  { key: 'dashboard', nombre: 'Dashboard' },
  { key: 'animales', nombre: 'Animales' },
  { key: 'predios', nombre: 'Predios' },
  { key: 'servicios', nombre: 'Servicios' },
  { key: 'reportes', nombre: 'Reportes' },
  { key: 'configuracion', nombre: 'Configuración' },
  { key: 'maestros', nombre: 'Maestros' },
  { key: 'productos', nombre: 'Productos' },
  { key: 'imagenes', nombre: 'Imágenes' },
  { key: 'notificaciones', nombre: 'Notificaciones' },
  { key: 'usuarios', nombre: 'Usuarios' },
] as const;

export type ModuloKey = (typeof MODULOS_PERMISOS)[number]['key'];

/**
 * Available permission actions.
 */
export const ACCIONES_PERMISOS = ['ver', 'crear', 'editar', 'eliminar'] as const;
export type AccionPermiso = (typeof ACCIONES_PERMISOS)[number];

/**
 * Permission cell state in the matrix grid.
 */
export interface PermisoCell {
  modulo: ModuloKey;
  accion: AccionPermiso;
  enabled: boolean;
  conflicted: boolean;
  conflictMessage?: string;
}

/**
 * Full permission matrix state for a role.
 * 11 modules × 4 actions = 44 cells.
 */
export interface PermisoMatrixState {
  rolId: number;
  cells: PermisoCell[];
  isDirty: boolean;
  conflicts: RolConflictDetail[];
}

/**
 * Detected conflict detail.
 */
export interface RolConflictDetail {
  tipo: 'dependencia' | 'exclusion';
  modulo: ModuloKey;
  accion: AccionPermiso;
  mensaje: string;
  requiere?: AccionPermiso;
}

/**
 * Batch save payload for permissions matrix.
 */
export interface BatchSavePermisosPayload {
  rolId: number;
  permisos: { modulo: string; accion: string; enabled: boolean }[];
}

/**
 * Role summary for display in selector.
 */
export interface RolSummary {
  id: number;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  usuarioCount?: number;
}

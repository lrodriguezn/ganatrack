// packages/shared-types/src/schemas/usuario.schema.ts
/**
 * Usuario Schema — Zod schemas for Usuarios, Roles, and Permisos.
 *
 * Provides:
 * - CreateUsuarioSchema: form-level validation for creating users
 * - UpdateUsuarioSchema: partial schema for editing users
 * - RolSchema: role entity validation
 * - PermisoSchema: permission entity validation
 *
 * Validation rules:
 * - nombre: 2-100 chars
 * - email: valid email format, unique (checked server-side)
 * - password: 8+ chars, mixed case + number
 * - rol: valid role ID
 * - predio_id: valid predio ID
 */

import { z } from 'zod';

// ============================================================================
// Usuario Types
// ============================================================================

/**
 * Create Usuario DTO — all required fields for user creation.
 */
export const CreateUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'Contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'Contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Contraseña debe contener al menos un número'),
  rolId: z.number().int({ message: 'Rol requerido' }),
  predioId: z.number().int({ message: 'Predio requerido' }),
  telefono: z.string().max(20).optional(),
});

export type CreateUsuarioDto = z.infer<typeof CreateUsuarioSchema>;

/**
 * Update Usuario DTO — partial, all fields optional.
 */
export const UpdateUsuarioSchema = CreateUsuarioSchema.partial().extend({
  password: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[a-z]/, 'Contraseña debe contener al menos una letra minúscula')
    .regex(/[A-Z]/, 'Contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'Contraseña debe contener al menos un número')
    .optional(),
});

export type UpdateUsuarioDto = z.infer<typeof UpdateUsuarioSchema>;

/**
 * Usuario base schema — entity returned from API.
 */
export const UsuarioSchema = z.object({
  id: z.number().int(),
  nombre: z.string(),
  email: z.string().email(),
  rolId: z.number().int(),
  rolNombre: z.string().optional(),
  predioId: z.number().int(),
  predioNombre: z.string().optional(),
  telefono: z.string().optional(),
  activo: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  lastLoginAt: z.string().datetime().optional(),
});

export type Usuario = z.infer<typeof UsuarioSchema>;

/**
 * Paginated response for usuarios list.
 */
export const PaginatedUsuariosSchema = z.object({
  data: z.array(UsuarioSchema),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export type PaginatedUsuarios = z.infer<typeof PaginatedUsuariosSchema>;

/**
 * Filters for usuario list queries.
 */
export const UsuarioFiltersSchema = z.object({
  predioId: z.number().int(),
  page: z.number().int().default(1),
  limit: z.number().int().default(10),
  search: z.string().optional(),
  rolId: z.number().int().optional(),
  activo: z.boolean().optional(),
});

export type UsuarioFilters = z.infer<typeof UsuarioFiltersSchema>;

// ============================================================================
// Rol Types
// ============================================================================

/**
 * Rol base schema.
 */
export const RolSchema = z.object({
  id: z.number().int(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  esSistema: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export type Rol = z.infer<typeof RolSchema>;

/**
 * Permiso base schema.
 */
export const PermisoSchema = z.object({
  id: z.number().int(),
  modulo: z.string(),
  accion: z.string(),
  nombre: z.string(),
});

export type Permiso = z.infer<typeof PermisoSchema>;

/**
 * RolPermiso — association between a role and a permission.
 */
export const RolPermisoSchema = z.object({
  id: z.number().int(),
  rolId: z.number().int(),
  permisoId: z.number().int(),
  modulo: z.string(),
  accion: z.string(),
});

export type RolPermiso = z.infer<typeof RolPermisoSchema>;

/**
 * RolDetail — role with its permissions included.
 */
export const RolDetailSchema = RolSchema.extend({
  permisos: z.array(RolPermisoSchema),
});

export type RolDetail = z.infer<typeof RolDetailSchema>;

/**
 * ModuloPermiso — a module with its 4 possible actions.
 */
export const ModuloPermisoSchema = z.object({
  modulo: z.string(),
  nombre: z.string(),
  ver: z.boolean().default(false),
  crear: z.boolean().default(false),
  editar: z.boolean().default(false),
  eliminar: z.boolean().default(false),
});

export type ModuloPermiso = z.infer<typeof ModuloPermisoSchema>;

/**
 * PermisoMatrix — full grid of module × action permissions for a role.
 */
export const PermisoMatrixSchema = z.array(ModuloPermisoSchema);

export type PermisoMatrix = z.infer<typeof PermisoMatrixSchema>;

/**
 * RolConflict — detected conflict when assigning permissions.
 */
export const RolConflictSchema = z.object({
  tipo: z.enum(['dependencia', 'exclusion']),
  modulo: z.string(),
  accion: z.string(),
  mensaje: z.string(),
  requiere: z.string().optional(),
});

export type RolConflict = z.infer<typeof RolConflictSchema>;

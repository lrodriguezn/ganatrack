import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core'

// Import predios for reference resolution
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { predios } from './predios.js'

// usuarios - Main user table
export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  email: text('email', { length: 100 }).notNull().unique(),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// usuarios_contrasena - Password for each user
export const usuariosContrasena = sqliteTable('usuarios_contrasena', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id).unique(),
  contrasenaHash: text('contrasena_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
  activo: integer('activo').default(1),
})

// usuarios_historial_contrasenas - Password history for reuse prevention
export const usuariosHistorialContrasenas = sqliteTable('usuarios_historial_contrasenas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  contrasenaHash: text('contrasena_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// usuarios_login - Login sessions with refresh tokens
export const usuariosLogin = sqliteTable('usuarios_login', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  refreshToken: text('refresh_token'),
  exitoso: integer('exitoso').default(0),
  ip: text('ip', { length: 45 }),
  userAgent: text('user_agent'),
  fechaExpiracion: integer('fecha_expiracion', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// usuarios_autenticacion_dos_factores - 2FA configuration
export const usuariosAutenticacionDosFactores = sqliteTable('usuarios_autenticacion_dos_factores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id).unique(),
  metodo: text('metodo', { length: 20 }).notNull().default('email'),
  codigo: text('codigo', { length: 10 }),
  fechaExpiracion: integer('fecha_expiracion', { mode: 'timestamp' }),
  intentosFallidos: integer('intentos_fallidos').default(0),
  habilitado: integer('habilitado').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
  activo: integer('activo').default(1),
})

// usuarios_roles - Role definitions
export const usuariosRoles = sqliteTable('usuarios_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 50 }).notNull(),
  descripcion: text('descripcion'),
  esSistema: integer('es_sistema').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// usuarios_permisos - Permission definitions
export const usuariosPermisos = sqliteTable('usuarios_permisos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  modulo: text('modulo', { length: 50 }).notNull(),
  accion: text('accion', { length: 50 }).notNull(),
  nombre: text('nombre', { length: 100 }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// roles_permisos - Junction table for role-permission relationship
export const rolesPermisos = sqliteTable('roles_permisos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  rolId: integer('rol_id').notNull().references(() => usuariosRoles.id),
  permisoId: integer('permiso_id').notNull().references(() => usuariosPermisos.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
}, (table) => [
  unique('uq_roles_permisos').on(table.rolId, table.permisoId),
])

// usuarios_predios - User-predio assignments for multi-tenant access
export const usuariosPredios = sqliteTable('usuarios_predios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// usuarios_roles_asignacion - User-role assignments
export const usuariosRolesAsignacion = sqliteTable('usuarios_roles_asignacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  rolId: integer('rol_id').notNull().references(() => usuariosRoles.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
}, (table) => [
  unique('uq_usuarios_roles').on(table.usuarioId, table.rolId),
])

// Type exports
export type Usuario = typeof usuarios.$inferSelect
export type NuevoUsuario = typeof usuarios.$inferInsert
export type UsuarioContrasena = typeof usuariosContrasena.$inferSelect
export type NuevoUsuarioContrasena = typeof usuariosContrasena.$inferInsert
export type UsuarioHistorialContrasena = typeof usuariosHistorialContrasenas.$inferSelect
export type NuevoUsuarioHistorialContrasena = typeof usuariosHistorialContrasenas.$inferInsert
export type UsuarioLogin = typeof usuariosLogin.$inferSelect
export type NuevoUsuarioLogin = typeof usuariosLogin.$inferInsert
export type UsuarioAutenticacionDosFactores = typeof usuariosAutenticacionDosFactores.$inferSelect
export type NuevoUsuarioAutenticacionDosFactores = typeof usuariosAutenticacionDosFactores.$inferInsert
export type UsuarioRol = typeof usuariosRoles.$inferSelect
export type NuevoUsuarioRol = typeof usuariosRoles.$inferInsert
export type UsuarioPermiso = typeof usuariosPermisos.$inferSelect
export type NuevoUsuarioPermiso = typeof usuariosPermisos.$inferInsert
export type RolPermiso = typeof rolesPermisos.$inferSelect
export type NuevoRolPermiso = typeof rolesPermisos.$inferInsert
export type UsuarioPredio = typeof usuariosPredios.$inferSelect
export type NuevoUsuarioPredio = typeof usuariosPredios.$inferInsert
export type UsuarioRolesAsignacion = typeof usuariosRolesAsignacion.$inferSelect
export type NuevoUsuarioRolesAsignacion = typeof usuariosRolesAsignacion.$inferInsert

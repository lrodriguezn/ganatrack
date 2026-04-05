import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core'
import { usuarios } from './usuarios.js'

// ============================================================================
// NOTIFICACIONES
// ============================================================================

// notificaciones - Generated notifications
export const notificaciones = sqliteTable('notificaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  usuarioId: integer('usuario_id'),
  tipo: text('tipo', { length: 50 }).notNull(), // PARTO_PROXIMO|CELO_ESTIMADO|INSEMINACION_PENDIENTE|VACUNA_PENDIENTE|ANIMAL_ENFERMO
  titulo: text('titulo', { length: 200 }).notNull(),
  mensaje: text('mensaje').notNull(),
  entidadTipo: text('entidad_tipo', { length: 50 }), // 'animal'|'servicio'|etc.
  entidadId: integer('entidad_id'),
  leida: integer('leida').default(0),
  fechaEvento: integer('fecha_evento', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// notificaciones_preferencias - User notification preferences
export const notificacionesPreferencias = sqliteTable('notificaciones_preferencias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Forward reference to usuarios.id - resolved in barrel export
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  tipo: text('tipo', { length: 50 }).notNull(),
  canalInapp: integer('canal_inapp').default(1),
  canalEmail: integer('canal_email').default(1),
  canalPush: integer('canal_push').default(0),
  diasAnticipacion: integer('dias_anticipacion').default(7),
  activo: integer('activo').default(1),
}, (table) => [
  unique('uq_notificaciones_preferencias').on(table.usuarioId, table.tipo),
])

// notificaciones_push_tokens - Device tokens for push notifications
export const notificacionesPushTokens = sqliteTable('notificaciones_push_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Forward reference to usuarios.id - resolved in barrel export
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id),
  token: text('token', { length: 500 }).notNull(),
  plataforma: text('plataforma', { length: 20 }).notNull(), // 'android'|'ios'|'web'
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
}, (table) => [
  unique('uq_notificaciones_push_tokens').on(table.usuarioId, table.token),
])

// Type exports
export type Notificacion = typeof notificaciones.$inferSelect
export type NuevaNotificacion = typeof notificaciones.$inferInsert
export type NotificacionPreferencia = typeof notificacionesPreferencias.$inferSelect
export type NuevaNotificacionPreferencia = typeof notificacionesPreferencias.$inferInsert
export type NotificacionPushToken = typeof notificacionesPushTokens.$inferSelect
export type NuevaNotificacionPushToken = typeof notificacionesPushTokens.$inferInsert

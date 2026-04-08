import { sqliteTable, integer, text, index, unique } from 'drizzle-orm/sqlite-core'

// Forward references for foreign keys (resolved in barrel export)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { predios } from './predios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { usuarios } from './usuarios'

// reportes_exportaciones - Report export jobs tracking
export const reportesExportaciones = sqliteTable('reportes_exportaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tipo: text('tipo', { length: 50 }).notNull(), // inventario|reproductivo|mortalidad|movimiento|sanitario
  formato: text('formato', { length: 10 }).notNull(), // json|pdf|xlsx|csv
  estado: text('estado', { length: 20 }).notNull().default('pendiente'), // pendiente|procesando|completado|fallido
  rutaArchivo: text('ruta_archivo'),
  parametros: text('parametros'), // JSON string with applied filters
  // Tenant isolation - REQUIRED foreign keys
  predioId: integer('predio_id').notNull(),
  usuarioId: integer('usuario_id').notNull(),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  // Index for tenant filtering
  index('idx_reportes_exportaciones_predio_activo').on(table.predioId, table.activo),
  // Index for user listing
  index('idx_reportes_exportaciones_usuario_activo').on(table.usuarioId, table.activo),
  // Index for status polling
  index('idx_reportes_exportaciones_estado').on(table.estado),
])

// Type exports
export type ReporteExportacion = typeof reportesExportaciones.$inferSelect
export type NuevoReporteExportacion = typeof reportesExportaciones.$inferInsert

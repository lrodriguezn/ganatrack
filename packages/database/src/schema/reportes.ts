import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// reportes_exportaciones - Report export jobs tracking
export const reportesExportaciones = sqliteTable('reportes_exportaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Forward reference to predios.id - resolved in barrel export
  // Forward reference to usuarios.id - resolved in barrel export
  tipo: text('tipo', { length: 50 }).notNull(), // inventario|reproductivo|mortalidad|movimiento|sanitario
  formato: text('formato', { length: 10 }).notNull(), // json|pdf|xlsx|csv
  estado: text('estado', { length: 20 }).notNull().default('pendiente'), // pendiente|procesando|listo|error
  rutaArchivo: text('ruta_archivo'),
  parametros: text('parametros'), // JSON string with applied filters
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  activo: integer('activo').default(1),
})

// Type exports
export type ReporteExportacion = typeof reportesExportaciones.$inferSelect
export type NuevoReporteExportacion = typeof reportesExportaciones.$inferInsert

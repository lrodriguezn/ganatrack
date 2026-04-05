import { sqliteTable, integer, text, real, unique } from 'drizzle-orm/sqlite-core'

// productos - Veterinary products inventory
export const productos = sqliteTable('productos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  codigo: text('codigo', { length: 20 }).notNull(),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  tipoProducto: text('tipo_producto', { length: 50 }),
  categoria: text('categoria', { length: 100 }),
  presentacion: text('presentacion', { length: 50 }),
  unidadMedida: text('unidad_medida', { length: 20 }),
  precioUnitario: real('precio_unitario').default(0),
  stockMinimo: real('stock_minimo').default(0),
  stockActual: real('stock_actual').default(0),
  fechaVencimiento: integer('fecha_vencimiento', { mode: 'timestamp' }),
  laboratorio: text('laboratorio', { length: 100 }),
  registroInvima: text('registro_invima', { length: 50 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  unique('uq_productos_predio_codigo').on(table.predioId, table.codigo),
])

// productos_imagenes - Product images junction table
export const productosImagenes = sqliteTable('productos_imagenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productoId: integer('producto_id').notNull().references(() => productos.id),
  // Forward reference to imagenes.id - resolved in barrel export
  imagenId: integer('imagen_id').notNull(),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  unique('uq_productos_imagenes').on(table.productoId, table.imagenId),
])

// Type exports
export type Producto = typeof productos.$inferSelect
export type NuevoProducto = typeof productos.$inferInsert
export type ProductoImagen = typeof productosImagenes.$inferSelect
export type NuevoProductoImagen = typeof productosImagenes.$inferInsert

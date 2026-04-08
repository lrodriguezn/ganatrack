import { sqliteTable, integer, text, real, unique, index } from 'drizzle-orm/sqlite-core'

// Import required tables for references
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { predios } from './predios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { potreros } from './predios'

// imagenes - Image storage table
export const imagenes = sqliteTable('imagenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  ruta: text('ruta').notNull(),
  nombreOriginal: text('nombre_original', { length: 255 }),
  mimeType: text('mime_type', { length: 50 }),
  tamanoBytes: integer('tamano_bytes'),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// animales - Animals table with self-referencing lineage
export const animales = sqliteTable('animales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  codigo: text('codigo', { length: 20 }).notNull(),
  nombre: text('nombre', { length: 100 }).default(''),
  fechaNacimiento: integer('fecha_nacimiento', { mode: 'timestamp' }),
  fechaCompra: integer('fecha_compra', { mode: 'timestamp' }),
  sexoKey: integer('sexo_key').default(0),
  tipoIngresoId: integer('tipo_ingreso_id').default(0),
  madreId: integer('madre_id').references((): any => animales.id),
  codigoMadre: text('codigo_madre').default(''),
  indTransferenciaEmb: integer('ind_transferencia_embriones').default(0),
  codigoDonadora: text('codigo_donadora').default(''),
  tipoPadreKey: integer('tipo_padre_key').default(0),
  padreId: integer('padre_id').references((): any => animales.id),
  codigoPadre: text('codigo_padre').default(''),
  codigoPajuela: text('codigo_pajuela').default(''),
  // Forward reference to config_razas.id - resolved in barrel export
  configRazasId: integer('config_razas_id'),
  potreroId: integer('potrero_id'),
  precioCompra: real('precio_compra').default(0),
  pesoCompra: real('peso_compra').default(0),
  codigoRfid: text('codigo_rfid').default(''),
  codigoArete: text('codigo_arete').default(''),
  codigoQr: text('codigo_qr').default(''),
  saludAnimalKey: integer('salud_animal_key').default(0),
  estadoAnimalKey: integer('estado_animal_key').default(0),
  indDescartado: integer('ind_descartado').default(0),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  // Unique constraint: animal code is unique within each farm
  unique('uq_animales_predio_codigo').on(table.predioId, table.codigo),
  // Index for tenant filtering
  index('idx_animales_predio_activo').on(table.predioId, table.activo),
])

// animales_imagenes - Junction table for animal-image relationship
export const animalesImagenes = sqliteTable('animales_imagenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  animalId: integer('animal_id').notNull().references(() => animales.id),
  imagenId: integer('imagen_id').notNull().references(() => imagenes.id),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  unique('uq_animales_imagenes').on(table.animalId, table.imagenId),
])

// Type exports
export type Imagen = typeof imagenes.$inferSelect
export type NuevaImagen = typeof imagenes.$inferInsert
export type Animal = typeof animales.$inferSelect
export type NuevoAnimal = typeof animales.$inferInsert
export type AnimalImagen = typeof animalesImagenes.$inferSelect
export type NuevaAnimalImagen = typeof animalesImagenes.$inferInsert

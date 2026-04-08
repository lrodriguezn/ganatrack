import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// Import required tables for references
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { predios } from './predios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { imagenes } from './animales'

// veterinarios - Veterinarians
export const veterinarios = sqliteTable('veterinarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  nombre: text('nombre', { length: 100 }).notNull(),
  telefono: text('telefono', { length: 20 }),
  email: text('email', { length: 100 }),
  direccion: text('direccion'),
  numeroRegistro: text('numero_registro', { length: 50 }),
  especialidad: text('especialidad', { length: 100 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// propietarios - Property owners
export const propietarios = sqliteTable('propietarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  nombre: text('nombre', { length: 100 }).notNull(),
  tipoDocumento: text('tipo_documento', { length: 20 }),
  numeroDocumento: text('numero_documento', { length: 50 }),
  telefono: text('telefono', { length: 20 }),
  email: text('email', { length: 100 }),
  direccion: text('direccion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// hierros - Brand irons for cattle identification
export const hierros = sqliteTable('hierros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// diagnosticos_veterinarios - Veterinary diagnoses
export const diagnosticosVeterinarios = sqliteTable('diagnosticos_veterinarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  categoria: text('categoria', { length: 50 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// motivos_ventas - Sale reasons/motives
export const motivosVentas = sqliteTable('motivos_ventas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// causas_muerte - Death causes
export const causasMuerte = sqliteTable('causas_muerte', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// lugares_compras - Purchase places/locations
export const lugaresCompras = sqliteTable('lugares_compras', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  tipo: text('tipo', { length: 50 }),
  ubicacion: text('ubicacion'),
  contacto: text('contacto'),
  telefono: text('telefono', { length: 20 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// lugares_ventas - Sale places/locations
export const lugaresVentas = sqliteTable('lugares_ventas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  tipo: text('tipo', { length: 50 }),
  ubicacion: text('ubicacion'),
  contacto: text('contacto'),
  telefono: text('telefono', { length: 20 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// Type exports
export type Veterinario = typeof veterinarios.$inferSelect
export type NuevoVeterinario = typeof veterinarios.$inferInsert
export type Propietario = typeof propietarios.$inferSelect
export type NuevoPropietario = typeof propietarios.$inferInsert
export type Hierro = typeof hierros.$inferSelect
export type NuevoHierro = typeof hierros.$inferInsert
export type DiagnosticoVeterinario = typeof diagnosticosVeterinarios.$inferSelect
export type NuevoDiagnosticoVeterinario = typeof diagnosticosVeterinarios.$inferInsert
export type MotivoVenta = typeof motivosVentas.$inferSelect
export type NuevoMotivoVenta = typeof motivosVentas.$inferInsert
export type CausaMuerte = typeof causasMuerte.$inferSelect
export type NuevaCausaMuerte = typeof causasMuerte.$inferInsert
export type LugarCompra = typeof lugaresCompras.$inferSelect
export type NuevoLugarCompra = typeof lugaresCompras.$inferInsert
export type LugarVenta = typeof lugaresVentas.$inferSelect
export type NuevoLugarVenta = typeof lugaresVentas.$inferInsert

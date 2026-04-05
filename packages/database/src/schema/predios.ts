import { sqliteTable, integer, text, real, unique } from 'drizzle-orm/sqlite-core'

// predios - Farm/estate table
export const predios = sqliteTable('predios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  codigo: text('codigo', { length: 20 }).notNull(),
  nombre: text('nombre', { length: 100 }).notNull(),
  departamento: text('departamento', { length: 100 }),
  municipio: text('municipio', { length: 100 }),
  vereda: text('vereda', { length: 100 }),
  areaHectareas: real('area_hectareas').default(0),
  capacidadMaxima: integer('capacidad_maxima').default(0),
  tipoExplotacionId: integer('tipo_explotacion_id'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// potreros - Paddocks within a farm
export const potreros = sqliteTable('potreros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  codigo: text('codigo', { length: 20 }).notNull(),
  nombre: text('nombre', { length: 100 }).notNull(),
  areaHectareas: real('area_hectareas').default(0),
  tipoPasto: text('tipo_pasto', { length: 100 }),
  capacidadMaxima: integer('capacidad_maxima').default(0),
  estado: text('estado', { length: 20 }).default('activo'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  unique('uq_potreros_predio_codigo').on(table.predioId, table.codigo),
])

// sectores - Sectors within a farm
export const sectores = sqliteTable('sectores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  codigo: text('codigo', { length: 20 }).notNull(),
  nombre: text('nombre', { length: 100 }).notNull(),
  areaHectareas: real('area_hectareas').default(0),
  tipoPasto: text('tipo_pasto', { length: 100 }),
  capacidadMaxima: integer('capacidad_maxima').default(0),
  estado: text('estado', { length: 20 }).default('activo'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  unique('uq_sectores_predio_codigo').on(table.predioId, table.codigo),
])

// lotes - Lots within a farm
export const lotes = sqliteTable('lotes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  tipo: text('tipo', { length: 50 }).default('producción'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// grupos - Animal groups within a farm
export const grupos = sqliteTable('grupos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_parametros_predio - Farm-specific configuration parameters
export const configParametrosPredio = sqliteTable('config_parametros_predio', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull().references(() => predios.id),
  codigo: text('codigo', { length: 50 }).notNull(),
  valor: text('valor'),
  descripcion: text('descripcion'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
  activo: integer('activo').default(1),
}, (table) => [
  unique('uq_parametros_predio_codigo').on(table.predioId, table.codigo),
])

// Type exports
export type Predio = typeof predios.$inferSelect
export type NuevoPredio = typeof predios.$inferInsert
export type Potrero = typeof potreros.$inferSelect
export type NuevoPotrero = typeof potreros.$inferInsert
export type Sector = typeof sectores.$inferSelect
export type NuevoSector = typeof sectores.$inferInsert
export type Lote = typeof lotes.$inferSelect
export type NuevoLote = typeof lotes.$inferInsert
export type Grupo = typeof grupos.$inferSelect
export type NuevoGrupo = typeof grupos.$inferInsert
export type ConfigParametroPredio = typeof configParametrosPredio.$inferSelect
export type NuevoConfigParametroPredio = typeof configParametrosPredio.$inferInsert

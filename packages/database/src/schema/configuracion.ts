import { sqliteTable, integer, text, unique } from 'drizzle-orm/sqlite-core'

// ============================================================================
// CONFIG TABLES - Global catalog tables (no predio_id)
// ============================================================================

// config_razas - Cattle breeds
export const configRazas = sqliteTable('config_razas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  origen: text('origen', { length: 100 }),
  tipoProduccion: text('tipo_produccion', { length: 50 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_condiciones_corporales - Body condition scores
export const configCondicionesCorporales = sqliteTable('config_condiciones_corporales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  valorMin: integer('valor_min').default(1),
  valorMax: integer('valor_max').default(5),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_tipos_explotacion - Farm exploitation types
export const configTiposExplotacion = sqliteTable('config_tipos_explotacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_calidad_animal - Animal quality grades
export const configCalidadAnimal = sqliteTable('config_calidad_animal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_colores - Animal colors
export const configColores = sqliteTable('config_colores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 50 }).notNull(),
  codigo: text('codigo', { length: 20 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_rangos_edades - Age range categories
export const configRangosEdades = sqliteTable('config_rangos_edades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre', { length: 100 }).notNull(),
  rango1: integer('rango1').notNull(),
  rango2: integer('rango2').notNull(),
  sexo: integer('sexo').default(0),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// config_key_values - Generic key-value configuration
export const configKeyValues = sqliteTable('config_key_values', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opcion: text('opcion', { length: 50 }).notNull(),
  key: text('key', { length: 100 }).notNull(),
  value: text('value'),
  descripcion: text('descripcion'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, (table) => [
  unique('uq_config_key_values').on(table.opcion, table.key),
])

// Type exports
export type ConfigRaza = typeof configRazas.$inferSelect
export type NuevoConfigRaza = typeof configRazas.$inferInsert
export type ConfigCondicionCorporal = typeof configCondicionesCorporales.$inferSelect
export type NuevoConfigCondicionCorporal = typeof configCondicionesCorporales.$inferInsert
export type ConfigTipoExplotacion = typeof configTiposExplotacion.$inferSelect
export type NuevoConfigTipoExplotacion = typeof configTiposExplotacion.$inferInsert
export type ConfigCalidadAnimal = typeof configCalidadAnimal.$inferSelect
export type NuevoConfigCalidadAnimal = typeof configCalidadAnimal.$inferInsert
export type ConfigColor = typeof configColores.$inferSelect
export type NuevoConfigColor = typeof configColores.$inferInsert
export type ConfigRangoEdad = typeof configRangosEdades.$inferSelect
export type NuevoConfigRangoEdad = typeof configRangosEdades.$inferInsert
export type ConfigKeyValue = typeof configKeyValues.$inferSelect
export type NuevoConfigKeyValue = typeof configKeyValues.$inferInsert

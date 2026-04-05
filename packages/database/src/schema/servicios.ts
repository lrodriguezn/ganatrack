import { sqliteTable, integer, text, real, unique } from 'drizzle-orm/sqlite-core'

// ============================================================================
// PALPACIONES
// ============================================================================

// servicios_palpaciones_grupal - Group palpation service events
export const serviciosPalpacionesGrupal = sqliteTable('servicios_palpaciones_grupal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  codigo: text('codigo', { length: 20 }).notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  veterinariosId: integer('veterinarios_id'),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// servicios_palpaciones_animales - Individual animal palpation results
export const serviciosPalpacionesAnimales = sqliteTable('servicios_palpaciones_animales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  palpacionGrupalId: integer('palpacion_grupal_id').notNull().references(() => serviciosPalpacionesGrupal.id),
  // Forward reference to animales.id - resolved in barrel export
  animalId: integer('animal_id').notNull(),
  // Forward reference to veterinarios.id - resolved in barrel export
  veterinarioId: integer('veterinario_id'),
  // Forward reference to diagnosticos_veterinarios.id - resolved in barrel export
  diagnosticoId: integer('diagnostico_id'),
  // Forward reference to config_condiciones_corporales.id - resolved in barrel export
  condicionCorporalId: integer('condicion_corporal_id'),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  diasGestacion: integer('dias_gestacion'),
  fechaParto: integer('fecha_parto', { mode: 'timestamp' }),
  comentarios: text('comentarios'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// ============================================================================
// INSEMINACIONES
// ============================================================================

// servicios_inseminacion_grupal - Group insemination service events
export const serviciosInseminacionGrupal = sqliteTable('servicios_inseminacion_grupal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  codigo: text('codigo', { length: 20 }).notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  veterinariosId: integer('veterinarios_id'),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// servicios_inseminacion_animales - Individual animal insemination results
export const serviciosInseminacionAnimales = sqliteTable('servicios_inseminacion_animales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inseminacionGrupalId: integer('inseminacion_grupal_id').notNull().references(() => serviciosInseminacionGrupal.id),
  // Forward reference to animales.id - resolved in barrel export
  animalId: integer('animal_id').notNull(),
  // Forward reference to veterinarios.id - resolved in barrel export
  veterinarioId: integer('veterinario_id'),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  tipoInseminacionKey: integer('tipo_inseminacion_key').default(0),
  codigoPajuela: text('codigo_pajuela').default(''),
  // Forward reference to diagnosticos_veterinarios.id - resolved in barrel export
  diagnosticoId: integer('diagnostico_id'),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// ============================================================================
// PARTOS
// ============================================================================

// servicios_partos_animales - Animal parturition records
export const serviciosPartosAnimales = sqliteTable('servicios_partos_animales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  animalId: integer('animal_id').notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  macho: integer('macho').default(0),
  hembra: integer('hembra').default(0),
  muertos: integer('muertos').default(0),
  peso: real('peso'),
  tipoPartoKey: integer('tipo_parto_key').default(0),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// servicios_partos_crias - Offspring from parturition
export const serviciosPartosCrias = sqliteTable('servicios_partos_crias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  partoId: integer('parto_id').notNull().references(() => serviciosPartosAnimales.id),
  // Forward reference to animales.id (offspring) - resolved in barrel export
  criaId: integer('cria_id'),
  sexoKey: integer('sexo_key').default(0),
  pesoNacimiento: real('peso_nacimiento'),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ============================================================================
// SERVICIOS VETERINARIOS
// ============================================================================

// servicios_veterinarios_grupal - Group veterinary service events
export const serviciosVeterinariosGrupal = sqliteTable('servicios_veterinarios_grupal', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  predioId: integer('predio_id').notNull(),
  codigo: text('codigo', { length: 20 }).notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  veterinariosId: integer('veterinarios_id'),
  tipoServicio: text('tipo_servicio', { length: 100 }),
  observaciones: text('observaciones'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// servicios_veterinarios_animales - Individual animal veterinary treatments
export const serviciosVeterinariosAnimales = sqliteTable('servicios_veterinarios_animales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  servicioGrupalId: integer('servicio_grupal_id').notNull().references(() => serviciosVeterinariosGrupal.id),
  // Forward reference to animales.id - resolved in barrel export
  animalId: integer('animal_id').notNull(),
  // Forward reference to veterinarios.id - resolved in barrel export
  veterinarioId: integer('veterinario_id'),
  // Forward reference to diagnosticos_veterinarios.id - resolved in barrel export
  diagnosticoId: integer('diagnostico_id'),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  tipoDiagnosticoKey: integer('tipo_diagnostico_key').default(0),
  tratamiento: text('tratamiento'),
  medicamentos: text('medicamentos'),
  dosis: text('dosis'),
  comentarios: text('comentarios'),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
})

// servicios_veterinarios_productos - Products used in veterinary services
export const serviciosVeterinariosProductos = sqliteTable('servicios_veterinarios_productos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  servicioAnimalId: integer('servicio_animal_id').notNull().references(() => serviciosVeterinariosAnimales.id),
  // Forward reference to productos.id - resolved in barrel export
  productoId: integer('producto_id').notNull(),
  cantidad: real('cantidad').default(1),
  unidad: text('unidad', { length: 20 }),
  activo: integer('activo').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Type exports
export type ServicioPalpacionGrupal = typeof serviciosPalpacionesGrupal.$inferSelect
export type NuevoServicioPalpacionGrupal = typeof serviciosPalpacionesGrupal.$inferInsert
export type ServicioPalpacionAnimal = typeof serviciosPalpacionesAnimales.$inferSelect
export type NuevoServicioPalpacionAnimal = typeof serviciosPalpacionesAnimales.$inferInsert
export type ServicioInseminacionGrupal = typeof serviciosInseminacionGrupal.$inferSelect
export type NuevoServicioInseminacionGrupal = typeof serviciosInseminacionGrupal.$inferInsert
export type ServicioInseminacionAnimal = typeof serviciosInseminacionAnimales.$inferSelect
export type NuevoServicioInseminacionAnimal = typeof serviciosInseminacionAnimales.$inferInsert
export type ServicioPartoAnimal = typeof serviciosPartosAnimales.$inferSelect
export type NuevoServicioPartoAnimal = typeof serviciosPartosAnimales.$inferInsert
export type ServicioPartoCria = typeof serviciosPartosCrias.$inferSelect
export type NuevoServicioPartoCria = typeof serviciosPartosCrias.$inferInsert
export type ServicioVeterinarioGrupal = typeof serviciosVeterinariosGrupal.$inferSelect
export type NuevoServicioVeterinarioGrupal = typeof serviciosVeterinariosGrupal.$inferInsert
export type ServicioVeterinarioAnimal = typeof serviciosVeterinariosAnimales.$inferSelect
export type NuevoServicioVeterinarioAnimal = typeof serviciosVeterinariosAnimales.$inferInsert
export type ServicioVeterinarioProducto = typeof serviciosVeterinariosProductos.$inferSelect
export type NuevoServicioVeterinarioProducto = typeof serviciosVeterinariosProductos.$inferInsert

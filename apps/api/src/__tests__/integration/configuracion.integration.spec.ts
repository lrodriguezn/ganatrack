/**
 * Integration tests for Configuracion module - condiciones-corporales and diagnosticos seed.
 *
 * These tests verify:
 * - Task 1.4: diagnosticos seed data can be inserted and queried (database layer)
 * - Task 1.2/1.3: Route-level tests require full app setup (verified manually after implementation)
 *
 * NOTE: These tests require better-sqlite3 native module.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Check if we can load better-sqlite3 at module load time
let canRunTests = false

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3')
  try {
    const testDb = new Database(':memory:')
    testDb.close()
    canRunTests = true
  } catch {
    console.warn('⚠ better-sqlite3 native module failed to initialize, integration tests skipped')
  }
} catch {
  console.warn('⚠ better-sqlite3 native module not available, integration tests skipped')
}

describe('Configuracion Integration Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sqlite: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any = null

  beforeEach(async () => {
    if (!canRunTests) {
      return
    }

    // Dynamic import to avoid hoisting issues
    const Database = (await import('better-sqlite3')).default
    const { drizzle } = await import('drizzle-orm/better-sqlite3')
    const schema = await import('@ganatrack/database/schema')

    sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')

    db = drizzle(sqlite, { schema })

    // Create diagnosticos_veterinarios table
    sqlite.exec(`
      CREATE TABLE diagnosticos_veterinarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT(100) NOT NULL,
        descripcion TEXT,
        categoria TEXT(50),
        activo INTEGER DEFAULT 1,
        created_at INTEGER,
        updated_at INTEGER
      );
    `)
  })

  afterEach(() => {
    if (sqlite) {
      try {
        sqlite.close()
      } catch {
        // Ignore
      }
      sqlite = null
      db = null
    }
  })

  const testOrSkip = canRunTests ? it : it.skip

  // ============ Task 1.4: Diagnosticos Seed Verification ============

  testOrSkip('diagnosticos_veterinarios should have 6 records after seed', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { diagnosticosVeterinarios } = schema

    // Insert diagnosticos seed data (as seed.ts will do)
    await db.insert(diagnosticosVeterinarios).values([
      { id: 1, nombre: 'Positiva', descripcion: 'Preñez confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 2, nombre: 'Negativa', descripcion: 'Preñez no confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 3, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 4, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementación vitamínica', categoria: 'Suplementación', activo: 1 },
      { id: 6, nombre: 'Tratamiento', descripcion: 'Tratamiento médico curativo', categoria: 'Medicina Curativa', activo: 1 },
    ]).onConflictDoNothing()

    // Verify 6 records exist
    const result = await db.select().from(diagnosticosVeterinarios)
    expect(result).toHaveLength(6)
  })

  testOrSkip('diagnosticos should have expected names matching spec', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { diagnosticosVeterinarios } = schema

    await db.insert(diagnosticosVeterinarios).values([
      { id: 1, nombre: 'Positiva', descripcion: 'Preñez confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 2, nombre: 'Negativa', descripcion: 'Preñez no confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 3, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 4, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementación vitamínica', categoria: 'Suplementación', activo: 1 },
      { id: 6, nombre: 'Tratamiento', descripcion: 'Tratamiento médico curativo', categoria: 'Medicina Curativa', activo: 1 },
    ]).onConflictDoNothing()

    const diagnosticos = await db.select({
      id: diagnosticosVeterinarios.id,
      nombre: diagnosticosVeterinarios.nombre,
      categoria: diagnosticosVeterinarios.categoria,
    }).from(diagnosticosVeterinarios).orderBy(diagnosticosVeterinarios.id)

    expect(diagnosticos[0].nombre).toBe('Positiva')
    expect(diagnosticos[0].categoria).toBe('Diagnóstico Reproductivo')
    expect(diagnosticos[1].nombre).toBe('Negativa')
    expect(diagnosticos[1].categoria).toBe('Diagnóstico Reproductivo')
    expect(diagnosticos[2].nombre).toBe('Desparasitación')
    expect(diagnosticos[2].categoria).toBe('Sanidad Preventiva')
    expect(diagnosticos[3].nombre).toBe('Vacunación')
    expect(diagnosticos[3].categoria).toBe('Sanidad Preventiva')
    expect(diagnosticos[4].nombre).toBe('Vitaminas')
    expect(diagnosticos[4].categoria).toBe('Suplementación')
    expect(diagnosticos[5].nombre).toBe('Tratamiento')
    expect(diagnosticos[5].categoria).toBe('Medicina Curativa')
  })

  testOrSkip('diagnosticos seed should be idempotent (onConflictDoNothing)', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { diagnosticosVeterinarios } = schema

    // Insert diagnosticos seed data twice
    await db.insert(diagnosticosVeterinarios).values([
      { id: 1, nombre: 'Positiva', descripcion: 'Preñez confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 2, nombre: 'Negativa', descripcion: 'Preñez no confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 3, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 4, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementación vitamínica', categoria: 'Suplementación', activo: 1 },
      { id: 6, nombre: 'Tratamiento', descripcion: 'Tratamiento médico curativo', categoria: 'Medicina Curativa', activo: 1 },
    ]).onConflictDoNothing()

    // Insert again - should not duplicate
    await db.insert(diagnosticosVeterinarios).values([
      { id: 1, nombre: 'Positiva', descripcion: 'Preñez confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 2, nombre: 'Negativa', descripcion: 'Preñez no confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 3, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 4, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementación vitamínica', categoria: 'Suplementación', activo: 1 },
      { id: 6, nombre: 'Tratamiento', descripcion: 'Tratamiento médico curativo', categoria: 'Medicina Curativa', activo: 1 },
    ]).onConflictDoNothing()

    // Should still have only 6 records
    const result = await db.select().from(diagnosticosVeterinarios)
    expect(result).toHaveLength(6)
  })

  testOrSkip('all diagnosticos should be active (activo = 1)', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { diagnosticosVeterinarios } = schema

    await db.insert(diagnosticosVeterinarios).values([
      { id: 1, nombre: 'Positiva', descripcion: 'Preñez confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 2, nombre: 'Negativa', descripcion: 'Preñez no confirmada', categoria: 'Diagnóstico Reproductivo', activo: 1 },
      { id: 3, nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 4, nombre: 'Vacunación', descripcion: 'Aplicación de vacunas', categoria: 'Sanidad Preventiva', activo: 1 },
      { id: 5, nombre: 'Vitaminas', descripcion: 'Suplementación vitamínica', categoria: 'Suplementación', activo: 1 },
      { id: 6, nombre: 'Tratamiento', descripcion: 'Tratamiento médico curativo', categoria: 'Medicina Curativa', activo: 1 },
    ]).onConflictDoNothing()

    const result = await db.select({ activo: diagnosticosVeterinarios.activo }).from(diagnosticosVeterinarios)

    expect(result.every(r => r.activo === 1)).toBe(true)
  })
})

// =============================================================================
// Route-level integration tests for /config/condiciones-corporales
// =============================================================================
// Tasks 1.2 and 1.3: real HTTP integration tests using Fastify app.inject().
// - GET /condiciones-corporales returns 5 items
// - GET /condiciones-corporales/:id returns specific item
// The routes require authMiddleware, so we generate a valid JWT for the tests.

describe('GET /config/condiciones-corporales routes (HTTP)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sqlite: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any = null
  let token: string

  const testOrSkip = canRunTests ? it : it.skip

  beforeEach(async () => {
    if (!canRunTests) return

    const Database = (await import('better-sqlite3')).default
    const { drizzle } = await import('drizzle-orm/better-sqlite3')
    const schema = await import('@ganatrack/database/schema')

    sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite, { schema })

    // Create only the table we need for the route tests
    sqlite.exec(`
      CREATE TABLE config_condiciones_corporales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT(100) NOT NULL,
        descripcion TEXT,
        valor_min INTEGER DEFAULT 1,
        valor_max INTEGER DEFAULT 5,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER,
        updated_at INTEGER
      );
    `)

    // Seed 5 records (matches seed.ts id 1-5)
    await db.insert(schema.configCondicionesCorporales).values([
      { id: 1, nombre: 'Muy delgado', valorMin: 1, valorMax: 1, descripcion: 'Costillas visibles, espinazo prominente', activo: 1 },
      { id: 2, nombre: 'Delgado', valorMin: 2, valorMax: 2, descripcion: 'Costillas palpables', activo: 1 },
      { id: 3, nombre: 'Ideal', valorMin: 3, valorMax: 3, descripcion: 'Costillas cubiertas, buena condición', activo: 1 },
      { id: 4, nombre: 'Gordo', valorMin: 4, valorMax: 4, descripcion: 'Costillas no palpables, grasa visible', activo: 1 },
      { id: 5, nombre: 'Muy gordo', valorMin: 5, valorMax: 5, descripcion: 'Exceso de grasa, pliegues', activo: 1 },
    ])

    // Generate a valid JWT for the auth middleware
    const { signAccessToken } = await import('../../shared/utils/jwt.utils.js')
    token = signAccessToken({
      sub: 1,
      roles: ['ADMIN'],
      permisos: ['config:read'],
      predioIds: [1],
    })

    // Build a minimal Fastify app and register the configuracion routes
    // with the real condicionCorpRepo bound to our in-memory DB and stub repos
    // for the other catalog resources.
    const Fastify = (await import('fastify')).default
    app = Fastify({ logger: false })

    const { DrizzleConfigCondicionCorporalRepository } = await import(
      '../../modules/configuracion/infrastructure/persistence/drizzle-config-condicion-corporal.repository.js'
    )
    const condicionCorpRepo = new DrizzleConfigCondicionCorporalRepository(db)

    // Stubs for repos the other catalog routes need (not exercised by these tests)
    const stubRepo = () => ({
      findAll: async () => ({ data: [], total: 0 }),
      findById: async () => null,
      create: async () => ({}),
      update: async () => null,
      softDelete: async () => true,
    })

    const { registerConfiguracionRoutes } = await import(
      '../../modules/configuracion/infrastructure/http/routes/configuracion.routes.js'
    )
    await registerConfiguracionRoutes(app, {
      condicionCorpRepo,
      razaRepo: stubRepo() as never,
      tipoExpRepo: stubRepo() as never,
      calidadAnimalRepo: stubRepo() as never,
      colorRepo: stubRepo() as never,
      rangoEdadRepo: stubRepo() as never,
      keyValueRepo: stubRepo() as never,
    })
    await app.ready()
  })

  afterEach(async () => {
    if (app) {
      try { await app.close() } catch { /* ignore */ }
      app = null
    }
    if (sqlite) {
      try { sqlite.close() } catch { /* ignore */ }
      sqlite = null
      db = null
    }
  })

  // -------- Task 1.2: GET /condiciones-corporales (list) --------

  testOrSkip('GET /condiciones-corporales returns 200 with paginated payload', async () => {
    if (!app) return

    const response = await app.inject({
      method: 'GET',
      url: '/condiciones-corporales',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(5)
    expect(body.page).toBe(1)
    expect(body.limit).toBe(20)
    expect(body.total).toBe(5)
  })

  testOrSkip('GET /condiciones-corporales items have all required fields', async () => {
    if (!app) return

    const response = await app.inject({
      method: 'GET',
      url: '/condiciones-corporales',
      headers: { authorization: `Bearer ${token}` },
    })

    const body = response.json()
    const item = body.data[0]
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('nombre')
    expect(item).toHaveProperty('valorMin')
    expect(item).toHaveProperty('valorMax')
    expect(item).toHaveProperty('descripcion')
    expect(item).toHaveProperty('activo')
  })

  testOrSkip('GET /condiciones-corporales returns 401 without auth token', async () => {
    if (!app) return

    const response = await app.inject({
      method: 'GET',
      url: '/condiciones-corporales',
    })

    expect(response.statusCode).toBe(401)
  })

  // -------- Task 1.3: GET /condiciones-corporales/:id (get by id) --------

  testOrSkip('GET /condiciones-corporales/3 returns 200 with the matching record', async () => {
    if (!app) return

    const response = await app.inject({
      method: 'GET',
      url: '/condiciones-corporales/3',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(3)
    expect(body.data.nombre).toBe('Ideal')
    expect(body.data).toHaveProperty('valorMin')
    expect(body.data).toHaveProperty('valorMax')
    expect(body.data).toHaveProperty('descripcion')
    expect(body.data).toHaveProperty('activo')
  })

  testOrSkip('GET /condiciones-corporales/9999 returns 404 for unknown id', async () => {
    if (!app) return

    const response = await app.inject({
      method: 'GET',
      url: '/condiciones-corporales/9999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })
})
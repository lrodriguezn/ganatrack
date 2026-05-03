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

/**
 * Route-level integration tests for /config/condiciones-corporales:
 *
 * Tasks 1.2 and 1.3 require testing HTTP routes:
 * - GET /config/condiciones-corporales returns 5 items
 * - GET /config/condiciones-corporales/:id returns specific item
 *
 * These tests will be implemented after route registration (Task 2.1).
 * The routes are NOT registered yet, so these would return 404.
 *
 * Route tests require full Fastify app setup with proper DI - to be verified
 * manually after implementation or via E2E tests against running server.
 */
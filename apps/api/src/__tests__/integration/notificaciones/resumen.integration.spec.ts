/**
 * Integration tests for GET /notificaciones/resumen (HTTP).
 *
 * Change: fix-endpoint-notificaciones
 * Spec: openspec/changes/fix-endpoint-notificaciones/specs/notifications/spec.md
 *
 * These tests verify:
 * - 200 with valid X-Predio-Id → { noLeidas, porTipo, ultimas }
 * - 403 when X-Predio-Id is missing
 * - 401 when auth token is missing
 * - Route ordering: /resumen must NOT match /:id
 * - 200 with empty list
 * - ultimas newest-first, max 5
 *
 * NOTE: These tests require better-sqlite3 native module. In environments
 * where the native module is not available, tests are skipped.
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

describe('GET /notificaciones/resumen (HTTP)', () => {
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

    // Create only the table we need for the resumen endpoint
    sqlite.exec(`
      CREATE TABLE notificaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        predio_id INTEGER NOT NULL,
        usuario_id INTEGER,
        tipo TEXT(50) NOT NULL,
        titulo TEXT(200) NOT NULL,
        mensaje TEXT NOT NULL,
        entidad_tipo TEXT(50),
        entidad_id INTEGER,
        leida INTEGER DEFAULT 0,
        fecha_evento INTEGER,
        created_at INTEGER,
        activo INTEGER NOT NULL DEFAULT 1
      );
    `)

    // Generate a valid JWT for the auth middleware
    const { signAccessToken } = await import('../../../shared/utils/jwt.utils.js')
    token = signAccessToken({
      sub: 1,
      roles: ['ADMIN'],
      permisos: ['notificaciones:read'],
      predioIds: [1],
    })

    // Build a minimal Fastify app and register the notificaciones routes
    // with the real DrizzleNotificacionRepository bound to our in-memory DB
    // and stub repos for the other recursos (not exercised by these tests).
    const Fastify = (await import('fastify')).default
    app = Fastify({ logger: false })
    // Register the global error handler so DomainError → 403/404/etc. work
    const { errorHandler } = await import('../../../shared/middleware/index.js')
    app.setErrorHandler(errorHandler)

    const { DrizzleNotificacionRepository } = await import(
      '../../../modules/notificaciones/infrastructure/persistence/drizzle-notificacion.repository.js'
    )
    const notificacionRepo = new DrizzleNotificacionRepository(db)

    const { registerNotificacionesRoutes } = await import(
      '../../../modules/notificaciones/infrastructure/http/routes/notificaciones.routes.js'
    )
    const { makeStubRepo } = await import('../../helpers/make-stub-repo.js')
    await registerNotificacionesRoutes(app, {
      notificacionRepo,
      preferenciaRepo: makeStubRepo(),
      pushTokenRepo: makeStubRepo(),
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

  // -------- Scenario: 200 with valid X-Predio-Id --------
  testOrSkip('GET /notificaciones/resumen returns 200 with valid X-Predio-Id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: {
        authorization: `Bearer ${token}`,
        'x-predio-id': '1',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty('noLeidas')
    expect(body.data).toHaveProperty('porTipo')
    expect(body.data).toHaveProperty('ultimas')
    expect(Array.isArray(body.data.ultimas)).toBe(true)
  })

  // -------- Scenario: 403 when X-Predio-Id is missing --------
  testOrSkip('GET /notificaciones/resumen returns 403 when X-Predio-Id is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(403)
    const body = response.json()
    expect(body.success).toBe(false)
    expect(body.error?.code).toBe('FORBIDDEN')
  })

  // -------- Scenario: 401 when auth is missing --------
  testOrSkip('GET /notificaciones/resumen returns 401 when auth is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: { 'x-predio-id': '1' },
    })

    expect(response.statusCode).toBe(401)
    // Regression A.W5: the 401 path should follow the same success/error
    // envelope as 403/404. The error.code 'UNAUTHORIZED' is emitted by
    // the global error handler for missing/invalid auth.
    const body = response.json()
    expect(body.success).toBe(false)
    expect(body.error?.code).toBe('UNAUTHORIZED')
  })

  // -------- Scenario: route ordering — resumen must NOT match :id --------
  testOrSkip('GET /notificaciones/resumen does not match /:id and returns resumen payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: {
        authorization: `Bearer ${token}`,
        'x-predio-id': '1',
      },
    })

    // Proves the request matched /resumen (with ultimas) NOT /:id
    // (which returns data: {}). Regression B.W4: assert the routing
    // invariant explicitly, not just the shape.
    const body = response.json()
    expect(body.success).toBe(true)
    expect(Object.keys(body.data).length).toBeGreaterThan(0)
    expect(body.data).toHaveProperty('noLeidas')
    expect(body.data).toHaveProperty('porTipo')
    expect(body.data).toHaveProperty('ultimas')
  })

  // -------- Scenario: 200 with empty list --------
  testOrSkip('GET /notificaciones/resumen returns empty ultimas and zero counts on empty DB', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: {
        authorization: `Bearer ${token}`,
        'x-predio-id': '1',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data.noLeidas).toBe(0)
    expect(body.data.porTipo).toEqual([])
    expect(body.data.ultimas).toEqual([])
  })

  // -------- Scenario: ultimas newest-first, max 5 --------
  testOrSkip('GET /notificaciones/resumen returns ultimas newest-first with max 5 items', async () => {
    // Seed 12 rows with monotonically increasing timestamps
    const schema = await import('@ganatrack/database/schema')
    const { notificaciones } = schema

    const now = Date.now()
    const seedRows = Array.from({ length: 12 }, (_, i) => ({
      predioId: 1,
      usuarioId: 1,
      tipo: 'PARTO_PROXIMO' as const,
      titulo: `Notif ${i + 1}`,
      mensaje: `Mensaje ${i + 1}`,
      leida: 0,
      // i=0 is oldest, i=11 is newest
      createdAt: new Date(now - (12 - i) * 60_000),
      activo: 1,
    }))
    await db.insert(notificaciones).values(seedRows)

    const response = await app.inject({
      method: 'GET',
      url: '/notificaciones/resumen',
      headers: {
        authorization: `Bearer ${token}`,
        'x-predio-id': '1',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()

    // ultimas should have at most 5 items
    expect(body.data.ultimas.length).toBeLessThanOrEqual(5)
    expect(body.data.ultimas.length).toBe(5)

    // First item should be the newest (i=11, "Notif 12")
    expect(body.data.ultimas[0].titulo).toBe('Notif 12')

    // Items should be ordered descending by fechaCreacion
    for (let i = 1; i < body.data.ultimas.length; i++) {
      const prev = new Date(body.data.ultimas[i - 1].fechaCreacion).getTime()
      const curr = new Date(body.data.ultimas[i].fechaCreacion).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

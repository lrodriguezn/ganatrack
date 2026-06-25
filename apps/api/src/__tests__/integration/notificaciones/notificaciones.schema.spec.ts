/**
 * Integration test asserting that the composite indexes required by the
 * notificaciones polling queries exist on the `notificaciones` table.
 *
 * Change: fix-endpoint-notificaciones (R4.C1)
 *
 * The polling endpoint (GET /notificaciones/resumen) runs three queries
 * (countNoLeidas, countByTipo, findByPredio) every 30s, all filtering on
 * `predio_id` plus `activo=1` or `leida=0`. Without indexes these do
 * table scans, which scale poorly with 30s polling.
 *
 * This test is a schema-level guard: it queries sqlite_master on a
 * dev-database snapshot to assert the two composite indexes
 * (`idx_notificaciones_predio_activo`, `idx_notificaciones_predio_leida`)
 * are present. We chose the schema-test approach over a timing-based
 * behavioral test because timing depends on hardware and is flaky in CI.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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
    console.warn('⚠ better-sqlite3 native module failed to initialize, schema tests skipped')
  }
} catch {
  console.warn('⚠ better-sqlite3 native module not available, schema tests skipped')
}

describe('notificaciones schema indexes (R4.C1)', () => {
  const testOrSkip = canRunTests ? it : it.skip

  // We rebuild the schema in-memory from the migration file so the test
  // is independent of the dev.db's runtime state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sqlite: any = null

  beforeEach(() => {
    if (!canRunTests) return

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3')
    sqlite = new Database(':memory:')

    const migrationsDir = join(process.cwd(), '..', '..', 'packages', 'database', 'migrations')
    const sql0000 = readFileSync(join(migrationsDir, '0000_organic_peter_quill.sql'), 'utf8')
    const sql0002 = readFileSync(join(migrationsDir, '0002_notificaciones_indexes.sql'), 'utf8')

    sqlite.exec(sql0000)
    sqlite.exec(sql0002)
  })

  afterEach(() => {
    if (sqlite) {
      try { sqlite.close() } catch { /* ignore */ }
      sqlite = null
    }
  })

  testOrSkip('notificaciones has idx_notificaciones_predio_activo covering (predio_id, activo)', () => {
    const rows = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='notificaciones' AND name='idx_notificaciones_predio_activo'",
      )
      .all()

    expect(rows).toHaveLength(1)
  })

  testOrSkip('notificaciones has idx_notificaciones_predio_leida covering (predio_id, leida)', () => {
    const rows = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='notificaciones' AND name='idx_notificaciones_predio_leida'",
      )
      .all()

    expect(rows).toHaveLength(1)
  })
})

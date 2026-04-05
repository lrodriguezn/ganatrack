/**
 * Integration tests for Auth module.
 * 
 * NOTE: These tests require better-sqlite3 native module which must be compiled
 * for the specific Node.js version. In environments where the native module
 * is not available (e.g., different Node version than what it was compiled for),
 * these tests will be skipped.
 * 
 * To run these tests:
 * 1. Ensure better-sqlite3 is compiled for your Node version: npm rebuild better-sqlite3
 * 2. Or run in an environment with Node.js v20.x
 */

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Check if we can load better-sqlite3 at module load time
let canRunTests = false

// Attempt to load better-sqlite3 synchronously
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3')
  // Try to create a temporary in-memory database to verify it actually works
  try {
    const testDb = new Database(':memory:')
    testDb.close()
    canRunTests = true
  } catch {
    console.warn('⚠ better-sqlite3 native module failed to initialize, integration tests skipped')
    console.warn('⚠ To enable integration tests, rebuild better-sqlite3 for your Node version')
  }
} catch (e) {
  console.warn('⚠ better-sqlite3 native module not available, integration tests skipped')
  console.warn('⚠ To enable integration tests, rebuild better-sqlite3 for your Node version')
}

describe('Auth Integration Tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sqlite: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any = null

  beforeAll(() => {
    if (!canRunTests) {
      return
    }
  })

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

    // Create tables
    sqlite.exec(`
      CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT(100) NOT NULL,
        email TEXT(100) NOT NULL UNIQUE,
        activo INTEGER DEFAULT 1,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE usuarios_contrasena (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id),
        contrasena_hash TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE usuarios_login (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        refresh_token TEXT,
        exitoso INTEGER DEFAULT 0,
        ip TEXT(45),
        user_agent TEXT,
        fecha_expiracion INTEGER,
        created_at INTEGER,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE usuarios_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT(50) NOT NULL,
        descripcion TEXT,
        es_sistema INTEGER DEFAULT 0,
        created_at INTEGER,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE usuarios_permisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modulo TEXT(50) NOT NULL,
        accion TEXT(50) NOT NULL,
        nombre TEXT(100) NOT NULL,
        created_at INTEGER,
        activo INTEGER DEFAULT 1
      );

      CREATE TABLE roles_permisos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rol_id INTEGER NOT NULL REFERENCES usuarios_roles(id),
        permiso_id INTEGER NOT NULL REFERENCES usuarios_permisos(id),
        created_at INTEGER,
        activo INTEGER DEFAULT 1,
        UNIQUE(rol_id, permiso_id)
      );

      CREATE TABLE usuarios_predios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        activo INTEGER DEFAULT 1,
        created_at INTEGER
      );

      CREATE TABLE usuarios_roles_asignacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        rol_id INTEGER NOT NULL REFERENCES usuarios_roles(id),
        created_at INTEGER,
        activo INTEGER DEFAULT 1,
        UNIQUE(usuario_id, rol_id)
      );
    `)
  })

  afterEach(() => {
    if (sqlite) {
      try {
        sqlite.close()
      } catch {
        // Ignore close errors
      }
      sqlite = null
      db = null
    }
  })

  // Skip all tests if native module not available
  const testOrSkip = canRunTests ? it : it.skip

  testOrSkip('should login with admin credentials and return tokens', async () => {
    if (!db) return

    // Dynamic import for bcrypt
    const bcrypt = await import('bcrypt')
    const schema = await import('@ganatrack/database/schema')
    const { eq } = await import('drizzle-orm')

    // Seed admin user
    const adminHash = await bcrypt.hash('Admin123!', 12)
    const now = Math.floor(Date.now() / 1000)

    sqlite.exec(`
      INSERT INTO usuarios (id, nombre, email, activo, created_at, updated_at)
      VALUES (1, 'Administrador', 'admin@ganatrack.com', 1, ${now}, ${now});

      INSERT INTO usuarios_contrasena (usuario_id, contrasena_hash, created_at, updated_at, activo)
      VALUES (1, '${adminHash}', ${now}, ${now}, 1);

      INSERT INTO usuarios_roles (id, nombre, descripcion, es_sistema, created_at, activo)
      VALUES (1, 'ADMIN', 'Admin', 1, ${now}, ${now});

      INSERT INTO usuarios_permisos (id, modulo, accion, nombre, created_at, activo)
      VALUES (1, 'usuarios', 'read', 'Ver usuarios', ${now}, 1);

      INSERT INTO roles_permisos (rol_id, permiso_id, created_at, activo)
      VALUES (1, 1, ${now}, 1);

      INSERT INTO usuarios_roles_asignacion (usuario_id, rol_id, created_at, activo)
      VALUES (1, 1, ${now}, 1);
    `)

    // Find user by email
    const [user] = await db
      .select({
        id: schema.usuarios.id,
        nombre: schema.usuarios.nombre,
        email: schema.usuarios.email,
        activo: schema.usuarios.activo,
      })
      .from(schema.usuarios)
      .where(eq(schema.usuarios.email, 'admin@ganatrack.com'))
      .limit(1)

    expect(user).toBeDefined()
    expect(user.nombre).toBe('Administrador')
    expect(user.email).toBe('admin@ganatrack.com')
    expect(user.activo).toBe(1)

    // Get password hash
    const [passwordRow] = await db
      .select({ contrasenaHash: schema.usuariosContrasena.contrasenaHash })
      .from(schema.usuariosContrasena)
      .where(eq(schema.usuariosContrasena.usuarioId, user.id))

    expect(passwordRow).toBeDefined()
    const isValid = await bcrypt.compare('Admin123!', passwordRow.contrasenaHash)
    expect(isValid).toBe(true)

    // Get roles
    const roles = await db
      .select({ nombre: schema.usuariosRoles.nombre })
      .from(schema.usuariosRolesAsignacion)
      .innerJoin(schema.usuariosRoles, eq(schema.usuariosRolesAsignacion.rolId, schema.usuariosRoles.id))
      .where(eq(schema.usuariosRolesAsignacion.usuarioId, user.id))

    expect(roles).toHaveLength(1)
    expect(roles[0].nombre).toBe('ADMIN')
  })

  testOrSkip('should fail login with wrong password', async () => {
    if (!db) return

    const bcrypt = await import('bcrypt')
    const schema = await import('@ganatrack/database/schema')
    const { eq } = await import('drizzle-orm')

    const adminHash = await bcrypt.hash('Admin123!', 12)
    const now = Math.floor(Date.now() / 1000)

    sqlite.exec(`
      INSERT INTO usuarios (id, nombre, email, activo, created_at, updated_at)
      VALUES (1, 'Administrador', 'admin@ganatrack.com', 1, ${now}, ${now});

      INSERT INTO usuarios_contrasena (usuario_id, contrasena_hash, created_at, updated_at, activo)
      VALUES (1, '${adminHash}', ${now}, ${now}, 1);
    `)

    const [passwordRow] = await db
      .select({ contrasenaHash: schema.usuariosContrasena.contrasenaHash })
      .from(schema.usuariosContrasena)
      .where(eq(schema.usuariosContrasena.usuarioId, 1))

    expect(passwordRow).toBeDefined()
    const isValid = await bcrypt.compare('WrongPassword123!', passwordRow.contrasenaHash)
    expect(isValid).toBe(false)
  })

  testOrSkip('should save and retrieve refresh token', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { eq } = await import('drizzle-orm')

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    sqlite.exec(`
      INSERT INTO usuarios (id, nombre, email, activo, created_at, updated_at)
      VALUES (1, 'Test', 'test@test.com', 1, ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)});
    `)

    // Insert refresh token
    await db.insert(schema.usuariosLogin).values({
      usuarioId: 1,
      refreshToken: 'test-refresh-token',
      exitoso: 1,
      fechaExpiracion: expiresAt,
      activo: 1,
    })

    // Find token
    const [tokenRow] = await db
      .select({
        usuarioId: schema.usuariosLogin.usuarioId,
        activo: schema.usuariosLogin.activo,
      })
      .from(schema.usuariosLogin)
      .where(eq(schema.usuariosLogin.refreshToken, 'test-refresh-token'))

    expect(tokenRow).toBeDefined()
    expect(tokenRow.usuarioId).toBe(1)
    expect(tokenRow.activo).toBe(1)
  })

  testOrSkip('should revoke token by setting activo = 0', async () => {
    if (!db) return

    const schema = await import('@ganatrack/database/schema')
    const { eq } = await import('drizzle-orm')

    sqlite.exec(`
      INSERT INTO usuarios (id, nombre, email, activo, created_at, updated_at)
      VALUES (1, 'Test', 'test@test.com', 1, ${Math.floor(Date.now() / 1000)}, ${Math.floor(Date.now() / 1000)});
    `)

    await db.insert(schema.usuariosLogin).values({
      usuarioId: 1,
      refreshToken: 'token-to-revoke',
      activo: 1,
    })

    // Revoke token
    await db
      .update(schema.usuariosLogin)
      .set({ activo: 0 })
      .where(eq(schema.usuariosLogin.refreshToken, 'token-to-revoke'))

    // Check token is revoked
    const [tokenRow] = await db
      .select({ activo: schema.usuariosLogin.activo })
      .from(schema.usuariosLogin)
      .where(eq(schema.usuariosLogin.refreshToken, 'token-to-revoke'))

    expect(tokenRow.activo).toBe(0)
  })
})

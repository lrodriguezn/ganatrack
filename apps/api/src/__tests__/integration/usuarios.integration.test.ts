/**
 * Integration tests for Usuarios module.
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

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'

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

describe('Usuarios Integration Tests', () => {
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

  describe('CRUD Operations', () => {
    testOrSkip('should create usuario and store in DB', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq } = await import('drizzle-orm')

      // Insert usuario
      await db.insert(schema.usuarios).values({
        nombre: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        activo: 1,
      })

      // Verify it was inserted
      const [user] = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.email, 'nuevo@test.com'))

      expect(user).toBeDefined()
      expect(user.nombre).toBe('Nuevo Usuario')
      expect(user.email).toBe('nuevo@test.com')
      expect(user.activo).toBe(1)
      expect(user.id).toBeGreaterThan(0)
    })

    testOrSkip('should list usuarios with pagination', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq } = await import('drizzle-orm')

      // Insert multiple usuarios
      for (let i = 1; i <= 5; i++) {
        await db.insert(schema.usuarios).values({
          nombre: `User ${i}`,
          email: `user${i}@test.com`,
          activo: 1,
        })
      }

      // Query with limit
      const users = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.activo, 1))
        .limit(3)

      expect(users).toHaveLength(3)
    })

    testOrSkip('should get usuario by ID with roles', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq, and } = await import('drizzle-orm')

      // Insert usuario
      await db.insert(schema.usuarios).values({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        activo: 1,
      })

      // Insert role
      await db.insert(schema.usuariosRoles).values({
        id: 1,
        nombre: 'ADMIN',
        descripcion: 'Admin role',
        esSistema: 1,
        activo: 1,
      })

      // Assign role
      await db.insert(schema.usuariosRolesAsignacion).values({
        usuarioId: 1,
        rolId: 1,
        activo: 1,
      })

      // Get user
      const [user] = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.id, 1))

      expect(user).toBeDefined()
      expect(user.nombre).toBe('Test User')

      // Get roles
      const roles = await db
        .select({ nombre: schema.usuariosRoles.nombre })
        .from(schema.usuariosRolesAsignacion)
        .innerJoin(schema.usuariosRoles, eq(schema.usuariosRolesAsignacion.rolId, schema.usuariosRoles.id))
        .where(and(
          eq(schema.usuariosRolesAsignacion.usuarioId, 1),
          eq(schema.usuariosRolesAsignacion.activo, 1),
          eq(schema.usuariosRoles.activo, 1)
        ))

      expect(roles).toHaveLength(1)
      expect(roles[0].nombre).toBe('ADMIN')
    })

    testOrSkip('should update usuario and persist changes', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq } = await import('drizzle-orm')

      // Insert usuario
      await db.insert(schema.usuarios).values({
        id: 1,
        nombre: 'Original Name',
        email: 'original@test.com',
        activo: 1,
      })

      // Update
      await db
        .update(schema.usuarios)
        .set({ nombre: 'Updated Name' })
        .where(eq(schema.usuarios.id, 1))

      // Verify update
      const [user] = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.id, 1))

      expect(user.nombre).toBe('Updated Name')
      expect(user.email).toBe('original@test.com')
    })

    testOrSkip('should soft delete usuario (activo = 0)', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq } = await import('drizzle-orm')

      // Insert usuario
      await db.insert(schema.usuarios).values({
        id: 1,
        nombre: 'To Delete',
        email: 'delete@test.com',
        activo: 1,
      })

      // Soft delete
      await db
        .update(schema.usuarios)
        .set({ activo: 0 })
        .where(eq(schema.usuarios.id, 1))

      // Verify soft delete - user should still exist but be inactive
      const [user] = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.id, 1))

      expect(user.activo).toBe(0)

      // Active query should not return the user
      const activeUsers = await db
        .select()
        .from(schema.usuarios)
        .where(eq(schema.usuarios.activo, 1))

      expect(activeUsers.find((u: { id: number }) => u.id === 1)).toBeUndefined()
    })
  })

  describe('Role Assignment', () => {
    testOrSkip('should assign roles to usuario and be visible in getMe', async () => {
      if (!db) return

      const schema = await import('@ganatrack/database/schema')
      const { eq, and } = await import('drizzle-orm')

      // Insert usuario
      await db.insert(schema.usuarios).values({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        activo: 1,
      })

      // Insert roles
      await db.insert(schema.usuariosRoles).values([
        { id: 1, nombre: 'ADMIN', descripcion: 'Admin', esSistema: 1, activo: 1 },
        { id: 2, nombre: 'OPERARIO', descripcion: 'Operario', esSistema: 1, activo: 1 },
      ])

      // Assign both roles
      await db.insert(schema.usuariosRolesAsignacion).values([
        { usuarioId: 1, rolId: 1, activo: 1 },
        { usuarioId: 1, rolId: 2, activo: 1 },
      ])

      // Get roles for user (simulating getMe)
      const roleAssignments = await db
        .select({ nombre: schema.usuariosRoles.nombre })
        .from(schema.usuariosRolesAsignacion)
        .innerJoin(schema.usuariosRoles, eq(schema.usuariosRolesAsignacion.rolId, schema.usuariosRoles.id))
        .where(and(
          eq(schema.usuariosRolesAsignacion.usuarioId, 1),
          eq(schema.usuariosRolesAsignacion.activo, 1),
          eq(schema.usuariosRoles.activo, 1)
        ))

      expect(roleAssignments).toHaveLength(2)
      const roleNames = roleAssignments.map((r: { nombre: string }) => r.nombre).sort()
      expect(roleNames).toEqual(['ADMIN', 'OPERARIO'])
    })
  })
})

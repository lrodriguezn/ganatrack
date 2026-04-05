import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import * as schema from '@ganatrack/database/schema'

export interface TestDbResult {
  sqlite: Database.Database
  db: ReturnType<typeof drizzle>
}

export function createTestDb(): TestDbResult {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  sqlite.pragma('journal_mode = WAL')

  const db = drizzle(sqlite, { schema })

  // Create all necessary tables
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

    CREATE TABLE usuarios_historial_contrasenas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      contrasena_hash TEXT NOT NULL,
      created_at INTEGER,
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

    CREATE TABLE usuarios_autenticacion_dos_factores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id),
      metodo TEXT(20) NOT NULL DEFAULT 'email',
      codigo TEXT(10),
      fecha_expiracion INTEGER,
      intentos_fallidos INTEGER DEFAULT 0,
      habilitado INTEGER DEFAULT 0,
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

  return { sqlite, db }
}

export async function seedTestDb(db: ReturnType<typeof drizzle>): Promise<void> {
  const adminHash = await bcrypt.hash('Admin123!', 12)
  const now = Math.floor(Date.now() / 1000)

  // Insert admin user
  db.run(
    `INSERT INTO usuarios (id, nombre, email, activo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 'Administrador', 'admin@ganatrack.com', 1, now, now]
  )

  // Insert password
  db.run(
    `INSERT INTO usuarios_contrasena (usuario_id, contrasena_hash, created_at, updated_at, activo) VALUES (?, ?, ?, ?, ?)`,
    [1, adminHash, now, now, 1]
  )

  // Insert roles
  db.run(
    `INSERT INTO usuarios_roles (id, nombre, descripcion, es_sistema, created_at, activo) VALUES (?, ?, ?, ?, ?, ?)`,
    [1, 'ADMIN', 'Acceso total al sistema', 1, now, 1]
  )
  db.run(
    `INSERT INTO usuarios_roles (id, nombre, descripcion, es_sistema, created_at, activo) VALUES (?, ?, ?, ?, ?, ?)`,
    [2, 'OPERARIO', 'Operaciones de campo', 1, now, 1]
  )
  db.run(
    `INSERT INTO usuarios_roles (id, nombre, descripcion, es_sistema, created_at, activo) VALUES (?, ?, ?, ?, ?, ?)`,
    [3, 'VISOR', 'Solo lectura', 1, now, 1]
  )

  // Insert permissions
  const permisos = [
    { modulo: 'usuarios', accion: 'read', nombre: 'Ver usuarios' },
    { modulo: 'usuarios', accion: 'admin', nombre: 'Gestionar usuarios' },
    { modulo: 'animales', accion: 'read', nombre: 'Ver animales' },
    { modulo: 'animales', accion: 'write', nombre: 'Crear animales' },
  ]

  for (let i = 0; i < permisos.length; i++) {
    db.run(
      `INSERT INTO usuarios_permisos (id, modulo, accion, nombre, created_at, activo) VALUES (?, ?, ?, ?, ?, ?)`,
      [i + 1, permisos[i].modulo, permisos[i].accion, permisos[i].nombre, now, 1]
    )
  }

  // Assign all permissions to ADMIN role
  for (let i = 0; i < permisos.length; i++) {
    db.run(
      `INSERT INTO roles_permisos (rol_id, permiso_id, created_at, activo) VALUES (?, ?, ?, ?)`,
      [1, i + 1, now, 1]
    )
  }

  // Assign admin user to ADMIN role
  db.run(
    `INSERT INTO usuarios_roles_asignacion (usuario_id, rol_id, created_at, activo) VALUES (?, ?, ?, ?)`,
    [1, 1, now, 1]
  )
}

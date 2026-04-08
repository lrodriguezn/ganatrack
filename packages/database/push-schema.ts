/**
 * Schema Push Script - Direct SQLite schema creation without drizzle-kit
 * 
 * This script creates all tables in dev.db based on the actual Drizzle schema definitions.
 * It bypasses drizzle-kit CLI which has Node.js version incompatibility issues.
 */

import Database from 'better-sqlite3'
import { existsSync, unlinkSync } from 'fs'

const dbPath = process.env.DATABASE_URL ?? 'dev.db'

// Delete existing database to start fresh
if (existsSync(dbPath)) {
  console.log(`Removing existing database: ${dbPath}`)
  unlinkSync(dbPath)
}

console.log(`Creating new database: ${dbPath}`)
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Create drizzle migrations table (required for drizzle to track migrations)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL,
    created_at INTEGER
  );
`)

// Table definitions matching actual Drizzle schema
// Note: Column names here are the actual DB column names (snake_case)
// Drizzle uses camelCase in TypeScript but stores as snake_case in SQLite

const tableDefinitions: Record<string, string> = {
  // usuarios - Main user table
  usuarios: `
    CREATE TABLE usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // usuarios_contrasena - Password for each user
  usuarios_contrasena: `
    CREATE TABLE usuarios_contrasena (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id),
      contrasena_hash TEXT NOT NULL,
      created_at INTEGER,
      updated_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // usuarios_historial_contrasenas - Password history
  usuarios_historial_contrasenas: `
    CREATE TABLE usuarios_historial_contrasenas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      contrasena_hash TEXT NOT NULL,
      created_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // usuarios_login - Login sessions
  usuarios_login: `
    CREATE TABLE usuarios_login (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      refresh_token TEXT,
      exitoso INTEGER DEFAULT 0,
      ip TEXT,
      user_agent TEXT,
      fecha_expiracion INTEGER,
      created_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // usuarios_autenticacion_dos_factores - 2FA configuration
  usuarios_autenticacion_dos_factores: `
    CREATE TABLE usuarios_autenticacion_dos_factores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id),
      metodo TEXT NOT NULL DEFAULT 'email',
      codigo TEXT,
      fecha_expiracion INTEGER,
      intentos_fallidos INTEGER DEFAULT 0,
      habilitado INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // usuarios_roles - Role definitions
  usuarios_roles: `
    CREATE TABLE usuarios_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      es_sistema INTEGER DEFAULT 0,
      created_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // usuarios_permisos - Permission definitions
  usuarios_permisos: `
    CREATE TABLE usuarios_permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modulo TEXT NOT NULL,
      accion TEXT NOT NULL,
      nombre TEXT NOT NULL,
      created_at INTEGER,
      activo INTEGER DEFAULT 1
    );
  `,

  // roles_permisos - Junction table for role-permission relationship
  roles_permisos: `
    CREATE TABLE roles_permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rol_id INTEGER NOT NULL REFERENCES usuarios_roles(id),
      permiso_id INTEGER NOT NULL REFERENCES usuarios_permisos(id),
      created_at INTEGER,
      activo INTEGER DEFAULT 1,
      UNIQUE(rol_id, permiso_id)
    );
  `,

  // predios - Farm/property table
  predios: `
    CREATE TABLE predios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      telefono TEXT,
      email TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // usuarios_predios - User-predio assignments
  usuarios_predios: `
    CREATE TABLE usuarios_predios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      activo INTEGER DEFAULT 1,
      created_at INTEGER
    );
  `,

  // usuarios_roles_asignacion - User-role assignments
  usuarios_roles_asignacion: `
    CREATE TABLE usuarios_roles_asignacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      rol_id INTEGER NOT NULL REFERENCES usuarios_roles(id),
      created_at INTEGER,
      activo INTEGER DEFAULT 1,
      UNIQUE(usuario_id, rol_id)
    );
  `,

  // potreros - Paddocks/pastures
  potreros: `
    CREATE TABLE potreros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      capacidad INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // sectores - Sectors within a farm
  sectores: `
    CREATE TABLE sectores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // lotes - Lots/batches
  lotes: `
    CREATE TABLE lotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      potrero_id INTEGER REFERENCES potreros(id),
      nombre TEXT NOT NULL,
      fecha_ingreso INTEGER,
      fecha_salida INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // grupos - Animal groups
  grupos: `
    CREATE TABLE grupos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      lote_id INTEGER REFERENCES lotes(id),
      nombre TEXT NOT NULL,
      fecha_ingreso INTEGER,
      fecha_salida INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_parametros_predio - Farm-specific parameters
  config_parametros_predio: `
    CREATE TABLE config_parametros_predio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      parametro TEXT NOT NULL,
      valor TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // imagenes - Images
  imagenes: `
    CREATE TABLE imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      tipo TEXT,
      created_at INTEGER
    );
  `,

  // animales - Animals
  animales: `
    CREATE TABLE animales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      codigo TEXT NOT NULL,
      nombre TEXT,
      fecha_nacimiento INTEGER,
      precio_compra REAL,
      codigo_rfid TEXT,
      madre_id INTEGER REFERENCES animales(id),
      padre_id INTEGER REFERENCES animales(id),
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // animales_imagenes - Animal images junction
  animales_imagenes: `
    CREATE TABLE animales_imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      imagen_id INTEGER NOT NULL REFERENCES imagenes(id),
      es_principal INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // veterinarios - Veterinarians
  veterinarios: `
    CREATE TABLE veterinarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // propietarios - Owners
  propietarios: `
    CREATE TABLE propietarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // hierros - Brands
  hierros: `
    CREATE TABLE hierros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // diagnosticos_veterinarios - Veterinary diagnoses
  diagnosticos_veterinarios: `
    CREATE TABLE diagnosticos_veterinarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // motivos_ventas - Sale reasons
  motivos_ventas: `
    CREATE TABLE motivos_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // causas_muerte - Death causes
  causas_muerte: `
    CREATE TABLE causas_muerte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // lugares_compras - Purchase places
  lugares_compras: `
    CREATE TABLE lugares_compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // lugares_ventas - Sale places
  lugares_ventas: `
    CREATE TABLE lugares_ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      ubicacion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_palpaciones_grupal - Group palpation services
  servicios_palpaciones_grupal: `
    CREATE TABLE servicios_palpaciones_grupal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      fecha INTEGER NOT NULL,
      veterinario_id INTEGER REFERENCES veterinarios(id),
      resultado TEXT,
      notas TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_palpaciones_animales - Palpation results per animal
  servicios_palpaciones_animales: `
    CREATE TABLE servicios_palpaciones_animales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_grupal_id INTEGER NOT NULL REFERENCES servicios_palpaciones_grupal(id),
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      resultado TEXT,
      dias_gestacion INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_inseminacion_grupal - Group insemination services
  servicios_inseminacion_grupal: `
    CREATE TABLE servicios_inseminacion_grupal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      fecha INTEGER NOT NULL,
      veterinario_id INTEGER REFERENCES veterinarios(id),
      notas TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_inseminacion_animales - Insemination results per animal
  servicios_inseminacion_animales: `
    CREATE TABLE servicios_inseminacion_animales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_grupal_id INTEGER NOT NULL REFERENCES servicios_inseminacion_grupal(id),
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      resultado TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_partos_animales - Birth services per animal
  servicios_partos_animales: `
    CREATE TABLE servicios_partos_animales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      fecha INTEGER NOT NULL,
      tipo TEXT,
      complicaciones TEXT,
      notas TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_partos_crias - Birth results for calves
  servicios_partos_crias: `
    CREATE TABLE servicios_partos_crias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_id INTEGER NOT NULL REFERENCES servicios_partos_animales(id),
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      peso REAL,
      sexo TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_veterinarios_grupal - Group veterinary services
  servicios_veterinarios_grupal: `
    CREATE TABLE servicios_veterinarios_grupal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      fecha INTEGER NOT NULL,
      veterinario_id INTEGER REFERENCES veterinarios(id),
      diagnostico_id INTEGER REFERENCES diagnosticos_veterinarios(id),
      notas TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_veterinarios_animales - Veterinary service results per animal
  servicios_veterinarios_animales: `
    CREATE TABLE servicios_veterinarios_animales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_grupal_id INTEGER NOT NULL REFERENCES servicios_veterinarios_grupal(id),
      animal_id INTEGER NOT NULL REFERENCES animales(id),
      resultado TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // servicios_veterinarios_productos - Products used in veterinary services
  servicios_veterinarios_productos: `
    CREATE TABLE servicios_veterinarios_productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio_id INTEGER NOT NULL REFERENCES servicios_veterinarios_animales(id),
      producto_id INTEGER NOT NULL REFERENCES productos(id),
      cantidad REAL NOT NULL,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_razas - Cattle breeds
  config_razas: `
    CREATE TABLE config_razas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      origen TEXT,
      tipo_produccion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_condiciones_corporales - Body condition scores
  config_condiciones_corporales: `
    CREATE TABLE config_condiciones_corporales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      valor_min INTEGER DEFAULT 1,
      valor_max INTEGER DEFAULT 5,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_tipos_explotacion - Farm exploitation types
  config_tipos_explotacion: `
    CREATE TABLE config_tipos_explotacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_calidad_animal - Animal quality grades
  config_calidad_animal: `
    CREATE TABLE config_calidad_animal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_colores - Animal colors
  config_colores: `
    CREATE TABLE config_colores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_rangos_edades - Age range categories
  config_rangos_edades: `
    CREATE TABLE config_rangos_edades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      rango1 INTEGER NOT NULL,
      rango2 INTEGER NOT NULL,
      sexo INTEGER DEFAULT 0,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // config_key_values - Generic key-value configuration
  config_key_values: `
    CREATE TABLE config_key_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opcion TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      UNIQUE(opcion, key)
    );
  `,

  // productos - Products
  productos: `
    CREATE TABLE productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      tipo TEXT,
      precio REAL,
      stock REAL,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // productos_imagenes - Product images junction
  productos_imagenes: `
    CREATE TABLE productos_imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL REFERENCES productos(id),
      imagen_id INTEGER NOT NULL REFERENCES imagenes(id),
      es_principal INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // reportes_exportaciones - Report exports
  reportes_exportaciones: `
    CREATE TABLE reportes_exportaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      predio_id INTEGER NOT NULL REFERENCES predios(id),
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      tipo TEXT NOT NULL,
      formato TEXT NOT NULL,
      ruta_archivo TEXT NOT NULL,
      estado TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // notificaciones - Notifications
  notificaciones: `
    CREATE TABLE notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      titulo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      tipo TEXT,
      leida INTEGER DEFAULT 0,
      datos TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // notificaciones_preferencias - Notification preferences
  notificaciones_preferencias: `
    CREATE TABLE notificaciones_preferencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      tipo TEXT NOT NULL,
      habilitado INTEGER DEFAULT 1,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,

  // notificaciones_push_tokens - Push notification tokens
  notificaciones_push_tokens: `
    CREATE TABLE notificaciones_push_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      token TEXT NOT NULL,
      plataforma TEXT,
      activo INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `,
}

// Tables in order respecting foreign key dependencies
const tableOrder = [
  '__drizzle_migrations',
  'usuarios',
  'usuarios_roles',
  'usuarios_permisos',
  'predios',
  'usuarios_contrasena',
  'usuarios_login',
  'usuarios_autenticacion_dos_factores',
  'roles_permisos',
  'usuarios_predios',
  'usuarios_roles_asignacion',
  'potreros',
  'sectores',
  'lotes',
  'grupos',
  'config_parametros_predio',
  'imagenes',
  'animales',
  'animales_imagenes',
  'veterinarios',
  'propietarios',
  'hierros',
  'diagnosticos_veterinarios',
  'motivos_ventas',
  'causas_muerte',
  'lugares_compras',
  'lugares_ventas',
  'productos',
  'productos_imagenes',
  'reportes_exportaciones',
  'notificaciones',
  'notificaciones_preferencias',
  'notificaciones_push_tokens',
  'config_razas',
  'config_condiciones_corporales',
  'config_tipos_explotacion',
  'config_calidad_animal',
  'config_colores',
  'config_rangos_edades',
  'config_key_values',
  'servicios_palpaciones_grupal',
  'servicios_palpaciones_animales',
  'servicios_inseminacion_grupal',
  'servicios_inseminacion_animales',
  'servicios_partos_animales',
  'servicios_partos_crias',
  'servicios_veterinarios_grupal',
  'servicios_veterinarios_animales',
  'servicios_veterinarios_productos',
]

console.log('Creating tables...')
for (const tableName of tableOrder) {
  const createSQL = tableDefinitions[tableName]
  if (!createSQL) {
    console.log(`  WARNING: No definition for table ${tableName}, skipping`)
    continue
  }
  sqlite.exec(createSQL.trim())
}

console.log(`\nDatabase created successfully with ${tableOrder.length} tables!`)

// Verify tables were created
const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
console.log(`\nVerified ${tables.length} tables in database:`)
for (const t of tables) {
  console.log(`  - ${(t as any).name}`)
}

// Create indexes for better query performance
console.log('\nCreating indexes...')
const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);',
  'CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);',
  'CREATE INDEX IF NOT EXISTS idx_predios_nombre ON predios(nombre);',
  'CREATE INDEX IF NOT EXISTS idx_animales_predio ON animales(predio_id);',
  'CREATE INDEX IF NOT EXISTS idx_animales_codigo ON animales(codigo);',
  'CREATE INDEX IF NOT EXISTS idx_animales_predio_activo ON animales(predio_id, activo);',
  'CREATE INDEX IF NOT EXISTS idx_animales_madre ON animales(madre_id);',
  'CREATE INDEX IF NOT EXISTS idx_animales_padre ON animales(padre_id);',
  'CREATE INDEX IF NOT EXISTS idx_potreros_predio ON potreros(predio_id);',
  'CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios_palpaciones_grupal(fecha);',
  'CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);',
  'CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);',
]

for (const idx of indexes) {
  sqlite.exec(idx)
}

console.log(`Created ${indexes.length} indexes`)

sqlite.close()
console.log('\nDatabase schema push complete!')

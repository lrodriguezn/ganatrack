import { createClient } from './src/client'
import {
  configRangosEdades,
  configKeyValues,
  configRazas,
  configCondicionesCorporales,
  configTiposExplotacion,
  configCalidadAnimal,
  configColores,
  usuarios,
  usuariosContrasena,
  usuariosRoles,
  usuariosPermisos,
  rolesPermisos,
  usuariosRolesAsignacion,
  usuariosPredios,
  usuariosAutenticacionDosFactores,
  predios,
} from './src/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'

async function seed() {
  const db = createClient()

  console.log('Seeding database...')

  // --- Config Rangos Edades (10 records) ---
  await db.insert(configRangosEdades).values([
    { id: 1, rango1: 1, rango2: 240, nombre: 'Ternero', sexo: 0 },
    { id: 2, rango1: 241, rango2: 365, nombre: 'Novillo destete', sexo: 0 },
    { id: 3, rango1: 366, rango2: 720, nombre: 'Novillo levante', sexo: 0 },
    { id: 4, rango1: 721, rango2: 1080, nombre: 'Novillo ceba', sexo: 0 },
    { id: 5, rango1: 1081, rango2: 99999, nombre: 'Toro', sexo: 0 },
    { id: 6, rango1: 1, rango2: 240, nombre: 'Ternera', sexo: 1 },
    { id: 7, rango1: 241, rango2: 365, nombre: 'Novilla destete', sexo: 1 },
    { id: 8, rango1: 366, rango2: 720, nombre: 'Novilla levante', sexo: 1 },
    { id: 9, rango1: 721, rango2: 1080, nombre: 'Novilla vientre', sexo: 1 },
    { id: 10, rango1: 1081, rango2: 99999, nombre: 'Vaca', sexo: 1 },
  ]).onConflictDoNothing()

  // --- Config Key Values ---
  await db.insert(configKeyValues).values([
    { opcion: 'sexo', key: 'Masculino', value: '0' },
    { opcion: 'sexo', key: 'Femenino', value: '1' },
    { opcion: 'estado_animal', key: 'Activo', value: '0' },
    { opcion: 'estado_animal', key: 'Vendido', value: '1' },
    { opcion: 'estado_animal', key: 'Muerto', value: '2' },
    { opcion: 'tipo_ingreso', key: 'Nacido predio', value: '0' },
    { opcion: 'tipo_ingreso', key: 'Comprado', value: '1' },
    { opcion: 'tipo_padre', key: 'Natural', value: '0' },
    { opcion: 'tipo_padre', key: 'Inseminación', value: '1' },
    { opcion: 'tipo_parto', key: 'Normal', value: '0' },
    { opcion: 'tipo_parto', key: 'Con ayuda', value: '1' },
    { opcion: 'tipo_parto', key: 'Distócico', value: '2' },
    { opcion: 'tipo_parto', key: 'Mortinato', value: '3' },
    { opcion: 'salud_animal', key: 'Normal', value: '0' },
    { opcion: 'salud_animal', key: 'Enfermo', value: '1' },
    { opcion: 'tipo_producto', key: 'Medicamento', value: '0' },
    { opcion: 'tipo_producto', key: 'Vacuna', value: '1' },
    { opcion: 'tipo_producto', key: 'Suplemento', value: '2' },
    { opcion: 'tipo_diagnostico', key: 'Vitaminas', value: '0' },
    { opcion: 'tipo_diagnostico', key: 'Desparasitación', value: '1' },
    { opcion: 'tipo_diagnostico', key: 'Tratamiento', value: '2' },
    { opcion: 'tipo_inseminacion', key: 'Convencional', value: '0' },
    { opcion: 'tipo_inseminacion', key: 'Sexada', value: '1' },
  ]).onConflictDoNothing()

  // --- Config Razas (common breeds) ---
  await db.insert(configRazas).values([
    { id: 1, nombre: 'Brahman', descripcion: 'Cebú Brahman', activo: 1 },
    { id: 2, nombre: 'Holstein', descripcion: 'Holstein Friesian', activo: 1 },
    { id: 3, nombre: 'Angus', descripcion: 'Aberdeen Angus', activo: 1 },
    { id: 4, nombre: 'Brangus', descripcion: 'Brahman × Angus', activo: 1 },
    { id: 5, nombre: 'Gyr', descripcion: 'Gir Lechero', activo: 1 },
    { id: 6, nombre: 'Normando', descripcion: 'Normando', activo: 1 },
    { id: 7, nombre: 'Simmental', descripcion: 'Simmental', activo: 1 },
    { id: 8, nombre: 'Criollo', descripcion: 'Criollo colombiano', activo: 1 },
    { id: 9, nombre: 'Romosinuano', descripcion: 'Romosinuano', activo: 1 },
    { id: 10, nombre: 'Blanco Orejinegro', descripcion: 'BON', activo: 1 },
    { id: 11, nombre: 'Crossbreed', descripcion: 'Cruza', activo: 1 },
  ]).onConflictDoNothing()

  // --- Config Condiciones Corporales (1-5 scale) ---
  await db.insert(configCondicionesCorporales).values([
    { id: 1, nombre: 'Muy delgado', valorMin: 1, valorMax: 1, descripcion: 'Costillas visibles, espinazo prominente', activo: 1 },
    { id: 2, nombre: 'Delgado', valorMin: 2, valorMax: 2, descripcion: 'Costillas palpables', activo: 1 },
    { id: 3, nombre: 'Ideal', valorMin: 3, valorMax: 3, descripcion: 'Costillas cubiertas, buena condición', activo: 1 },
    { id: 4, nombre: 'Gordo', valorMin: 4, valorMax: 4, descripcion: 'Costillas no palpables, grasa visible', activo: 1 },
    { id: 5, nombre: 'Muy gordo', valorMin: 5, valorMax: 5, descripcion: 'Exceso de grasa, pliegues', activo: 1 },
  ]).onConflictDoNothing()

  // --- Config Tipos Explotacion ---
  await db.insert(configTiposExplotacion).values([
    { id: 1, nombre: 'Cría', descripcion: 'Producción de terneros', activo: 1 },
    { id: 2, nombre: 'Lechería', descripcion: 'Producción de leche', activo: 1 },
    { id: 3, nombre: 'Doble propósito', descripcion: 'Carne y leche', activo: 1 },
    { id: 4, nombre: 'Engorde', descripcion: 'Ceba de ganado', activo: 1 },
  ]).onConflictDoNothing()

  // --- Config Calidad Animal ---
  await db.insert(configCalidadAnimal).values([
    { id: 1, nombre: 'Excelente', descripcion: 'Animal de alta calidad genética', activo: 1 },
    { id: 2, nombre: 'Bueno', descripcion: 'Buena calidad', activo: 1 },
    { id: 3, nombre: 'Regular', descripcion: 'Calidad promedio', activo: 1 },
    { id: 4, nombre: 'Malo', descripcion: 'Baja calidad', activo: 1 },
  ]).onConflictDoNothing()

  // --- Config Colores ---
  await db.insert(configColores).values([
    { id: 1, nombre: 'Negro', codigo: '#000000', activo: 1 },
    { id: 2, nombre: 'Blanco', codigo: '#FFFFFF', activo: 1 },
    { id: 3, nombre: 'Rojo', codigo: '#8B0000', activo: 1 },
    { id: 4, nombre: 'Café', codigo: '#8B4513', activo: 1 },
    { id: 5, nombre: 'Canela', codigo: '#D2691E', activo: 1 },
    { id: 6, nombre: 'Bayo', codigo: '#F4A460', activo: 1 },
    { id: 7, nombre: 'Overo', codigo: '#DEB887', activo: 1 },
    { id: 8, nombre: 'Pintado', codigo: '#A9A9A9', activo: 1 },
  ]).onConflictDoNothing()

  // --- Admin User ---
  const adminHash = await bcrypt.hash('Admin123!', 12)
  await db.insert(usuarios).values({
    id: 1,
    nombre: 'Administrador',
    email: 'admin@ganatrack.com',
    activo: 1,
  }).onConflictDoNothing()

  await db.insert(usuariosContrasena).values({
    usuarioId: 1,
    contrasenaHash: adminHash,
    activo: 1,
  }).onConflictDoNothing()

  // --- Roles ---
  await db.insert(usuariosRoles).values([
    { id: 1, nombre: 'ADMIN', descripcion: 'Acceso total al sistema', esSistema: 1, activo: 1 },
    { id: 2, nombre: 'OPERARIO', descripcion: 'Operaciones de campo', esSistema: 1, activo: 1 },
    { id: 3, nombre: 'VISOR', descripcion: 'Solo lectura', esSistema: 1, activo: 1 },
  ]).onConflictDoNothing()

  // --- Permissions ---
  const permisos = [
    { modulo: 'animales', accion: 'read', nombre: 'Ver animales' },
    { modulo: 'animales', accion: 'write', nombre: 'Crear/editar animales' },
    { modulo: 'animales', accion: 'delete', nombre: 'Eliminar animales' },
    { modulo: 'servicios', accion: 'read', nombre: 'Ver servicios' },
    { modulo: 'servicios', accion: 'write', nombre: 'Registrar servicios' },
    { modulo: 'servicios', accion: 'delete', nombre: 'Eliminar servicios' },
    { modulo: 'predios', accion: 'read', nombre: 'Ver predios' },
    { modulo: 'predios', accion: 'write', nombre: 'Crear/editar predios' },
    { modulo: 'predios', accion: 'delete', nombre: 'Eliminar predios' },
    { modulo: 'usuarios', accion: 'read', nombre: 'Ver usuarios' },
    { modulo: 'usuarios', accion: 'admin', nombre: 'Gestionar usuarios y roles' },
    { modulo: 'config', accion: 'read', nombre: 'Ver catálogos' },
    { modulo: 'config', accion: 'admin', nombre: 'Modificar catálogos' },
    { modulo: 'reportes', accion: 'read', nombre: 'Consultar reportes' },
    { modulo: 'reportes', accion: 'export', nombre: 'Exportar reportes' },
    { modulo: 'notificaciones', accion: 'read', nombre: 'Ver notificaciones' },
    { modulo: 'notificaciones', accion: 'admin', nombre: 'Gestionar alertas' },
    { modulo: 'productos', accion: 'read', nombre: 'Ver productos' },
    { modulo: 'productos', accion: 'write', nombre: 'Crear/editar productos' },
    { modulo: 'productos', accion: 'delete', nombre: 'Eliminar productos' },
    { modulo: 'imagenes', accion: 'read', nombre: 'Ver imágenes' },
    { modulo: 'imagenes', accion: 'write', nombre: 'Subir imágenes' },
    { modulo: 'imagenes', accion: 'delete', nombre: 'Eliminar imágenes' },
    { modulo: 'maestros', accion: 'read', nombre: 'Ver maestros' },
    { modulo: 'maestros', accion: 'write', nombre: 'Crear/editar maestros' },
    { modulo: 'maestros', accion: 'delete', nombre: 'Eliminar maestros' },
  ]

  for (const p of permisos) {
    await db.insert(usuariosPermisos).values({
      ...p,
      activo: 1,
    }).onConflictDoNothing()
  }

  // Get all permission IDs
  const allPermisos = await db.select({ id: usuariosPermisos.id }).from(usuariosPermisos)

  // Assign ALL permissions to ADMIN role
  for (const perm of allPermisos) {
    await db.insert(rolesPermisos).values({
      rolId: 1, // ADMIN
      permisoId: perm.id,
      activo: 1,
    }).onConflictDoNothing()
  }

  // Assign read permissions to VISOR role
  const readPermisos = await db.select({ id: usuariosPermisos.id })
    .from(usuariosPermisos)
    .where(eq(usuariosPermisos.accion, 'read'))

  for (const perm of readPermisos) {
    await db.insert(rolesPermisos).values({
      rolId: 3, // VISOR
      permisoId: perm.id,
      activo: 1,
    }).onConflictDoNothing()
  }

  // Assign admin user to ADMIN role
  await db.insert(usuariosRolesAsignacion).values({
    usuarioId: 1,
    rolId: 1,
    activo: 1,
  }).onConflictDoNothing()

  // --- Default Predio ---
  await db.insert(predios).values({
    id: 1,
    codigo: 'FINCA-001',
    nombre: 'Finca Principal',
    departamento: 'Antioquia',
    municipio: 'Rionegro',
    vereda: 'La Esperanza',
    areaHectareas: 150.5,
    capacidadMaxima: 200,
    activo: 1,
  }).onConflictDoNothing()

  // Assign admin user to the default Predio
  await db.insert(usuariosPredios).values({
    usuarioId: 1,
  	predioId: 1,
    activo: 1,
  }).onConflictDoNothing()

  // --- 2FA Test User ---
  // Create a test user with 2FA enabled for testing the flow
  const hashedPassword = await bcrypt.hash('test123456', 10)

  await db.insert(usuarios).values({
    id: 2,
    email: 'test2fa@ganatrack.com',
    nombre: 'Usuario 2FA Test',
    activo: 1,
  }).onConflictDoNothing()

  await db.insert(usuariosContrasena).values({
    usuarioId: 2,
    contrasenaHash: hashedPassword,
    activo: 1,
  }).onConflictDoNothing()

  // Assign to OPERARIO role (id: 2)
  await db.insert(usuariosRolesAsignacion).values({
    usuarioId: 2,
    rolId: 2,
    activo: 1,
  }).onConflictDoNothing()

  // Enable 2FA for this user - use a pre-computed hash for reliability
  // Hash for '123456' is: $2b$10$XnGkbZi2XItTP.7S6h4oNu2PE0zfJxPAZJnc3wcGw8sWqUE/xj/nC
  const twoFactorCodeHash = '$2b$10$XnGkbZi2XItTP.7S6h4oNu2PE0zfJxPAZJnc3wcGw8sWqUE/xj/nC'
  await db.insert(usuariosAutenticacionDosFactores).values({
    usuarioId: 2,
    metodo: 'email',
    codigo: twoFactorCodeHash,
    fechaExpiracion: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    intentosFallidos: 0,
    habilitado: 1,
    activo: 1,
  }).onConflictDoNothing()

  console.log('Seed completed!')
}

seed().catch(console.error)

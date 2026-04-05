/**
 * Test Factories - Entity builders with sensible defaults
 * 
 * Usage:
 *   import { factories } from './factories'
 *   
 *   const animal = factories.animal.build()
 *   const adminUser = factories.usuario.build({ nombre: 'Admin' })
 */

import type { AnimalEntity, ImagenEntity, AnimalImagenEntity } from '../../modules/animales/domain/entities/animal.entity.js'
import type { UsuarioEntity } from '../../modules/usuarios/domain/entities/usuario.entity.js'
import type { PredioEntity } from '../../modules/predios/domain/entities/predio.entity.js'
import type { Notificacion } from '../../modules/notificaciones/domain/entities/notificacion.entity.js'
import type { PermisoEntity } from '../../modules/usuarios/domain/entities/permiso.entity.js'
import type { RolEntity } from '../../modules/usuarios/domain/entities/rol.entity.js'

// Factory type
interface Factory<T> {
  build(overrides?: Partial<T>): T
}

// Base factory creator
function createFactory<T>(defaults: () => T): Factory<T> {
  return {
    build: (overrides?: Partial<T>) => ({ ...defaults(), ...overrides }),
  }
}

// ============================================
// Animal Factory
// ============================================
const animalDefaults = (): AnimalEntity => ({
  id: 1,
  predioId: 1,
  codigo: 'A001',
  nombre: null,
  fechaNacimiento: null,
  fechaCompra: null,
  sexoKey: null,
  tipoIngresoId: null,
  madreId: null,
  codigoMadre: null,
  indTransferenciaEmb: null,
  codigoDonadora: null,
  tipoPadreKey: null,
  padreId: null,
  codigoPadre: null,
  codigoPajuela: null,
  configRazasId: null,
  potreroId: null,
  precioCompra: null,
  pesoCompra: null,
  codigoRfid: null,
  codigoArete: null,
  codigoQr: null,
  saludAnimalKey: null,
  estadoAnimalKey: null,
  indDescartado: null,
  activo: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// ============================================
// Usuario Factory
// ============================================
const usuarioDefaults = (): UsuarioEntity => ({
  id: 1,
  nombre: 'Test User',
  email: 'test@example.com',
  activo: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// ============================================
// Predio Factory
// ============================================
const predioDefaults = (): PredioEntity => ({
  id: 1,
  codigo: 'P001',
  nombre: 'Finca Test',
  departamento: null,
  municipio: null,
  vereda: null,
  areaHectareas: null,
  capacidadMaxima: null,
  tipoExplotacionId: null,
  activo: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// ============================================
// Notificacion Factory
// ============================================
const notificacionDefaults = (): Notificacion => ({
  id: 1,
  predioId: 1,
  usuarioId: 10,
  tipo: 'PARTO_PROXIMO',
  titulo: 'Parto próximo — Animal A001',
  mensaje: 'El animal A001 tiene un parto estimado',
  entidadTipo: 'animal',
  entidadId: 100,
  leida: 0,
  fechaEvento: new Date('2026-04-10'),
  createdAt: new Date(),
  activo: 1,
})

// ============================================
// Permiso Factory
// ============================================
const permisoDefaults = (): PermisoEntity => ({
  id: 1,
  modulo: 'usuarios',
  accion: 'read',
  nombre: 'Ver usuarios',
  createdAt: new Date(),
  activo: 1,
})

// ============================================
// Rol Factory
// ============================================
const rolDefaults = (): RolEntity => ({
  id: 1,
  nombre: 'ADMIN',
  descripcion: 'Administrador',
  esSistema: 1,
  createdAt: new Date(),
  activo: 1,
})

// ============================================
// Imagen Factory
// ============================================
const imagenDefaults = (): ImagenEntity => ({
  id: 1,
  predioId: 1,
  ruta: '/uploads/imagenes/test.jpg',
  nombreOriginal: 'test.jpg',
  mimeType: 'image/jpeg',
  tamanoBytes: 1024,
  descripcion: null,
  activo: 1,
  createdAt: new Date(),
})

// ============================================
// Animal-Imagen Factory
// ============================================
const animalImagenDefaults = (): AnimalImagenEntity => ({
  id: 1,
  animalId: 1,
  imagenId: 1,
  activo: 1,
  createdAt: new Date(),
})

// ============================================
// Export all factories
// ============================================
export const factories = {
  animal: createFactory(animalDefaults),
  usuario: createFactory(usuarioDefaults),
  predio: createFactory(predioDefaults),
  notificacion: createFactory(notificacionDefaults),
  permiso: createFactory(permisoDefaults),
  rol: createFactory(rolDefaults),
  imagen: createFactory(imagenDefaults),
  animalImagen: createFactory(animalImagenDefaults),
}

// Re-export types for convenience
export type { AnimalEntity, ImagenEntity, AnimalImagenEntity }
export type { UsuarioEntity }
export type { PredioEntity }
export type { Notificacion }
export type { PermisoEntity }
export type { RolEntity }

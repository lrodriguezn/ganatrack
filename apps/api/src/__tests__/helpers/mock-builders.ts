/**
 * Mock Repository Builders
 * 
 * Usage:
 *   import { mockBuilders } from './mock-builders'
 *   
 *   const mockAnimalRepo = mockBuilders.animal.build()
 *   const mockAuthRepo = mockBuilders.auth.build()
 */

import { vi } from 'vitest'
import type { IAuthRepository } from '../../modules/auth/domain/repositories/auth.repository.js'
import type { IUsuarioRepository } from '../../modules/usuarios/domain/repositories/usuario.repository.js'
import type { IAnimalRepository } from '../../modules/animales/domain/repositories/animal.repository.js'
import type { INotificacionRepository } from '../../modules/notificaciones/domain/repositories/notificacion.repository.js'
import type { IPredioRepository } from '../../modules/predios/domain/repositories/predio.repository.js'
import type { IPushTokenRepository } from '../../modules/notificaciones/domain/repositories/push-token.repository.js'
import type { IImagenRepository } from '../../modules/imagenes/domain/repositories/imagen.repository.js'
import type { IProductoRepository } from '../../modules/productos/domain/repositories/producto.repository.js'
import type { IHierroRepository } from '../../modules/maestros/domain/repositories/hierro.repository.js'
import type { IVeterinarioRepository } from '../../modules/maestros/domain/repositories/veterinario.repository.js'
import type { IPropietarioRepository } from '../../modules/maestros/domain/repositories/propietario.repository.js'
import type { IMotivoVentaRepository } from '../../modules/maestros/domain/repositories/motivo-venta.repository.js'
import type { ICausaMuerteRepository } from '../../modules/maestros/domain/repositories/causa-muerte.repository.js'
import type { ILugarCompraRepository } from '../../modules/maestros/domain/repositories/lugar-compra.repository.js'
import type { ILugarVentaRepository } from '../../modules/maestros/domain/repositories/lugar-venta.repository.js'
import type { IDiagnosticoVeterinarioRepository } from '../../modules/maestros/domain/repositories/diagnostico-veterinario.repository.js'
import type { IConfigKeyValueRepository } from '../../modules/configuracion/domain/repositories/config-key-value.repository.js'
import type { IConfigRazaRepository } from '../../modules/configuracion/domain/repositories/config-raza.repository.js'
import type { IConfigColorRepository } from '../../modules/configuracion/domain/repositories/config-color.repository.js'
import type { IConfigCondicionCorporalRepository } from '../../modules/configuracion/domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigTipoExplotacionRepository } from '../../modules/configuracion/domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigCalidadAnimalRepository } from '../../modules/configuracion/domain/repositories/config-calidad-animal.repository.js'
import type { IConfigRangoEdadRepository } from '../../modules/configuracion/domain/repositories/config-rango-edad.repository.js'
import type { IConfigParametroPredioRepository } from '../../modules/predios/domain/repositories/config-parametro-predio.repository.js'
import type { IPotreroRepository } from '../../modules/predios/domain/repositories/potrero.repository.js'
import type { ISectorRepository } from '../../modules/predios/domain/repositories/sector.repository.js'
import type { ILoteRepository } from '../../modules/predios/domain/repositories/lote.repository.js'
import type { IGrupoRepository } from '../../modules/predios/domain/repositories/grupo.repository.js'
import type { IPartoRepository } from '../../modules/servicios/domain/repositories/parto.repository.js'
import type { IInseminacionAnimalRepository } from '../../modules/servicios/domain/repositories/inseminacion-animal.repository.js'
import type { IInseminacionGrupalRepository } from '../../modules/servicios/domain/repositories/inseminacion-grupal.repository.js'
import type { IPalpacionAnimalRepository } from '../../modules/servicios/domain/repositories/palpacion-animal.repository.js'
import type { IPalpacionGrupalRepository } from '../../modules/servicios/domain/repositories/palpacion-grupal.repository.js'
import type { IVeterinarioAnimalRepository } from '../../modules/servicios/domain/repositories/veterinario-animal.repository.js'
import type { IVeterinarioGrupalRepository } from '../../modules/servicios/domain/repositories/veterinario-grupal.repository.js'
import type { IExportJobRepository } from '../../modules/reportes/domain/repositories/export-job.repository.js'

/**
 * Create a mock repository with all methods as vi.fn()
 * Defaults to returning null/undefined/empty arrays for fetch methods
 */
function createMockRepo<T extends Record<string, unknown>>(methods: T): T {
  const mock = {} as T
  for (const key of Object.keys(methods)) {
    mock[key as keyof T] = vi.fn() as T[keyof T]
  }
  return mock
}

// ============================================
// Auth Repository Mock
// ============================================
function buildAuthRepo(): IAuthRepository {
  return createMockRepo<IAuthRepository>({
    findUsuarioById: vi.fn().mockResolvedValue(null),
    findUsuarioByEmail: vi.fn().mockResolvedValue(null),
    getContrasenaHash: vi.fn().mockResolvedValue(null),
    getRoles: vi.fn().mockResolvedValue([]),
    getPermisos: vi.fn().mockResolvedValue([]),
    getPredioIds: vi.fn().mockResolvedValue([]),
    getTwoFactor: vi.fn().mockResolvedValue(null),
    saveTwoFactorCode: vi.fn().mockResolvedValue(undefined),
    incrementTwoFactorAttempts: vi.fn().mockResolvedValue(undefined),
    resetTwoFactorAttempts: vi.fn().mockResolvedValue(undefined),
    saveRefreshToken: vi.fn().mockResolvedValue(undefined),
    findRefreshToken: vi.fn().mockResolvedValue(null),
    revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    savePasswordHistory: vi.fn().mockResolvedValue(undefined),
    getPasswordHistory: vi.fn().mockResolvedValue([]),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    revokeAllUserTokens: vi.fn().mockResolvedValue(undefined),
  })
}

// ============================================
// Usuario Repository Mock
// ============================================
function buildUsuarioRepo(): IUsuarioRepository {
  return createMockRepo<IUsuarioRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    deactivate: vi.fn().mockResolvedValue(false),
    existsByEmail: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Animal Repository Mock
// ============================================
function buildAnimalRepo(): IAnimalRepository {
  return createMockRepo<IAnimalRepository>({
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findById: vi.fn().mockResolvedValue(null),
    findByCodigo: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    softDelete: vi.fn().mockResolvedValue(false),
    getGenealogy: vi.fn().mockResolvedValue({ ancestors: [], descendants: [] }),
  })
}

// ============================================
// Notificacion Repository Mock
// ============================================
function buildNotificacionRepo(): INotificacionRepository {
  return createMockRepo<INotificacionRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByPredio: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    countByTipo: vi.fn().mockResolvedValue({}),
    countNoLeidas: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({} as any),
    markAsRead: vi.fn().mockResolvedValue(false),
    markAllAsRead: vi.fn().mockResolvedValue(0),
    softDelete: vi.fn().mockResolvedValue(false),
    existsSimilar: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Predio Repository Mock
// ============================================
function buildPredioRepo(): IPredioRepository {
  return createMockRepo<IPredioRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    existsByCodigo: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Push Token Repository Mock
// ============================================
function buildPushTokenRepo(): IPushTokenRepository {
  return createMockRepo<IPushTokenRepository>({
    findByUsuario: vi.fn().mockResolvedValue([]),
    findByToken: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(false),
    deleteByUsuario: vi.fn().mockResolvedValue(0),
  })
}

// ============================================
// Imagen Repository Mock
// ============================================
function buildImagenRepo(): IImagenRepository {
  return createMockRepo<IImagenRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByAnimal: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Producto Repository Mock
// ============================================
function buildProductoRepo(): IProductoRepository {
  return createMockRepo<IProductoRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    updateStock: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Hierro Repository Mock
// ============================================
function buildHierroRepo(): IHierroRepository {
  return createMockRepo<IHierroRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Veterinario Repository Mock
// ============================================
function buildVeterinarioRepo(): IVeterinarioRepository {
  return createMockRepo<IVeterinarioRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Propietario Repository Mock
// ============================================
function buildPropietarioRepo(): IPropietarioRepository {
  return createMockRepo<IPropietarioRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// MotivoVenta Repository Mock
// ============================================
function buildMotivoVentaRepo(): IMotivoVentaRepository {
  return createMockRepo<IMotivoVentaRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// CausaMuerte Repository Mock
// ============================================
function buildCausaMuerteRepo(): ICausaMuerteRepository {
  return createMockRepo<ICausaMuerteRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// LugarCompra Repository Mock
// ============================================
function buildLugarCompraRepo(): ILugarCompraRepository {
  return createMockRepo<ILugarCompraRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// LugarVenta Repository Mock
// ============================================
function buildLugarVentaRepo(): ILugarVentaRepository {
  return createMockRepo<ILugarVentaRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// DiagnosticoVeterinario Repository Mock
// ============================================
function buildDiagnosticoVeterinarioRepo(): IDiagnosticoVeterinarioRepository {
  return createMockRepo<IDiagnosticoVeterinarioRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigKeyValue Repository Mock
// ============================================
function buildConfigKeyValueRepo(): IConfigKeyValueRepository {
  return createMockRepo<IConfigKeyValueRepository>({
    findByKey: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigRaza Repository Mock
// ============================================
function buildConfigRazaRepo(): IConfigRazaRepository {
  return createMockRepo<IConfigRazaRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigColor Repository Mock
// ============================================
function buildConfigColorRepo(): IConfigColorRepository {
  return createMockRepo<IConfigColorRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigCondicionCorporal Repository Mock
// ============================================
function buildConfigCondicionCorporalRepo(): IConfigCondicionCorporalRepository {
  return createMockRepo<IConfigCondicionCorporalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigTipoExplotacion Repository Mock
// ============================================
function buildConfigTipoExplotacionRepo(): IConfigTipoExplotacionRepository {
  return createMockRepo<IConfigTipoExplotacionRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigCalidadAnimal Repository Mock
// ============================================
function buildConfigCalidadAnimalRepo(): IConfigCalidadAnimalRepository {
  return createMockRepo<IConfigCalidadAnimalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigRangoEdad Repository Mock
// ============================================
function buildConfigRangoEdadRepo(): IConfigRangoEdadRepository {
  return createMockRepo<IConfigRangoEdadRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ConfigParametroPredio Repository Mock
// ============================================
function buildConfigParametroPredioRepo(): IConfigParametroPredioRepository {
  return createMockRepo<IConfigParametroPredioRepository>({
    findByPredio: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue({} as any),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Potrero Repository Mock
// ============================================
function buildPotreroRepo(): IPotreroRepository {
  return createMockRepo<IPotreroRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByPredio: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Sector Repository Mock
// ============================================
function buildSectorRepo(): ISectorRepository {
  return createMockRepo<ISectorRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByPredio: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Lote Repository Mock
// ============================================
function buildLoteRepo(): ILoteRepository {
  return createMockRepo<ILoteRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByPredio: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Grupo Repository Mock
// ============================================
function buildGrupoRepo(): IGrupoRepository {
  return createMockRepo<IGrupoRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByPredio: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Parto Repository Mock
// ============================================
function buildPartoRepo(): IPartoRepository {
  return createMockRepo<IPartoRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByAnimal: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// InseminacionAnimal Repository Mock
// ============================================
function buildInseminacionAnimalRepo(): IInseminacionAnimalRepository {
  return createMockRepo<IInseminacionAnimalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByAnimal: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// InseminacionGrupal Repository Mock
// ============================================
function buildInseminacionGrupalRepo(): IInseminacionGrupalRepository {
  return createMockRepo<IInseminacionGrupalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByGrupo: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// PalpacionAnimal Repository Mock
// ============================================
function buildPalpacionAnimalRepo(): IPalpacionAnimalRepository {
  return createMockRepo<IPalpacionAnimalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByAnimal: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// PalpacionGrupal Repository Mock
// ============================================
function buildPalpacionGrupalRepo(): IPalpacionGrupalRepository {
  return createMockRepo<IPalpacionGrupalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByGrupo: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// VeterinarioAnimal Repository Mock
// ============================================
function buildVeterinarioAnimalRepo(): IVeterinarioAnimalRepository {
  return createMockRepo<IVeterinarioAnimalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByAnimal: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// VeterinarioGrupal Repository Mock
// ============================================
function buildVeterinarioGrupalRepo(): IVeterinarioGrupalRepository {
  return createMockRepo<IVeterinarioGrupalRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByGrupo: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// ExportJob Repository Mock
// ============================================
function buildExportJobRepo(): IExportJobRepository {
  return createMockRepo<IExportJobRepository>({
    findById: vi.fn().mockResolvedValue(null),
    findByUser: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({} as any),
    updateStatus: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
  })
}

// ============================================
// Export all mock builders
// ============================================
export const mockBuilders = {
  auth: { build: buildAuthRepo },
  usuario: { build: buildUsuarioRepo },
  animal: { build: buildAnimalRepo },
  notificacion: { build: buildNotificacionRepo },
  predic: { build: buildPredioRepo },
  pushToken: { build: buildPushTokenRepo },
  imagen: { build: buildImagenRepo },
  producto: { build: buildProductoRepo },
  hierro: { build: buildHierroRepo },
  veterinario: { build: buildVeterinarioRepo },
  propietario: { build: buildPropietarioRepo },
  motivoVenta: { build: buildMotivoVentaRepo },
  causaMuerte: { build: buildCausaMuerteRepo },
  lugarCompra: { build: buildLugarCompraRepo },
  lugarVenta: { build: buildLugarVentaRepo },
  diagnosticoVeterinario: { build: buildDiagnosticoVeterinarioRepo },
  configKeyValue: { build: buildConfigKeyValueRepo },
  configRaza: { build: buildConfigRazaRepo },
  configColor: { build: buildConfigColorRepo },
  configCondicionCorporal: { build: buildConfigCondicionCorporalRepo },
  configTipoExplotacion: { build: buildConfigTipoExplotacionRepo },
  configCalidadAnimal: { build: buildConfigCalidadAnimalRepo },
  configRangoEdad: { build: buildConfigRangoEdadRepo },
  configParametroPredio: { build: buildConfigParametroPredioRepo },
  potrero: { build: buildPotreroRepo },
  sector: { build: buildSectorRepo },
  lote: { build: buildLoteRepo },
  grupo: { build: buildGrupoRepo },
  parto: { build: buildPartoRepo },
  inseminacionAnimal: { build: buildInseminacionAnimalRepo },
  inseminacionGrupal: { build: buildInseminacionGrupalRepo },
  palpacionAnimal: { build: buildPalpacionAnimalRepo },
  palpacionGrupal: { build: buildPalpacionGrupalRepo },
  veterinarioAnimal: { build: buildVeterinarioAnimalRepo },
  veterinarioGrupal: { build: buildVeterinarioGrupalRepo },
  exportJob: { build: buildExportJobRepo },
}

// Re-export repository types
export type { IAuthRepository }
export type { IUsuarioRepository }
export type { IAnimalRepository }
export type { INotificacionRepository }
export type { IPredioRepository }

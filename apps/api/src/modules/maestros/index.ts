import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repositories
import { VETERINARIO_REPOSITORY } from './domain/repositories/veterinario.repository.js'
import type { IVeterinarioRepository } from './domain/repositories/veterinario.repository.js'
import { PROPIETARIO_REPOSITORY } from './domain/repositories/propietario.repository.js'
import type { IPropietarioRepository } from './domain/repositories/propietario.repository.js'
import { HIERRO_REPOSITORY } from './domain/repositories/hierro.repository.js'
import type { IHierroRepository } from './domain/repositories/hierro.repository.js'
import { DIAGNOSTICO_VETERINARIO_REPOSITORY } from './domain/repositories/diagnostico-veterinario.repository.js'
import type { IDiagnosticoVeterinarioRepository } from './domain/repositories/diagnostico-veterinario.repository.js'
import { MOTIVO_VENTA_REPOSITORY } from './domain/repositories/motivo-venta.repository.js'
import type { IMotivoVentaRepository } from './domain/repositories/motivo-venta.repository.js'
import { CAUSA_MUERTE_REPOSITORY } from './domain/repositories/causa-muerte.repository.js'
import type { ICausaMuerteRepository } from './domain/repositories/causa-muerte.repository.js'
import { LUGAR_COMPRA_REPOSITORY } from './domain/repositories/lugar-compra.repository.js'
import type { ILugarCompraRepository } from './domain/repositories/lugar-compra.repository.js'
import { LUGAR_VENTA_REPOSITORY } from './domain/repositories/lugar-venta.repository.js'
import type { ILugarVentaRepository } from './domain/repositories/lugar-venta.repository.js'

// Drizzle repositories
import { DrizzleVeterinarioRepository } from './infrastructure/persistence/drizzle-veterinario.repository.js'
import { DrizzlePropietarioRepository } from './infrastructure/persistence/drizzle-propietario.repository.js'
import { DrizzleHierroRepository } from './infrastructure/persistence/drizzle-hierro.repository.js'
import { DrizzleDiagnosticoVeterinarioRepository } from './infrastructure/persistence/drizzle-diagnostico-veterinario.repository.js'
import { DrizzleMotivoVentaRepository } from './infrastructure/persistence/drizzle-motivo-venta.repository.js'
import { DrizzleCausaMuerteRepository } from './infrastructure/persistence/drizzle-causa-muerte.repository.js'
import { DrizzleLugarCompraRepository } from './infrastructure/persistence/drizzle-lugar-compra.repository.js'
import { DrizzleLugarVentaRepository } from './infrastructure/persistence/drizzle-lugar-venta.repository.js'

// Use cases
import { CrearVeterinarioUseCase } from './application/use-cases/crear-veterinario.use-case.js'
import { GetVeterinarioUseCase } from './application/use-cases/get-veterinario.use-case.js'
import { ListVeterinariosUseCase } from './application/use-cases/list-veterinarios.use-case.js'
import { UpdateVeterinarioUseCase } from './application/use-cases/update-veterinario.use-case.js'
import { DeleteVeterinarioUseCase } from './application/use-cases/delete-veterinario.use-case.js'
import { CrearPropietarioUseCase } from './application/use-cases/crear-propietario.use-case.js'
import { GetPropietarioUseCase } from './application/use-cases/get-propietario.use-case.js'
import { ListPropietariosUseCase } from './application/use-cases/list-propietarios.use-case.js'
import { UpdatePropietarioUseCase } from './application/use-cases/update-propietario.use-case.js'
import { DeletePropietarioUseCase } from './application/use-cases/delete-propietario.use-case.js'
import { CrearHierroUseCase } from './application/use-cases/crear-hierro.use-case.js'
import { GetHierroUseCase } from './application/use-cases/get-hierro.use-case.js'
import { ListHierrosUseCase } from './application/use-cases/list-hierros.use-case.js'
import { UpdateHierroUseCase } from './application/use-cases/update-hierro.use-case.js'
import { DeleteHierroUseCase } from './application/use-cases/delete-hierro.use-case.js'
import { CrearDiagnosticoVeterinarioUseCase } from './application/use-cases/crear-diagnostico-veterinario.use-case.js'
import { GetDiagnosticoVeterinarioUseCase } from './application/use-cases/get-diagnostico-veterinario.use-case.js'
import { ListDiagnosticosVeterinariosUseCase } from './application/use-cases/list-diagnosticos-veterinarios.use-case.js'
import { UpdateDiagnosticoVeterinarioUseCase } from './application/use-cases/update-diagnostico-veterinario.use-case.js'
import { DeleteDiagnosticoVeterinarioUseCase } from './application/use-cases/delete-diagnostico-veterinario.use-case.js'
import { CrearMotivoVentaUseCase } from './application/use-cases/crear-motivo-venta.use-case.js'
import { GetMotivoVentaUseCase } from './application/use-cases/get-motivo-venta.use-case.js'
import { ListMotivosVentasUseCase } from './application/use-cases/list-motivos-ventas.use-case.js'
import { UpdateMotivoVentaUseCase } from './application/use-cases/update-motivo-venta.use-case.js'
import { DeleteMotivoVentaUseCase } from './application/use-cases/delete-motivo-venta.use-case.js'
import { CrearCausaMuerteUseCase } from './application/use-cases/crear-causa-muerte.use-case.js'
import { GetCausaMuerteUseCase } from './application/use-cases/get-causa-muerte.use-case.js'
import { ListCausasMuerteUseCase } from './application/use-cases/list-causas-muerte.use-case.js'
import { UpdateCausaMuerteUseCase } from './application/use-cases/update-causa-muerte.use-case.js'
import { DeleteCausaMuerteUseCase } from './application/use-cases/delete-causa-muerte.use-case.js'
import { CrearLugarCompraUseCase } from './application/use-cases/crear-lugar-compra.use-case.js'
import { GetLugarCompraUseCase } from './application/use-cases/get-lugar-compra.use-case.js'
import { ListLugaresComprasUseCase } from './application/use-cases/list-lugares-compras.use-case.js'
import { UpdateLugarCompraUseCase } from './application/use-cases/update-lugar-compra.use-case.js'
import { DeleteLugarCompraUseCase } from './application/use-cases/delete-lugar-compra.use-case.js'
import { CrearLugarVentaUseCase } from './application/use-cases/crear-lugar-venta.use-case.js'
import { GetLugarVentaUseCase } from './application/use-cases/get-lugar-venta.use-case.js'
import { ListLugaresVentasUseCase } from './application/use-cases/list-lugares-ventas.use-case.js'
import { UpdateLugarVentaUseCase } from './application/use-cases/update-lugar-venta.use-case.js'
import { DeleteLugarVentaUseCase } from './application/use-cases/delete-lugar-venta.use-case.js'

import { registerMaestrosRoutes } from './infrastructure/http/routes/maestros.routes.js'

export {
  VETERINARIO_REPOSITORY, PROPIETARIO_REPOSITORY, HIERRO_REPOSITORY,
  DIAGNOSTICO_VETERINARIO_REPOSITORY, MOTIVO_VENTA_REPOSITORY, CAUSA_MUERTE_REPOSITORY,
  LUGAR_COMPRA_REPOSITORY, LUGAR_VENTA_REPOSITORY,
}

const MAESTROS_DB_CLIENT = Symbol('MaestrosDbClient')

export function registerMaestrosModule(): void {
  const db = createClient()
  container.registerInstance<DbClient>(MAESTROS_DB_CLIENT, db)

  container.registerSingleton<IVeterinarioRepository>(VETERINARIO_REPOSITORY, DrizzleVeterinarioRepository)
  container.registerSingleton<IPropietarioRepository>(PROPIETARIO_REPOSITORY, DrizzlePropietarioRepository)
  container.registerSingleton<IHierroRepository>(HIERRO_REPOSITORY, DrizzleHierroRepository)
  container.registerSingleton<IDiagnosticoVeterinarioRepository>(DIAGNOSTICO_VETERINARIO_REPOSITORY, DrizzleDiagnosticoVeterinarioRepository)
  container.registerSingleton<IMotivoVentaRepository>(MOTIVO_VENTA_REPOSITORY, DrizzleMotivoVentaRepository)
  container.registerSingleton<ICausaMuerteRepository>(CAUSA_MUERTE_REPOSITORY, DrizzleCausaMuerteRepository)
  container.registerSingleton<ILugarCompraRepository>(LUGAR_COMPRA_REPOSITORY, DrizzleLugarCompraRepository)
  container.registerSingleton<ILugarVentaRepository>(LUGAR_VENTA_REPOSITORY, DrizzleLugarVentaRepository)

  container.registerSingleton(CrearVeterinarioUseCase)
  container.registerSingleton(GetVeterinarioUseCase)
  container.registerSingleton(ListVeterinariosUseCase)
  container.registerSingleton(UpdateVeterinarioUseCase)
  container.registerSingleton(DeleteVeterinarioUseCase)
  container.registerSingleton(CrearPropietarioUseCase)
  container.registerSingleton(GetPropietarioUseCase)
  container.registerSingleton(ListPropietariosUseCase)
  container.registerSingleton(UpdatePropietarioUseCase)
  container.registerSingleton(DeletePropietarioUseCase)
  container.registerSingleton(CrearHierroUseCase)
  container.registerSingleton(GetHierroUseCase)
  container.registerSingleton(ListHierrosUseCase)
  container.registerSingleton(UpdateHierroUseCase)
  container.registerSingleton(DeleteHierroUseCase)
  container.registerSingleton(CrearDiagnosticoVeterinarioUseCase)
  container.registerSingleton(GetDiagnosticoVeterinarioUseCase)
  container.registerSingleton(ListDiagnosticosVeterinariosUseCase)
  container.registerSingleton(UpdateDiagnosticoVeterinarioUseCase)
  container.registerSingleton(DeleteDiagnosticoVeterinarioUseCase)
  container.registerSingleton(CrearMotivoVentaUseCase)
  container.registerSingleton(GetMotivoVentaUseCase)
  container.registerSingleton(ListMotivosVentasUseCase)
  container.registerSingleton(UpdateMotivoVentaUseCase)
  container.registerSingleton(DeleteMotivoVentaUseCase)
  container.registerSingleton(CrearCausaMuerteUseCase)
  container.registerSingleton(GetCausaMuerteUseCase)
  container.registerSingleton(ListCausasMuerteUseCase)
  container.registerSingleton(UpdateCausaMuerteUseCase)
  container.registerSingleton(DeleteCausaMuerteUseCase)
  container.registerSingleton(CrearLugarCompraUseCase)
  container.registerSingleton(GetLugarCompraUseCase)
  container.registerSingleton(ListLugaresComprasUseCase)
  container.registerSingleton(UpdateLugarCompraUseCase)
  container.registerSingleton(DeleteLugarCompraUseCase)
  container.registerSingleton(CrearLugarVentaUseCase)
  container.registerSingleton(GetLugarVentaUseCase)
  container.registerSingleton(ListLugaresVentasUseCase)
  container.registerSingleton(UpdateLugarVentaUseCase)
  container.registerSingleton(DeleteLugarVentaUseCase)
}

export async function registerMaestrosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerMaestrosRoutes(app)
}

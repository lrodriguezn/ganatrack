import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import type { IVeterinarioRepository } from './domain/repositories/veterinario.repository.js'
import type { IPropietarioRepository } from './domain/repositories/propietario.repository.js'
import type { IHierroRepository } from './domain/repositories/hierro.repository.js'
import type { IDiagnosticoVeterinarioRepository } from './domain/repositories/diagnostico-veterinario.repository.js'
import type { IMotivoVentaRepository } from './domain/repositories/motivo-venta.repository.js'
import type { ICausaMuerteRepository } from './domain/repositories/causa-muerte.repository.js'
import type { ILugarCompraRepository } from './domain/repositories/lugar-compra.repository.js'
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

import { registerMaestrosRoutes } from './infrastructure/http/routes/maestros.routes.js'

export function registerMaestrosModule(): void {}

export async function registerMaestrosModuleRoutes(app: FastifyInstance): Promise<void> {
  const db: DbClient = createClient()
  
  const repo = {
    veterinarioRepo: new DrizzleVeterinarioRepository(db) as IVeterinarioRepository,
    propietarioRepo: new DrizzlePropietarioRepository(db) as IPropietarioRepository,
    hierroRepo: new DrizzleHierroRepository(db) as IHierroRepository,
    diagnosticoRepo: new DrizzleDiagnosticoVeterinarioRepository(db) as IDiagnosticoVeterinarioRepository,
    motivoVentaRepo: new DrizzleMotivoVentaRepository(db) as IMotivoVentaRepository,
    causaMuerteRepo: new DrizzleCausaMuerteRepository(db) as ICausaMuerteRepository,
    lugarCompraRepo: new DrizzleLugarCompraRepository(db) as ILugarCompraRepository,
    lugarVentaRepo: new DrizzleLugarVentaRepository(db) as ILugarVentaRepository,
  }

  await registerMaestrosRoutes(app, repo)
}

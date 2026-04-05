import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { PALPACION_GRUPAL_REPOSITORY } from './domain/repositories/palpacion-grupal.repository.js'
import { PALPACION_ANIMAL_REPOSITORY } from './domain/repositories/palpacion-animal.repository.js'
import { INSEMINACION_GRUPAL_REPOSITORY } from './domain/repositories/inseminacion-grupal.repository.js'
import { INSEMINACION_ANIMAL_REPOSITORY } from './domain/repositories/inseminacion-animal.repository.js'
import { PARTO_ANIMAL_REPOSITORY } from './domain/repositories/parto-animal.repository.js'
import { PARTO_CRIA_REPOSITORY } from './domain/repositories/parto-cria.repository.js'
import { VETERINARIO_GRUPAL_REPOSITORY } from './domain/repositories/veterinario-grupal.repository.js'
import { VETERINARIO_ANIMAL_REPOSITORY } from './domain/repositories/veterinario-animal.repository.js'
import { VETERINARIO_PRODUCTO_REPOSITORY } from './domain/repositories/veterinario-producto.repository.js'

// Drizzle repositories
import { DrizzlePalpacionGrupalRepository } from './infrastructure/persistence/drizzle-palpacion-grupal.repository.js'
import { DrizzlePalpacionAnimalRepository } from './infrastructure/persistence/drizzle-palpacion-animal.repository.js'
import { DrizzleInseminacionGrupalRepository } from './infrastructure/persistence/drizzle-inseminacion-grupal.repository.js'
import { DrizzleInseminacionAnimalRepository } from './infrastructure/persistence/drizzle-inseminacion-animal.repository.js'
import { DrizzlePartoAnimalRepository } from './infrastructure/persistence/drizzle-parto-animal.repository.js'
import { DrizzlePartoCriaRepository } from './infrastructure/persistence/drizzle-parto-cria.repository.js'
import { DrizzleVeterinarioGrupalRepository } from './infrastructure/persistence/drizzle-veterinario-grupal.repository.js'
import { DrizzleVeterinarioAnimalRepository } from './infrastructure/persistence/drizzle-veterinario-animal.repository.js'
import { DrizzleVeterinarioProductoRepository } from './infrastructure/persistence/drizzle-veterinario-producto.repository.js'

// Transaction manager
import { DrizzleTransactionManager } from '../../shared/services/transaction-manager.js'
import type { ITransactionManager } from '../../shared/types/transaction.js'

// Use cases - Palpaciones
import { ListPalpacionesGrupalesUseCase } from './application/use-cases/list-palpaciones-grupales.use-case.js'
import { GetPalpacionGrupalUseCase } from './application/use-cases/get-palpacion-grupal.use-case.js'
import { CrearPalpacionGrupalUseCase } from './application/use-cases/crear-palpacion-grupal.use-case.js'
import { UpdatePalpacionGrupalUseCase } from './application/use-cases/update-palpacion-grupal.use-case.js'
import { DeletePalpacionGrupalUseCase } from './application/use-cases/delete-palpacion-grupal.use-case.js'
import { AddPalpacionAnimalUseCase } from './application/use-cases/add-palpacion-animal.use-case.js'
import { UpdatePalpacionAnimalUseCase } from './application/use-cases/update-palpacion-animal.use-case.js'
import { RemovePalpacionAnimalUseCase } from './application/use-cases/remove-palpacion-animal.use-case.js'

// Use cases - Inseminaciones
import { ListInseminacionesGrupalesUseCase } from './application/use-cases/list-inseminaciones-grupales.use-case.js'
import { GetInseminacionGrupalUseCase } from './application/use-cases/get-inseminacion-grupal.use-case.js'
import { CrearInseminacionGrupalUseCase } from './application/use-cases/crear-inseminacion-grupal.use-case.js'
import { UpdateInseminacionGrupalUseCase } from './application/use-cases/update-inseminacion-grupal.use-case.js'
import { DeleteInseminacionGrupalUseCase } from './application/use-cases/delete-inseminacion-grupal.use-case.js'
import { AddInseminacionAnimalUseCase } from './application/use-cases/add-inseminacion-animal.use-case.js'
import { UpdateInseminacionAnimalUseCase } from './application/use-cases/update-inseminacion-animal.use-case.js'
import { RemoveInseminacionAnimalUseCase } from './application/use-cases/remove-inseminacion-animal.use-case.js'

// Use cases - Partos
import { ListPartosUseCase } from './application/use-cases/list-partos.use-case.js'
import { GetPartoUseCase } from './application/use-cases/get-parto.use-case.js'
import { CrearPartoUseCase } from './application/use-cases/crear-parto.use-case.js'
import { UpdatePartoUseCase } from './application/use-cases/update-parto.use-case.js'
import { DeletePartoUseCase } from './application/use-cases/delete-parto.use-case.js'

// Use cases - Veterinarios
import { ListVeterinariosGrupalesUseCase } from './application/use-cases/list-veterinarios-grupales.use-case.js'
import { GetVeterinarioGrupalUseCase } from './application/use-cases/get-veterinario-grupal.use-case.js'
import { CrearVeterinarioGrupalUseCase } from './application/use-cases/crear-veterinario-grupal.use-case.js'
import { UpdateVeterinarioGrupalUseCase } from './application/use-cases/update-veterinario-grupal.use-case.js'
import { DeleteVeterinarioGrupalUseCase } from './application/use-cases/delete-veterinario-grupal.use-case.js'
import { AddVeterinarioAnimalUseCase } from './application/use-cases/add-veterinario-animal.use-case.js'
import { UpdateVeterinarioAnimalUseCase } from './application/use-cases/update-veterinario-animal.use-case.js'
import { RemoveVeterinarioAnimalUseCase } from './application/use-cases/remove-veterinario-animal.use-case.js'

// Routes
import { registerServiciosRoutes } from './infrastructure/http/routes/servicios.routes.js'

// DI token for transaction manager
const SERVICIOS_DB_CLIENT = Symbol('ServiciosDbClient')

export function registerServiciosModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(SERVICIOS_DB_CLIENT, db)

  // Register transaction manager
  container.registerSingleton<ITransactionManager>('ITransactionManager', DrizzleTransactionManager)

  // Register repositories
  container.registerSingleton(PALPACION_GRUPAL_REPOSITORY, DrizzlePalpacionGrupalRepository)
  container.registerSingleton(PALPACION_ANIMAL_REPOSITORY, DrizzlePalpacionAnimalRepository)
  container.registerSingleton(INSEMINACION_GRUPAL_REPOSITORY, DrizzleInseminacionGrupalRepository)
  container.registerSingleton(INSEMINACION_ANIMAL_REPOSITORY, DrizzleInseminacionAnimalRepository)
  container.registerSingleton(PARTO_ANIMAL_REPOSITORY, DrizzlePartoAnimalRepository)
  container.registerSingleton(PARTO_CRIA_REPOSITORY, DrizzlePartoCriaRepository)
  container.registerSingleton(VETERINARIO_GRUPAL_REPOSITORY, DrizzleVeterinarioGrupalRepository)
  container.registerSingleton(VETERINARIO_ANIMAL_REPOSITORY, DrizzleVeterinarioAnimalRepository)
  container.registerSingleton(VETERINARIO_PRODUCTO_REPOSITORY, DrizzleVeterinarioProductoRepository)

  // Register use cases - Palpaciones
  container.registerSingleton(ListPalpacionesGrupalesUseCase)
  container.registerSingleton(GetPalpacionGrupalUseCase)
  container.registerSingleton(CrearPalpacionGrupalUseCase)
  container.registerSingleton(UpdatePalpacionGrupalUseCase)
  container.registerSingleton(DeletePalpacionGrupalUseCase)
  container.registerSingleton(AddPalpacionAnimalUseCase)
  container.registerSingleton(UpdatePalpacionAnimalUseCase)
  container.registerSingleton(RemovePalpacionAnimalUseCase)

  // Register use cases - Inseminaciones
  container.registerSingleton(ListInseminacionesGrupalesUseCase)
  container.registerSingleton(GetInseminacionGrupalUseCase)
  container.registerSingleton(CrearInseminacionGrupalUseCase)
  container.registerSingleton(UpdateInseminacionGrupalUseCase)
  container.registerSingleton(DeleteInseminacionGrupalUseCase)
  container.registerSingleton(AddInseminacionAnimalUseCase)
  container.registerSingleton(UpdateInseminacionAnimalUseCase)
  container.registerSingleton(RemoveInseminacionAnimalUseCase)

  // Register use cases - Partos
  container.registerSingleton(ListPartosUseCase)
  container.registerSingleton(GetPartoUseCase)
  container.registerSingleton(CrearPartoUseCase)
  container.registerSingleton(UpdatePartoUseCase)
  container.registerSingleton(DeletePartoUseCase)

  // Register use cases - Veterinarios
  container.registerSingleton(ListVeterinariosGrupalesUseCase)
  container.registerSingleton(GetVeterinarioGrupalUseCase)
  container.registerSingleton(CrearVeterinarioGrupalUseCase)
  container.registerSingleton(UpdateVeterinarioGrupalUseCase)
  container.registerSingleton(DeleteVeterinarioGrupalUseCase)
  container.registerSingleton(AddVeterinarioAnimalUseCase)
  container.registerSingleton(UpdateVeterinarioAnimalUseCase)
  container.registerSingleton(RemoveVeterinarioAnimalUseCase)
}

export async function registerServiciosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerServiciosRoutes(app)
}

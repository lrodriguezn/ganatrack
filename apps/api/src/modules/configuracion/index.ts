import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Repository interfaces
import { CONFIG_RAZA_REPOSITORY } from './domain/repositories/config-raza.repository.js'
import type { IConfigRazaRepository } from './domain/repositories/config-raza.repository.js'
import { CONFIG_CONDICION_CORPORAL_REPOSITORY } from './domain/repositories/config-condicion-corporal.repository.js'
import type { IConfigCondicionCorporalRepository } from './domain/repositories/config-condicion-corporal.repository.js'
import { CONFIG_TIPO_EXPLOTACION_REPOSITORY } from './domain/repositories/config-tipo-explotacion.repository.js'
import type { IConfigTipoExplotacionRepository } from './domain/repositories/config-tipo-explotacion.repository.js'
import { CONFIG_CALIDAD_ANIMAL_REPOSITORY } from './domain/repositories/config-calidad-animal.repository.js'
import type { IConfigCalidadAnimalRepository } from './domain/repositories/config-calidad-animal.repository.js'
import { CONFIG_COLOR_REPOSITORY } from './domain/repositories/config-color.repository.js'
import type { IConfigColorRepository } from './domain/repositories/config-color.repository.js'
import { CONFIG_RANGO_EDAD_REPOSITORY } from './domain/repositories/config-rango-edad.repository.js'
import type { IConfigRangoEdadRepository } from './domain/repositories/config-rango-edad.repository.js'
import { CONFIG_KEY_VALUE_REPOSITORY } from './domain/repositories/config-key-value.repository.js'
import type { IConfigKeyValueRepository } from './domain/repositories/config-key-value.repository.js'

// Drizzle repositories
import { DrizzleConfigRazaRepository } from './infrastructure/persistence/drizzle-config-raza.repository.js'
import { DrizzleConfigCondicionCorporalRepository } from './infrastructure/persistence/drizzle-config-condicion-corporal.repository.js'
import { DrizzleConfigTipoExplotacionRepository } from './infrastructure/persistence/drizzle-config-tipo-explotacion.repository.js'
import { DrizzleConfigCalidadAnimalRepository } from './infrastructure/persistence/drizzle-config-calidad-animal.repository.js'
import { DrizzleConfigColorRepository } from './infrastructure/persistence/drizzle-config-color.repository.js'
import { DrizzleConfigRangoEdadRepository } from './infrastructure/persistence/drizzle-config-rango-edad.repository.js'
import { DrizzleConfigKeyValueRepository } from './infrastructure/persistence/drizzle-config-key-value.repository.js'

// Use cases
import { CrearConfigRazaUseCase } from './application/use-cases/crear-config-raza.use-case.js'
import { GetConfigRazaUseCase } from './application/use-cases/get-config-raza.use-case.js'
import { ListConfigRazasUseCase } from './application/use-cases/list-config-razas.use-case.js'
import { UpdateConfigRazaUseCase } from './application/use-cases/update-config-raza.use-case.js'
import { DeleteConfigRazaUseCase } from './application/use-cases/delete-config-raza.use-case.js'
import { CrearConfigCondicionCorporalUseCase } from './application/use-cases/crear-config-condicion-corporal.use-case.js'
import { GetConfigCondicionCorporalUseCase } from './application/use-cases/get-config-condicion-corporal.use-case.js'
import { ListConfigCondicionesCorporalesUseCase } from './application/use-cases/list-config-condiciones-corporales.use-case.js'
import { UpdateConfigCondicionCorporalUseCase } from './application/use-cases/update-config-condicion-corporal.use-case.js'
import { DeleteConfigCondicionCorporalUseCase } from './application/use-cases/delete-config-condicion-corporal.use-case.js'
import { CrearConfigTipoExplotacionUseCase } from './application/use-cases/crear-config-tipo-explotacion.use-case.js'
import { GetConfigTipoExplotacionUseCase } from './application/use-cases/get-config-tipo-explotacion.use-case.js'
import { ListConfigTiposExplotacionUseCase } from './application/use-cases/list-config-tipos-explotacion.use-case.js'
import { UpdateConfigTipoExplotacionUseCase } from './application/use-cases/update-config-tipo-explotacion.use-case.js'
import { DeleteConfigTipoExplotacionUseCase } from './application/use-cases/delete-config-tipo-explotacion.use-case.js'
import { CrearConfigCalidadAnimalUseCase } from './application/use-cases/crear-config-calidad-animal.use-case.js'
import { GetConfigCalidadAnimalUseCase } from './application/use-cases/get-config-calidad-animal.use-case.js'
import { ListConfigCalidadesAnimalesUseCase } from './application/use-cases/list-config-calidades-animales.use-case.js'
import { UpdateConfigCalidadAnimalUseCase } from './application/use-cases/update-config-calidad-animal.use-case.js'
import { DeleteConfigCalidadAnimalUseCase } from './application/use-cases/delete-config-calidad-animal.use-case.js'
import { CrearConfigColorUseCase } from './application/use-cases/crear-config-color.use-case.js'
import { GetConfigColorUseCase } from './application/use-cases/get-config-color.use-case.js'
import { ListConfigColoresUseCase } from './application/use-cases/list-config-colores.use-case.js'
import { UpdateConfigColorUseCase } from './application/use-cases/update-config-color.use-case.js'
import { DeleteConfigColorUseCase } from './application/use-cases/delete-config-color.use-case.js'
import { CrearConfigRangoEdadUseCase } from './application/use-cases/crear-config-rango-edad.use-case.js'
import { GetConfigRangoEdadUseCase } from './application/use-cases/get-config-rango-edad.use-case.js'
import { ListConfigRangosEdadesUseCase } from './application/use-cases/list-config-rangos-edades.use-case.js'
import { UpdateConfigRangoEdadUseCase } from './application/use-cases/update-config-rango-edad.use-case.js'
import { DeleteConfigRangoEdadUseCase } from './application/use-cases/delete-config-rango-edad.use-case.js'
import { CrearConfigKeyValueUseCase } from './application/use-cases/crear-config-key-value.use-case.js'
import { GetConfigKeyValueUseCase } from './application/use-cases/get-config-key-value.use-case.js'
import { ListConfigKeyValuesUseCase } from './application/use-cases/list-config-key-values.use-case.js'
import { UpdateConfigKeyValueUseCase } from './application/use-cases/update-config-key-value.use-case.js'
import { DeleteConfigKeyValueUseCase } from './application/use-cases/delete-config-key-value.use-case.js'

// Routes
import { registerConfiguracionRoutes } from './infrastructure/http/routes/configuracion.routes.js'

// Export tokens
export {
  CONFIG_RAZA_REPOSITORY,
  CONFIG_CONDICION_CORPORAL_REPOSITORY,
  CONFIG_TIPO_EXPLOTACION_REPOSITORY,
  CONFIG_CALIDAD_ANIMAL_REPOSITORY,
  CONFIG_COLOR_REPOSITORY,
  CONFIG_RANGO_EDAD_REPOSITORY,
  CONFIG_KEY_VALUE_REPOSITORY,
}

// DI tokens
const CONFIG_DB_CLIENT = Symbol('ConfigDbClient')

export function registerConfiguracionModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance<DbClient>(CONFIG_DB_CLIENT, db)

  // Register repositories
  container.registerSingleton<IConfigRazaRepository>(CONFIG_RAZA_REPOSITORY, DrizzleConfigRazaRepository)
  container.registerSingleton<IConfigCondicionCorporalRepository>(CONFIG_CONDICION_CORPORAL_REPOSITORY, DrizzleConfigCondicionCorporalRepository)
  container.registerSingleton<IConfigTipoExplotacionRepository>(CONFIG_TIPO_EXPLOTACION_REPOSITORY, DrizzleConfigTipoExplotacionRepository)
  container.registerSingleton<IConfigCalidadAnimalRepository>(CONFIG_CALIDAD_ANIMAL_REPOSITORY, DrizzleConfigCalidadAnimalRepository)
  container.registerSingleton<IConfigColorRepository>(CONFIG_COLOR_REPOSITORY, DrizzleConfigColorRepository)
  container.registerSingleton<IConfigRangoEdadRepository>(CONFIG_RANGO_EDAD_REPOSITORY, DrizzleConfigRangoEdadRepository)
  container.registerSingleton<IConfigKeyValueRepository>(CONFIG_KEY_VALUE_REPOSITORY, DrizzleConfigKeyValueRepository)

  // Register use cases - Raza
  container.registerSingleton(CrearConfigRazaUseCase)
  container.registerSingleton(GetConfigRazaUseCase)
  container.registerSingleton(ListConfigRazasUseCase)
  container.registerSingleton(UpdateConfigRazaUseCase)
  container.registerSingleton(DeleteConfigRazaUseCase)

  // Register use cases - Condicion Corporal
  container.registerSingleton(CrearConfigCondicionCorporalUseCase)
  container.registerSingleton(GetConfigCondicionCorporalUseCase)
  container.registerSingleton(ListConfigCondicionesCorporalesUseCase)
  container.registerSingleton(UpdateConfigCondicionCorporalUseCase)
  container.registerSingleton(DeleteConfigCondicionCorporalUseCase)

  // Register use cases - Tipo Explotacion
  container.registerSingleton(CrearConfigTipoExplotacionUseCase)
  container.registerSingleton(GetConfigTipoExplotacionUseCase)
  container.registerSingleton(ListConfigTiposExplotacionUseCase)
  container.registerSingleton(UpdateConfigTipoExplotacionUseCase)
  container.registerSingleton(DeleteConfigTipoExplotacionUseCase)

  // Register use cases - Calidad Animal
  container.registerSingleton(CrearConfigCalidadAnimalUseCase)
  container.registerSingleton(GetConfigCalidadAnimalUseCase)
  container.registerSingleton(ListConfigCalidadesAnimalesUseCase)
  container.registerSingleton(UpdateConfigCalidadAnimalUseCase)
  container.registerSingleton(DeleteConfigCalidadAnimalUseCase)

  // Register use cases - Color
  container.registerSingleton(CrearConfigColorUseCase)
  container.registerSingleton(GetConfigColorUseCase)
  container.registerSingleton(ListConfigColoresUseCase)
  container.registerSingleton(UpdateConfigColorUseCase)
  container.registerSingleton(DeleteConfigColorUseCase)

  // Register use cases - Rango Edad
  container.registerSingleton(CrearConfigRangoEdadUseCase)
  container.registerSingleton(GetConfigRangoEdadUseCase)
  container.registerSingleton(ListConfigRangosEdadesUseCase)
  container.registerSingleton(UpdateConfigRangoEdadUseCase)
  container.registerSingleton(DeleteConfigRangoEdadUseCase)

  // Register use cases - Key Value
  container.registerSingleton(CrearConfigKeyValueUseCase)
  container.registerSingleton(GetConfigKeyValueUseCase)
  container.registerSingleton(ListConfigKeyValuesUseCase)
  container.registerSingleton(UpdateConfigKeyValueUseCase)
  container.registerSingleton(DeleteConfigKeyValueUseCase)
}

export async function registerConfiguracionModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerConfiguracionRoutes(app)
}

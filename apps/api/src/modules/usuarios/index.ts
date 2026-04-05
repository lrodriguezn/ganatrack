import { container } from 'tsyringe'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from './domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY } from './domain/repositories/rol.repository.js'
import type { IRolRepository } from './domain/repositories/rol.repository.js'
import { PERMISO_REPOSITORY } from './domain/repositories/permiso.repository.js'
import type { IPermisoRepository } from './domain/repositories/permiso.repository.js'
import { DrizzleUsuarioRepository } from './infrastructure/persistence/drizzle-usuario.repository.js'
import { DrizzleRolRepository } from './infrastructure/persistence/drizzle-rol.repository.js'
import { DrizzlePermisoRepository } from './infrastructure/persistence/drizzle-permiso.repository.js'
import { registerUsuarioRoutes } from './infrastructure/http/routes/usuario.routes.js'
import type { FastifyInstance } from 'fastify'

// Use case imports
import { CreateUsuarioUseCase } from './application/use-cases/create-usuario.use-case.js'
import { UpdateUsuarioUseCase } from './application/use-cases/update-usuario.use-case.js'
import { DeleteUsuarioUseCase } from './application/use-cases/delete-usuario.use-case.js'
import { ListUsuariosUseCase } from './application/use-cases/list-usuarios.use-case.js'
import { GetUsuarioUseCase } from './application/use-cases/get-usuario.use-case.js'
import { GetMeUseCase } from './application/use-cases/get-me.use-case.js'
import { AssignRolesUseCase } from './application/use-cases/assign-roles.use-case.js'
import { CreateRolUseCase } from './application/use-cases/create-rol.use-case.js'
import { UpdateRolUseCase } from './application/use-cases/update-rol.use-case.js'
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case.js'
import { ListPermisosUseCase } from './application/use-cases/list-permisos.use-case.js'

export { USUARIO_REPOSITORY, ROL_REPOSITORY, PERMISO_REPOSITORY }
export { registerUsuarioRoutes }

// DI tokens for the usuarios module
export const USUARIO_TOKENS = {
  UsuarioRepository: USUARIO_REPOSITORY,
  RolRepository: ROL_REPOSITORY,
  PermisoRepository: PERMISO_REPOSITORY,
  DbClient: Symbol('UsuarioDbClient'),
}

// Export DB client symbol for use cases
export const USUARIO_DB_CLIENT = USUARIO_TOKENS.DbClient

export function registerUsuariosModule(): void {
  // Register DB client
  const db = createClient()
  container.registerInstance(USUARIO_TOKENS.DbClient, db)

  // Register repositories
  container.registerSingleton<IUsuarioRepository>(USUARIO_TOKENS.UsuarioRepository, DrizzleUsuarioRepository)
  container.registerSingleton<IRolRepository>(USUARIO_TOKENS.RolRepository, DrizzleRolRepository)
  container.registerSingleton<IPermisoRepository>(USUARIO_TOKENS.PermisoRepository, DrizzlePermisoRepository)

  // Register use cases
  container.registerSingleton(CreateUsuarioUseCase)
  container.registerSingleton(UpdateUsuarioUseCase)
  container.registerSingleton(DeleteUsuarioUseCase)
  container.registerSingleton(ListUsuariosUseCase)
  container.registerSingleton(GetUsuarioUseCase)
  container.registerSingleton(GetMeUseCase)
  container.registerSingleton(AssignRolesUseCase)
  container.registerSingleton(CreateRolUseCase)
  container.registerSingleton(UpdateRolUseCase)
  container.registerSingleton(ListRolesUseCase)
  container.registerSingleton(ListPermisosUseCase)
}

export async function registerUsuariosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerUsuarioRoutes(app)
}

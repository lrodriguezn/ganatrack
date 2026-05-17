import { type DbClient, createClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Import repositories
import { type IUsuarioRepository, USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.js'
import { type IRolRepository, ROL_REPOSITORY } from './domain/repositories/rol.repository.js'
import { type IPermisoRepository, PERMISO_REPOSITORY } from './domain/repositories/permiso.repository.js'
import { DrizzleUsuarioRepository } from './infrastructure/persistence/drizzle-usuario.repository.js'
import { DrizzleRolRepository } from './infrastructure/persistence/drizzle-rol.repository.js'
import { DrizzlePermisoRepository } from './infrastructure/persistence/drizzle-permiso.repository.js'

// Infrastructure imports
import { registerUsuarioRoutes } from './infrastructure/http/routes/usuario.routes.js'

// Import tokens
export { USUARIO_TOKENS, USUARIO_DB_CLIENT } from './tokens.js'

export { USUARIO_REPOSITORY, ROL_REPOSITORY, PERMISO_REPOSITORY }
export { registerUsuarioRoutes }

export function registerUsuariosModule(): void {
  // No DI - instances created on-demand in routes
}

export async function registerUsuariosModuleRoutes(app: FastifyInstance): Promise<void> {
  await registerUsuarioRoutes(app)
}

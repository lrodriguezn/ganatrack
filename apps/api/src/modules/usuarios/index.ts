import { createClient, type DbClient } from '@ganatrack/database'
import type { FastifyInstance } from 'fastify'

// Import repositories
import { USUARIO_REPOSITORY, type IUsuarioRepository } from './domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY, type IRolRepository } from './domain/repositories/rol.repository.js'
import { PERMISO_REPOSITORY, type IPermisoRepository } from './domain/repositories/permiso.repository.js'
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

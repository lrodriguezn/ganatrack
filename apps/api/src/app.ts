import 'reflect-metadata'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { corsPlugin } from './plugins/cors.plugin.js'
import { cookiePlugin } from './plugins/cookie.plugin.js'
import { jwtPlugin } from './plugins/jwt.plugin.js'
import { rateLimitPlugin } from './plugins/rate-limit.plugin.js'
import { errorHandler, authMiddleware, tenantContextMiddleware } from './shared/middleware/index.js'
import { registerAuthModule, registerAuthModuleRoutes } from './modules/auth/index.js'
import { registerUsuariosModule, registerUsuariosModuleRoutes } from './modules/usuarios/index.js'
import { registerConfiguracionModule, registerConfiguracionModuleRoutes } from './modules/configuracion/index.js'
import { registerPrediosModule, registerPrediosModuleRoutes } from './modules/predios/index.js'
import { registerMaestrosModule, registerMaestrosModuleRoutes } from './modules/maestros/index.js'
import { registerAnimalesModule, registerAnimalesModuleRoutes } from './modules/animales/index.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  })

  // Error handler
  app.setErrorHandler(errorHandler)

  // Plugins
  await app.register(corsPlugin)
  await app.register(cookiePlugin)
  await app.register(jwtPlugin)
  await app.register(rateLimitPlugin)

  // Decorate app with middleware for use in routes
  app.decorate('authenticate', authMiddleware)
  app.decorate('requireTenant', tenantContextMiddleware)

  // Register auth module and routes
  registerAuthModule()
  await app.register(async (instance) => registerAuthModuleRoutes(instance), { prefix: '/api/v1/auth' })

  // Register usuarios module and routes
  registerUsuariosModule()
  await app.register(async (instance) => registerUsuariosModuleRoutes(instance), { prefix: '/api/v1' })

  // Register configuracion module and routes
  registerConfiguracionModule()
  await app.register(async (instance) => registerConfiguracionModuleRoutes(instance), { prefix: '/api/v1/config' })

  // Register predios module and routes
  registerPrediosModule()
  await app.register(async (instance) => registerPrediosModuleRoutes(instance), { prefix: '/api/v1/predios' })

  // Register maestros module and routes
  registerMaestrosModule()
  await app.register(async (instance) => registerMaestrosModuleRoutes(instance), { prefix: '/api/v1/maestros' })

  // Register animales module and routes
  registerAnimalesModule()
  await app.register(async (instance) => registerAnimalesModuleRoutes(instance), { prefix: '/api/v1' })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', service: 'ganatrack-api' }
  })

  return app
}

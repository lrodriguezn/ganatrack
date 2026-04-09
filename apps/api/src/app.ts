import 'reflect-metadata'
import 'dotenv/config'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { corsPlugin } from './plugins/cors.plugin.js'
import { cookiePlugin } from './plugins/cookie.plugin.js'
import { jwtPlugin } from './plugins/jwt.plugin.js'
import { rateLimitPlugin } from './plugins/rate-limit.plugin.js'
import { authMiddleware, errorHandler, tenantContextMiddleware } from './shared/middleware/index.js'
import { registerAuthModule, registerAuthModuleRoutes } from './modules/auth/index.js'
import { registerUsuariosModule, registerUsuariosModuleRoutes } from './modules/usuarios/index.js'
import { registerPrediosModule, registerPrediosModuleRoutes } from './modules/predios/index.js'
import { registerAnimalesModule, registerAnimalesModuleRoutes } from './modules/animales/index.js'
import { registerConfiguracionModule, registerConfiguracionModuleRoutes } from './modules/configuracion/index.js'
import { registerMaestrosModule, registerMaestrosModuleRoutes } from './modules/maestros/index.js'
import { registerServiciosModule, registerServiciosModuleRoutes } from './modules/servicios/index.js'
import { registerProductosModule, registerProductosModuleRoutes } from './modules/productos/index.js'
import { registerImagenesModule, registerImagenesModuleRoutes } from './modules/imagenes/index.js'
import { registerNotificacionesModule, registerNotificacionesModuleRoutes } from './modules/notificaciones/index.js'
import { registerReportesModule, registerReportesModuleRoutes } from './modules/reportes/index.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' }
  })

  // Register CORS plugin FIRST - before any other middleware
  await app.register(corsPlugin)

  // Add error handler immediately after CORS
  app.setErrorHandler(errorHandler)

  // Add CORS headers to ALL responses as fallback
  app.addHook('onSend', async (request, reply) => {
    const origin = request.headers.origin
    if (origin) {
      reply.header('Access-Control-Allow-Origin', origin)
      reply.header('Access-Control-Allow-Credentials', 'true')
    } else {
      // Allow all origins if no origin header
      reply.header('Access-Control-Allow-Origin', '*')
    }
  })
  await app.register(cookiePlugin)
  await app.register(jwtPlugin)
  await app.register(rateLimitPlugin)

  app.decorate('authenticate', authMiddleware)
  app.decorate('requireTenant', tenantContextMiddleware)

  registerAuthModule()
  await app.register(async (i) => registerAuthModuleRoutes(i), { prefix: '/api/v1/auth' })

  registerUsuariosModule()
  await app.register(async (i) => registerUsuariosModuleRoutes(i), { prefix: '/api/v1' })

  registerPrediosModule()
  await app.register(async (i) => registerPrediosModuleRoutes(i), { prefix: '/api/v1/predios' })

  registerAnimalesModule()
  await app.register(async (i) => registerAnimalesModuleRoutes(i), { prefix: '/api/v1' })

  registerConfiguracionModule()
  await app.register(async (i) => registerConfiguracionModuleRoutes(i), { prefix: '/api/v1/config' })

  registerMaestrosModule()
  await app.register(async (i) => registerMaestrosModuleRoutes(i), { prefix: '/api/v1/maestros' })

  registerServiciosModule()
  await app.register(async (i) => registerServiciosModuleRoutes(i), { prefix: '/api/v1' })

  registerProductosModule()
  await app.register(async (i) => registerProductosModuleRoutes(i), { prefix: '/api/v1' })

  registerImagenesModule()
  await app.register(async (i) => registerImagenesModuleRoutes(i), { prefix: '/api/v1' })

  registerNotificacionesModule()
  await app.register(async (i) => registerNotificacionesModuleRoutes(i), { prefix: '/api/v1' })

  registerReportesModule()
  await app.register(async (i) => registerReportesModuleRoutes(i), { prefix: '/api/v1' })

  app.get('/health', async () => ({ status: 'ok', service: 'ganatrack-api' }))

  return app
}

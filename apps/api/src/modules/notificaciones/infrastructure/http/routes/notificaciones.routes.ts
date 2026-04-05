import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { NotificacionesController } from '../controllers/notificaciones.controller.js'
import { authMiddleware, requirePermission, tenantContextMiddleware } from '../../../../../shared/middleware/index.js'
import {
  listNotificacionesQuerySchema,
  idParamsSchema,
  tipoParamsSchema,
  tokenParamsSchema,
  actualizarPreferenciaBodySchema,
  registrarPushTokenBodySchema,
  evaluarAlertasBodySchema,
  notificacionResponseSchema,
  notificacionListResponseSchema,
  resumenResponseSchema,
  preferenciaListResponseSchema,
  preferenciaResponseSchema,
  pushTokenResponseSchema,
  evaluarAlertasResponseSchema,
  messageResponseSchema,
} from '../schemas/notificaciones.schema.js'

export async function registerNotificacionesRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(NotificacionesController)

  // ============ NOTIFICACIONES ============

  // GET /api/v1/notificaciones
  app.get('/notificaciones', {
    schema: {
      querystring: listNotificacionesQuerySchema,
      response: {
        200: notificacionListResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.listar(request, reply))

  // GET /api/v1/notificaciones/resumen
  app.get('/notificaciones/resumen', {
    schema: {
      response: {
        200: resumenResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.resumen(request, reply))

  // PATCH /api/v1/notificaciones/:id/leer
  app.patch('/notificaciones/:id/leer', {
    schema: {
      params: idParamsSchema,
      response: {
        200: notificacionResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.marcarLeida(request, reply))

  // PATCH /api/v1/notificaciones/leer-todas
  app.patch('/notificaciones/leer-todas', {
    schema: {
      response: {
        200: messageResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.marcarTodasLeidas(request, reply))

  // DELETE /api/v1/notificaciones/:id
  app.delete('/notificaciones/:id', {
    schema: {
      params: idParamsSchema,
      response: {
        200: messageResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.eliminar(request, reply))

  // ============ PREFERENCIAS ============

  // GET /api/v1/notificaciones/preferencias
  app.get('/notificaciones/preferencias', {
    schema: {
      response: {
        200: preferenciaListResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.obtenerPreferencias(request, reply))

  // PUT /api/v1/notificaciones/preferencias/:tipo
  app.put('/notificaciones/preferencias/:tipo', {
    schema: {
      params: tipoParamsSchema,
      body: actualizarPreferenciaBodySchema,
      response: {
        200: preferenciaResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.actualizarPreferencia(request, reply))

  // ============ PUSH TOKENS ============

  // POST /api/v1/notificaciones/push-tokens
  app.post('/notificaciones/push-tokens', {
    schema: {
      body: registrarPushTokenBodySchema,
      response: {
        201: pushTokenResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.registrarPushToken(request, reply))

  // DELETE /api/v1/notificaciones/push-tokens/:token
  app.delete('/notificaciones/push-tokens/:token', {
    schema: {
      params: tokenParamsSchema,
      response: {
        200: messageResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware],
  }, async (request, reply) => controller.eliminarPushToken(request, reply))

  // ============ ADMIN ============

  // POST /api/v1/notificaciones/alertas/evaluar
  app.post('/notificaciones/alertas/evaluar', {
    schema: {
      body: evaluarAlertasBodySchema,
      response: {
        200: evaluarAlertasResponseSchema,
      },
    },
    preHandler: [authMiddleware, tenantContextMiddleware, requirePermission('notificaciones:admin')],
  }, async (request, reply) => controller.evaluarAlertas(request, reply))
}

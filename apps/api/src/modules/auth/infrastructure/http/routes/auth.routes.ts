import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'
import { AuthController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware.js'
import {
  changePasswordBodySchema,
  loginBodySchema,
  resend2faBodySchema,
  verify2faBodySchema,
} from '../schemas/auth.schema.js'
import type { ChangePasswordDto, LoginDto, Verify2faDto } from '../../../application/dtos/login.dto.js'

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(AuthController)

  // POST /api/v1/auth/login
  app.post<{ Body: LoginDto }>('/login', {
    schema: {
      body: loginBodySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    expiresIn: { type: 'number' },
                    usuario: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        nombre: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  properties: {
                    requires2FA: { type: 'boolean', const: true },
                    tempToken: { type: 'string' },
                  },
                },
              ],
            },
          },
        },
      },
    },
  }, async (request, reply) => controller.login(request, reply))

  // POST /api/v1/auth/refresh
  app.post('/refresh', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => controller.refresh(request, reply))

  // POST /api/v1/auth/logout
  app.post('/logout', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => controller.logout(request, reply))

  // POST /api/v1/auth/2fa/verify
  app.post<{ Body: Verify2faDto }>('/2fa/verify', {
    schema: {
      body: verify2faBodySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                expiresIn: { type: 'number' },
                usuario: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    nombre: { type: 'string' },
                    roles: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => controller.verify2fa(request, reply))

  // POST /api/v1/auth/2fa/resend
  app.post<{ Body: { tempToken: string } }>('/2fa/resend', {
    schema: {
      body: resend2faBodySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => controller.resend2fa(request, reply))

  // POST /api/v1/auth/change-password (requires auth)
  app.post<{ Body: ChangePasswordDto }>('/change-password', {
    schema: {
      body: changePasswordBodySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    preHandler: [authMiddleware],
  }, async (request, reply) => controller.changePassword(request, reply))
}

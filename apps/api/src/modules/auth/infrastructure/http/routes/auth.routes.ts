import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware.js'
import {
  changePasswordBodySchema,
  loginBodySchema,
  resend2faBodySchema,
  verify2faBodySchema,
} from '../schemas/auth.schema.js'
import type { ChangePasswordDto, LoginDto, LoginResponseDto, Verify2faDto } from '../../../application/dtos/login.dto.js'
import { AuthMapper } from '../../mappers/auth.mapper.js'

interface AuthUseCases {
  loginUseCase: any
  logoutUseCase: any
  refreshTokenUseCase: any
  verify2faUseCase: any
  resend2faUseCase: any
  changePasswordUseCase: any
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  useCases: AuthUseCases
): Promise<void> {
  const { loginUseCase, logoutUseCase, refreshTokenUseCase, verify2faUseCase, resend2faUseCase, changePasswordUseCase } = useCases

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
  }, async (request, reply) => {
    const result = await loginUseCase.execute(request.body)

    if ('requires2FA' in result) {
      return reply.send({
        success: true,
        data: {
          requires2FA: true,
          tempToken: (result as any).tempToken
        }
      })
    }

    // Set refresh token cookie on successful login using header directly
    const loginResult = result as LoginResponseDto
    const isProduction = process.env.NODE_ENV === 'production'
    const secureFlag = isProduction ? '; Secure' : ''
    const cookieValue = `refreshToken=${loginResult.refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${secureFlag}`
    reply.header('Set-Cookie', cookieValue)

    return reply.send({
      success: true,
      data: result,
    })
  })

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
  }, async (request, reply) => {
    const refreshToken = request.cookies?.refreshToken ?? ''
    const result = await refreshTokenUseCase.execute(refreshToken)

    // Set new refresh token cookie
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      }))
  })

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
  }, async (request, reply) => {
    const refreshToken = request.cookies?.refreshToken ?? (request.body as { refreshToken?: string })?.refreshToken ?? ''
    await logoutUseCase.execute(refreshToken)

    reply.clearCookie('refreshToken')
    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: { message: 'Sesión cerrada' },
      }))
  })

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
  }, async (request, reply) => {
    console.log('[2fa-verify] request.body:', JSON.stringify(request.body))
    const result = await verify2faUseCase.execute(request.body)
    console.log('[2fa-verify] result:', result)


    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          usuario: result.usuario,
        },
      }))
  })

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
  }, async (request, reply) => {
    const result = await resend2faUseCase.execute(request.body.tempToken)

    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: result,
      }))
  })

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
  }, async (request, reply) => {
    const user = request.user as { id: number }
    await changePasswordUseCase.execute(user.id, request.body)

    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: { message: 'Contraseña actualizada' },
      }))
  })

  // GET /api/v1/auth/me (requires auth)
  app.get('/me', {
    preHandler: [authMiddleware],
  }, async (request, reply) => {
    const user = request.user as { id: number; email: string; nombre: string; rol: string }
    
    return reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(JSON.stringify({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
        },
      }))
  })
}
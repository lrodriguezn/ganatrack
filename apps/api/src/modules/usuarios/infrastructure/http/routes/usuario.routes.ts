import type { FastifyInstance } from 'fastify'
import { container } from 'tsyringe'
import { UsuarioController } from '../controllers/usuario.controller.js'
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware.js'
import {
  assignRolesBodySchema,
  createRolBodySchema,
  createUsuarioBodySchema,
  idParamsSchema,
  listUsuariosQuerySchema,
  updateRolBodySchema,
  updateUsuarioBodySchema,
} from '../schemas/usuario.schema.js'
import type { CreateRolDto, CreateUsuarioDto, UpdateRolDto, UpdateUsuarioDto } from '../../../application/dtos/usuario.dto.js'

export async function registerUsuarioRoutes(app: FastifyInstance): Promise<void> {
  const controller = container.resolve(UsuarioController)

  // GET /api/v1/usuarios - List usuarios (paginated)
  app.get<{ Querystring: { page?: number; limit?: number; search?: string; activo?: number } }>(
    '/',
    {
      schema: {
        querystring: listUsuariosQuerySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
              meta: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.list(request, reply),
  )

  // GET /api/v1/usuarios/me - Get current user (MUST be before /:id)
  app.get(
    '/me',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  nombre: { type: 'string' },
                  email: { type: 'string' },
                  roles: { type: 'array', items: { type: 'string' } },
                  permisos: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.getMe(request, reply),
  )

  // GET /api/v1/usuarios/:id - Get usuario by ID
  app.get<{ Params: { id: number } }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.getById(request, reply),
  )

  // POST /api/v1/usuarios - Create usuario
  app.post<{ Body: CreateUsuarioDto }>(
    '/',
    {
      schema: {
        body: createUsuarioBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.create(request, reply),
  )

  // PUT /api/v1/usuarios/:id - Update usuario
  app.put<{ Params: { id: number }; Body: UpdateUsuarioDto }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        body: updateUsuarioBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.update(request, reply),
  )

  // DELETE /api/v1/usuarios/:id - Soft delete usuario
  app.delete<{ Params: { id: number } }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.delete(request, reply),
  )

  // POST /api/v1/usuarios/:id/roles - Assign roles to usuario
  app.post<{ Params: { id: number }; Body: { rolesIds: number[] } }>(
    '/:id/roles',
    {
      schema: {
        params: idParamsSchema,
        body: assignRolesBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.assignRoles(request, reply),
  )

  // GET /api/v1/roles - List all roles
  app.get(
    '/roles',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.listRoles(request, reply),
  )

  // GET /api/v1/roles/:id - Get role by ID
  app.get<{ Params: { id: number } }>(
    '/roles/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.getRolById(request, reply),
  )

  // POST /api/v1/roles - Create role
  app.post<{ Body: CreateRolDto }>(
    '/roles',
    {
      schema: {
        body: createRolBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.createRol(request, reply),
  )

  // PUT /api/v1/roles/:id - Update role
  app.put<{ Params: { id: number }; Body: UpdateRolDto }>(
    '/roles/:id',
    {
      schema: {
        params: idParamsSchema,
        body: updateRolBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.updateRol(request, reply),
  )

  // GET /api/v1/permisos - List all permissions
  app.get(
    '/permisos',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'array' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => controller.listPermisos(request, reply),
  )
}

import type { FastifyInstance } from 'fastify'
import { createClient } from '@ganatrack/database'
import type { DbClient } from '@ganatrack/database'
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

// Import repository interfaces
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IRolRepository } from '../../../domain/repositories/rol.repository.js'
import type { IPermisoRepository } from '../../../domain/repositories/permiso.repository.js'

export async function registerUsuarioRoutes(app: FastifyInstance): Promise<void> {
  // Create instances on-demand
  const db: DbClient = createClient()
  
  // Dynamic imports to avoid circular dependency issues
  const { DrizzleUsuarioRepository } = await import('../../persistence/drizzle-usuario.repository.js')
  const { DrizzleRolRepository } = await import('../../persistence/drizzle-rol.repository.js')
  const { DrizzlePermisoRepository } = await import('../../persistence/drizzle-permiso.repository.js')
  
  const usuarioRepo: IUsuarioRepository = new DrizzleUsuarioRepository(db)
  const rolRepo: IRolRepository = new DrizzleRolRepository(db)
  const permisoRepo: IPermisoRepository = new DrizzlePermisoRepository(db)

  // Dynamic imports for use cases
  const { CreateUsuarioUseCase } = await import('../../../application/use-cases/create-usuario.use-case.js')
  const { UpdateUsuarioUseCase } = await import('../../../application/use-cases/update-usuario.use-case.js')
  const { DeleteUsuarioUseCase } = await import('../../../application/use-cases/delete-usuario.use-case.js')
  const { ListUsuariosUseCase } = await import('../../../application/use-cases/list-usuarios.use-case.js')
  const { GetUsuarioUseCase } = await import('../../../application/use-cases/get-usuario.use-case.js')
  const { GetMeUseCase } = await import('../../../application/use-cases/get-me.use-case.js')
  const { AssignRolesUseCase } = await import('../../../application/use-cases/assign-roles.use-case.js')
  const { CreateRolUseCase } = await import('../../../application/use-cases/create-rol.use-case.js')
  const { UpdateRolUseCase } = await import('../../../application/use-cases/update-rol.use-case.js')
  const { ListRolesUseCase } = await import('../../../application/use-cases/list-roles.use-case.js')
  const { ListPermisosUseCase } = await import('../../../application/use-cases/list-permisos.use-case.js')

  // Create use cases manually (since tsyringe isn't working)
  const createUsuarioUseCase = new CreateUsuarioUseCase(usuarioRepo, rolRepo, db)
  const updateUsuarioUseCase = new UpdateUsuarioUseCase(usuarioRepo, rolRepo, db)
  const deleteUsuarioUseCase = new DeleteUsuarioUseCase(usuarioRepo)
  const listUsuariosUseCase = new ListUsuariosUseCase(usuarioRepo)
  const getUsuarioUseCase = new GetUsuarioUseCase(usuarioRepo)
  const getMeUseCase = new GetMeUseCase(usuarioRepo, rolRepo)
  const assignRolesUseCase = new AssignRolesUseCase(rolRepo, usuarioRepo, db)
  const createRolUseCase = new CreateRolUseCase(rolRepo)
  const updateRolUseCase = new UpdateRolUseCase(rolRepo)
  const listRolesUseCase = new ListRolesUseCase(rolRepo)
  const listPermisosUseCase = new ListPermisosUseCase(permisoRepo)

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
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const { page = 1, limit = 20, search, activo } = request.query
      const result = await listUsuariosUseCase.execute({ page, limit, search, activo })
      return reply.code(200).send({ success: true, ...result })
    }
  )

  // GET /api/v1/usuarios/me - Get current user
  app.get(
    '/me',
    {
      schema: {
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
    async (request, reply) => {
      const user = request.user as { id: number }
      const result = await getMeUseCase.execute(user.id)
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // GET /api/v1/usuarios/roles - List roles
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
    async (request, reply) => {
      const result = await listRolesUseCase.execute()
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // GET /api/v1/usuarios/permisos - List permisos
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
    async (request, reply) => {
      const result = await listPermisosUseCase.execute()
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // GET /api/v1/usuarios/:id - Get usuario by ID
  app.get<{ Params: { id: string } }>(
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
    async (request, reply) => {
      const id = parseInt(request.params.id, 10)
      const result = await getUsuarioUseCase.execute(id)
      return reply.code(200).send({ success: true, data: result })
    }
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
    async (request, reply) => {
      const result = await createUsuarioUseCase.execute(request.body)
      return reply.code(201).send({ success: true, data: result })
    }
  )

  // POST /api/v1/usuarios/:id/roles - Assign roles to usuario
  app.post<{ Body: CreateRolDto; Params: { id: string } }>(
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
              data: { type: 'object' },
            },
          },
        },
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const usuarioId = parseInt(request.params.id, 10)
      const result = await assignRolesUseCase.execute(usuarioId, request.body.roles)
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // POST /api/v1/usuarios/roles - Create rol
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
    async (request, reply) => {
      const result = await createRolUseCase.execute(request.body)
      return reply.code(201).send({ success: true, data: result })
    }
  )

  // PUT /api/v1/usuarios/:id - Update usuario
  app.put<{ Body: UpdateUsuarioDto; Params: { id: string } }>(
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
    async (request, reply) => {
      const id = parseInt(request.params.id, 10)
      const result = await updateUsuarioUseCase.execute(id, request.body)
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // PUT /api/v1/usuarios/roles/:id - Update rol
  app.put<{ Body: UpdateRolDto; Params: { id: string } }>(
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
    async (request, reply) => {
      const id = parseInt(request.params.id, 10)
      const result = await updateRolUseCase.execute(id, request.body)
      return reply.code(200).send({ success: true, data: result })
    }
  )

  // DELETE /api/v1/usuarios/:id - Delete usuario
  app.delete<{ Params: { id: string } }>(
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
    async (request, reply) => {
      const id = parseInt(request.params.id, 10)
      await deleteUsuarioUseCase.execute(id)
      return reply.code(200).send({ success: true, data: { message: 'Usuario eliminado' } })
    }
  )
}

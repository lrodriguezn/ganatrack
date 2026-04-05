import type { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'tsyringe'
import type { CreateUsuarioUseCase } from '../../../application/use-cases/create-usuario.use-case.js'
import type { UpdateUsuarioUseCase } from '../../../application/use-cases/update-usuario.use-case.js'
import type { DeleteUsuarioUseCase } from '../../../application/use-cases/delete-usuario.use-case.js'
import type { ListUsuariosUseCase } from '../../../application/use-cases/list-usuarios.use-case.js'
import type { GetUsuarioUseCase } from '../../../application/use-cases/get-usuario.use-case.js'
import type { GetMeUseCase } from '../../../application/use-cases/get-me.use-case.js'
import type { AssignRolesUseCase } from '../../../application/use-cases/assign-roles.use-case.js'
import type { CreateRolUseCase } from '../../../application/use-cases/create-rol.use-case.js'
import type { UpdateRolUseCase } from '../../../application/use-cases/update-rol.use-case.js'
import type { ListRolesUseCase } from '../../../application/use-cases/list-roles.use-case.js'
import type { ListPermisosUseCase } from '../../../application/use-cases/list-permisos.use-case.js'
import type {
  CreateRolDto,
  CreateUsuarioDto,
  GetMeResponseDto,
  PermisoResponseDto,
  RolResponseDto,
  UpdateRolDto,
  UpdateUsuarioDto,
  UsuarioResponseDto,
} from '../../../application/dtos/usuario.dto.js'

@injectable()
export class UsuarioController {
  constructor(
    private readonly createUsuarioUseCase: CreateUsuarioUseCase,
    private readonly updateUsuarioUseCase: UpdateUsuarioUseCase,
    private readonly deleteUsuarioUseCase: DeleteUsuarioUseCase,
    private readonly listUsuariosUseCase: ListUsuariosUseCase,
    private readonly getUsuarioUseCase: GetUsuarioUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly assignRolesUseCase: AssignRolesUseCase,
    private readonly createRolUseCase: CreateRolUseCase,
    private readonly updateRolUseCase: UpdateRolUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly listPermisosUseCase: ListPermisosUseCase,
  ) {}

  async list(request: FastifyRequest<{ Querystring: { page?: number; limit?: number; search?: string; activo?: number } }>, reply: FastifyReply) {
    const { page = 1, limit = 20, search, activo = 1 } = request.query

    const result = await this.listUsuariosUseCase.execute({ page, limit, search, activo })

    return reply.code(200).send({
      success: true,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    })
  }

  async getById(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const { id } = request.params
    const result = await this.getUsuarioUseCase.execute(id)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async create(request: FastifyRequest<{ Body: CreateUsuarioDto }>, reply: FastifyReply) {
    const result = await this.createUsuarioUseCase.execute(request.body)

    return reply.code(201).send({
      success: true,
      data: result,
    })
  }

  async update(request: FastifyRequest<{ Params: { id: number }; Body: UpdateUsuarioDto }>, reply: FastifyReply) {
    const { id } = request.params
    const result = await this.updateUsuarioUseCase.execute(id, request.body)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async delete(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const { id } = request.params
    await this.deleteUsuarioUseCase.execute(id)

    return reply.code(200).send({
      success: true,
      data: { message: 'Usuario desactivado' },
    })
  }

  async assignRoles(request: FastifyRequest<{ Params: { id: number }; Body: { rolesIds: number[] } }>, reply: FastifyReply) {
    const { id } = request.params
    const { rolesIds } = request.body
    const result = await this.assignRolesUseCase.execute(id, rolesIds)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { id: number }
    const result = await this.getMeUseCase.execute(user.id)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async listRoles(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.listRolesUseCase.execute()

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async getRolById(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    const { id } = request.params
    // Use the list roles use case and filter
    const roles = await this.listRolesUseCase.execute()
    const rol = roles.find((r) => r.id === id)

    if (!rol) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Rol con id ${id} no existe`,
        },
      })
    }

    return reply.code(200).send({
      success: true,
      data: rol,
    })
  }

  async createRol(request: FastifyRequest<{ Body: CreateRolDto }>, reply: FastifyReply) {
    const result = await this.createRolUseCase.execute(request.body)

    return reply.code(201).send({
      success: true,
      data: result,
    })
  }

  async updateRol(request: FastifyRequest<{ Params: { id: number }; Body: UpdateRolDto }>, reply: FastifyReply) {
    const { id } = request.params
    const result = await this.updateRolUseCase.execute(id, request.body)

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }

  async listPermisos(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.listPermisosUseCase.execute()

    return reply.code(200).send({
      success: true,
      data: result,
    })
  }
}

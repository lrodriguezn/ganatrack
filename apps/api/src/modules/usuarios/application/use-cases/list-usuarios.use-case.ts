import { inject, injectable } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import type { UsuarioResponseDto } from '../dtos/usuario.dto.js'
import type { DbClient } from '@ganatrack/database'
import { usuariosRoles, usuariosRolesAsignacion } from '@ganatrack/database/schema'
import { and, eq } from 'drizzle-orm'
import { USUARIO_DB_CLIENT } from '../../tokens.js'

export interface ListUsuariosResponse {
  data: UsuarioResponseDto[]
  total: number
  page: number
  limit: number
}

@injectable()
export class ListUsuariosUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(opts: { page: number; limit: number; search?: string; activo?: number }): Promise<ListUsuariosResponse> {
    const { page, limit, search, activo = 1 } = opts

    // Get paginated usuarios
    const result = await this.usuarioRepo.findAll({ page, limit, search, activo })

    // Get roles for each usuario
    const data: UsuarioResponseDto[] = []
    for (const usuario of result.data) {
      const roleAssignments = await this.db
        .select({ nombre: usuariosRoles.nombre })
        .from(usuariosRolesAsignacion)
        .innerJoin(usuariosRoles, eq(usuariosRolesAsignacion.rolId, usuariosRoles.id))
        .where(and(eq(usuariosRolesAsignacion.usuarioId, usuario.id), eq(usuariosRolesAsignacion.activo, 1), eq(usuariosRoles.activo, 1)))

      const roles = roleAssignments.map((r: { nombre: string }) => r.nombre)

      data.push({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo,
        roles,
        createdAt: usuario.createdAt?.toISOString() ?? null,
      })
    }

    return {
      data,
      total: result.total,
      page,
      limit,
    }
  }
}

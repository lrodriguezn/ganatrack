import { inject, injectable } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import type { UsuarioResponseDto } from '../dtos/usuario.dto.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { DbClient } from '@ganatrack/database'
import { usuariosRoles, usuariosRolesAsignacion } from '@ganatrack/database/schema'
import { and, eq } from 'drizzle-orm'
import { USUARIO_DB_CLIENT } from '../../tokens.js'

@injectable()
export class GetUsuarioUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(id: number): Promise<UsuarioResponseDto> {
    // 1. Find usuario by id (NotFoundError if not found)
    const usuario = await this.usuarioRepo.findById(id)
    if (!usuario) {
      throw new NotFoundError('Usuario', id)
    }

    // Get roles for response
    const roleAssignments = await this.db
      .select({ nombre: usuariosRoles.nombre })
      .from(usuariosRolesAsignacion)
      .innerJoin(usuariosRoles, eq(usuariosRolesAsignacion.rolId, usuariosRoles.id))
      .where(and(eq(usuariosRolesAsignacion.usuarioId, id), eq(usuariosRolesAsignacion.activo, 1), eq(usuariosRoles.activo, 1)))

    const roles = roleAssignments.map((r: { nombre: string }) => r.nombre)

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      activo: usuario.activo,
      roles,
      createdAt: usuario.createdAt?.toISOString() ?? null,
    }
  }
}

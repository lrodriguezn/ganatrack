import { injectable, inject } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import type { GetMeResponseDto } from '../dtos/usuario.dto.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { DbClient } from '@ganatrack/database'
import { usuariosRolesAsignacion, usuariosRoles } from '@ganatrack/database/schema'
import { eq, and } from 'drizzle-orm'
import { USUARIO_DB_CLIENT } from '../../index.js'

@injectable()
export class GetMeUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(userId: number): Promise<GetMeResponseDto> {
    // 1. Find usuario by id (NotFoundError if not found)
    const usuario = await this.usuarioRepo.findById(userId)
    if (!usuario) {
      throw new NotFoundError('Usuario', userId)
    }

    // 2. Get roles
    const roleAssignments = await this.db
      .select({ rolId: usuariosRoles.id, nombre: usuariosRoles.nombre })
      .from(usuariosRolesAsignacion)
      .innerJoin(usuariosRoles, eq(usuariosRolesAsignacion.rolId, usuariosRoles.id))
      .where(and(eq(usuariosRolesAsignacion.usuarioId, userId), eq(usuariosRolesAsignacion.activo, 1), eq(usuariosRoles.activo, 1)))

    const roles = roleAssignments.map((r: { nombre: string }) => r.nombre)

    // 3. Get all permissions from user's roles
    const permisosSet = new Set<string>()
    for (const assignment of roleAssignments) {
      const rolPermisos = await this.rolRepo.getPermisosByRol(assignment.rolId)
      for (const permiso of rolPermisos) {
        permisosSet.add(`${permiso.modulo}:${permiso.accion}`)
      }
    }

    const permisos = Array.from(permisosSet)

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      roles,
      permisos,
    }
  }
}

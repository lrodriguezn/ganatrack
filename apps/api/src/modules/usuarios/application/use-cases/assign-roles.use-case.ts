import { injectable, inject } from 'tsyringe'
import { eq } from 'drizzle-orm'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import type { RolResponseDto } from '../dtos/usuario.dto.js'
import { NotFoundError, ConflictError } from '../../../../shared/errors/index.js'
import type { DbClient } from '@ganatrack/database'
import { usuariosRolesAsignacion } from '@ganatrack/database/schema'
import { USUARIO_DB_CLIENT } from '../../index.js'

@injectable()
export class AssignRolesUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(usuarioId: number, rolesIds: number[]): Promise<RolResponseDto[]> {
    // 1. Validate usuario exists
    const usuario = await this.usuarioRepo.findById(usuarioId)
    if (!usuario) {
      throw new NotFoundError('Usuario', usuarioId)
    }

    // 2. Validate all role IDs exist
    const roles: RolResponseDto[] = []
    for (const rolId of rolesIds) {
      const rol = await this.rolRepo.findById(rolId)
      if (!rol) {
        throw new ConflictError(`El rol con id ${rolId} no existe`)
      }
      const permisos = await this.rolRepo.getPermisosByRol(rolId)
      roles.push({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        esSistema: rol.esSistema,
        permisos: permisos.map((p) => ({
          id: p.id,
          modulo: p.modulo,
          accion: p.accion,
          nombre: p.nombre,
        })),
      })
    }

    // 3. Delete existing assignments (set activo=0)
    await this.db
      .update(usuariosRolesAsignacion)
      .set({ activo: 0 })
      .where(eq(usuariosRolesAsignacion.usuarioId, usuarioId))

    // 4. Create new assignments
    for (const rolId of rolesIds) {
      await this.db.insert(usuariosRolesAsignacion).values({
        usuarioId,
        rolId,
        activo: 1,
      })
    }

    // 5. Return updated roles
    return roles
  }
}

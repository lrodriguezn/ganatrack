import { inject, injectable } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import { UsuariosDomainService } from '../../domain/services/usuarios.domain-service.js'
import type { UpdateUsuarioDto, UsuarioResponseDto } from '../dtos/usuario.dto.js'
import { NotFoundError } from '../../../../shared/errors/index.js'
import type { DbClient } from '@ganatrack/database'
import { usuariosRoles, usuariosRolesAsignacion } from '@ganatrack/database/schema'
import { and, eq } from 'drizzle-orm'
import { USUARIO_DB_CLIENT } from '../../tokens.js'

@injectable()
export class UpdateUsuarioUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    const domainService = new UsuariosDomainService()

    // 1. Find usuario by id (NotFoundError if not found)
    const usuario = await this.usuarioRepo.findById(id)
    if (!usuario) {
      throw new NotFoundError('Usuario', id)
    }

    // 2. If email changing, validate unique
    if (dto.email && dto.email !== usuario.email) {
      await domainService.validateEmailUnique(dto.email, this.usuarioRepo, id)
    }

    // 3. Update record
    await this.usuarioRepo.update(id, dto)

    // 4. Get updated usuario with roles
    const updatedUsuario = await this.usuarioRepo.findById(id)
    if (!updatedUsuario) {
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
      id: updatedUsuario.id,
      nombre: updatedUsuario.nombre,
      email: updatedUsuario.email,
      activo: updatedUsuario.activo,
      roles,
      createdAt: updatedUsuario.createdAt?.toISOString() ?? null,
    }
  }
}

import { inject, injectable } from 'tsyringe'
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario.repository.js'
import type { IUsuarioRepository } from '../../domain/repositories/usuario.repository.js'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import { UsuariosDomainService } from '../../domain/services/usuarios.domain-service.js'
import type { CreateUsuarioDto, UsuarioResponseDto } from '../dtos/usuario.dto.js'
import { hashPassword } from '../../../../shared/utils/password.utils.js'
import { ConflictError } from '../../../../shared/errors/index.js'
import type { DbClient } from '@ganatrack/database'
import { USUARIO_DB_CLIENT } from '../../tokens.js'

@injectable()
export class CreateUsuarioUseCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any

  constructor(
    @inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
    @inject(USUARIO_DB_CLIENT) db: DbClient,
  ) {
    this.db = db
  }

  async execute(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const domainService = new UsuariosDomainService()

    // 1. Validate email is unique
    await domainService.validateEmailUnique(dto.email, this.usuarioRepo)

    // 2. Validate password strength
    domainService.validatePasswordStrength(dto.password)

    // 3. Hash password
    const passwordHash = await hashPassword(dto.password)

    // 4. Create usuario record
    const usuario = await this.usuarioRepo.create({
      nombre: dto.nombre,
      email: dto.email,
    })

    // 5. Create password record
    await this.db.insert(usuariosContrasena).values({
      usuarioId: usuario.id,
      contrasenaHash: passwordHash,
      activo: 1,
    })

    // 6. Assign roles if provided
    const roles: string[] = []
    if (dto.rolesIds && dto.rolesIds.length > 0) {
      // Validate all role IDs exist
      for (const rolId of dto.rolesIds) {
        const rol = await this.rolRepo.findById(rolId)
        if (!rol) {
          throw new ConflictError(`El rol con id ${rolId} no existe`)
        }
        roles.push(rol.nombre)
      }

      // Create role assignments
      for (const rolId of dto.rolesIds) {
        await this.db.insert(usuariosRolesAsignacion).values({
          usuarioId: usuario.id,
          rolId: rolId,
          activo: 1,
        })
      }
    }

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

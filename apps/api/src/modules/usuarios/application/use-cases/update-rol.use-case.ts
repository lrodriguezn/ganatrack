import { inject, injectable } from 'tsyringe'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import { UsuariosDomainService } from '../../domain/services/usuarios.domain-service.js'
import type { RolResponseDto, UpdateRolDto } from '../dtos/usuario.dto.js'
import { ConflictError, NotFoundError } from '../../../../shared/errors/index.js'

@injectable()
export class UpdateRolUseCase {
  constructor(
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
  ) {}

  async execute(id: number, dto: UpdateRolDto): Promise<RolResponseDto> {
    const domainService = new UsuariosDomainService()

    // 1. Find rol by id (NotFoundError if not found)
    const rol = await this.rolRepo.findById(id)
    if (!rol) {
      throw new NotFoundError('Rol', id)
    }

    // 2. Validate not system role
    if (rol.esSistema === 1) {
      throw new ConflictError('No se puede modificar un rol del sistema')
    }

    // 3. Update role
    await this.rolRepo.update(id, {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    })

    // 4. Replace permissions if provided
    if (dto.permisosIds !== undefined) {
      await this.rolRepo.assignPermisos(id, dto.permisosIds)
    }

    // 5. Get updated role with permissions
    const updatedRol = await this.rolRepo.findById(id)
    if (!updatedRol) {
      throw new NotFoundError('Rol', id)
    }

    const permisos = await this.rolRepo.getPermisosByRol(id)

    return {
      id: updatedRol.id,
      nombre: updatedRol.nombre,
      descripcion: updatedRol.descripcion,
      esSistema: updatedRol.esSistema,
      permisos: permisos.map((p) => ({
        id: p.id,
        modulo: p.modulo,
        accion: p.accion,
        nombre: p.nombre,
      })),
    }
  }
}

import { injectable, inject } from 'tsyringe'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import type { CreateRolDto, RolResponseDto } from '../dtos/usuario.dto.js'

@injectable()
export class CreateRolUseCase {
  constructor(
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
  ) {}

  async execute(dto: CreateRolDto): Promise<RolResponseDto> {
    // 1. Create role
    const rol = await this.rolRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    })

    // 2. Assign permissions if provided
    if (dto.permisosIds && dto.permisosIds.length > 0) {
      await this.rolRepo.assignPermisos(rol.id, dto.permisosIds)
    }

    // 3. Get permissions for response
    const permisos = await this.rolRepo.getPermisosByRol(rol.id)

    return {
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
    }
  }
}

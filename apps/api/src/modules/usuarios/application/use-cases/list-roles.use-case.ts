import { inject, injectable } from 'tsyringe'
import { ROL_REPOSITORY } from '../../domain/repositories/rol.repository.js'
import type { IRolRepository } from '../../domain/repositories/rol.repository.js'
import type { RolResponseDto } from '../dtos/usuario.dto.js'

@injectable()
export class ListRolesUseCase {
  constructor(
    @inject(ROL_REPOSITORY) private readonly rolRepo: IRolRepository,
  ) {}

  async execute(): Promise<RolResponseDto[]> {
    const roles = await this.rolRepo.findAll()

    const result: RolResponseDto[] = []
    for (const rol of roles) {
      const permisos = await this.rolRepo.getPermisosByRol(rol.id)
      result.push({
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

    return result
  }
}

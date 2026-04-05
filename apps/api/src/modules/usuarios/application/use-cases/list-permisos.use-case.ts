import { injectable, inject } from 'tsyringe'
import { PERMISO_REPOSITORY } from '../../domain/repositories/permiso.repository.js'
import type { IPermisoRepository } from '../../domain/repositories/permiso.repository.js'
import type { PermisoResponseDto } from '../dtos/usuario.dto.js'

@injectable()
export class ListPermisosUseCase {
  constructor(
    @inject(PERMISO_REPOSITORY) private readonly permisoRepo: IPermisoRepository,
  ) {}

  async execute(): Promise<PermisoResponseDto[]> {
    const permisos = await this.permisoRepo.findAll()

    return permisos.map((p) => ({
      id: p.id,
      modulo: p.modulo,
      accion: p.accion,
      nombre: p.nombre,
    }))
  }
}

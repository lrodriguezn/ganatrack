import { injectable, inject } from 'tsyringe'
import { GRUPO_REPOSITORY } from '../../domain/repositories/grupo.repository.js'
import type { IGrupoRepository } from '../../domain/repositories/grupo.repository.js'
import type { CreateGrupoDto, GrupoResponseDto } from '../dtos/predios.dto.js'
import { GrupoMapper } from '../../infrastructure/mappers/predios.mapper.js'

@injectable()
export class CrearGrupoUseCase {
  constructor(
    @inject(GRUPO_REPOSITORY) private readonly repo: IGrupoRepository,
  ) {}

  async execute(dto: CreateGrupoDto, predioId: number): Promise<GrupoResponseDto> {
    const entity = await this.repo.create({
      predioId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      activo: 1,
    })

    return GrupoMapper.toResponse(entity)
  }
}
